/**
 * Moroccan Cities Configuration
 * Single source of truth for city data across the app
 */

export interface City {
    slug: string;
    name: {
        ar: string;
        fr: string;
    };
}

export const CITIES: City[] = [
    { slug: 'casablanca', name: { ar: 'الدار البيضاء', fr: 'Casablanca' } },
    { slug: 'rabat', name: { ar: 'الرباط', fr: 'Rabat' } },
    { slug: 'salé', name: { ar: 'سلا', fr: 'Salé' } },
    { slug: 'marrakech', name: { ar: 'مراكش', fr: 'Marrakech' } },
    { slug: 'tanger', name: { ar: 'طنجة', fr: 'Tanger' } },
    { slug: 'agadir', name: { ar: 'أكادير', fr: 'Agadir' } },
    { slug: 'fes', name: { ar: 'فاس', fr: 'Fès' } },
    { slug: 'meknes', name: { ar: 'مكناس', fr: 'Meknès' } },
    { slug: 'oujda', name: { ar: 'وجدة', fr: 'Oujda' } },
    { slug: 'kenitra', name: { ar: 'القنيطرة', fr: 'Kénitra' } },
    { slug: 'tetouan', name: { ar: 'تطوان', fr: 'Tétouan' } },
    { slug: 'temara', name: { ar: 'تمارة', fr: 'Témara' } },
    { slug: 'safi', name: { ar: 'آسفي', fr: 'Safi' } },
    { slug: 'mohammedia', name: { ar: 'المحمدية', fr: 'Mohammedia' } },
    { slug: 'kouribga', name: { ar: 'خريبكة', fr: 'Khouribga' } },
    { slug: 'el-jadida', name: { ar: 'الجديدة', fr: 'El Jadida' } },
    { slug: 'beni-mellal', name: { ar: 'بني ملال', fr: 'Béni Mellal' } },
    { slug: 'nador', name: { ar: 'الناظور', fr: 'Nador' } },
    { slug: 'taza', name: { ar: 'تازة', fr: 'Taza' } },
    { slug: 'settat', name: { ar: 'سطات', fr: 'Settat' } },
    { slug: 'berrechid', name: { ar: 'برشيد', fr: 'Berrechid' } },
    { slug: 'khemisset', name: { ar: 'الخميسات', fr: 'Khémisset' } },
    { slug: 'berkane', name: { ar: 'بركان', fr: 'Berkane' } },
    { slug: 'guelmim', name: { ar: 'كلميم', fr: 'Guelmim' } },
    { slug: 'larache', name: { ar: 'العرائش', fr: 'Larache' } },
    { slug: 'khanifra', name: { ar: 'خنيفرة', fr: 'Khénifra' } },
    { slug: 'essaouira', name: { ar: 'الصويرة', fr: 'Essaouira' } },
    { slug: 'al-hoceima', name: { ar: 'الحسيمة', fr: 'Al Hoceïma' } },
    { slug: 'ouarzazate', name: { ar: 'ورزازات', fr: 'Ouarzazate' } },
    { slug: 'tiznit', name: { ar: 'تيزنيت', fr: 'Tiznit' } },
    { slug: 'errachidia', name: { ar: 'الرشيدية', fr: 'Errachidia' } },
    { slug: 'taroudant', name: { ar: 'تارودانت', fr: 'Taroudannt' } },
    { slug: 'dakhla', name: { ar: 'الداخلة', fr: 'Dakhla' } },
    { slug: 'laayoune', name: { ar: 'العيون', fr: 'Laâyoune' } },
    { slug: 'chefchaouen', name: { ar: 'شفشاون', fr: 'Chefchaouen' } },
    { slug: 'fnideq', name: { ar: 'الفنيدق', fr: 'Fnideq' } },
    { slug: 'martil', name: { ar: 'مرتيل', fr: 'Martil' } },
    { slug: 'sidi-kacem', name: { ar: 'سيدي قاسم', fr: 'Sidi Kacem' } },
    { slug: 'sidi-slimane', name: { ar: 'سيدي سليمان', fr: 'Sidi Slimane' } },
    { slug: 'ifrane', name: { ar: 'إفران', fr: 'Ifrane' } },
    { slug: 'asilah', name: { ar: 'أصيلة', fr: 'Asilah' } },
    { slug: 'azrou', name: { ar: 'أزرو', fr: 'Azrou' } },
    { slug: 'midelt', name: { ar: 'ميدلت', fr: 'Midelt' } }
];

/**
 * Get city name by locale
 */
export function getCityName(city: City, locale: string): string {
    return locale === 'ar' ? city.name.ar : city.name.fr;
}

/**
 * Find city by slug
 */
export function findCityBySlug(slug: string | null | undefined): City | undefined {
    if (!slug || typeof slug !== 'string') return undefined;
    return CITIES.find(c => c.slug === slug.toLowerCase());
}

/**
 * Get all city slugs (for validation)
 */
export function getCitySlugs(): string[] {
    return CITIES.map(c => c.slug);
}
