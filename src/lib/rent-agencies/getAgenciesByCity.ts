import { NormalizedAgency, ReviewNormalized } from './normalize';
import prisma from '@/lib/db';
import { SeoIntent } from './seo-intents';
import { getDistance } from './normalize';

// Supported cities
const SUPPORTED_CITIES = ['marrakech', 'rabat', 'casablanca', 'safi', 'berrechid', 'settat', 'khemisset', 'kenitra', 'oujda', 'fes', 'tanger', 'agadir', 'meknes', 'tetouan', 'kelaat-sraghna', 'beni-mellal'];

// Coordinates for Airports (Hardcoded for now)
const AIRPORTS: Record<string, { lat: number, lng: number }> = {
    'marrakech': { lat: 31.6069, lng: -8.0363 }, // Menara Airport
    'rabat': { lat: 34.0513, lng: -6.7515 }, // Rabat-Salé Airport
    'casablanca': { lat: 33.3675, lng: -7.5899 }, // Mohammed V Airport
    'safi': { lat: 32.2994, lng: -9.2372 }, // Safi Center
    'berrechid': { lat: 33.2677, lng: -7.5811 }, // Central Berrechid (Close to Med V)
    'settat': { lat: 33.0010, lng: -7.6166 }, // Settat Center
    'khemisset': { lat: 33.8150, lng: -6.0660 }, // Khemisset Center
    'kenitra': { lat: 34.2610, lng: -6.5802 }, // Kenitra Center
    'oujda': { lat: 34.6814, lng: -1.9086 }, // Oujda Center
    'fes': { lat: 34.0371, lng: -4.9998 }, // Fes-Saïss Airport / Center
    'tanger': { lat: 35.7269, lng: -5.9169 }, // Ibn Battuta Airport
    'agadir': { lat: 30.3238, lng: -9.4132 }, // Al Massira Airport
    'meknes': { lat: 33.8789, lng: -5.5186 }, // Bassatine / Meknes
    'tetouan': { lat: 35.5785, lng: -5.3686 }, // Sania Ramel Airport / Tetouan Center
    'kelaat-sraghna': { lat: 32.0533, lng: -7.4063 }, // Kelaat Sraghna Center
    'beni-mellal': { lat: 32.4019, lng: -6.3159 }, // Beni Mellal Airport
};


export function filterAgenciesByIntent(agencies: NormalizedAgency[], intent: SeoIntent, citySlug: string): NormalizedAgency[] {
    let filtered = [...agencies];

    if (intent.filter.nearAirport) {
        const airport = AIRPORTS[citySlug.toLowerCase()];
        if (airport) {
            filtered = filtered.filter(a => {
                if (!a.location || !a.location.lat) return false;
                const dist = getDistance(a.location, airport);
                return dist <= 15000;
            });
            filtered.sort((a, b) => {
                const dA = getDistance(a.location, airport);
                const dB = getDistance(b.location, airport);
                return dA - dB;
            });
        }
    }

    if (intent.filter.noDeposit) {
        filtered = filtered.filter(a => a.noDeposit);
    }

    if (intent.filter.priceLevel) {
        filtered = filtered.filter(a => a.priceLevel === intent.filter.priceLevel);
    }

    return filtered;
}

// Transform Prisma model to UI interface
function mapPrismaToAgency(dbBusiness: any): NormalizedAgency {
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
        score: dbBusiness.rating * 10, // simplified scoring for now
        openingHours: dbBusiness.openingHours || [],
        reviews: dbBusiness.reviews?.map((r: any) => ({
            reviewId: r.id,
            reviewerName: r.reviewerName,
            reviewerPhotoUrl: r.reviewerPhotoUrl,
            rating: r.rating,
            text: r.text,
            textTranslated: r.textTranslated,
            publishedAtText: r.publishedAtText,
            originalLanguage: r.originalLanguage
        })) || [],
        mixedServices: dbBusiness.mixedServices,
        isMixedService: dbBusiness.mixedServices,
        hasWebsite: !!dbBusiness.website,
        hasPhone: !!dbBusiness.phone,
        noDeposit: dbBusiness.noDeposit,
        priceLevel: dbBusiness.priceLevel,
    };
}


export async function getAgenciesByCity(citySlug: string): Promise<NormalizedAgency[]> {
    const city = citySlug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (!SUPPORTED_CITIES.includes(city)) {
        return [];
    }

    const businesses = await prisma.business.findMany({
        where: { city: { slug: city } },
        include: {
            city: true,
            categories: { include: { category: true } },
            reviews: { take: 5, orderBy: { createdAt: 'desc' } }
        },
        orderBy: [
            { rating: 'desc' },
            { reviewsCount: 'desc' }
        ]
    });

    return businesses.map(mapPrismaToAgency);
}

export async function getAgencyBySlug(citySlug: string, slug: string): Promise<NormalizedAgency | null> {
    const dbBusiness = await prisma.business.findUnique({
        where: { slug: slug },
        include: {
            city: true,
            categories: { include: { category: true } },
            reviews: { take: 20, orderBy: { createdAt: 'desc' } }
        }
    });

    if (!dbBusiness) return null;
    return mapPrismaToAgency(dbBusiness);
}

export function getSupportedCities(): string[] {
    return [...SUPPORTED_CITIES];
}
