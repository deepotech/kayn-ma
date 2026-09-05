import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db';
import ListingCard from '@/components/listings/ListingCard';
import SeoHeader from '@/components/seo/SeoHeader';
import InternalLinks from '@/components/seo/InternalLinks';
import { CITIES as ALL_CITIES, findCityBySlug } from '@/constants/cities';
import { CITIES as DATA_CITIES } from '@/constants/data';
import { getTranslations } from 'next-intl/server';
import { getCityCarGuide } from '@/data/seo-guides/index';

// Force dynamic rendering — page uses Prisma (database queries at runtime)
export const dynamic = 'force-dynamic';

function getCityData(citySlug: string) {
    const lower = (citySlug || '').toLowerCase();
    const city = findCityBySlug(lower) || ALL_CITIES.find(c => c.slug === lower);
    if (city) {
        return { slug: city.slug, ar: city.name.ar, fr: city.name.fr };
    }
    const dataCity = DATA_CITIES.find(c => c.id.toLowerCase() === lower);
    if (dataCity) {
        return { slug: dataCity.id, ar: dataCity.ar, fr: dataCity.fr };
    }
    return null;
}

// Metadata for SEO
export async function generateMetadata({ params: { city, locale } }: any) {
    const cityData = getCityData(city);
    if (!cityData) return {};

    const cityName = locale === 'ar' ? cityData.ar : cityData.fr;

    const title = locale === 'ar'
        ? `سيارات مستعملة للبيع في ${cityName} | Cayn.ma`
        : `Voitures d'occasion à vendre à ${cityName} | Cayn.ma`;

    const description = locale === 'ar'
        ? `تصفح السيارات المستعملة للبيع في ${cityName}. عروض حصرية وأثمنة مناسبة مع التواصل المباشر مع أصحاب الإعلانات.`
        : `Trouvez des voitures d'occasion à vendre à ${cityName}. Offres exclusives et bons prix avec contact direct avec les vendeurs.`;

    const canonicalUrl = `https://www.cayn.ma/${locale}/cars/city/${cityData.slug}`;

    return {
        title: {
            absolute: title,
        },
        description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'ar-MA': `https://www.cayn.ma/ar/cars/city/${cityData.slug}`,
                'fr-MA': `https://www.cayn.ma/fr/cars/city/${cityData.slug}`,
                'x-default': `https://www.cayn.ma/ar/cars/city/${cityData.slug}`,
            }
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: 'website',
            locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
        }
    };
}

async function getCityListings(cityId: string) {
    const listings = await prisma.listing.findMany({
        where: {
            city: {
                slug: {
                    equals: cityId,
                    mode: 'insensitive'
                }
            },
            status: 'approved',
            visibility: 'public'
        },
        orderBy: [
            { isFeatured: 'desc' },
            { publishedAt: 'desc' },
            { createdAt: 'desc' }
        ],
        take: 20
    });

    return JSON.parse(JSON.stringify(listings));
}

export default async function CityPage({ params: { city, locale } }: any) {
    const cityData = getCityData(city);

    if (!cityData) {
        notFound();
    }

    const tCommon = await getTranslations('Common');
    const cityName = locale === 'ar' ? cityData.ar : cityData.fr;
    const listings = await getCityListings(city);
    const count = listings.length;

    // Programmatic Content Generation
    const title = locale === 'ar'
        ? `سيارات مستعملة للبيع في ${cityName}`
        : `Voitures d'occasion à vendre à ${cityName}`;

    const description = locale === 'ar'
        ? `ابحث عن سيارات للبيع في ${cityName}. يوفر لك موقع Cayn.ma ${count > 0 ? `${count} إعلان حقيقي` : 'أحدث العروض'} مع إمكانية التواصل مباشرة مع المعلنين.`
        : `Vous cherchez une voiture à ${cityName} ? Cayn.ma vous propose ${count > 0 ? `${count} annonces réelles` : 'les dernières offres'} avec contact direct avec les annonceurs.`;

    const breadcrumbs = [
        { label: locale === 'ar' ? 'الرئيسية' : 'Accueil', href: '/' },
        { label: locale === 'ar' ? 'السيارات' : 'Voitures', href: '/search' },
        { label: cityName, href: `/cars/city/${cityData.slug}` },
    ];

    // Schema Markup (CollectionPage)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description: description,
        url: `https://www.cayn.ma/${locale}/cars/city/${cityData.slug}`,
        numberOfItems: listings.length,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.label,
                item: `https://www.cayn.ma${crumb.href}`
            }))
        }
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.label,
            item: `https://www.cayn.ma${crumb.href}`
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <SeoHeader
                title={title}
                description={description}
                breadcrumbs={breadcrumbs}
            />

            <div className="container mx-auto px-4 pb-16">
                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((l: any) => (
                            <ListingCard key={l._id} listing={l} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            {locale === 'ar'
                                ? `ماكاين حتى سيارة حاليا في ${cityName}. كن أول واحد ينشر إعلان!`
                                : `Aucune voiture disponible actuellement à ${cityName}. Soyez le premier à publier !`}
                        </p>
                    </div>
                )}

                {/* FAQ Section for extra SEO content */}
                <div className="mt-16 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        {locale === 'ar' ? `أسئلة شائعة حول شراء السيارات في ${cityName}` : `Questions fréquentes sur l'achat de voitures à ${cityName}`}
                    </h2>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <h3 className="font-bold text-lg mb-2">
                                {locale === 'ar' ? 'كيفاش نشري طوموبيل في هاد المدينة؟' : 'Comment acheter une voiture ici ?'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {locale === 'ar'
                                    ? `تصفح الإعلانات الموجودة أعلاه، اختار السيارة اللي عجباتك، وتواصل مباشرة مع البائع عبر الهاتف أو الواتساب. تلاقاو في مكان عمومي في ${cityName} باش تقلب الطوموبيل.`
                                    : `Parcourez les annonces ci-dessus, choisissez la voiture qui vous plaît, et contactez directement le vendeur par téléphone ou WhatsApp. Rencontrez-vous dans un lieu public à ${cityName} pour inspecter le véhicule.`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dynamic SEO Guide Block — rendered for any city that has a guide in the registry */}
                {(() => {
                    const guide = getCityCarGuide(city);
                    if (!guide) return null;
                    const lang = locale === 'ar' ? guide.ar : guide.fr;
                    const faqSchema = {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: lang.faqs.map((faq: { question: string; answer: string }) => ({
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
                                    {lang.sections.map((section: { title: string; content: string | string[] }, i: number) => (
                                        <section key={i}>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">{section.title}</h3>
                                            {Array.isArray(section.content) ? (
                                                <ul className="list-disc list-inside space-y-2 ms-2 text-slate-600 dark:text-slate-400">
                                                    {section.content.map((item: string, j: number) => (
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
                                        {lang.faqs.map((faq: { question: string; answer: string }, i: number) => (
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
                                            <Link href={`/${locale}/rent-agencies/${city}`} className="hover:underline">
                                                {locale === 'ar'
                                                    ? `دليل كراء السيارات في ${cityName}`
                                                    : `Guide de location de voiture à ${cityName}`}
                                            </Link>
                                        </li>
                                        {city !== 'marrakech' && (
                                            <li>
                                                <Link href={`/${locale}/cars/city/marrakech`} className="hover:underline">
                                                    {locale === 'ar' ? 'دليل السيارات المستعملة في مراكش' : 'Guide de voitures d\'occasion à Marrakech'}
                                                </Link>
                                            </li>
                                        )}
                                        {city !== 'casablanca' && (
                                            <li>
                                                <Link href={`/${locale}/cars/city/casablanca`} className="hover:underline">
                                                    {locale === 'ar' ? 'دليل السيارات المستعملة في الدار البيضاء' : 'Guide de voitures d\'occasion à Casablanca'}
                                                </Link>
                                            </li>
                                        )}
                                        {city !== 'rabat' && (
                                            <li>
                                                <Link href={`/${locale}/cars/city/rabat`} className="hover:underline">
                                                    {locale === 'ar' ? 'دليل السيارات المستعملة في الرباط' : 'Guide de voitures d\'occasion à Rabat'}
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </>
                    );
                })()}

                <InternalLinks />

            </div>
        </>
    );
}
