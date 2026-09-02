import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { normalizeField, slugify } from '@/lib/normalization';

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return true;
    }
    if (record.count >= RATE_LIMIT_MAX) return false;
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

        const where: any = { status: 'approved', visibility: 'public' };

        if (purpose !== 'all') {
            where.OR = [
                { purpose },
                { adType: purpose === 'rent' ? 'rental' : 'sale' },
            ];
        }

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
                skip,
                take: limit,
                include: { city: true }
            }),
            prisma.listing.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: listings,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

        if (!checkRateLimit(ip)) {
            return NextResponse.json({ success: false, error: 'Too many requests. Please wait a moment.' }, { status: 429 });
        }

        const body = await request.json();

        // Honeypot check
        if (body.website) {
            return NextResponse.json({ success: true, data: { _id: 'fake' } }, { status: 201 });
        }

        // Parsing & Sanitization
        const numPrice = Number(body.price);
        const numYear = Number(body.year) || new Date().getFullYear();
        const numMileage = Number(body.mileage) || 0;
        const cleanPhone = (body.phone || '').toString().replace(/[\s\-\+\(\)]/g, '');
        const cleanWhatsapp = body.whatsapp ? body.whatsapp.toString().replace(/[\s\-\+\(\)]/g, '') : null;

        // Prevent duplicate submissions
        if (body.userId && body.title && !isNaN(numPrice)) {
            const existingDuplicate = await prisma.listing.findFirst({
                where: {
                    userId: body.userId,
                    title: body.title,
                    price: numPrice,
                    createdAt: { gt: new Date(Date.now() - 60000) }
                }
            });
            if (existingDuplicate) {
                return NextResponse.json({ success: true, data: existingDuplicate }, { status: 200 });
            }
        }

        const requiredFields = ['title', 'city', 'price', 'phone', 'brand', 'carModel', 'year', 'fuelType', 'transmission', 'bodyType'];
        const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');
        if (missingFields.length > 0) {
            return NextResponse.json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
        }

        const phoneRegex = /^0[567]\d{8}$/;
        if (!phoneRegex.test(cleanPhone)) {
            return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
        }

        const minPrice = body.purpose === 'rent' ? 100 : 1000;
        if (isNaN(numPrice) || numPrice < minPrice || numPrice > 500000000) {
            return NextResponse.json({ success: false, error: `Price must be between ${minPrice} and 500,000,000 DH` }, { status: 400 });
        }

        if (body.sellerType === 'agency' && !body.agencyName) {
            return NextResponse.json({ success: false, error: 'Agency name is required' }, { status: 400 });
        }

        // Normalize fields
        const brandObj = normalizeField(body.brand === 'other' ? body.brandCustom : body.brand);
        const modelObj = normalizeField(body.carModel === 'other' || body.carModel === 'Other' ? body.modelCustom : body.carModel);
        const cityObj = normalizeField(body.city === 'other' ? body.cityCustom : body.city);
        const bodyTypeObj = normalizeField(body.bodyType);

        // Resolve or create the city record
        const citySlug = cityObj.slug || slugify(cityObj.label || '') || `city-${Date.now()}`;
        const cityRecord = await prisma.city.upsert({
            where: { slug: citySlug },
            update: {},
            create: { name: cityObj.label || citySlug, slug: citySlug }
        });

        // Format extra features & specs into description for full persistence
        let finalDescription = (body.description || '').trim();
        const extraSpecs: string[] = [];

        if (body.fiscalPower) extraSpecs.push(`الخيل الجبائي (Puissance Fiscale): ${body.fiscalPower}`);
        if (body.doors) extraSpecs.push(`عدد الأبواب: ${body.doors}`);
        if (body.seats) extraSpecs.push(`عدد المقاعد: ${body.seats}`);

        if (Array.isArray(body.features) && body.features.length > 0) {
            extraSpecs.push(`التجهيزات والخيارات: ${body.features.join(' • ')}`);
        }

        if (extraSpecs.length > 0 && !finalDescription.includes('التجهيزات والمواصفات الإضافية')) {
            finalDescription = `${finalDescription}\n\n---\n📋 التجهيزات والمواصفات الإضافية:\n• ${extraSpecs.join('\n• ')}`;
        }

        const listing = await prisma.listing.create({
            data: {
                purpose: body.purpose || 'sale',
                adType: body.purpose === 'rent' ? 'rental' : 'sale',
                condition: body.condition || 'used',
                sellerType: body.sellerType || 'individual',
                agencyName: body.sellerType === 'agency' ? body.agencyName : null,
                title: body.title,
                description: finalDescription || null,
                price: numPrice,
                pricePeriod: body.purpose === 'rent' ? (body.pricePeriod || 'day') : null,
                currency: body.currency || 'MAD',
                brandLabel: brandObj.label || body.brand || '',
                brandSlug: brandObj.slug || slugify(body.brand || '') || 'other-brand',
                carModelLabel: modelObj.label || body.carModel || '',
                carModelSlug: modelObj.slug || slugify(body.carModel || '') || 'other-model',
                bodyTypeLabel: bodyTypeObj.label || body.bodyType || '',
                bodyTypeSlug: bodyTypeObj.slug || slugify(body.bodyType || '') || 'other-bodytype',
                cityId: cityRecord.id,
                year: numYear,
                mileage: numMileage,
                fuelType: body.fuelType,
                transmission: body.transmission,
                images: body.images || [],
                phone: cleanPhone,
                whatsapp: cleanWhatsapp,
                userId: body.userId || null,
                status: 'approved',
                visibility: 'public',
                isReported: false,
                reportsCount: 0,
                publishedAt: new Date(),
            }
        });

        revalidatePath('/fr');
        revalidatePath('/ar');
        revalidatePath('/fr/cars');
        revalidatePath('/ar/cars');

        return NextResponse.json({ success: true, data: listing }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ success: false, error: error?.message || 'Failed to create listing' }, { status: 500 });
    }
}
