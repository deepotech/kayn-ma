
import { generateSitemaps, default as sitemapFunc } from '../src/app/sitemap';
import dbConnect from '../src/lib/db';

async function test() {
    console.log('Starting test...');
    try {
        await dbConnect();
        console.log('DB Connected');

        console.log('Generating Sitemaps List...');
        const sitemaps = await generateSitemaps();
        console.log('Sitemaps:', sitemaps);

        console.log('Generating Static Sitemap...');
        const staticSitemap = await sitemapFunc({ id: 'static' });
        console.log('Static entries:', staticSitemap.length);

        console.log('Generating Agencies Sitemap...');
        const agenciesSitemap = await sitemapFunc({ id: 'agencies' });
        console.log('Agencies entries:', agenciesSitemap.length);

    } catch (error) {
        console.error('Test Failed:', error);
    }
    process.exit(0);
}

test();
