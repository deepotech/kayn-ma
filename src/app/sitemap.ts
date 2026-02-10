import { MetadataRoute } from 'next';
import { getAgencies } from '@/lib/agencies';
import { getAllIntents } from '@/lib/rent-agencies/seo-intents';
import { CITY_NAMES_AR } from '@/lib/rent-agencies/utils';
import {
    BASE_URL,
    LOCALES,
    SITEMAP_CHUNK_SIZE,
    getTotalListingsCount,
    getListingBatch,
    getSeoLandingUrls,
} from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';

export async function generateSitemaps() {
    // 1. Calculate how many listing sitemaps we need
    const totalListings = await getTotalListingsCount();
    const listingChunks = Math.ceil(totalListings / SITEMAP_CHUNK_SIZE);

    const sitemaps = [
        { id: 'static' },
        { id: 'agencies' },
        { id: 'seo' },
    ];

    for (let i = 0; i < listingChunks; i++) {
        sitemaps.push({ id: `listings-${i}` });
    }

    return sitemaps;
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // --- 1. Static Pages ---
    // SEO Strategy: Prioritize high-traffic entry points and SEO landing pages
    if (id === 'static') {
        LOCALES.forEach(locale => {
            // Homepage - Critical entry point
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            });

            // Listings Index (Cars for sale/rent) - High-frequency updates
            // Note: Google ignores 'always', using 'hourly' instead
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/cars`,
                lastModified: new Date(),
                changeFrequency: 'hourly',
                priority: 0.9,
            });

            // Agencies Index - Weekly updates typical
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/rent-agencies`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });

            // Post Ad - CTA page, lower SEO priority
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/post`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            });

            // Legal & Info pages - Low SEO priority
            const infoPages = ['terms', 'privacy', 'contact'];
            infoPages.forEach(page => {
                sitemapEntries.push({
                    url: `${BASE_URL}/${locale}/${page}`,
                    lastModified: new Date(),
                    changeFrequency: 'yearly',
                    priority: 0.3,
                });
            });
        });
    }

    // --- 2. Agencies & Intent Pages ---
    // SEO Strategy: High-value city landing pages + programmatic SEO intent pages
    else if (id === 'agencies') {
        const { getSupportedCities } = await import('@/lib/rent-agencies/getAgenciesByCity');
        const supportedCities = getSupportedCities();

        // Fetch agencies from all supported cities
        const allAgencies: any[] = [];
        for (const city of supportedCities) {
            const { agencies } = await getAgencies({ city, limit: 10000 });
            allAgencies.push(...agencies);
        }

        const intents = getAllIntents();

        const agencyCities = Array.from(new Set(allAgencies.map(a => a.citySlug)));
        const predefinedCities = Object.keys(CITY_NAMES_AR);
        const allCities = Array.from(new Set([...agencyCities, ...predefinedCities]));

        // City Pages & Intent Pages
        allCities.forEach(city => {
            if (!city) return;

            LOCALES.forEach(locale => {
                // Agency City Page: /rent-agencies/[city] - High-value SEO landing page
                sitemapEntries.push({
                    url: `${BASE_URL}/${locale}/rent-agencies/${city}`,
                    lastModified: new Date(),
                    changeFrequency: 'daily',
                    priority: 0.85,
                });

                // Intent Pages: /rent-agencies/[city]/[intent]
                intents.forEach(intent => {
                    sitemapEntries.push({
                        url: `${BASE_URL}/${locale}/rent-agencies/${city}/${intent.slug}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    });
                });
            });
        });

        // Agency Detail Pages: /rent-agencies/[city]/[slug]
        allAgencies.forEach(agency => {
            LOCALES.forEach(locale => {
                sitemapEntries.push({
                    url: `${BASE_URL}/${locale}/rent-agencies/${agency.citySlug}/${agency.slug}`,
                    lastModified: new Date(), // Ideally create At or update At
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            });
        });
    }


    // --- 3. SEO Landing Pages (Programmatic Car Pages) ---
    // SEO Strategy: Brand, city, and brand+city combination pages for organic traffic
    else if (id === 'seo') {
        // Generates /cars/[brand], /cars/[city], /cars/[brand]/[city]
        getSeoLandingUrls().forEach(url => {
            sitemapEntries.push(url as any);
        });
    }

    // --- 4. Listings Chunks ---
    // SEO Strategy: Individual car listings with actual update timestamps
    else if (id.startsWith('listings-')) {
        const chunkIndex = parseInt(id.split('-')[1]);
        const listings = await getListingBatch(chunkIndex, SITEMAP_CHUNK_SIZE);

        listings.forEach((listing: any) => {
            LOCALES.forEach(locale => {
                sitemapEntries.push({
                    // Listings use ID in URL: /cars/[id]
                    url: `${BASE_URL}/${locale}/cars/${listing._id.toString()}`,
                    lastModified: listing.updatedAt ? new Date(listing.updatedAt) : new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.65,
                });
            });
        });
    }

    return sitemapEntries;
}
