import { Agency } from './normalize';

export interface CityStats {
    avgRating: number;      // C: Mean rating across dataset
    maxReviews: number;     // For normalizing popularity
    minReviewsThreshold: number; // m: threshold (e.g. 30)
}

/**
 * Calculates dataset statistics needed for Bayesian rating
 */
export function getCityStats(agencies: Agency[]): CityStats {
    let totalRating = 0;
    let validRatingsCount = 0;
    let maxReviews = 0;

    for (const a of agencies) {
        if (a.rating && a.rating > 0) {
            totalRating += a.rating;
            validRatingsCount++;
        }
        if (a.reviewsCount > maxReviews) {
            maxReviews = a.reviewsCount;
        }
    }

    const avgRating = validRatingsCount > 0 ? (totalRating / validRatingsCount) : 0;

    return {
        avgRating,
        maxReviews,
        minReviewsThreshold: 30 // Hardcoded threshold as per requirements
    };
}

/**
 * Computes a score based on User's SEO Strategy:
 * Score = rating * log(reviewsCount + 1)
 * 
 * We also add a small random jitter to avoid static ordering (as requested).
 */
export function computeAgencyScore(agency: Agency, stats: CityStats): number {
    const rating = agency.rating || 0;
    const reviews = agency.reviewsCount || 0;

    // Core Formula: Rating * Log(Reviews + 1)
    // Using natural log (Math.log) which scales nicely
    let score = rating * Math.log(reviews + 1);

    // Add Data Completeness Boost (minor tie-breaker)
    if (agency.phone) score += 0.5;
    if (agency.website) score += 0.5;

    // Add small random jitter (0.0 to 0.2) to shuffle identical agencies
    // and keep the list looking dynamic ("Random slight shuffle")
    const jitter = Math.random() * 0.2;
    score += jitter;

    return Math.round(score * 100) / 100; // Round to 2 decimals
}
