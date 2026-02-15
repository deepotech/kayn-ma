
import dbConnect from '../src/lib/db';
import Listing from '../src/models/Listing';
import { CITIES } from '../src/constants/cities';
import { carCatalog } from '../src/constants/car-brands-models';

async function verifySeoData() {
    console.log('🔌 Connecting to DB...');
    await dbConnect();
    console.log('✅ Connected.');

    console.log('\n📊 Verifying SEO Data Integrity...\n');

    // 1. Check Cities
    console.log('--- Cities Status ---');
    const cityStats = await Listing.aggregate([
        { $match: { status: 'approved', visibility: 'public' } },
        { $group: { _id: "$city.slug", count: { $sum: 1 } } }
    ]);

    const activeCitySlugs = new Set(cityStats.map(s => s._id));
    const missingCities = CITIES.filter(c => !activeCitySlugs.has(c.slug));

    console.log(`✅ Active Cities: ${activeCitySlugs.size}`);
    console.log(`⚠️  Cities with NO listings: ${missingCities.length}`);
    if (missingCities.length > 0) {
        console.log('   (These pages will NOT be in sitemap, but should render Empty State if visited)');
        missingCities.slice(0, 10).forEach(c => console.log(`   - ${c.slug}`));
        if (missingCities.length > 10) console.log(`   ...and ${missingCities.length - 10} more.`);
    }

    // 2. Check Brands
    console.log('\n--- Brands Status ---');
    const brandStats = await Listing.aggregate([
        { $match: { status: 'approved', visibility: 'public' } },
        { $group: { _id: "$brand.slug", count: { $sum: 1 } } }
    ]);

    const activeBrandSlugs = new Set(brandStats.map(s => s._id));
    const missingBrands = carCatalog.filter(b => !activeBrandSlugs.has(b.slug));

    console.log(`✅ Active Brands: ${activeBrandSlugs.size}`);
    console.log(`⚠️  Brands with NO listings: ${missingBrands.length}`);

    // 3. Specific Check for Alfa Romeo / Guelmim
    console.log('\n--- Specific Check: Alfa Romeo / Guelmim ---');
    const alfaGuelmimCount = await Listing.countDocuments({
        "brand.slug": "alfa-romeo",
        "city.slug": "guelmim",
        status: 'approved',
        visibility: 'public'
    });
    console.log(`Ads for Alfa Romeo in Guelmim: ${alfaGuelmimCount}`);

    if (alfaGuelmimCount === 0) {
        console.log('ℹ️  Result: correctly 0.');
        console.log('   - Page should render 200 OK with "No ads found".');
        console.log('   - Sitemap should NOT include this URL.');
    } else {
        console.log('ℹ️  Result: Has data.');
        console.log('   - Page should render 200 OK with listings.');
        console.log('   - Sitemap SHOULD include this URL.');
    }

    process.exit(0);
}

verifySeoData().catch(e => {
    console.error(e);
    process.exit(1);
});
