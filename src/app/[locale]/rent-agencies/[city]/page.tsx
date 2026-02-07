import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAgenciesByCity, getAgencies } from '@/lib/agencies';
import AgencyList from '@/components/rent-agencies/AgencyList';
import { buildAgencyHref, getLocalizedCityName, generateBreadcrumbSchema } from '@/lib/rent-agencies/utils';
import IntentLinks from '@/components/rent-agencies/IntentLinks';
import { getAllIntents } from '@/lib/rent-agencies/seo-intents';

interface Props {
    params: {
        city: string;
        locale: string;
    };
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const cityName = getLocalizedCityName(params.city, params.locale);
    const { locale } = params;

    const title = locale === 'ar'
        ? `أفضل وكالات كراء السيارات في ${cityName} | أسعار رخيصة وتقييمات حقيقية`
        : `Best car rental agencies in ${cityName} | Cheap prices & real reviews`;

    const description = locale === 'ar'
        ? `اكتشف أفضل وكالات كراء السيارات في ${cityName} مع تقييمات حقيقية، مواقع دقيقة، وأرقام الاتصال المباشر. قارن واختر بسهولة.`
        : `Discover the best car rental agencies in ${cityName} with real reviews, precise locations, and direct contact numbers. Compare and choose easily.`;

    const baseUrl = 'https://kayn.ma';
    const path = `/rent-agencies/${params.city}`;

    return {
        title,
        description,
        alternates: {
            canonical: `${baseUrl}/${locale}${path}`,
            languages: {
                'ar': `${baseUrl}/ar${path}`,
                'fr': `${baseUrl}/fr${path}`,
            }
        },
        openGraph: {
            type: 'website',
            title,
            description,
            url: `${baseUrl}/${locale}${path}`,
            siteName: 'Kayn.ma',
            locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
        }
    };
}

export default async function CityAgenciesPage({ params }: Props) {
    const { city, locale } = params;
    const t = await getTranslations({ locale, namespace: 'RentAgencies.Listing' });

    // Fetch Full Dataset (Server-Side)
    const result = await getAgencies({
        city,
        limit: 5000,
        mixedServices: undefined
    });

    const allAgencies = result.agencies;
    const total = result.total;

    const cityName = getLocalizedCityName(city, locale);
    const intents = getAllIntents();

    // JSON-LD for ItemList
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: allAgencies.slice(0, 20).map((agency, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `https://kayn.ma${buildAgencyHref(locale, agency.citySlug, agency.slug)}`,
            name: agency.name
        }))
    };

    const breadcrumbJsonLd = generateBreadcrumbSchema([
        { name: 'Home', url: `/${locale}` },
        { name: t('breadcrumb'), url: `/${locale}/rent-agencies` },
        { name: cityName, url: `/${locale}/rent-agencies/${city}` }
    ]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* JSON-LD: ItemList */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* JSON-LD: BreadcrumbList */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            {/* Breadcrumb & Header */}
            <div className="mb-8">
                <div className="text-sm text-slate-500 mb-2">
                    <Link href={`/${locale}/rent-agencies`} className="hover:text-blue-600">{t('breadcrumb')}</Link> / <span className="text-slate-900 font-medium">{cityName}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">
                            {t('title', { city: cityName })}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            {/* Note: This static count is correct for total agencies, filters update the view count in AgencyList */}
                            {t('count', { count: total })}
                        </p>
                    </div>
                </div>

                {/* SEO Text Block */}
                <div className="mt-4 text-sm text-slate-500 max-w-4xl leading-relaxed hidden md:block">
                    <p>
                        {t('seoDescription', { city: cityName })}
                    </p>
                </div>

                {/* Quick Links (Intents) */}
                <div className="flex flex-wrap gap-3 mt-6">
                    {intents.map((intent) => {
                        let chipLabel = '';
                        if (locale === 'ar') {
                            switch (intent.slug) {
                                case 'best': chipLabel = 'الأفضل تقييماً'; break;
                                case 'airport': chipLabel = 'المطار'; break;
                                case 'cheap': chipLabel = 'رخيصة'; break;
                                case 'luxury': chipLabel = 'فاخرة'; break;
                                case 'no-deposit': chipLabel = 'بدون شيك'; break;
                                case '24h': chipLabel = '24/24'; break;
                                case 'most-reviewed': chipLabel = 'الأكثر طلباً'; break;
                                default:
                                    chipLabel = intent.params.ar.split('|')[0].replace('{city}', '').replace(cityName, '').trim();
                            }
                        } else {
                            switch (intent.slug) {
                                case 'best': chipLabel = 'Best Rated'; break;
                                case 'airport': chipLabel = 'Airport'; break;
                                case 'cheap': chipLabel = 'Cheap'; break;
                                case 'luxury': chipLabel = 'Luxury'; break;
                                case 'no-deposit': chipLabel = 'No Deposit'; break;
                                case '24h': chipLabel = '24h'; break;
                                case 'most-reviewed': chipLabel = 'Popular'; break;
                                default:
                                    chipLabel = intent.params.fr.split('|')[0].replace('{city}', '').replace(cityName, '').trim();
                            }
                        }

                        if (!chipLabel) return null;

                        return (
                            <Link
                                key={intent.slug}
                                href={`/${locale}/rent-agencies/${city}/${intent.slug}`}
                                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors border border-slate-200 dark:border-zinc-700"
                            >
                                {chipLabel}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Client Side List & Filters */}
            <AgencyList
                initialAgencies={allAgencies}
                cityName={cityName}
            />
            {/* Internal Linking */}
            <div className="mt-20 pt-10 border-t border-slate-200 dark:border-zinc-800">
                <IntentLinks currentIntent="view-all" city={params.city} locale={params.locale} />
            </div>
        </div>
    );
}
