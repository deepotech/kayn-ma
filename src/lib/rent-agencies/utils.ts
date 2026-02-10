import { NormalizedAgency } from './normalize';

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * Builds a deterministic canonical slug for an agency.
 * Format: slugify(title) + "-" + placeId.slice(-6)
 * This ensures URL stability even if name changes slightly, and uniqueness.
 */
export function buildAgencySlug(name: string, placeId: string | null, index: number): string {
    let baseSlug = slugify(name || 'agency');

    // Fallback if slugify results in empty string (e.g. name was only symbols)
    if (!baseSlug) baseSlug = `agency-${index}`;

    // Append small unique hash from placeId if available
    // We use the last 6 chars of placeId which is usually enough for uniqueness
    const suffix = placeId ? `-${placeId.slice(-6)}` : `-${index}`;

    return (baseSlug + suffix).toLowerCase();
}

/**
 * consistently builds the href for an agency detail page
 */
export function buildAgencyHref(locale: string, citySlug: string, agencySlug: string): string {
    return `/${locale}/rent-agencies/${citySlug}/${agencySlug}`;
}

/**
 * Normalizes agency images into a single array.
 * Picks the best available image as cover.
 */
export function getAgencyImages(raw: any): string[] {
    let photos: string[] = [];

    // Prioritize high-res or specifically named fields
    if (raw.originalImage) photos.push(raw.originalImage);
    if (raw.imageUrl) photos.push(raw.imageUrl);

    // Add the array of images
    if (raw.imageUrls && Array.isArray(raw.imageUrls)) {
        photos = [...photos, ...raw.imageUrls];
    }

    // Also check for 'images' field if scraping schema varies
    if (raw.images && Array.isArray(raw.images)) {
        photos = [...photos, ...raw.images];
    }

    // Deduplicate and filter empty/invalid
    return Array.from(new Set(photos)).filter(url => {
        return url && typeof url === 'string' && url.length > 5 && url.startsWith('http');
    });
}

/**
 * Helper to get proper address with fallback
 */
export function getAgencyAddress(raw: any): string {
    return raw.address || raw.street || raw.city || '';
}

export const CITY_NAMES_AR: Record<string, string> = {
    marrakech: 'مراكش',
    casablanca: 'الدار البيضاء',
    rabat: 'الرباط',
    tanger: 'طنجة',
    agadir: 'أكادير',
    fes: 'فاس',
    meknes: 'مكناس',
    oujda: 'وجدة',
    kenitra: 'القنيطرة',
    tetouan: 'تطوان',
    essaouira: 'الصويرة',
    safi: 'آسفي',
    mohammedia: 'المحمدية',
    eljadida: 'الجديدة',
    beni_mellal: 'بني ملال',
    nador: 'الناظور',
    taza: 'تازة',
    settat: 'سطات',
    berrechid: 'برشيد',
    khemisset: 'الخميسات'
};

export function getLocalizedCityName(citySlug: string, locale: string): string {
    if (locale === 'ar' && CITY_NAMES_AR[citySlug.toLowerCase()]) {
        return CITY_NAMES_AR[citySlug.toLowerCase()];
    }
    return citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://www.cayn.ma${item.url}`
        }))
    };
}
