import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { normalizeField, slugify } from '@/lib/normalization';

// Simple rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '8');
        const purpose = searchParams.get('purpose') || 'all';
        const skip = (page - 1) * limit;

        await dbConnect();

        // Query approved and public listings
        // Query approved and public listings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {
            status: 'approved',
            visibility: 'public',
        };

        if (purpose !== 'all') {
            const isRent = purpose === 'rent';
            query.$or = [
                { purpose },
                { adType: isRent ? 'rental' : 'sale' },
                // If purpose/adType missing, assume sale for 'sale' query
                ...(purpose === 'sale' ? [{ purpose: { $exists: false }, adType: { $exists: false } }] : [])
            ];
        }

        const listings = await Listing.find(query)
            .sort({ publishedAt: -1, createdAt: -1 }) // Sort by publishedAt for feed
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Listing.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: listings,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Rate limit check
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please wait a moment.' },
                { status: 429 }
            );
        }

        const body = await request.json();

        // Prevent Duplicate Submissions (Double Click or Retry)
        if (body.userId) {
            await dbConnect();
            const existingDuplicate = await Listing.findOne({
                userId: body.userId,
                title: body.title,
                price: body.price,
                createdAt: { $gt: new Date(Date.now() - 60000) } // Created in last 60s
            });

            if (existingDuplicate) {
                console.log('Duplicate submission detected, returning existing listing.');
                return NextResponse.json({ success: true, data: existingDuplicate }, { status: 200 }); // Return 200 OK
            }
        }

        // Honeypot check - if this field is filled, it's a bot
        if (body.website) {
            console.log('Honeypot triggered from IP:', ip);
            // Return success to not alert the bot
            return NextResponse.json({ success: true, data: { _id: 'fake' } }, { status: 201 });
        }

        // Validation
        const requiredFields = ['title', 'city', 'price', 'phone', 'brand', 'carModel', 'year', 'fuelType', 'transmission', 'bodyType'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Phone validation (Moroccan format)
        const phoneRegex = /^0[67]\d{8}$/;
        if (!phoneRegex.test(body.phone)) {
            return NextResponse.json(
                { success: false, error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // Price validation
        const minPrice = body.purpose === 'rent' ? 100 : 1000;
        // Max price 500M DH
        if (body.price < minPrice || body.price > 500000000) {
            return NextResponse.json(
                { success: false, error: `Price must be between ${minPrice} and 500,000,000 DH` },
                { status: 400 }
            );
        }

        // Agency validation
        if (body.sellerType === 'agency' && !body.agencyName) {
            return NextResponse.json(
                { success: false, error: 'Agency name is required' },
                { status: 400 }
            );
        }

        // Normalization using utils
        const brandObj = normalizeField(body.brand === 'other' ? body.brandCustom : body.brand);
        const modelObj = normalizeField(body.carModel === 'other' || body.carModel === 'Other' ? body.modelCustom : body.carModel);
        const cityObj = normalizeField(body.city === 'other' ? body.cityCustom : body.city);
        const bodyTypeObj = normalizeField(body.bodyType);

        await dbConnect();

        const listing = await Listing.create({
            purpose: body.purpose || 'sale',
            adType: body.purpose === 'rent' ? 'rental' : 'sale', // Backward compatibility
            condition: body.condition || 'used',
            sellerType: body.sellerType || 'individual',
            agencyName: body.sellerType === 'agency' ? body.agencyName : undefined,
            title: body.title,
            description: body.description || '',
            price: body.price,
            pricePeriod: body.purpose === 'rent' ? (body.pricePeriod || 'day') : null,
            currency: body.currency || 'MAD',

            // New Structured Data
            brand: brandObj,
            carModel: modelObj,
            city: cityObj,
            bodyType: bodyTypeObj,

            year: body.year,
            mileage: body.mileage || 0,
            fuelType: body.fuelType,
            transmission: body.transmission,

            images: body.images || [],
            phone: body.phone,
            whatsapp: body.whatsapp || '',
            userId: body.userId || '',

            // Moderation fields - Auto-approve
            status: 'approved',
            visibility: 'public',
            isReported: false,
            reportsCount: 0,

            publishedAt: new Date(),
        });

        // Revalidate Home and Listings pages for both locales
        revalidatePath('/fr');
        revalidatePath('/ar');
        revalidatePath('/fr/cars');
        revalidatePath('/ar/cars');

        return NextResponse.json({ success: true, data: listing }, { status: 201 });
    } catch (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create listing' },
            { status: 500 }
        );
    }
}
