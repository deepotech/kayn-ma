import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAgenciesByCity, getAgencies } from '@/lib/agencies';
import AgencyList from '@/components/rent-agencies/AgencyList';
import { buildAgencyHref, getLocalizedCityName, generateBreadcrumbSchema } from '@/lib/rent-agencies/utils';
import IntentLinks from '@/components/rent-agencies/IntentLinks';
import { getAllIntents } from '@/lib/rent-agencies/seo-intents';
import { getCityRentGuide } from '@/data/seo-guides/index';

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

    const year = new Date().getFullYear();

    const title = locale === 'ar'
        ? `وكالات كراء السيارات في ${cityName} | أفضل الشركات ${year}`
        : `Car Rental Agencies in ${cityName} | Best Companies ${year}`;

    const description = locale === 'ar'
        ? `اكتشف أفضل وكالات كراء السيارات في ${cityName} مع تقييمات حقيقية، مواقع دقيقة، وأرقام الاتصال المباشر. قارن واختر بسهولة.`
        : `Discover the best car rental agencies in ${cityName} with real reviews, precise locations, and direct contact numbers. Compare and choose easily.`;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cayn.ma';
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
            siteName: 'Cayn.ma',
            locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
        }
    };
}

export default async function CityAgenciesPage({ params }: Props) {
    const { locale } = params;
    const city = params.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
            url: `https://www.cayn.ma${buildAgencyHref(locale, agency.citySlug, agency.slug)}`,
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

            {/* Dynamic SEO Guide Block — rendered for any city that has a guide in the registry */}
            {(() => {
                const guide = getCityRentGuide(city);
                if (!guide) return null;
                const lang = locale === 'ar' ? guide.ar : guide.fr;
                const faqSchema = {
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: lang.faqs.map(faq => ({
                        '@type': 'Question',
                        name: faq.question,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: faq.answer
                        }
                    }))
                };
                return (
                    <>
                        {/* FAQPage JSON-LD */}
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                        />
                        <div className="mt-16 bg-white dark:bg-zinc-900 rounded-xl p-8 border border-slate-200 dark:border-zinc-800 shadow-sm max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{lang.title}</h2>
                            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800/50">
                                <span>
                                    {locale === 'ar' ? 'آخر تحديث: يونيو 2026' : 'Dernière mise à jour : Juin 2026'}
                                </span>
                                <span>•</span>
                                <span>
                                    {locale === 'ar' ? 'بقلم: فريق Cayn.ma' : 'Par : L\'équipe Cayn.ma'}
                                </span>
                            </div>
                            <div className="space-y-8">
                                {lang.sections.map((section, i) => (
                                    <section key={i}>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">{section.title}</h3>
                                        {Array.isArray(section.content) ? (
                                            <ul className="list-disc list-inside space-y-2 ms-2 text-slate-600 dark:text-slate-400">
                                                {section.content.map((item, j) => (
                                                    <li key={j}>{item}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{section.content}</p>
                                        )}
                                    </section>
                                ))}
                            </div>
                            {/* FAQ Section */}
                            <div className="mt-10 border-t border-slate-200 dark:border-zinc-800 pt-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                                    {locale === 'ar' ? 'الأسئلة الشائعة' : 'Questions fréquentes'}
                                </h3>
                                <div className="space-y-4">
                                    {lang.faqs.map((faq, i) => (
                                        <div key={i} className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{faq.question}</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Related Guides Section */}
                            <div className="mt-10 border-t border-slate-200 dark:border-zinc-800 pt-8">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                    {locale === 'ar' ? 'قد يهمك أيضاً:' : 'Vous aimerez aussi :'}
                                </h3>
                                <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                                    <li>
                                        <Link href={`/${locale}/cars/city/${city}`} className="hover:underline">
                                            {locale === 'ar'
                                                ? `دليل شراء سيارة مستعملة في ${cityName}`
                                                : `Guide d'achat de voitures d'occasion à ${cityName}`}
                                        </Link>
                                    </li>
                                    {city !== 'marrakech' && (
                                        <li>
                                            <Link href={`/${locale}/rent-agencies/marrakech`} className="hover:underline">
                                                {locale === 'ar' ? 'دليل كراء السيارات في مراكش' : 'Guide de location de voiture à Marrakech'}
                                            </Link>
                                        </li>
                                    )}
                                    {city !== 'casablanca' && (
                                        <li>
                                            <Link href={`/${locale}/rent-agencies/casablanca`} className="hover:underline">
                                                {locale === 'ar' ? 'دليل كراء السيارات في الدار البيضاء' : 'Guide de location de voiture à Casablanca'}
                                            </Link>
                                        </li>
                                    )}
                                    {city !== 'rabat' && (
                                        <li>
                                            <Link href={`/${locale}/rent-agencies/rabat`} className="hover:underline">
                                                {locale === 'ar' ? 'دليل كراء السيارات في الرباط' : 'Guide de location de voiture à Rabat'}
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </>
                );
            })()}

            {/* Internal Linking */}
            <div className="mt-20 pt-10 border-t border-slate-200 dark:border-zinc-800">
                <IntentLinks currentIntent="view-all" city={params.city} locale={params.locale} />
            </div>

            {/* Cross-City Internal Links */}
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">
                    {locale === 'ar' ? 'وكالات كراء السيارات في مدن أخرى' : 'Agences de location dans d\'autres villes'}
                </h2>
                <div className="flex flex-wrap gap-3">
                    {((): { slug: string; ar: string; fr: string }[] => {
                        const currentCity = params.city.toLowerCase();
                        // City-specific related cities for better topical relevance
                        const cityRelations: Record<string, { slug: string; ar: string; fr: string }[]> = {
                            tanger: [
                                { slug: 'tetouan', ar: 'تطوان', fr: 'Tétouan' },
                                { slug: 'rabat', ar: 'الرباط', fr: 'Rabat' },
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                                { slug: 'fes', ar: 'فاس', fr: 'Fès' },
                                { slug: 'marrakech', ar: 'مراكش', fr: 'Marrakech' },
                                { slug: 'agadir', ar: 'أكادير', fr: 'Agadir' },
                            ],
                            fes: [
                                { slug: 'meknes', ar: 'مكناس', fr: 'Meknès' },
                                { slug: 'tanger', ar: 'طنجة', fr: 'Tanger' },
                                { slug: 'rabat', ar: 'الرباط', fr: 'Rabat' },
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                                { slug: 'marrakech', ar: 'مراكش', fr: 'Marrakech' },
                                { slug: 'agadir', ar: 'أكادير', fr: 'Agadir' },
                            ],
                            rabat: [
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                                { slug: 'tanger', ar: 'طنجة', fr: 'Tanger' },
                                { slug: 'fes', ar: 'فاس', fr: 'Fès' },
                                { slug: 'marrakech', ar: 'مراكش', fr: 'Marrakech' },
                                { slug: 'kenitra', ar: 'القنيطرة', fr: 'Kénitra' },
                            ],
                            casablanca: [
                                { slug: 'rabat', ar: 'الرباط', fr: 'Rabat' },
                                { slug: 'marrakech', ar: 'مراكش', fr: 'Marrakech' },
                                { slug: 'tanger', ar: 'طنجة', fr: 'Tanger' },
                                { slug: 'agadir', ar: 'أكادير', fr: 'Agadir' },
                                { slug: 'fes', ar: 'فاس', fr: 'Fès' },
                            ],
                            marrakech: [
                                { slug: 'agadir', ar: 'أكادير', fr: 'Agadir' },
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                                { slug: 'tanger', ar: 'طنجة', fr: 'Tanger' },
                                { slug: 'fes', ar: 'فاس', fr: 'Fès' },
                                { slug: 'rabat', ar: 'الرباط', fr: 'Rabat' },
                            ],
                            agadir: [
                                { slug: 'marrakech', ar: 'مراكش', fr: 'Marrakech' },
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                                { slug: 'tanger', ar: 'طنجة', fr: 'Tanger' },
                                { slug: 'essaouira', ar: 'الصويرة', fr: 'Essaouira' },
                                { slug: 'tiznit', ar: 'تيزنيت', fr: 'Tiznit' },
                            ],
                            meknes: [
                                { slug: 'fes', ar: 'فاس', fr: 'Fès' },
                                { slug: 'rabat', ar: 'الرباط', fr: 'Rabat' },
                                { slug: 'settat', ar: 'سطات', fr: 'Settat' },
                                { slug: 'kenitra', ar: 'القنيطرة', fr: 'Kénitra' },
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                            ],
                            tetouan: [
                                { slug: 'tanger', ar: 'طنجة', fr: 'Tanger' },
                                { slug: 'ksar-el-kebir', ar: 'القصر الكبير', fr: 'Ksar El Kebir' },
                                { slug: 'rabat', ar: 'الرباط', fr: 'Rabat' },
                                { slug: 'fes', ar: 'فاس', fr: 'Fès' },
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                            ],
                            'kelaat-sraghna': [
                                { slug: 'marrakech', ar: 'مراكش', fr: 'Marrakech' },
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                                { slug: 'settat', ar: 'سطات', fr: 'Settat' },
                                { slug: 'berrechid', ar: 'برشيد', fr: 'Berrechid' },
                                { slug: 'agadir', ar: 'أكادير', fr: 'Agadir' },
                            ],
                            'beni-mellal': [
                                { slug: 'marrakech', ar: 'مراكش', fr: 'Marrakech' },
                                { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                                { slug: 'rabat', ar: 'الرباط', fr: 'Rabat' },
                                { slug: 'fes', ar: 'فاس', fr: 'Fès' },
                                { slug: 'agadir', ar: 'أكادير', fr: 'Agadir' },
                            ],
                        };
                        // Default list shown on all other cities — always includes main hubs + agadir
                        const defaultList = [
                            { slug: 'tanger', ar: 'طنجة', fr: 'Tanger' },
                            { slug: 'rabat', ar: 'الرباط', fr: 'Rabat' },
                            { slug: 'casablanca', ar: 'الدار البيضاء', fr: 'Casablanca' },
                            { slug: 'marrakech', ar: 'مراكش', fr: 'Marrakech' },
                            { slug: 'agadir', ar: 'أكادير', fr: 'Agadir' },
                            { slug: 'fes', ar: 'فاس', fr: 'Fès' },
                        ];
                        const list = cityRelations[currentCity] || defaultList;
                        return list.filter(c => c.slug !== currentCity);
                    })().map(c => (
                        <Link
                            key={c.slug}
                            href={`/${locale}/rent-agencies/${c.slug}`}
                            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors border border-slate-200 dark:border-zinc-700"
                        >
                            {locale === 'ar'
                                ? `كراء السيارات في ${c.ar}`
                                : `Location voiture ${c.fr}`}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
