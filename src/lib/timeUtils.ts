/**
 * Relative time formatting utility for Cayn.ma
 * Supports Arabic and French locales
 */

interface RelativeTimeStrings {
    justNow: string;
    minutesAgo: (count: number) => string;
    hoursAgo: (count: number) => string;
    daysAgo: (count: number) => string;
}

const localeStrings: Record<string, RelativeTimeStrings> = {
    ar: {
        justNow: 'الآن',
        minutesAgo: (count) => `قبل ${count} دقيقة`,
        hoursAgo: (count) => `قبل ${count} ساعة`,
        daysAgo: (count) => `قبل ${count} يوم`,
    },
    fr: {
        justNow: "À l'instant",
        minutesAgo: (count) => `Il y a ${count} min`,
        hoursAgo: (count) => `Il y a ${count}h`,
        daysAgo: (count) => `Il y a ${count}j`,
    },
};

/**
 * Get relative time string from a date
 * @param date - The date to format
 * @param locale - 'ar' or 'fr'
 * @returns Localized relative time string
 */
export function getRelativeTime(date: Date | string, locale: string = 'fr'): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const strings = localeStrings[locale] || localeStrings.fr;

    if (diffMins < 1) {
        return strings.justNow;
    } else if (diffMins < 60) {
        return strings.minutesAgo(diffMins);
    } else if (diffHours < 24) {
        return strings.hoursAgo(diffHours);
    } else {
        return strings.daysAgo(diffDays);
    }
}

/**
 * Format view count with locale-aware number formatting
 */
export function formatViews(views: number, locale: string = 'fr'): string {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-MA').format(views);
}
