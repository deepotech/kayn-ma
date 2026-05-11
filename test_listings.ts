import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import prisma from './src/lib/db';

async function test() {
    const listings = await prisma.listing.findMany({
        where: { status: 'approved', visibility: 'public' },
        orderBy: { createdAt: 'desc' },
        take: 1
    });
    console.log(JSON.stringify(listings[0], null, 2));
}
test();
