import { Agency } from '@/lib/rent-agencies/normalize';

export type { Agency };

let cachedAgencies: Agency[] | null = null;

export interface GetAgenciesOptions {
    city?: string;
    page?: number;
    limit?: number;
    search?: string;
    minRating?: number;
    hasPhone?: boolean;
    hasReviews?: boolean;
    hasWebsite?: boolean;
    isOpenNow?: boolean; // Heuristic: just checks if openingHours array is present/valid
    mixedServices?: boolean; // undefined=show all, false=hide mixed, true=show only mixed
    categories?: string[];
    sortBy?: 'recommended' | 'rating' | 'reviews';
}

export interface PaginatedResult {
    agencies: Agency[];
    total: number;
    page: number;
    limit: number;
}

import { getAgenciesByCity as loadAgenciesFromModule } from '@/lib/rent-agencies/getAgenciesByCity';

async function loadAndProcessAgencies(city: string): Promise<Agency[]> {
    if (city.toLowerCase() !== 'marrakech') return [];

    // Delegate to the robust loader (which handles Normalize + Score + Dedupe + Sort)
    const agencies = await loadAgenciesFromModule(city);
    return agencies;
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
        isOpenNow,
        mixedServices,
        categories,
        sortBy = 'recommended'
    } = options;

    const allAgencies = await loadAndProcessAgencies(city);

    let filtered = allAgencies;

    // Filter: Search
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.address.toLowerCase().includes(q) ||
            a.categories.some(c => c.toLowerCase().includes(q))
        );
    }

    // Filter: Rating
    if (minRating) {
        filtered = filtered.filter(a => (a.rating || 0) >= minRating);
    }

    // Filter: Phone
    if (hasPhone) {
        filtered = filtered.filter(a => !!a.phone);
    }

    // Filter: Website
    if (hasWebsite) {
        filtered = filtered.filter(a => !!a.website);
    }

    // Filter: Reviews
    if (hasReviews) {
        filtered = filtered.filter(a => a.reviewsCount > 0);
    }

    // Filter: Open Now (Heuristic)
    if (isOpenNow) {
        // Since we can't easily parse Arabic hours on server without heavy libs,
        // we check if they HAVE hours listed, implying they are a structured business.
        filtered = filtered.filter(a => a.openingHours && a.openingHours.length > 0);
    }

    // Filter: Categories (Multi-select)
    if (categories && categories.length > 0) {
        filtered = filtered.filter(a =>
            categories.some(c => a.categories.includes(c))
        );
    }

    // Filter: Mixed Services
    if (mixedServices === false) {
        filtered = filtered.filter(a => !a.mixedServices);
    } else if (mixedServices === true) {
        filtered = filtered.filter(a => a.mixedServices);
    }

    // Apply Sorting
    if (sortBy === 'reviews') {
        filtered.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
        // Default: recommended (already sorted by score in loadAndProcessAgencies)
        // But if we filtered, order is preserved.
        // If we want to be safe or re-sort if filtered modified things (it shouldn't affect score):
        // filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
        agencies: paginated,
        total,
        page,
        limit
    };
}

// Legacy support alias
// Re-export or use the module directly
export { getAgenciesByCity } from '@/lib/rent-agencies/getAgenciesByCity';

export async function getAgencyBySlug(city: string, slug: string): Promise<Agency | null> {
    const all = await loadAndProcessAgencies(city);
    return all.find(a => a.slug === slug) || null;
}

// SEO & Related Helpers
import { SeoIntent } from '@/lib/rent-agencies/seo-intents';
import { filterAgenciesByIntent } from '@/lib/rent-agencies/getAgenciesByCity';
import { getDistance } from '@/lib/rent-agencies/normalize';

export async function getAgenciesByIntent(city: string, intent: SeoIntent): Promise<Agency[]> {
    const all = await loadAndProcessAgencies(city);
    return filterAgenciesByIntent(all, intent, city);
}

export async function getRelatedAgencies(agency: Agency, limit: number = 8): Promise<Agency[]> {
    const all = await loadAndProcessAgencies(agency.citySlug);

    // Filter out the current agency
    let candidates = all.filter(a => a._id !== agency._id);

    // Calculate relevancy score
    const scored = candidates.map(candidate => {
        let score = 0;

        // 1. Category Match (if any)
        const commonCategories = candidate.categories.filter(c => agency.categories.includes(c));
        if (commonCategories.length > 0) score += 5;

        // 2. Distance (Closer is better)
        let dist = 999999;
        if (agency.location && candidate.location) {
            dist = getDistance(agency.location, candidate.location);
            // Boost for being very close (< 2km)
            if (dist < 2000) score += 10;
            else if (dist < 5000) score += 5;
        }

        // 3. User specified quality formula: rating * log(reviewsCount + 1)
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
