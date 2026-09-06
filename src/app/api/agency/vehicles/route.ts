import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/agency-auth';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const agency = await prisma.business.findFirst({
            where: { ownerId: user.id }
        });

        if (!agency) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        const vehicles = await prisma.agencyVehicle.findMany({
            where: { agencyId: agency.id },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json({ success: true, vehicles });
    } catch (error: any) {
        console.error('[Agency Vehicles GET] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch vehicles' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const agency = await prisma.business.findFirst({
            where: { ownerId: user.id }
        });

        if (!agency) {
            return NextResponse.json({ error: 'You do not own an agency yet.' }, { status: 404 });
        }

        const body = await request.json();
        const {
            brand,
            model,
            year,
            category,
            bodyType,
            transmission,
            fuel,
            seats,
            doors,
            luggage,
            color,
            description,
            images,
            dailyPrice,
            weeklyPrice,
            monthlyPrice,
            securityDeposit,
            minRentalDays,
            mileagePerDay,
            extraMileagePrice,
            deliveryFee,
            airportDeliveryFee,
            priceNotes,
            seasonPricing,
            status
        } = body;

        // Basic validation
        if (!brand || !model || !year || !dailyPrice) {
            return NextResponse.json(
                { error: 'Brand, Model, Year, and Daily Price are required.' },
                { status: 400 }
            );
        }

        const parsedYear = parseInt(year, 10);
        const parsedDailyPrice = parseFloat(dailyPrice);

        if (isNaN(parsedYear) || parsedYear < 1990 || parsedYear > new Date().getFullYear() + 1) {
            return NextResponse.json({ error: 'Invalid year.' }, { status: 400 });
        }

        if (isNaN(parsedDailyPrice) || parsedDailyPrice <= 0) {
            return NextResponse.json({ error: 'Daily price must be a positive number.' }, { status: 400 });
        }

        const brandSlug = slugify(brand);
        const modelSlug = slugify(model);

        // Generate a unique slug
        let baseSlug = `${brandSlug}-${modelSlug}-${parsedYear}`;
        let candidateSlug = baseSlug;
        let suffix = 1;

        while (true) {
            const existing = await prisma.agencyVehicle.findUnique({
                where: { slug: candidateSlug }
            });
            if (!existing) break;
            const randSuffix = randomBytes(2).toString('hex');
            candidateSlug = `${baseSlug}-${randSuffix}`;
            suffix++;
            if (suffix > 10) break;
        }

        const validImages = Array.isArray(images) ? images : [];
        const featuredImage = validImages[0]?.url || null;

        const vehicle = await prisma.agencyVehicle.create({
            data: {
                agencyId: agency.id,
                brand: brand.trim(),
                brandSlug,
                model: model.trim(),
                modelSlug,
                year: parsedYear,
                category: category || 'economy',
                bodyType: bodyType || 'sedan',
                transmission: transmission || 'Manual',
                fuel: fuel || 'Diesel',
                seats: parseInt(seats, 10) || 5,
                doors: parseInt(doors, 10) || 4,
                luggage: parseInt(luggage, 10) || 2,
                color: color ? String(color).trim() : null,
                description: description ? String(description).trim() : null,
                images: validImages,
                featuredImage,
                dailyPrice: parsedDailyPrice,
                weeklyPrice: weeklyPrice ? parseFloat(weeklyPrice) : null,
                monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
                securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
                minRentalDays: parseInt(minRentalDays, 10) || 1,
                mileagePerDay: mileagePerDay ? parseInt(mileagePerDay, 10) : null,
                extraMileagePrice: extraMileagePrice ? parseFloat(extraMileagePrice) : null,
                deliveryFee: deliveryFee ? parseFloat(deliveryFee) : null,
                airportDeliveryFee: airportDeliveryFee ? parseFloat(airportDeliveryFee) : null,
                priceNotes: priceNotes ? String(priceNotes).trim() : null,
                seasonPricing: seasonPricing || null,
                status: status || 'AVAILABLE',
                slug: candidateSlug,
                lastConfirmedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            vehicle
        }, { status: 201 });
    } catch (error: any) {
        console.error('[Agency Vehicles POST] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to create vehicle.' },
            { status: 500 }
        );
    }
}
