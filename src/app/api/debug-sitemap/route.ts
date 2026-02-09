
import { NextResponse } from 'next/server';
import { generateSitemaps, default as sitemapFunc } from '@/app/sitemap';

export async function GET() {
    try {
        console.log('Debug Sitemap: Starting...');

        const sitemaps = await generateSitemaps();
        console.log('Debug Sitemap: Generated IDs', sitemaps);

        const staticEntries = await sitemapFunc({ id: 'static' });
        console.log('Debug Sitemap: Generated Static Entries', staticEntries.length);

        return NextResponse.json({
            success: true,
            sitemaps,
            staticEntriesCount: staticEntries.length,
            staticEntriesPreview: staticEntries.slice(0, 3)
        });
    } catch (error: any) {
        console.error('Debug Sitemap Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
