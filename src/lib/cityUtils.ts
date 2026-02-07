import { CITIES, getCityName, findCityBySlug } from '@/constants/cities';

/**
 * Get the display name for a city
 * Handles both predefined cities (via slug) and custom cities
 */
export function getCityDisplayName(citySlug: string | { slug: string } | undefined | null, cityCustom: string | undefined | null, locale: string): string {
    // Extract slug if object
    const slug = (typeof citySlug === 'object' && citySlug !== null) ? citySlug.slug : citySlug;
    // If it's a custom city, return the custom name
    if (cityCustom) {
        return cityCustom;
    }


    // If the slug is 'other' but no custom name is provided (fallback)
    if (slug === 'other') {
        return locale === 'ar' ? 'مدينة أخرى' : 'Autre ville';
    }

    // Try to find the city in our constants
    const city = findCityBySlug(slug as string);
    if (city) {
        return getCityName(city, locale);
    }

    // Fallback: return the slug as is (capitalized)
    if (typeof slug === 'string') {
        return slug.charAt(0).toUpperCase() + slug.slice(1);
    }

    return '';
}

/**
 * Check if a city slug is valid (exists in our list)
 */
export function isValidCity(slug: string): boolean {
    return slug === 'other' || !!findCityBySlug(slug);
}
