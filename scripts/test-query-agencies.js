require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("Checking database records for Kelaat Sraghna...");
    const kelaat = await prisma.city.findUnique({
        where: { slug: 'kelaat-sraghna' }
    });
    if (!kelaat) {
        console.error("❌ Kelaat Sraghna not found in DB");
        return;
    }
    console.log(`🟢 City Found: ${kelaat.name} (ID: ${kelaat.id})`);

    const totalBusinesses = await prisma.business.count({
        where: { cityId: kelaat.id }
    });
    console.log(`Total Businesses seeded: ${totalBusinesses}`);

    const totalReviews = await prisma.review.count({
        where: {
            business: {
                cityId: kelaat.id
            }
        }
    });
    console.log(`Total Reviews seeded: ${totalReviews}`);

    // Count by categories
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: {
                    businesses: {
                        where: {
                            business: {
                                cityId: kelaat.id
                            }
                        }
                    }
                }
            }
        }
    });

    console.log("Distribution by category:");
    for (const cat of categories) {
        console.log(`- ${cat.name}: ${cat._count.businesses} businesses`);
    }
}
test()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

