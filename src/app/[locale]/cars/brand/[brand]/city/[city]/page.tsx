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

function getCityData(citySlug: string) {
    const lower = citySlug.toLowerCase();
    const city = CITIES.find(c => c.slug === lower);
    if (!city) return null;
    return { slug: city.slug, ar: city.name.ar, fr: city.name.fr };
}

export async function generateMetadata({ params: { brand, city, locale } }: { params: { brand: string; city: string; locale: string } }) {
    const brandData = getBrandData(brand);
    const cityData = getCityData(city);
    if (!brandData || !cityData) return {};

    const brandName = locale === 'ar' ? brandData.ar : brandData.fr;
    const cityName = locale === 'ar' ? cityData.ar : cityData.fr;

    const title = locale === 'ar'
        ? `سيارات ${brandName} مستعملة للبيع في ${cityName} | Cayn.ma`
        : `Voitures ${brandName} d'occasion à vendre à ${cityName} | Cayn.ma`;

    const description = locale === 'ar'
        ? `ابحث عن سيارات ${brandName} مستعملة للبيع في ${cityName}. إعلانات حقيقية مع إمكانية التواصل مباشرة مع المعلنين.`
        : `Trouvez des voitures d'occasion ${brandName} à vendre à ${cityName}. Annonces vérifiées et contact direct.`;

    const canonicalUrl = `https://www.cayn.ma/${locale}/cars/brand/${brandData.slug}/city/${cityData.slug}`;

    return {
        title: {
            absolute: title,
        },
        description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'ar-MA': `https://www.cayn.ma/ar/cars/brand/${brandData.slug}/city/${cityData.slug}`,
                'fr-MA': `https://www.cayn.ma/fr/cars/brand/${brandData.slug}/city/${cityData.slug}`,
                'x-default': `https://www.cayn.ma/ar/cars/brand/${brandData.slug}/city/${cityData.slug}`,
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

async function getBrandCityListings(brandSlug: string, citySlug: string) {
    const listings = await prisma.listing.findMany({
        where: {
            brandSlug: { equals: brandSlug, mode: 'insensitive' },
            city: { slug: { equals: citySlug, mode: 'insensitive' } },
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

export default async function BrandCityCarsPage({ params: { brand, city, locale } }: { params: { brand: string; city: string; locale: string } }) {
    const brandData = getBrandData(brand);
    const cityData = getCityData(city);
    if (!brandData || !cityData) {
        notFound();
    }

    const brandName = locale === 'ar' ? brandData.ar : brandData.fr;
    const cityName = locale === 'ar' ? cityData.ar : cityData.fr;

    const listings = await getBrandCityListings(brandData.slug, cityData.slug);
    const count = listings.length;

    const title = locale === 'ar'
        ? `سيارات ${brandName} مستعملة للبيع في ${cityName}`
        : `Voitures ${brandName} d'occasion à vendre à ${cityName}`;

    const description = locale === 'ar'
        ? `تصفح سيارات ${brandName} المعروضة للبيع حالياً في ${cityName}. تواصل مباشرة مع البائعين وتفاوض على الأسعار بدون تعقيدات.`
        : `Découvrez les annonces de voitures ${brandName} à vendre à ${cityName}. Contactez directement les vendeurs sans intermédiaire.`;

    const breadcrumbs = [
        { label: locale === 'ar' ? 'الرئيسية' : 'Accueil', href: '/' },
        { label: locale === 'ar' ? 'سيارات مستعملة' : 'Voitures d\'occasion', href: '/cars' },
        { label: brandName, href: `/cars/brand/${brandData.slug}` },
        { label: cityName, href: `/cars/brand/${brandData.slug}/city/${cityData.slug}` },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: `https://www.cayn.ma/${locale}/cars/brand/${brandData.slug}/city/${cityData.slug}`,
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
                                ? `لا توجد سيارات ${brandName} حالياً في ${cityName}. كن أول من ينشر إعلانه!`
                                : `Aucune voiture ${brandName} disponible actuellement à ${cityName}. Soyez le premier à publier !`}
                        </p>
                    </div>
                )}

                <div className="mt-12 flex flex-wrap gap-4 text-sm">
                    <Link
                        href={`/${locale}/cars/city/${cityData.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                        ← {locale === 'ar' ? `كل السيارات في ${cityName}` : `Toutes les voitures à ${cityName}`}
                    </Link>
                    <Link
                        href={`/${locale}/cars/brand/${brandData.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                        ← {locale === 'ar' ? `كل سيارات ${brandName} في المغرب` : `Toutes les voitures ${brandName} au Maroc`}
                    </Link>
                </div>

                <InternalLinks />
            </div>
        </>
    );
}
