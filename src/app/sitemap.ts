import { MetadataRoute } from 'next';
import { getAgencies } from '@/lib/agencies';
import { getAllIntents } from '@/lib/rent-agencies/seo-intents';
import { CITY_NAMES_AR } from '@/lib/rent-agencies/utils';

const BASE_URL = 'https://kayn.ma';
const LOCALES = ['ar', 'fr'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // 1. Static Routes
    LOCALES.forEach(locale => {
        sitemapEntries.push({
            url: `${BASE_URL}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        });
        sitemapEntries.push({
            url: `${BASE_URL}/${locale}/rent-agencies`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        });
    });

    // 2. Fetch Data
    const { agencies } = await getAgencies({ limit: 10000 });
    const intents = getAllIntents();

    // extract unique cities from agencies and predefined list
    const agencyCities = Array.from(new Set(agencies.map(a => a.citySlug)));
    const predefinedCities = Object.keys(CITY_NAMES_AR);
    const allCities = Array.from(new Set([...agencyCities, ...predefinedCities]));

    // 3. City Pages & Intent Pages
    allCities.forEach(city => {
        LOCALES.forEach(locale => {
            // City Page
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/rent-agencies/${city}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
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

    // 4. Agency Detail Pages
    agencies.forEach(agency => {
        LOCALES.forEach(locale => {
            sitemapEntries.push({
                url: `${BASE_URL}/${locale}/rent-agencies/${agency.citySlug}/${agency.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        });
    });

    return sitemapEntries;
}
