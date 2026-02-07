// @ts-ignore
import marrakechData from '@/data/marrakech.json';
import { NormalizedAgency, normalizeAgency, getDistance } from './normalize';
import { getCityStats, computeAgencyScore } from './ranking';
import { SeoIntent } from './seo-intents';

// Coordinates for Airports (Hardcoded for now)
const AIRPORTS: Record<string, { lat: number, lng: number }> = {
    'marrakech': { lat: 31.6069, lng: -8.0363 } // Menara Airport
};

export function filterAgenciesByIntent(agencies: NormalizedAgency[], intent: SeoIntent, citySlug: string): NormalizedAgency[] {
    let filtered = [...agencies];

    // Filter: Near Airport
    if (intent.filter.nearAirport) {
        const airport = AIRPORTS[citySlug.toLowerCase()];
        if (airport) {
            filtered = filtered.filter(a => {
                if (!a.location || !a.location.lat) return false;
                const dist = getDistance(a.location, airport);
                // Within 5km of airport
                return dist <= 5000;
            });
            // Sort by distance to airport
            filtered.sort((a, b) => {
                const dA = getDistance(a.location, airport);
                const dB = getDistance(b.location, airport);
                return dA - dB;
            });
        }
    }

    // Filter: Check No Deposit
    if (intent.filter.noDeposit) {
        filtered = filtered.filter(a => a.noDeposit);
    }

    // Filter: Price/Luxury
    if (intent.filter.priceLevel) {
        filtered = filtered.filter(a => a.priceLevel === intent.filter.priceLevel);
    }

    return filtered;
}

// In-memory cache
let cachedAgencies: NormalizedAgency[] | null = null;

export async function getAgenciesByCity(citySlug: string): Promise<NormalizedAgency[]> {
    if (citySlug.toLowerCase() !== 'marrakech') return [];

    if (cachedAgencies) return cachedAgencies;

    // 1. Load Raw Data
    const rawData = marrakechData as any[];
    if (!Array.isArray(rawData)) return [];

    // 2. Normalize All
    const normalized = rawData.map((item, index) => normalizeAgency(item, index));

    // 3. Compute Scores (Bayesian + Qualities)
    // First, get dataset stats for Bayesian average
    const cityStats = getCityStats(normalized);

    // Assign score to each agency
    normalized.forEach(agency => {
        agency.score = computeAgencyScore(agency, cityStats);
    });

    // 4. Robust Deduplication (Merge Strategy)
    const agencyMap = new Map<string, NormalizedAgency>();

    // Sort by score DESC before deduplication to ensure we process best candidates first/keep them
    normalized.sort((a, b) => (b.score || 0) - (a.score || 0));

    for (const agency of normalized) {
        if (!agencyMap.has(agency._id)) {
            agencyMap.set(agency._id, agency);
        } else {
            // Merge logic: keep the 'better' version (which is currently 'existing' since we sorted by score)
            const existing = agencyMap.get(agency._id)!;

            // ... (keep merge logic for photos/phone/website to enrich the best entry)
            // Prefer the one with more photos
            if ((agency.photos?.length || 0) > (existing.photos?.length || 0)) {
                existing.photos = agency.photos;
            }
            if (!existing.phone && agency.phone) existing.phone = agency.phone;
            if (!existing.website && agency.website) existing.website = agency.website;

            // Re-score the merged entity in case it gained data (completeness score might increase)
            // But for now, just keeping the base high-quality entry is safer/simpler without re-running stats.
            // We can re-calc score if we assume stats don't change much.
            existing.score = computeAgencyScore(existing, cityStats);

            agencyMap.set(agency._id, existing);
        }
    }

    // Convert back to array
    const result = Array.from(agencyMap.values());

    // 5. Final Sort by Score
    result.sort((a, b) => (b.score || 0) - (a.score || 0));

    console.log(`[AgenciesLoader] Loaded ${rawData.length} raw, returned ${result.length} unique agencies for ${citySlug}.`);

    cachedAgencies = result;
    return result;
}

export async function getAgencyBySlug(citySlug: string, slug: string): Promise<NormalizedAgency | null> {
    const agencies = await getAgenciesByCity(citySlug);

    // 1. Direct Slug Match (Fastest)
    const exactMatch = agencies.find(a => a.slug === slug);
    if (exactMatch) return exactMatch;

    // 2. Suffix Match (Robustness for renamed agencies)
    // Extract placeId suffix (last 6 chars)
    const targetSuffix = slug.slice(-6);

    // Find agency where _id ends with this suffix
    if (slug.includes('-')) {
        const robustMatch = agencies.find(a => a._id.endsWith(targetSuffix));
        if (robustMatch) return robustMatch;
    }

    return null;
}
