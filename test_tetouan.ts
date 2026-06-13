import { getAgenciesByCity } from './src/lib/rent-agencies/getAgenciesByCity';
import { getCityRentGuide, getCityCarGuide } from './src/data/seo-guides';

async function test() {
    console.log("=== Testing Database Queries for Tetouan ===");
    const agencies = await getAgenciesByCity('tetouan');
    console.log(`Fetched ${agencies.length} agencies for Tetouan.`);
    if (agencies.length > 0) {
        console.log(`First agency: ${agencies[0].name} (Slug: ${agencies[0].slug}, City: ${agencies[0].city})`);
    } else {
        console.error("❌ No agencies found!");
    }

    console.log("\n=== Testing SEO Guide Resolution ===");
    const rentGuide = getCityRentGuide('tetouan');
    if (rentGuide) {
        console.log(`✅ Rent Guide (AR): "${rentGuide.ar.title}"`);
        console.log(`   Sections: ${rentGuide.ar.sections.length}, FAQs: ${rentGuide.ar.faqs.length}`);
        console.log(`✅ Rent Guide (FR): "${rentGuide.fr.title}"`);
        console.log(`   Sections: ${rentGuide.fr.sections.length}, FAQs: ${rentGuide.fr.faqs.length}`);
    } else {
        console.error("❌ Rent guide not resolved!");
    }

    const carGuide = getCityCarGuide('tetouan');
    if (carGuide) {
        console.log(`✅ Car Guide (AR): "${carGuide.ar.title}"`);
        console.log(`   Sections: ${carGuide.ar.sections.length}, FAQs: ${carGuide.ar.faqs.length}`);
        console.log(`✅ Car Guide (FR): "${carGuide.fr.title}"`);
        console.log(`   Sections: ${carGuide.fr.sections.length}, FAQs: ${carGuide.fr.faqs.length}`);
    } else {
        console.error("❌ Car guide not resolved!");
    }
}

test().catch(console.error);
