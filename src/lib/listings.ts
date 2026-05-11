import prisma from '@/lib/db';
import { SeoFilters } from '@/lib/seo-utils';

export interface SearchParams {
    purpose?: string;
    condition?: string;
    sellerType?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
    q?: string;
    brand?: string;
    city?: string;
    bodyType?: string;
    model?: string;
}

export async function getListings(searchParams: SearchParams, slugFilters: SeoFilters | null) {
    const where: any = { status: 'approved', visibility: 'public' };

    // 1. Apply Slug Filters (from URL segments like /cars/[brand]/[model])
    if (slugFilters?.brand) {
        where.brandSlug = slugFilters.brand;
    }
    if (slugFilters?.bodyType) {
        where.bodyTypeSlug = slugFilters.bodyType;
    }
    if (slugFilters?.city) {
        where.city = { slug: slugFilters.city };
    }

    // 2. Apply Query Params (Search Filters) — override slug filters if provided
    if (searchParams.purpose) where.purpose = searchParams.purpose;
    if (searchParams.condition) where.condition = searchParams.condition;
    if (searchParams.sellerType) where.sellerType = searchParams.sellerType;

    if (searchParams.brand) where.brandSlug = searchParams.brand;
    if (searchParams.model) where.carModelSlug = searchParams.model;
    if (searchParams.bodyType) where.bodyTypeSlug = searchParams.bodyType;

    if (searchParams.city) {
        where.city = { slug: searchParams.city };
    }

    // Keyword search across title and description
    if (searchParams.q) {
        where.OR = [
            { title: { contains: searchParams.q, mode: 'insensitive' } },
            { description: { contains: searchParams.q, mode: 'insensitive' } },
            { brandLabel: { contains: searchParams.q, mode: 'insensitive' } },
            { carModelLabel: { contains: searchParams.q, mode: 'insensitive' } },
        ];
    }

    // Price range
    if (searchParams.minPrice || searchParams.maxPrice) {
        where.price = {};
        if (searchParams.minPrice) where.price.gte = Number(searchParams.minPrice);
        if (searchParams.maxPrice) where.price.lte = Number(searchParams.maxPrice);
    }

    // Year range
    if (searchParams.minYear || searchParams.maxYear) {
        where.year = {};
        if (searchParams.minYear) where.year.gte = Number(searchParams.minYear);
        if (searchParams.maxYear) where.year.lte = Number(searchParams.maxYear);
    }

    const listings = await prisma.listing.findMany({
        where,
        orderBy: [
            { publishedAt: 'desc' },
            { createdAt: 'desc' },
        ],
        include: { city: true }
    });

    return listings;
}

export async function getSimilarListings(
    listingId: string,
    criteria: { brandSlug?: string; bodyTypeSlug?: string; price: number; city?: string; brand?: string }
) {
    const brandSlug = criteria.brandSlug || (criteria.brand ? criteria.brand.toLowerCase() : undefined);

    const baseWhere = { status: 'approved', visibility: 'public', NOT: { id: listingId } };

    // 1. Priority: Same Brand + Same City
    let similar: any[] = await prisma.listing.findMany({
        where: {
            ...baseWhere,
            ...(brandSlug ? { brandSlug } : {}),
            ...(criteria.city ? { city: { slug: criteria.city } } : {}),
        },
        orderBy: { publishedAt: 'desc' },
        take: 6,
        include: { city: true }
    });

    // 2. Fallback: Same Brand (Any City)
    if (similar.length < 6) {
        const foundIds = similar.map(l => l.id).filter(Boolean);
        const excludeIds = [listingId, ...foundIds].filter(Boolean) as string[];
        const moreBrand = await prisma.listing.findMany({
            where: {
                ...baseWhere,
                ...(brandSlug ? { brandSlug } : {}),
                NOT: { id: { in: excludeIds } },
            },
            orderBy: { publishedAt: 'desc' },
            take: 6 - similar.length,
            include: { city: true }
        });
        similar = [...similar, ...moreBrand];
    }

    // 3. Fallback: Same Body Type + Price Range
    if (similar.length < 6) {
        const foundIds = similar.map(l => l.id).filter(Boolean);
        const excludeIds = [listingId, ...foundIds].filter(Boolean) as string[];
        const more = await prisma.listing.findMany({
            where: {
                ...baseWhere,
                ...(criteria.bodyTypeSlug ? { bodyTypeSlug: criteria.bodyTypeSlug } : {}),
                price: { gte: criteria.price * 0.7, lte: criteria.price * 1.3 },
                NOT: { id: { in: excludeIds } },
            },
            orderBy: { publishedAt: 'desc' },
            take: 6 - similar.length,
            include: { city: true }
        });
        similar = [...similar, ...more];
    }

    return similar;
}
