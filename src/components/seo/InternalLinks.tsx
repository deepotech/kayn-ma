'use client';

import { Link } from '@/navigation';
import { CITIES, BRANDS } from '@/constants/data';
import { useLocale } from 'next-intl';

export default function InternalLinks() {
    const locale = useLocale();

    // Top 8 Cities
    const topCities = CITIES.slice(0, 8);
    // Top 8 Brands
    const topBrands = BRANDS.slice(0, 8);

    const priceRanges = [
        { label: locale === 'ar' ? 'أقل من 50,000 درهم' : 'Moins de 50 000 DH', value: 'under-50000' },
        { label: locale === 'ar' ? 'بين 50,000 و 100,000' : 'Entre 50k et 100k DH', value: '50000-100000' },
        { label: locale === 'ar' ? 'بين 100,000 و 200,000' : 'Entre 100k et 200k DH', value: '100000-200000' },
        { label: locale === 'ar' ? 'أكثر من 200,000 درهم' : 'Plus de 200 000 DH', value: 'over-200000' },
    ];

    return (
        <div className="bg-gray-50 dark:bg-zinc-900/50 py-12 mt-12 border-t border-gray-100 dark:border-zinc-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Cities */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                            {locale === 'ar' ? 'سيارات حسب المدينة' : 'Voitures par ville'}
                        </h3>
                        <ul className="space-y-2">
                            {topCities.map(city => (
                                <li key={city.id}>
                                    <Link
                                        href={`/cars/city/${city.id}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {locale === 'ar' ? `سيارات للبيع في ${city.ar}` : `Voitures à vendre à ${city.fr}`}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Brands */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                            {locale === 'ar' ? 'أشهر الماركات' : 'Marques populaires'}
                        </h3>
                        <ul className="space-y-2">
                            {topBrands.map(brand => (
                                <li key={brand.id}>
                                    <Link
                                        href={`/search?brand=${brand.name}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {locale === 'ar' ? `سيارات ${brand.name} للبيع` : `Voitures ${brand.name} occasion`}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Budgets */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                            {locale === 'ar' ? 'حسب الميزانية' : 'Par budget'}
                        </h3>
                        <ul className="space-y-2">
                            {priceRanges.map(range => (
                                <li key={range.value}>
                                    <Link
                                        href={`/cars/budget/${range.value}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                                    >
                                        {range.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}
