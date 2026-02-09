import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { carCatalog } from '@/constants/car-brands-models';
import { CITIES } from '@/constants/cities';

export const BASE_URL = 'https://www.cayn.ma';
export const LOCALES = ['ar', 'fr'];

export const SITEMAP_CHUNK_SIZE = 5000;

export interface SitemapUrl {
    url: string;
    lastModified?: Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

/**
 * Get total count of public approved listings
 */
export async function getTotalListingsCount(): Promise<number> {
    await dbConnect();
    return Listing.countDocuments({ status: 'approved', visibility: 'public' });
}

/**
 * Get batch of listings for sitemap
 * Returns only necessary fields: _id, updatedAt, slug-related fields if needed
 */
export async function getListingBatch(page: number, limit: number): Promise<any[]> {
    await dbConnect();
    return Listing.find({ status: 'approved', visibility: 'public' })
        .select('_id updatedAt')
        .sort({ updatedAt: -1, _id: 1 }) // Stable sort
        .skip(page * limit)
        .limit(limit)
        .lean();
}

/**
 * Generate SEO Landing Page URLs
 * combinations:
 * - /cars/[brand]
 * - /cars/city/[city] (Wait, checks parseSeoSlugs: checks brand then city)
 * - so /cars/[city] is valid if city slug is unique (yes it is)
 * - /cars/[brand]/[city] ? parseSeoSlugs loops.
 *   - slug 1: brand -> found
 *   - slug 2: city -> found
 *   - so /cars/dacia/casablanca is valid.
 */
export function getSeoLandingUrls(): SitemapUrl[] {
    const urls: SitemapUrl[] = [];

    // 1. Brands - Individual brand pages
    carCatalog.forEach(brand => {
        LOCALES.forEach(locale => {
            urls.push({
                url: `${BASE_URL}/${locale}/cars/${brand.slug}`,
                changeFrequency: 'weekly',
                priority: 0.75,
                lastModified: new Date()
            });
        });
    });

    // 2. Cities - Individual city pages
    CITIES.forEach(city => {
        LOCALES.forEach(locale => {
            urls.push({
                url: `${BASE_URL}/${locale}/cars/${city.slug}`,
                changeFrequency: 'weekly',
                priority: 0.75,
                lastModified: new Date()
            });
        });
    });

    // 3. Brand + City Combinations - Long-tail SEO pages
    // ~30 brands × ~50 cities × 2 locales = ~3000 URLs (manageable)
    carCatalog.forEach(brand => {
        CITIES.forEach(city => {
            LOCALES.forEach(locale => {
                urls.push({
                    url: `${BASE_URL}/${locale}/cars/${brand.slug}/${city.slug}`,
                    changeFrequency: 'weekly',
                    priority: 0.75,
                    lastModified: new Date()
                });
            });
        });
    });

    return urls;
}
