import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import prisma from './src/lib/db';

async function test() {
    const counts = await prisma.business.groupBy({
        by: ['cityId'],
        _count: { id: true }
    });
    const cities = await prisma.city.findMany({
        where: { id: { in: counts.map(c => c.cityId) } }
    });
    
    for (const c of counts) {
        const city = cities.find(city => city.id === c.cityId);
        console.log(`${city?.slug}: ${c._count.id} agencies`);
    }
}
test();
