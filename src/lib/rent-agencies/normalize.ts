import { buildAgencySlug, getAgencyImages, getAgencyAddress } from './utils';

export interface ReviewNormalized {
    reviewId: string;
    reviewerName: string;
    reviewerPhotoUrl: string | null;
    rating: number; // stars
    text: string | null;
    textTranslated: string | null;
    publishedAtDate: string | null; // ISO string
    publishedAtText: string | null; // e.g. "2 months ago"
    responseFromOwnerText: string | null;
    originalLanguage?: string | null;
}

export interface Agency {
    _id: string; // generated from slug or index
    name: string;
    slug: string;
    city: string; // "Marrakech" (Display name or normalized city key)
    citySlug: string; // "marrakech" (URL safe)
    address: string;
    phone: string | null;
    rating: number | null;
    reviewsCount: number;
    photos: string[];
    categories: string[];
    location: {
        lat: number;
        lng: number;
    };
    website: string | null;
    score?: number; // Internal scoring for ranking

    // New fields
    openingHours: { day: string; hours: string }[];
    reviews: ReviewNormalized[];
    mixedServices: boolean; // Flag for businesses that aren't primarily car rental (e.g. money transfer)
    isMixedService?: boolean; // Alias for compatibility

    // Normalized Filters
    hasWebsite: boolean;
    hasPhone: boolean;
    isOpenNow?: boolean; // Calculated at runtime usually, but we can flag if hours exist

    // SEO / Mock fields
    noDeposit?: boolean;
    priceLevel?: 'cheap' | 'standard' | 'luxury';
}

export type NormalizedAgency = Agency;

// Keywords that indicate valid rental agency
const RENTAL_KEYWORDS = [
    'rent', 'location', 'louer', 'voiture', 'car', 'auto', 'vehicule', 'vehicle', 'transport', 'tourist', 'tours'
];

// Keywords matching non-rental dominant businesses known to appear in datasets
const MIXED_SERVICE_PATTERNS = [
    /kash\s*plus/i,
    /cash\s*plus/i,
    /wafacash/i,
    /barid\s*cash/i,
    /transfer/i,
    /money/i,
    /change/i,
    /صرف/i,
    /تحويل/i,
    /western union/i,
    /liaison/i,
    /motorcycle/i,
    /motorbike/i,
    /scooter/i,
    /bike\s*(shop|store|rental)/i,
    /bicycle/i,
    /دراجة/i,
    /دراجات/i,
    /بخارية/i,
    /quad/i,
    /atv/i,
    /jet\s*ski/i
];

// Categories indicating non-car-rental businesses
const NON_CAR_RENTAL_CATEGORIES = [
    /motorcycle/i,
    /motorbike/i,
    /scooter/i,
    /bicycle/i,
    /bike.*shop/i,
    /bike.*store/i,
    /دراجات/i,
    /quad/i,
    /atv/i,
    /jet\s*ski/i,
    /متجر دراجات/i
];

// Helper to check if agency is valid
function isRentalAgency(raw: any): boolean {
    const text = [
        raw.title,
        ...(raw.categories || []),
        raw.categoryName
    ].join(' ').toLowerCase();

    // Must have at least one rental keyword
    return RENTAL_KEYWORDS.some(k => text.includes(k));
}

// Heuristic to detect mixed service businesses (e.g. Money transfer shops that also rent cars)
function isMixedService(title: string, categories: string[]): boolean {
    // Check title for money/transfer/cash/motorcycle keywords
    const titleMatch = MIXED_SERVICE_PATTERNS.some(pattern => pattern.test(title));
    if (titleMatch) return true;

    // Check categories for non-car-rental businesses (motorcycle shops, bike shops, etc.)
    const categoryText = categories.join(' ');
    const categoryMatch = NON_CAR_RENTAL_CATEGORIES.some(pattern => pattern.test(categoryText));
    if (categoryMatch) return true;

    // Also check if title contains non-car-rental category indicators
    const titleCategoryMatch = NON_CAR_RENTAL_CATEGORIES.some(pattern => pattern.test(title));
    if (titleCategoryMatch) return true;

    return false;
}

// City display name mapping
const CITY_DISPLAY_NAMES: Record<string, string> = {
    'marrakech': 'Marrakech',
    'rabat': 'Rabat',
    'casablanca': 'Casablanca',
    'agadir': 'Agadir',
    'fes': 'Fès',
    'tanger': 'Tanger',
};

export function normalizeAgency(raw: any, index: number, citySlug: string = 'marrakech'): Agency {
    const name = raw.name || raw.title || 'Unknown Agency';
    const city = citySlug.toLowerCase();
    const cityDisplayName = CITY_DISPLAY_NAMES[city] || city.charAt(0).toUpperCase() + city.slice(1);

    // 1. Slug Strategy
    const fullSlug = buildAgencySlug(name, raw.placeId, index);

    // 2. Rating & Reviews
    let rating = raw.rating;
    let reviewsCount = raw.reviews?.length || 0;

    if (!rating && raw.reviews && raw.reviews.length > 0) {
        const total = raw.reviews.reduce((acc: number, r: any) => acc + (r.stars || 0), 0);
        rating = total / raw.reviews.length;
    }

    // 3. Photos
    const photos = getAgencyImages(raw);

    // 4. Categories
    let categories: string[] = [];
    if (raw.categoryName) categories.push(raw.categoryName);
    if (raw.categories && Array.isArray(raw.categories)) {
        categories = [...categories, ...raw.categories];
    }
    categories = Array.from(new Set(categories));

    // 5. Opening Hours
    const openingHours: { day: string; hours: string }[] = [];
    if (raw.openingHours && Array.isArray(raw.openingHours)) {
        raw.openingHours.forEach((oh: any) => {
            if (oh.day && oh.hours) {
                openingHours.push({
                    day: oh.day,
                    hours: oh.hours
                });
            }
        });
    }

    // 6. Reviews Content
    const reviews: ReviewNormalized[] = [];
    if (raw.reviews && Array.isArray(raw.reviews)) {
        // Take top 20 most relevant/recent reviews
        raw.reviews.slice(0, 20).forEach((r: any) => {
            if (r.text || r.stars) {
                reviews.push({
                    reviewId: r.reviewId || Math.random().toString(36),
                    reviewerName: r.name || 'Anonymous',
                    reviewerPhotoUrl: r.reviewerPhotoUrl || null,
                    rating: r.stars || 0,
                    text: r.text || null,
                    textTranslated: r.textTranslated || null,
                    publishedAtDate: r.publishedAtDate || null,
                    publishedAtText: r.publishAt || null,
                    responseFromOwnerText: r.responseFromOwnerText || null,
                    originalLanguage: r.originalLanguage || null
                });
            }
        });
    }

    // 7. Mixed Service Check
    const mixedServicesResult = isMixedService(name, categories);

    // 8. Address
    const address = getAgencyAddress(raw);

    // 9. Phone
    const phone = raw.phone || null;

    // 10. Website
    const website = raw.website || raw.url || null;

    return {
        _id: raw.placeId || `local-${index}`,
        name: name,
        slug: fullSlug,
        city: cityDisplayName, // Dynamic Display Name
        citySlug: city, // URL safe
        address,
        phone,
        rating: rating || 0,
        reviewsCount: reviewsCount,
        photos: photos,
        categories: categories,
        location: raw.location || { lat: 0, lng: 0 },
        website,

        openingHours,
        reviews,

        mixedServices: mixedServicesResult,
        isMixedService: mixedServicesResult, // Alias

        // Helper flags for filtering
        hasWebsite: !!website,
        hasPhone: !!phone,

        // Mock Data for SEO purposes (Deterministic based on index/slug)
        // In real app, this comes from DB
        noDeposit: (index % 5 === 0), // 20% of agencies
        priceLevel: (index % 10 === 0) ? 'luxury' : (index % 3 === 0 ? 'cheap' : 'standard'),
    };
}


export function calculateScore(agency: Agency): number {
    let score = 0;

    // Base score from rating (0-50 points)
    if (agency.rating) {
        score += agency.rating * 10;
    }

    // Reviews count bonus (logarithmic, max ~30 points)
    if (agency.reviewsCount > 0) {
        score += Math.log2(agency.reviewsCount) * 4;
    }

    // Phone bonus (20 points)
    if (agency.phone) {
        score += 20;
    }

    // Photos bonus (5 points per photo, max 20)
    score += Math.min(agency.photos.length * 5, 20);

    // Keyword relevance in name
    const nameLower = agency.name.toLowerCase();
    if (nameLower.includes('rent') || nameLower.includes('location')) {
        score += 10;
    }

    // Penalize mixed services slightly so pure agencies appear first usually
    if (agency.mixedServices) {
        score -= 30;
    }

    // Penalize agencies without photos heavily to demote "ghost" listings
    if (agency.photos.length === 0) {
        score -= 15;
    }

    return score;
}

// Distance in meters
export function getDistance(loc1: { lat: number, lng: number }, loc2: { lat: number, lng: number }) {
    const R = 6371e3; // metres
    const φ1 = loc1.lat * Math.PI / 180;
    const φ2 = loc2.lat * Math.PI / 180;
    const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
    const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function deduplicateAgencies(agencies: Agency[]): Agency[] {
    const kept: Agency[] = [];

    // Sort by Score DESC so we keep the best one
    const sortedCandidates = [...agencies].sort((a, b) => (calculateScore(b) - calculateScore(a)));

    for (const candidate of sortedCandidates) {
        const isDuplicate = kept.some(existing => {
            // Check placeId first (primary key)
            if (candidate._id === existing._id) return true;

            const dist = getDistance(candidate.location, existing.location);
            const nameMatch = candidate.name.toLowerCase() === existing.name.toLowerCase();

            // Very close distance (duplicate listing on map w/ slightly diff name or same location)
            // Or same name and close enough
            const veryClose = dist < 20;

            return (nameMatch && dist < 200) || (veryClose && nameMatch);
        });

        if (!isDuplicate) {
            kept.push(candidate);
        }
    }

    return kept;
}
