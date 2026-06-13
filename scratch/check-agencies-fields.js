require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RENT_INTENTS = {
    best: {
        slug: 'best',
        filter: { minRating: 4.0 }
    },
    airport: {
        slug: 'airport',
        filter: { nearAirport: true }
    },
    cheap: {
        slug: 'cheap',
        filter: { priceLevel: 'cheap' }
    },
    luxury: {
        slug: 'luxury',
        filter: { priceLevel: 'luxury' }
    },
    'no-deposit': {
        slug: 'no-deposit',
        filter: { noDeposit: true }
    },
    '24h': {
        slug: '24h',
        filter: { open24h: true }
    },
    'most-reviewed': {
        slug: 'most-reviewed',
        filter: { minReviews: 50 }
    }
};

const AIRPORTS = {
    'kelaat-sraghna': { lat: 32.0533, lng: -7.4063 },
};

function getDistance(p1, p2) {
    const R = 6371e3; // metres
    const phi1 = p1.lat * Math.PI/180;
    const phi2 = p2.lat * Math.PI/180;
    const deltaPhi = (p2.lat-p1.lat) * Math.PI/180;
    const deltaLambda = (p2.lng-p1.lng) * Math.PI/180;

    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d;
}

// Transform Prisma model to UI interface
function mapPrismaToAgency(dbBusiness) {
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
        categories: dbBusiness.categories?.map((c) => c.category.name) || [],
        location: {
            lat: dbBusiness.lat || 0,
            lng: dbBusiness.lng || 0
        },
        website: dbBusiness.website,
        score: dbBusiness.rating * 10,
        openingHours: dbBusiness.openingHours || [],
        reviews: [],
        mixedServices: dbBusiness.mixedServices,
        isMixedService: dbBusiness.mixedServices,
        hasWebsite: !!dbBusiness.website,
        hasPhone: !!dbBusiness.phone,
        noDeposit: dbBusiness.noDeposit,
        priceLevel: dbBusiness.priceLevel,
    };
}

function filterAgenciesByIntent(agencies, intent, citySlug) {
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

async function run() {
    const city = 'kelaat-sraghna';
    const dbBusinesses = await prisma.business.findMany({
        where: { city: { slug: city } },
        include: { city: true }
    });

    const agencies = dbBusinesses.map(mapPrismaToAgency);
    console.log(`Loaded ${agencies.length} agencies`);

    for (const [key, intent] of Object.entries(RENT_INTENTS)) {
        const res = filterAgenciesByIntent(agencies, intent, city);
        console.log(`Intent "${key}" returns: ${res.length} agencies`);
        if (res.length > 0) {
            console.log(`  Sample: ${res[0].name} (rating: ${res[0].rating}, noDeposit: ${res[0].noDeposit}, priceLevel: ${res[0].priceLevel})`);
        }
    }
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
