import { Agency } from '@/lib/rent-agencies/normalize';
import prisma from '@/lib/db';
import { getDistance } from '@/lib/rent-agencies/normalize';

export type { Agency };

export interface GetAgenciesOptions {
    city?: string;
    page?: number;
    limit?: number;
    search?: string;
    minRating?: number;
    hasPhone?: boolean;
    hasReviews?: boolean;
    hasWebsite?: boolean;
    isOpenNow?: boolean;
    mixedServices?: boolean;
    categories?: string[];
    sortBy?: 'recommended' | 'rating' | 'reviews';
}

export interface PaginatedResult {
    agencies: Agency[];
    total: number;
    page: number;
    limit: number;
}

// Transform Prisma output to UI model
function mapPrismaToAgency(dbBusiness: any): Agency {
    return {
        _id: dbBusiness.id,
        name: dbBusiness.name,
        slug: dbBusiness.slug,
        city: dbBusiness.city?.name || 'Unknown',
        citySlug: dbBusiness.city?.slug || 'unknown',
        address: dbBusiness.address,
        phone: dbBusiness.phone,
        rating: dbBusiness.rating,
        reviewsCount: dbBusiness.reviewsCount,
        photos: dbBusiness.photos || [],
        categories: dbBusiness.categories?.map((c: any) => c.category.name) || [],
        location: {
            lat: dbBusiness.lat || 0,
            lng: dbBusiness.lng || 0
        },
        website: dbBusiness.website,
        score: (dbBusiness.rating || 0) * 10,
        openingHours: dbBusiness.openingHours || [],
        reviews: [], // omitted for list views
        mixedServices: dbBusiness.mixedServices,
        isMixedService: dbBusiness.mixedServices,
        hasWebsite: !!dbBusiness.website,
        hasPhone: !!dbBusiness.phone,
        noDeposit: dbBusiness.noDeposit,
        priceLevel: dbBusiness.priceLevel,
    };
}

export async function getAgencies(options: GetAgenciesOptions = {}): Promise<PaginatedResult> {
    const {
        city = 'marrakech',
        page = 1,
        limit = 24,
        search,
        minRating,
        hasPhone,
        hasReviews,
        hasWebsite,
        mixedServices,
        categories,
        sortBy = 'recommended'
    } = options;

    const where: any = {};

    if (city) {
        where.city = { slug: city.toLowerCase() };
    }

    if (search) {
        // Simple search across name and address
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (minRating) {
        where.rating = { gte: minRating };
    }

    if (hasPhone) {
        where.phone = { not: null };
    }

    if (hasWebsite) {
        where.website = { not: null };
    }

    if (hasReviews) {
        where.reviewsCount = { gt: 0 };
    }

    if (mixedServices !== undefined) {
        where.mixedServices = mixedServices;
    }

    if (categories && categories.length > 0) {
        where.categories = {
            some: {
                category: {
                    name: { in: categories }
                }
            }
        };
    }

    // Determine Sorting
    let orderBy: any[] = [];
    if (sortBy === 'reviews') {
        orderBy = [{ reviewsCount: 'desc' }];
    } else if (sortBy === 'rating') {
        orderBy = [{ rating: 'desc' }];
    } else {
        // recommended
        orderBy = [
            { rating: 'desc' },
            { reviewsCount: 'desc' }
        ];
    }

    const skip = (page - 1) * limit;

    const [dbAgencies, total] = await Promise.all([
        prisma.business.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            include: {
                city: true,
                categories: { include: { category: true } }
            }
        }),
        prisma.business.count({ where })
    ]);

    return {
        agencies: dbAgencies.map(mapPrismaToAgency),
        total,
        page,
        limit
    };
}

// Legacy support alias
export { getAgenciesByCity, getAgencyBySlug } from '@/lib/rent-agencies/getAgenciesByCity';

// SEO & Related Helpers
import { SeoIntent } from '@/lib/rent-agencies/seo-intents';
import { filterAgenciesByIntent, getAgenciesByCity as fetchCityAgencies } from '@/lib/rent-agencies/getAgenciesByCity';

export async function getAgenciesByIntent(city: string, intent: SeoIntent): Promise<Agency[]> {
    const all = await fetchCityAgencies(city);
    return filterAgenciesByIntent(all, intent, city);
}

export async function getRelatedAgencies(agency: Agency, limit: number = 8): Promise<Agency[]> {
    // Fetch all for the city and do in-memory distance calc
    // Since PostGIS is not set up in Prisma yet, this is the most reliable way to maintain current logic
    const all = await fetchCityAgencies(agency.citySlug);

    // Filter out the current agency
    let candidates = all.filter(a => a._id !== agency._id);

    // Calculate relevancy score
    const scored = candidates.map(candidate => {
        let score = 0;
        const commonCategories = candidate.categories.filter(c => agency.categories.includes(c));
        if (commonCategories.length > 0) score += 5;

        let dist = 999999;
        if (agency.location && candidate.location) {
            dist = getDistance(agency.location, candidate.location);
            if (dist < 2000) score += 10;
            else if (dist < 5000) score += 5;
        }

        const qualityScore = (candidate.rating || 0) * Math.log((candidate.reviewsCount || 0) + 1);
        score += qualityScore;

        return { agency: candidate, score, distance: dist };
    });

    // Sort by Score DESC, then Distance ASC
    scored.sort((a, b) => {
        if (Math.abs(b.score - a.score) > 1) {
            return b.score - a.score;
        }
        return a.distance - b.distance;
    });

    return scored.slice(0, limit).map(s => s.agency);
}
