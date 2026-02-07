import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { SeoFilters } from '@/lib/seo-utils';
import { findCityBySlug } from '@/constants/cities';

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
    model?: string; // Added model support from URL
}

export async function getListings(searchParams: SearchParams, slugFilters: SeoFilters | null) {
    await dbConnect();

    // Default to approved and public listings only
    const query: any = { status: 'approved', visibility: 'public' };

    // 1. Apply Slug Filters (Precedence from URL segment /cars/[brand]/[model] etc)
    // 1. Apply Slug Filters (Precedence from URL segment /cars/[brand]/[model] etc)
    if (slugFilters) {
        if (slugFilters.brand) {
            const brandSlug = slugFilters.brand;
            if (!query.$and) query.$and = [];
            query.$and.push({
                $or: [
                    { 'brand.slug': brandSlug },
                    { brandSlug: brandSlug },
                    { brand: new RegExp(`^${brandSlug}$`, 'i') },
                    { 'brand.label': new RegExp(`^${brandSlug}$`, 'i') }
                ]
            });
        }

        if (slugFilters.bodyType) {
            const bodyTypeSlug = slugFilters.bodyType;
            if (!query.$and) query.$and = [];
            query.$and.push({
                $or: [
                    { 'bodyType.slug': bodyTypeSlug },
                    { bodyTypeSlug: bodyTypeSlug },
                    { bodyType: new RegExp(`^${bodyTypeSlug}$`, 'i') },
                    { 'bodyType.label': new RegExp(`^${bodyTypeSlug}$`, 'i') }
                ]
            });
        }

        if (slugFilters.city) {
            const citySlug = slugFilters.city;
            const cityData = findCityBySlug(citySlug);
            const cityConditions: any[] = [
                { 'city.slug': citySlug },
                { city: new RegExp(`^${citySlug}$`, 'i') }
            ];
            if (cityData) {
                cityConditions.push({ city: cityData.name.fr });
                cityConditions.push({ city: cityData.name.ar });
                cityConditions.push({ 'city.label': cityData.name.fr });
                cityConditions.push({ 'city.label': cityData.name.ar });
            }
            if (!query.$and) query.$and = [];
            query.$and.push({ $or: cityConditions });
        }
    }

    // 2. Apply Query Params (Search Filters)
    // Overwrite slug filters if query param exists (or AND them? usually UI reflects URL)
    // Let's assume URL query params are the source of truth for filters

    if (searchParams.purpose) query.purpose = searchParams.purpose;
    if (searchParams.condition) query.condition = searchParams.condition;

    if (searchParams.sellerType === 'agency') query.sellerType = 'agency';
    else if (searchParams.sellerType === 'individual') query.sellerType = 'individual';

    // Explicit Filters (using slugs now, with legacy fallback)
    if (searchParams.brand) {
        const brandSlug = searchParams.brand;
        if (!query.$and) query.$and = [];
        query.$and.push({
            $or: [
                { 'brand.slug': brandSlug },
                { brand: new RegExp(`^${brandSlug}$`, 'i') }, // Legacy string match
                { brandSlug: brandSlug } // Legacy slug field if exists
            ]
        });
    }

    if (searchParams.model) {
        const modelSlug = searchParams.model;
        if (!query.$and) query.$and = [];
        query.$and.push({
            $or: [
                { 'carModel.slug': modelSlug },
                { carModel: new RegExp(`^${modelSlug}$`, 'i') },
                { modelSlug: modelSlug }
            ]
        });
    }

    if (searchParams.bodyType && !query['bodyType.slug']) {
        const bodyTypeSlug = searchParams.bodyType;
        if (!query.$and) query.$and = [];
        query.$and.push({
            $or: [
                { 'bodyType.slug': bodyTypeSlug },
                { bodyType: new RegExp(`^${bodyTypeSlug}$`, 'i') },
                { bodyTypeSlug: bodyTypeSlug }
            ]
        });
    }

    if (searchParams.city && !query['city.slug']) {
        const citySlug = searchParams.city;
        const cityData = findCityBySlug(citySlug);

        const cityConditions: any[] = [
            { 'city.slug': citySlug },
            { city: new RegExp(`^${citySlug}$`, 'i') } // Legacy string match
        ];

        if (cityData) {
            cityConditions.push({ city: cityData.name.fr }); // Legacy exact match FR
            cityConditions.push({ city: cityData.name.ar }); // Legacy exact match AR
        }

        if (!query.$and) query.$and = [];
        query.$and.push({ $or: cityConditions });
    }

    // Search Keywords
    // We can keep regex for title search, maybe description
    if (searchParams.q) {
        const keyword = searchParams.q;
        const regex = new RegExp(keyword, 'i');

        query.$or = [
            { title: regex },
            { description: regex },
            // Optional: Search inside labels if someone types "Fiat" in search bar
            { 'brand.label': regex },
            { 'carModel.label': regex },
            { 'city.label': regex }
        ];
    }

    // Price range
    if (searchParams.minPrice || searchParams.maxPrice) {
        query.price = {};
        if (searchParams.minPrice) query.price.$gte = Number(searchParams.minPrice);
        if (searchParams.maxPrice) query.price.$lte = Number(searchParams.maxPrice);
    }

    // Year range
    if (searchParams.minYear || searchParams.maxYear) {
        query.year = query.year || {};
        if (searchParams.minYear) query.year.$gte = Number(searchParams.minYear);
        if (searchParams.maxYear) query.year.$lte = Number(searchParams.maxYear);
    }

    const listings = await Listing.find(query)
        .sort({ publishedAt: -1, createdAt: -1 }) // Sort by new
        .lean();

    return JSON.parse(JSON.stringify(listings));
}

export async function getSimilarListings(listingId: string, criteria: { brandSlug?: string, bodyTypeSlug?: string, price: number, city?: string, brand?: string }) {
    await dbConnect();

    // Fix criteria to use correct fields if they are passed as old format strings
    // But ideally criteria already has slugs
    const brandSlug = criteria.brandSlug || (criteria.brand ? criteria.brand.toLowerCase() : null);

    // 1. Priority: Same Brand + Same City
    const query1: any = {
        _id: { $ne: listingId },
        status: 'approved',
        visibility: 'public',
    };

    if (brandSlug) query1['brand.slug'] = brandSlug;
    if (criteria.city) query1['city.slug'] = criteria.city; // Assuming city comes as slug now from Listing Detail

    let similar = await Listing.find(query1).sort({ publishedAt: -1 }).limit(6).lean();

    // 2. Fallback: Same Brand (Any City)
    if (similar.length < 6) {
        const queryBrand: any = {
            _id: { $ne: listingId },
            status: 'approved',
            visibility: 'public',
        };
        if (brandSlug) queryBrand['brand.slug'] = brandSlug;

        // Exclude ones we already found
        const currentIds = similar.map((l: any) => l._id);
        queryBrand._id = { $nin: [listingId, ...currentIds] };

        const moreBrand = await Listing.find(queryBrand).sort({ publishedAt: -1 }).limit(6 - similar.length).lean();
        similar = [...similar, ...moreBrand];
    }

    // 3. Fallback: Same Body Type + Price Range
    if (similar.length < 6) {
        const minPrice = criteria.price * 0.7;
        const maxPrice = criteria.price * 1.3;

        const query2: any = {
            status: 'approved',
            visibility: 'public',
            price: { $gte: minPrice, $lte: maxPrice }
        };

        if (criteria.bodyTypeSlug) {
            query2['bodyType.slug'] = criteria.bodyTypeSlug;
        }

        // Exclude current listing AND anything found in steps 1 & 2
        const currentIds = similar.map((l: any) => l._id);
        query2._id = { $nin: [listingId, ...currentIds] };

        const more = await Listing.find(query2).sort({ publishedAt: -1 }).limit(6 - similar.length).lean();
        similar = [...similar, ...more];
    }

    return JSON.parse(JSON.stringify(similar));
}
