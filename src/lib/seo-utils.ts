import { BRANDS, BODY_TYPES } from '@/constants/data';
import { CITIES } from '@/constants/cities';
// import { getBrandName, getModelName } from '@/constants/car-brands-models';

/**
 * Checks if a string is a valid MongoDB ObjectId.
 * 24 hex characters.
 */
export function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

export interface SeoFilters {
    brand?: string;
    city?: string;
    bodyType?: string;
    isValid: boolean;
    slugsUsed: string[];
}

/**
 * Parses a list of slugs into SEO filters.
 * Returns the detected filters and whether the combination is valid.
 * Enforces that we don't have duplicates (e.g. two cities).
 */
export function parseSeoSlugs(slugs: string[]): SeoFilters {
    const filters: SeoFilters = {
        isValid: true,
        slugsUsed: []
    };

    const usedCategories = new Set<'brand' | 'city' | 'bodyType'>();

    for (const slug of slugs) {
        const lowerSlug = slug.toLowerCase();
        let found = false;

        // 1. Check Brand
        const brand = BRANDS.find(b => b.id === lowerSlug);
        if (brand) {
            if (usedCategories.has('brand')) {
                filters.isValid = false;
                break;
            }
            filters.brand = brand.id;
            usedCategories.add('brand');
            found = true;
        }

        // 2. Check City
        if (!found) {
            const city = CITIES.find(c => c.slug === lowerSlug);
            if (city) {
                if (usedCategories.has('city')) {
                    filters.isValid = false;
                    break;
                }
                filters.city = city.slug;
                usedCategories.add('city');
                found = true;
            }
        }

        // 3. Check Body Type
        if (!found) {
            const bodyType = BODY_TYPES.find(b => b.id === lowerSlug);
            if (bodyType) {
                if (usedCategories.has('bodyType')) {
                    filters.isValid = false;
                    break;
                }
                filters.bodyType = bodyType.id;
                usedCategories.add('bodyType');
                found = true;
            }
        }

        if (!found) {
            // Allow specific prefixes to be ignored for better URL structure readability
            // e.g. /cars/brands/toyota or /cars/cities/casablanca
            if (['brands', 'cities', 'body-types'].includes(lowerSlug)) {
                filters.slugsUsed.push(lowerSlug);
                continue;
            }

            filters.isValid = false;
            break;
        }

        filters.slugsUsed.push(lowerSlug);
    }

    return filters;
}

/**
 * Generates a title for the SEO page based on filters
 */
export function getSeoPageTitle(filters: SeoFilters, locale: string): string {
    const parts: string[] = [];

    // Base: "Cars" or "Cars [BodyType]"
    let base = locale === 'ar' ? 'سيارات' : 'Voitures';

    if (filters.bodyType) {
        const bt = BODY_TYPES.find(b => b.id === filters.bodyType);
        if (bt) {
            base = locale === 'ar' ? `سيارات ${bt.ar}` : `Voitures ${bt.fr}`;
        }
    }
    parts.push(base);

    // Brand
    if (filters.brand) {
        const brand = BRANDS.find(b => b.id === filters.brand);
        if (brand) {
            parts.push(brand.name); // Brand name is usually universal or has name field
        }
    }

    // Purpose (defaulting to sale for general SEO pages often, or neutral "for sale")
    parts.push(locale === 'ar' ? 'للبيع' : 'à vendre');

    // City
    if (filters.city) {
        const city = CITIES.find(c => c.slug === filters.city);
        if (city) {
            const cityName = locale === 'ar' ? city.name.ar : city.name.fr;
            parts.push(locale === 'ar' ? `في ${cityName}` : `à ${cityName}`);
        } else {
            parts.push(locale === 'ar' ? `في المغرب` : `au Maroc`);
        }
    } else {
        parts.push(locale === 'ar' ? `في المغرب` : `au Maroc`);
    }

    return parts.join(' ');
}

export function getSeoDescription(filters: SeoFilters, locale: string): string {
    const title = getSeoPageTitle(filters, locale);
    if (locale === 'ar') {
        return `أفضل عروض ${title}. تصفح آلاف الإعلانات الحقيقية مع الصور والأسعار. تواصل مباشرة مع البائعين في المغرب.`;
    }
    return `Meilleures offres de ${title}. Parcourez des milliers d'annonces réelles avec photos et prix. Contactez directement les vendeurs au Maroc.`;
}
