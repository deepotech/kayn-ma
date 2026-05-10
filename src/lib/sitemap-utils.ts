import prisma from '@/lib/db';
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

export async function getTotalListingsCount(): Promise<number> {
    return prisma.listing.count({ where: { status: 'approved', visibility: 'public' } });
}

export async function getListingBatch(page: number, limit: number): Promise<any[]> {
    return prisma.listing.findMany({
        where: { status: 'approved', visibility: 'public' },
        select: { id: true, updatedAt: true },
        orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
        skip: page * limit,
        take: limit,
    });
}

async function getExistingData() {
    // Group by brandSlug and cityId to find active combinations
    const grouped = await prisma.listing.groupBy({
        by: ['brandSlug', 'cityId'],
        where: { status: 'approved', visibility: 'public' },
    });

    // Fetch city slugs for the cityIds
    const cityIds = [...new Set(grouped.map(g => g.cityId))];
    const cities = await prisma.city.findMany({
        where: { id: { in: cityIds } },
        select: { id: true, slug: true }
    });
    const citySlugMap = new Map(cities.map(c => [c.id, c.slug]));

    const activeBrands = new Set<string>();
    const activeCities = new Set<string>();
    const activeCombinations = new Set<string>();

    grouped.forEach(g => {
        const brand = g.brandSlug?.toLowerCase();
        const city = citySlugMap.get(g.cityId)?.toLowerCase();
        if (brand) activeBrands.add(brand);
        if (city) activeCities.add(city);
        if (brand && city) activeCombinations.add(`${brand}|${city}`);
    });

    return { activeBrands, activeCities, activeCombinations };
}

export async function getSeoLandingUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];
    const { activeBrands, activeCities, activeCombinations } = await getExistingData();

    carCatalog.forEach(brand => {
        if (activeBrands.has(brand.slug.toLowerCase())) {
            LOCALES.forEach(locale => {
                urls.push({ url: `${BASE_URL}/${locale}/cars/${brand.slug}`, changeFrequency: 'weekly', priority: 0.75, lastModified: new Date() });
            });
        }
    });

    CITIES.forEach(city => {
        if (activeCities.has(city.slug.toLowerCase())) {
            LOCALES.forEach(locale => {
                urls.push({ url: `${BASE_URL}/${locale}/cars/${city.slug}`, changeFrequency: 'weekly', priority: 0.75, lastModified: new Date() });
            });
        }
    });

    carCatalog.forEach(brand => {
        CITIES.forEach(city => {
            const key = `${brand.slug.toLowerCase()}|${city.slug.toLowerCase()}`;
            if (activeCombinations.has(key)) {
                LOCALES.forEach(locale => {
                    urls.push({ url: `${BASE_URL}/${locale}/cars/${brand.slug}/${city.slug}`, changeFrequency: 'weekly', priority: 0.75, lastModified: new Date() });
                });
            }
        });
    });

    return urls;
}
