import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import prisma from '../src/lib/db';
import { CITIES } from '../src/constants/data';
import { getCityCarGuide } from '../src/data/seo-guides/index';

async function test() {
    const city = 'beni-mellal';
    const cityData = CITIES.find(c => c.id === city);
    console.log('CityData:', cityData);
    
    console.log('Querying listings...');
    const listings = await prisma.listing.findMany({
        where: {
            city: {
                slug: {
                    equals: city,
                    mode: 'insensitive'
                }
            },
            status: 'approved',
            visibility: 'public'
        },
        orderBy: [
            { isFeatured: 'desc' },
            { publishedAt: 'desc' },
            { createdAt: 'desc' }
        ],
        take: 20
    });
    console.log('Listings found:', listings.length);
    
    console.log('Querying guide...');
    const guide = getCityCarGuide(city);
    console.log('Guide found:', !!guide);
    if (guide) {
        console.log('Guide ar title:', guide.ar.title);
        console.log('Guide fr title:', guide.fr.title);
    }
}
test().catch(console.error);
