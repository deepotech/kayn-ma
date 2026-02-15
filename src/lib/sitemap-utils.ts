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
/**
 * Get existing brand/city combinations from DB
 */
async function getExistingData() {
    await dbConnect();

    // Aggregate to get all brands and cities that have at least one public approved listing
    const stats = await Listing.aggregate([
        { $match: { status: 'approved', visibility: 'public' } },
        {
            $group: {
                _id: {
                    brand: "$brand.slug",
                    city: "$city.slug"
                }
            }
        },
        {
            $project: {
                _id: 0,
                brand: "$_id.brand",
                city: "$_id.city"
            }
        }
    ]);

    const activeBrands = new Set<string>();
    const activeCities = new Set<string>();
    const activeCombinations = new Set<string>();

    stats.forEach(stat => {
        if (stat.brand) activeBrands.add(stat.brand.toLowerCase());
        if (stat.city) activeCities.add(stat.city.toLowerCase());
        if (stat.brand && stat.city) activeCombinations.add(`${stat.brand.toLowerCase()}|${stat.city.toLowerCase()}`);
    });

    return { activeBrands, activeCities, activeCombinations };
}

/**
 * Generate SEO Landing Page URLs
 * Only generates URLs for brands/cities/combinations that actually have listings.
 */
export async function getSeoLandingUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];
    const { activeBrands, activeCities, activeCombinations } = await getExistingData();

    // 1. Brands - Individual brand pages
    // Only generate if brand has at least one active listing
    carCatalog.forEach(brand => {
        if (activeBrands.has(brand.slug.toLowerCase())) {
            LOCALES.forEach(locale => {
                urls.push({
                    url: `${BASE_URL}/${locale}/cars/${brand.slug}`,
                    changeFrequency: 'weekly',
                    priority: 0.75,
                    lastModified: new Date()
                });
            });
        }
    });

    // 2. Cities - Individual city pages
    // Only generate if city has at least one active listing AND is in supported list
    CITIES.forEach(city => {
        if (activeCities.has(city.slug.toLowerCase())) {
            LOCALES.forEach(locale => {
                urls.push({
                    url: `${BASE_URL}/${locale}/cars/${city.slug}`,
                    changeFrequency: 'weekly',
                    priority: 0.75,
                    lastModified: new Date()
                });
            });
        }
    });

    // 3. Brand + City Combinations - Long-tail SEO pages
    // Only generate if specific combination exists
    carCatalog.forEach(brand => {
        CITIES.forEach(city => {
            const key = `${brand.slug.toLowerCase()}|${city.slug.toLowerCase()}`;
            if (activeCombinations.has(key)) {
                LOCALES.forEach(locale => {
                    urls.push({
                        url: `${BASE_URL}/${locale}/cars/${brand.slug}/${city.slug}`,
                        changeFrequency: 'weekly',
                        priority: 0.75,
                        lastModified: new Date()
                    });
                });
            }
        });
    });

    return urls;
}
