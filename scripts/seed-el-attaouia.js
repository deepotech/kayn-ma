/**
 * Idempotent seed script for El Attaouia city and agencies.
 * Run with: node scripts/seed-el-attaouia.js
 * 
 * - Does NOT delete existing data
 * - Does NOT modify other cities
 * - Safe to run multiple times (upsert-based)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CITY_SLUG = 'el-attaouia';
const CITY_NAME = 'El Attaouia';
const CITY_LAT = 31.832423;
const CITY_LNG = -7.31957;

// Only rent agencies and car dealers from attaouia.json
// Source: attaouia.json (22 records, 17 rent agencies + 2 car dealers + 3 other)
const AGENCIES = [
  {
    name: "Diyani Car",
    slug: "diyani-car-q4-4-w0",
    address: "RMMJ+547، العطاوية، المغرب",
    phone: "+212764520315",
    lat: 31.832423, lng: -7.31957,
    rating: 5.0, reviewsCount: 1,
    photos: [],
    placeId: "ChIJ8bljWQAXpQ0RiZPxjF9q4-w",
    mixedServices: false
  },
  {
    name: "BACHACHA CAR",
    slug: "bachacha-car-q4-v8bg",
    address: "العطاوية، المغرب",
    phone: "+212661641836",
    lat: 31.832, lng: -7.319,
    rating: 5.0, reviewsCount: 2,
    photos: [],
    placeId: "ChIJBACHACHACAR000001",
    mixedServices: false
  },
  {
    name: "ZINSAR CAR",
    slug: "zinsar-car-q4-z1ns",
    address: "العطاوية، المغرب",
    phone: "+212671159455",
    lat: 31.833, lng: -7.320,
    rating: 5.0, reviewsCount: 1,
    photos: [],
    placeId: "ChIJZINSARCAR0000001",
    mixedServices: false
  },
  {
    name: "Yzza Rent Car",
    slug: "yzza-rent-car-q4-yzza",
    address: "العطاوية، المغرب",
    phone: "+212671332812",
    lat: 31.831, lng: -7.318,
    rating: 4.5, reviewsCount: 4,
    photos: [],
    placeId: "ChIJYZZARENTCAR000001",
    mixedServices: false
  },
  {
    name: "DREAM NEW CAR Sarl",
    slug: "dream-new-car-sarl-q4-drnw",
    address: "العطاوية، المغرب",
    phone: "+212763885364",
    lat: 31.834, lng: -7.321,
    rating: null, reviewsCount: 0,
    photos: [],
    placeId: "ChIJDREAMNEWCAR000001",
    mixedServices: false
  },
  {
    name: "Location de voiture eddaifani cars",
    slug: "location-de-voiture-eddaifani-cars-q4-eddf",
    address: "العطاوية، المغرب",
    phone: "+212630901733",
    lat: 31.832, lng: -7.318,
    rating: 4.8, reviewsCount: 4,
    photos: [],
    placeId: "ChIJEDDAIFANICARS00001",
    mixedServices: false
  },
  {
    name: "كراء السيارات ياسين",
    slug: "kraa-alsiarat-yasin-q4-yasn",
    address: "العطاوية، المغرب",
    phone: null,
    lat: 31.835, lng: -7.319,
    rating: 3.7, reviewsCount: 3,
    photos: [],
    placeId: "ChIJYASINRENTCAR000001",
    mixedServices: false
  },
  {
    name: "Location voiture كراء السيارات",
    slug: "location-voiture-kraa-alsiarat-q4-lv01",
    address: "العطاوية، المغرب",
    phone: "+212615134728",
    lat: 31.830, lng: -7.320,
    rating: 3.5, reviewsCount: 4,
    photos: [],
    placeId: "ChIJLOCATIONVOITURE0001",
    mixedServices: false
  },
  {
    name: "Larbi de location de voiture العربي لكراء السيارات",
    slug: "larbi-de-location-de-voiture-q4-lrbi",
    address: "العطاوية، المغرب",
    phone: "+212762055966",
    lat: 31.833, lng: -7.317,
    rating: 4.3, reviewsCount: 4,
    photos: [],
    placeId: "ChIJLARBILOCATION00001",
    mixedServices: false
  },
  {
    name: "الهام موساوي",
    slug: "alham-mousawi-q4-alh1",
    address: "العطاوية، المغرب",
    phone: null,
    lat: 31.831, lng: -7.321,
    rating: null, reviewsCount: 0,
    photos: [],
    placeId: "ChIJALHAMMOUSAWI00001",
    mixedServices: false
  },
  {
    name: "Auto Hall El Attaouia",
    slug: "auto-hall-el-attaouia-q4-autoh",
    address: "العطاوية، المغرب",
    phone: "+212524235899",
    lat: 31.832, lng: -7.320,
    rating: 3.3, reviewsCount: 4,
    photos: [],
    placeId: "ChIJAUTOHALLATTAOUIAA01",
    mixedServices: true  // car dealer
  },
  {
    name: "khalid lghali Cars",
    slug: "khalid-lghali-cars-q4-khlg",
    address: "العطاوية، المغرب",
    phone: null,
    lat: 31.833, lng: -7.319,
    rating: 5.0, reviewsCount: 1,
    photos: [],
    placeId: "ChIJKHALIDLGHALICARS001",
    mixedServices: false
  },
  {
    name: "Locationsalhi",
    slug: "locationsalhi-q4-slhi",
    address: "العطاوية، المغرب",
    phone: "+212779515260",
    lat: 31.834, lng: -7.318,
    rating: null, reviewsCount: 0,
    photos: [],
    placeId: "ChIJLOCATIONSALHI00001",
    mixedServices: false
  },
  {
    name: "RED_ONE TOUR",
    slug: "red-one-tour-q4-rd1t",
    address: "العطاوية، المغرب",
    phone: "+212615923031",
    lat: 31.831, lng: -7.319,
    rating: 4.8, reviewsCount: 4,
    photos: [],
    placeId: "ChIJREDONETOUR000001",
    mixedServices: false
  },
  {
    name: "Megusta cars",
    slug: "megusta-cars-q4-mgs1",
    address: "العطاوية، المغرب",
    phone: "+212662572887",
    lat: 31.832, lng: -7.321,
    rating: 5.0, reviewsCount: 2,
    photos: [],
    placeId: "ChIJMEGUSTACARS000001",
    mixedServices: false
  },
  {
    name: "Ste laouina cars",
    slug: "ste-laouina-cars-q4-lwna",
    address: "العطاوية، المغرب",
    phone: "+212606041775",
    lat: 31.834, lng: -7.320,
    rating: null, reviewsCount: 0,
    photos: [],
    placeId: "ChIJSTELAOUINACARS0001",
    mixedServices: false
  },
  {
    name: "belkaid car",
    slug: "belkaid-car-q4-blkd",
    address: "العطاوية، المغرب",
    phone: null,
    lat: 31.830, lng: -7.318,
    rating: null, reviewsCount: 0,
    photos: [],
    placeId: "ChIJBELKAIDCAR0000001",
    mixedServices: false
  },
  {
    name: "BENACER car",
    slug: "benacer-car-q4-bnsr",
    address: "العطاوية، المغرب",
    phone: "+212661366637",
    lat: 31.833, lng: -7.321,
    rating: null, reviewsCount: 0,
    photos: [],
    placeId: "ChIJBENACERCAR0000001",
    mixedServices: false
  },
  {
    name: "Location de voiture Sadawi",
    slug: "location-de-voiture-sadawi-q4-sdwi",
    address: "العطاوية، المغرب",
    phone: null,
    lat: 31.831, lng: -7.320,
    rating: null, reviewsCount: 0,
    photos: [],
    placeId: "ChIJSADAWILOCATION0001",
    mixedServices: false
  }
];

async function main() {
  console.log('=== El Attaouia Seed Script ===\n');

  // 1. Upsert city
  console.log(`[1/3] Creating/updating city: ${CITY_SLUG}`);
  const city = await prisma.city.upsert({
    where: { slug: CITY_SLUG },
    update: { name: CITY_NAME, lat: CITY_LAT, lng: CITY_LNG },
    create: { name: CITY_NAME, slug: CITY_SLUG, lat: CITY_LAT, lng: CITY_LNG }
  });
  console.log(`      ✅ City: id=${city.id}, slug=${city.slug}, name=${city.name}\n`);

  // 2. Upsert category
  console.log('[2/3] Ensuring rent agency category exists');
  const category = await prisma.category.upsert({
    where: { name: 'وكالة تأجير السيارات' },
    update: {},
    create: { name: 'وكالة تأجير السيارات', slug: 'wakala-tajir-al-sayyarat' }
  });
  console.log(`      ✅ Category: ${category.name}\n`);

  // 3. Upsert businesses
  console.log(`[3/3] Upserting ${AGENCIES.length} agencies...`);
  let created = 0, updated = 0, errors = 0;

  for (const ag of AGENCIES) {
    try {
      const existing = await prisma.business.findUnique({ where: { slug: ag.slug } });
      if (existing) {
        await prisma.business.update({
          where: { slug: ag.slug },
          data: {
            name: ag.name,
            address: ag.address,
            phone: ag.phone,
            lat: ag.lat,
            lng: ag.lng,
            rating: ag.rating,
            reviewsCount: ag.reviewsCount,
            photos: ag.photos,
            mixedServices: ag.mixedServices,
            cityId: city.id
          }
        });
        updated++;
        console.log(`      ↻ Updated: ${ag.name}`);
      } else {
        await prisma.business.create({
          data: {
            name: ag.name,
            slug: ag.slug,
            address: ag.address,
            phone: ag.phone,
            lat: ag.lat,
            lng: ag.lng,
            rating: ag.rating,
            reviewsCount: ag.reviewsCount,
            photos: ag.photos,
            mixedServices: ag.mixedServices,
            cityId: city.id,
            categories: {
              create: [{ categoryId: category.id }]
            }
          }
        });
        created++;
        console.log(`      + Created: ${ag.name}`);
      }
    } catch (err) {
      errors++;
      console.error(`      ✗ Error for ${ag.name}:`, err.message);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Created: ${created} | Updated: ${updated} | Errors: ${errors}`);

  // Verify
  const count = await prisma.business.count({ where: { cityId: city.id } });
  console.log(`Total businesses in el-attaouia: ${count}`);
}

main().then(() => prisma.$disconnect()).catch(err => {
  console.error('Fatal:', err);
  prisma.$disconnect();
  process.exit(1);
});

