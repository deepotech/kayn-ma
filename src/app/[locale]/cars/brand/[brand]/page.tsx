import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db';
import ListingCard from '@/components/listings/ListingCard';
import SeoHeader from '@/components/seo/SeoHeader';
import InternalLinks from '@/components/seo/InternalLinks';
import { BRANDS } from '@/constants/data';
import { carCatalog } from '@/constants/car-brands-models';
import { CITIES } from '@/constants/cities';

export const dynamic = 'force-dynamic';

function getBrandData(brandSlug: string) {
    const lower = brandSlug.toLowerCase();
    const fromData = BRANDS.find(b => b.id.toLowerCase() === lower);
    const fromCatalog = carCatalog.find(b => b.slug.toLowerCase() === lower);
    if (!fromData && !fromCatalog) return null;

    const name = fromCatalog ? fromCatalog.name : (fromData ? fromData.name : brandSlug);
    const ar = fromCatalog?.ar || name;
    const fr = fromCatalog?.fr || name;

    return { slug: lower, name, ar, fr };
}

export async function generateMetadata({ params: { brand, locale } }: { params: { brand: string; locale: string } }) {
    const brandData = getBrandData(brand);
    if (!brandData) return {};

    const brandName = locale === 'ar' ? brandData.ar : brandData.fr;
    const title = locale === 'ar'
        ? `سيارات ${brandName} مستعملة للبيع في المغرب | Cayn.ma`
        : `Voitures ${brandName} d'occasion à vendre au Maroc | Cayn.ma`;

    const description = locale === 'ar'
        ? `تصفح سيارات ${brandName} مستعملة للبيع في المغرب. إعلانات حقيقية بالصور والمواصفات مع التواصل المباشر مع أصحاب السيارات.`
        : `Découvrez les voitures d'occasion ${brandName} à vendre au Maroc. Annonces réelles avec photos et contact direct avec les propriétaires.`;

    const canonicalUrl = `https://www.cayn.ma/${locale}/cars/brand/${brandData.slug}`;

    return {
        title: {
            absolute: title,
        },
        description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'ar-MA': `https://www.cayn.ma/ar/cars/brand/${brandData.slug}`,
                'fr-MA': `https://www.cayn.ma/fr/cars/brand/${brandData.slug}`,
                'x-default': `https://www.cayn.ma/ar/cars/brand/${brandData.slug}`,
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

async function getBrandListings(brandSlug: string) {
    const listings = await prisma.listing.findMany({
        where: {
            brandSlug: { equals: brandSlug, mode: 'insensitive' },
            status: 'approved',
            visibility: 'public'
        },
        orderBy: [
            { isFeatured: 'desc' },
            { publishedAt: 'desc' },
            { createdAt: 'desc' }
        ],
        take: 30,
        include: { city: true }
    });

    return JSON.parse(JSON.stringify(listings));
}

export default async function BrandCarsPage({ params: { brand, locale } }: { params: { brand: string; locale: string } }) {
    const brandData = getBrandData(brand);
    if (!brandData) {
        notFound();
    }

    const brandName = locale === 'ar' ? brandData.ar : brandData.fr;
    const listings = await getBrandListings(brandData.slug);
    const count = listings.length;

    const title = locale === 'ar'
        ? `سيارات ${brandName} مستعملة للبيع في المغرب`
        : `Voitures ${brandName} d'occasion à vendre au Maroc`;

    const description = locale === 'ar'
        ? `تصفح قائمة سيارات ${brandName} المستعملة المتوفرة حالياً على منصة Cayn.ma. قارن بين الموديلات والأسعار وتواصل مباشرة مع المعلنين.`
        : `Consultez les annonces de voitures ${brandName} d'occasion actuellement disponibles sur Cayn.ma. Comparez les prix et contactez directement les vendeurs.`;

    const breadcrumbs = [
        { label: locale === 'ar' ? 'الرئيسية' : 'Accueil', href: '/' },
        { label: locale === 'ar' ? 'سيارات مستعملة' : 'Voitures d\'occasion', href: '/cars' },
        { label: brandName, href: `/cars/brand/${brandData.slug}` },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: `https://www.cayn.ma/${locale}/cars/brand/${brandData.slug}`,
        numberOfItems: count,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: count,
            itemListElement: listings.map((l: any, index: number) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: l.title || `${brandName} ${l.carModelLabel || ''} ${l.year || ''}`.trim(),
                url: `https://www.cayn.ma/${locale}/cars/${l.id}`
            }))
        },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.label,
                item: `https://www.cayn.ma/${locale}${crumb.href}`
            }))
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <SeoHeader
                title={title}
                description={description}
                breadcrumbs={breadcrumbs}
            />

            <div className="container mx-auto px-4 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {title}
                        <span className="text-gray-500 font-normal text-lg ms-2">
                            ({count})
                        </span>
                    </h1>
                </div>

                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((l: any) => (
                            <ListingCard key={l.id || l._id} listing={l} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            {locale === 'ar'
                                ? `لا توجد سيارات ${brandName} معروضة حالياً. كن أول من ينشر إعلانه!`
                                : `Aucune voiture ${brandName} disponible actuellement. Soyez le premier à publier !`}
                        </p>
                    </div>
                )}

                {/* Internal Links for Major Cities */}
                <div className="mt-12 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {locale === 'ar' ? `تصفح سيارات ${brandName} حسب المدينة` : `Voitures ${brandName} par ville`}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {['casablanca', 'marrakech', 'agadir', 'tanger', 'rabat'].map((citySlug) => {
                            const c = CITIES.find(item => item.slug === citySlug);
                            const cityName = c ? (locale === 'ar' ? c.name.ar : c.name.fr) : citySlug;
                            return (
                                <Link
                                    key={citySlug}
                                    href={`/${locale}/cars/brand/${brandData.slug}/city/${citySlug}`}
                                    className="px-4 py-2 text-sm bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-zinc-700 transition-colors"
                                >
                                    {brandName} {locale === 'ar' ? `في ${cityName}` : `à ${cityName}`}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <InternalLinks />
            </div>
        </>
    );
}
