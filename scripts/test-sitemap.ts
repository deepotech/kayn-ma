
import sitemapFunc from '../src/app/sitemap';
import dbConnect from '../src/lib/db';

async function test() {
    console.log('Starting test...');
    try {
        await dbConnect();
        console.log('DB Connected');

        console.log('Generating Sitemap...');
        const sitemap = await sitemapFunc();
        console.log('Total entries:', sitemap.length);
    } catch (error) {
        console.error('Test Failed:', error);
    }
    process.exit(0);
}

test();
