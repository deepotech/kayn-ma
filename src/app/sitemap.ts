import { MetadataRoute } from 'next';
import { getAgencies } from '@/lib/agencies';
import { getAllIntents } from '@/lib/rent-agencies/seo-intents';

import {
    BASE_URL,
    LOCALES,
    SITEMAP_CHUNK_SIZE,
    getTotalListingsCount,
    getListingBatch,
    getSeoLandingUrls,
} from '@/lib/sitemap-utils';

export const revalidate = 3600;

// Simplified single sitemap function (no generateSitemaps) for better stability
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = [];



    // 1. Static Pages
    LOCALES.forEach(locale => {
        // Homepage
        sitemapEntries.push({
            url: `${BASE_URL}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        });

        // Listings Index
        sitemapEntries.push({
            url: `${BASE_URL}/${locale}/cars`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        });

        // Agencies Index
        sitemapEntries.push({
            url: `${BASE_URL}/${locale}/rent-agencies`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        });

        // Post Ad
        sitemapEntries.push({
            url: `${BASE_URL}/${locale}/post`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        });

        // Legal & Info pages
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

    // 2. Agencies & Intent Pages
    const { getSupportedCities } = await import('@/lib/rent-agencies/getAgenciesByCity');
    const supportedCities = getSupportedCities();

    // Fetch agencies from all supported cities
    const allAgencies: any[] = [];
    for (const city of supportedCities) {
        const { agencies } = await getAgencies({ city, limit: 10000 });
        allAgencies.push(...agencies);
    }

    const intents = getAllIntents();
    // Use getSupportedCities() as single source of truth
    const allCities = supportedCities;

    // City Pages & Intent Pages
    allCities.forEach(city => {
        if (!city) return;

        LOCALES.forEach(locale => {
            // Agency City Page
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/rent-agencies/${city}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.85,
            });

            // Intent Pages
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

    // Agency Detail Pages
    allAgencies.forEach(agency => {
        LOCALES.forEach(locale => {
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/rent-agencies/${agency.citySlug}/${agency.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    });

    // 3. SEO Landing Pages (Programmatic Car Pages)
    getSeoLandingUrls().forEach(url => {
        sitemapEntries.push(url as any);
    });

    // 4. Listings
    // Load ALL listings (pagination loop)
    const totalListings = await getTotalListingsCount();
    const batchSize = 1000;
    const batches = Math.ceil(totalListings / batchSize);

    for (let i = 0; i < batches; i++) {
        const listings = await getListingBatch(i, batchSize);
        listings.forEach((listing: any) => {
            LOCALES.forEach(locale => {
                sitemapEntries.push({
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
