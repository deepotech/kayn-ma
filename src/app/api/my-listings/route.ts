import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const q = searchParams.get('q');

        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        const where: any = { userId };
        if (status && status !== 'all') where.status = status;
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { brandLabel: { contains: q, mode: 'insensitive' } },
                { carModelLabel: { contains: q, mode: 'insensitive' } },
            ];
        }

        const listings = await prisma.listing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { city: true }
        });

        return NextResponse.json(listings);
    } catch (error) {
        console.error('Error fetching user listings:', error);
        return NextResponse.json({ error: 'Failed to fetch user listings' }, { status: 500 });
    }
}

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

function normalizeField(val: any): { label: string; slug: string } {
    if (!val) return { label: '', slug: '' };
    if (typeof val === 'string') {
        return { label: val, slug: slugify(val) };
    }
    if (typeof val === 'object') {
        const label = val.label || val.name || val.fr || val.ar || '';
        const slug = val.slug || slugify(label);
        return { label, slug };
    }
    return { label: String(val), slug: slugify(String(val)) };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        const brandObj = normalizeField(body.brand === 'other' ? body.brandCustom : body.brand);
        const modelObj = normalizeField(body.carModel || (body.model === 'other' ? body.modelCustom : body.model));
        const cityObj = normalizeField(body.city === 'other' ? body.cityCustom : body.city);
        const bodyTypeObj = normalizeField(body.bodyType);

        const citySlug = cityObj.slug || slugify(cityObj.label || 'morocco');
        const cityRecord = await prisma.city.upsert({
            where: { slug: citySlug },
            update: {},
            create: { name: cityObj.label || citySlug, slug: citySlug }
        });

        const brandLabel = brandObj.label || 'Autre';
        const brandSlug = brandObj.slug || slugify(brandLabel);
        const carModelLabel = modelObj.label || 'Autre';
        const carModelSlug = modelObj.slug || slugify(carModelLabel);

        const title = body.title || `${brandLabel} ${carModelLabel} ${body.year || ''}`.trim();

        const listingData: any = {
            purpose: body.purpose || 'sale',
            adType: body.purpose === 'rent' ? 'rental' : 'sale',
            condition: body.condition || 'used',
            sellerType: body.sellerType || 'individual',
            agencyName: body.sellerType === 'agency' ? body.agencyName : null,
            title,
            description: body.description || null,
            price: Number(body.price) || 0,
            pricePeriod: body.purpose === 'rent' ? (body.pricePeriod || 'day') : null,
            currency: body.currency || 'MAD',
            brandLabel,
            brandSlug,
            carModelLabel,
            carModelSlug,
            bodyTypeLabel: bodyTypeObj.label || 'Berline',
            bodyTypeSlug: bodyTypeObj.slug || 'sedan',
            cityId: cityRecord.id,
            year: Number(body.year) || new Date().getFullYear(),
            mileage: Number(body.mileage) || 0,
            fuelType: body.fuelType || body.fuel || 'Diesel',
            transmission: body.transmission || 'Manual',
            images: body.images || [],
            phone: body.phone || '',
            whatsapp: body.whatsapp || null,
            userId: body.userId,
            sellerName: body.sellerName || null,
            status: 'approved',
            visibility: 'public',
            isReported: false,
            reportsCount: 0,
            publishedAt: new Date(),
        };

        const listing = await prisma.listing.create({
            data: listingData
        });

        return NextResponse.json({ success: true, data: listing, id: listing.id });
    } catch (error: any) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ error: error.message || 'Failed to create listing' }, { status: 500 });
    }
}
