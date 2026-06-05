import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import prisma from '../src/lib/db';

async function test() {
    const marrakech = await prisma.city.findUnique({
        where: { slug: 'marrakech' }
    });
    if (!marrakech) {
        console.log("Marrakech not found in DB");
        return;
    }
    const businesses = await prisma.business.findMany({
        where: { cityId: marrakech.id },
        take: 3,
        include: {
            categories: {
                include: {
                    category: true
                }
            }
        }
    });

    console.log("Businesses in Marrakech:");
    for (const b of businesses) {
        console.log(`- ${b.name} (${b.slug})`);
        console.log(`  Categories:`, b.categories.map(c => c.category.name));
    }
}
test()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
