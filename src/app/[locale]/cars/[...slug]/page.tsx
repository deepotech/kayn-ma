import { getFormatter, getTranslations } from 'next-intl/server';
import { getListings } from '@/lib/listings';
import JsonLd from '@/components/seo/JsonLd';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import ListingDetail from '@/components/listings/ListingDetail';
import ListingCard from '@/components/listings/ListingCard';
import SearchFilters from '@/components/search/SearchFilters';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { isValidObjectId, parseSeoSlugs, getSeoPageTitle, getSeoDescription, SeoFilters } from '@/lib/seo-utils';
import { findCityBySlug } from '@/constants/cities';
import { BODY_TYPES } from '@/constants/data';

export const dynamic = 'force-dynamic';

interface SearchParams {
    purpose?: string;
    condition?: string;
    sellerType?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
    q?: string;
    // These might be overridden by slug, but user might manually add them? 
    // Generally slug takes precedence for SEO pages.
    brand?: string;
    city?: string;
    bodyType?: string;
}

import { normalizeListing } from '@/lib/listings/normalizeListing';

export async function generateMetadata({ params, searchParams }: any) {
    const slug = params.slug as string[];
    const idOrFirstSlug = slug[0];
    const locale = params.locale;

    // CASE 1: Listing Detail
    if (isValidObjectId(idOrFirstSlug) && slug.length === 1) {
        try {
            await dbConnect();
            const rawListing = await Listing.findById(idOrFirstSlug).select('brand carModel year price city purpose description images condition fuelType transmission mileage createdAt sellerType').lean();

            if (!rawListing) return { title: 'Not Found' };
            const l = normalizeListing(rawListing) as any;

            const purposeLabel = locale === 'ar'
                ? (l.purpose === 'rent' ? 'للكراء' : 'للبيع')
                : (l.purpose === 'rent' ? 'à louer' : 'à vendre');

            const brandLabel = typeof l.brand === 'object' ? l.brand?.label : l.brand;
            const modelLabel = typeof l.carModel === 'object' ? l.carModel?.label : l.carModel;
            const cityLabel = typeof l.city === 'object' ? l.city?.label : l.city;

            // Format: Brand Model Year - City | Cayn.ma
            const title = `${brandLabel} ${modelLabel} ${l.year} - ${cityLabel} | Cayn.ma`;
            // Description: Price + Condition + Fuel + city
            const conditionLabel = locale === 'ar' ? (l.condition === 'new' ? 'جديدة' : 'مستعملة') : (l.condition === 'new' ? 'Neuve' : 'Occasion');
            const description = `${brandLabel} ${modelLabel} ${l.year} ${purposeLabel} ${locale === 'ar' ? 'ب' : 'à'} ${cityLabel}. ${conditionLabel}, ${l.fuelType}, ${l.transmission}. ${l.mileage}km. ${l.price.toLocaleString()} DH.`;

            return {
                title: {
                    absolute: title
                },
                description: description.substring(0, 160),
                alternates: {
                    canonical: `https://cayn.ma/${locale}/cars/${l._id}`,
                },
                openGraph: {
                    title,
                    description,
                    url: `https://cayn.ma/${locale}/cars/${l._id}`,
                    images: l.images?.[0]?.url ? [{ url: l.images[0].url, width: 1200, height: 630, alt: title }] : [],
                    type: 'website', // or product? OG uses website/article usually
                    locale: locale,
                }
            };
        } catch (e) {
            return { title: 'Error' };
        }
    }

    // CASE 2: SEO Landing Page
    const filters = parseSeoSlugs(slug);
    if (!filters.isValid) return { title: 'Not Found' };

    const title = getSeoPageTitle(filters, locale);
    const description = getSeoDescription(filters, locale);

    return {
        title: `${title} | Cayn.ma`,
        description,
        openGraph: {
            title: `${title} | Cayn.ma`,
            description,
            type: 'website'
        }
    };
}

export default async function DynamicCarPage({
    params: { slug, locale },
    searchParams
}: {
    params: { slug: string[]; locale: string };
    searchParams: SearchParams;
}) {
    const idOrFirstSlug = slug[0];

    // 1. Check if it's a Listing Detail Page
    if (isValidObjectId(idOrFirstSlug) && slug.length === 1) {
        // Fetch data specifically for JSON-LD generation effectively duplicating fetch but cleaner separation
        await dbConnect();
        const rawListing = await Listing.findById(idOrFirstSlug).select('brand carModel year price city purpose description images condition fuelType transmission mileage createdAt sellerType').lean() as any;

        if (rawListing) {
            const l = normalizeListing(rawListing) as any;
            const brandLabel = typeof l.brand === 'object' ? l.brand?.label : l.brand;
            const modelLabel = typeof l.carModel === 'object' ? l.carModel?.label : l.carModel;

            const productJsonLd = {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": `${brandLabel} ${modelLabel} ${l.year}`,
                "image": l.images?.map((img: any) => img.url) || [],
                "description": l.description || '',
                "brand": {
                    "@type": "Brand",
                    "name": brandLabel
                },
                "offers": {
                    "@type": "Offer",
                    "url": `https://cayn.ma/${locale}/cars/${l._id}`,
                    "priceCurrency": "MAD",
                    "price": l.price,
                    "itemCondition": l.condition === 'new' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
                    "availability": "https://schema.org/InStock",
                    "seller": {
                        "@type": l.sellerType === 'agency' ? "Organization" : "Person",
                        "name": "Cayn.ma User" // Or seller name if available
                    }
                }
            };

            return (
                <>
                    <JsonLd data={productJsonLd} />
                    <ListingDetail id={idOrFirstSlug} locale={locale} initialData={l} />
                </>
            );
        }
        return <ListingDetail id={idOrFirstSlug} locale={locale} />;
    }

    // 2. Check if it's a Valid SEO Page
    const filters = parseSeoSlugs(slug);
    if (!filters.isValid) {
        notFound();
    }

    // Fetch Data for SEO Page
    const listings = await getListings(searchParams, filters);
    const t = await getTranslations('Common');
    const tHome = await getTranslations('Home');
    const pageTitle = getSeoPageTitle(filters, locale);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Filters Sidebar */}
                {/* We pass the current slug filters to the component if needed, 
                    currently it reads from URL params, but here URL params are consumed by slug.
                    You might need to adjust SearchFilters to accept 'defaultValues' 
                    or it might need refactoring to handle /cars/slug structure.
                    For now, standard filters work for query params.
                 */}
                <SearchFilters totalResults={listings.length} />

                {/* Results */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        {pageTitle}
                        <span className="text-gray-500 font-normal text-lg ms-2">
                            ({listings.length})
                        </span>
                    </h1>

                    {/* SEO Content Block Top (Optional) */}

                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((listing: any) => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                            <span className="text-5xl mb-4">🚗</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {locale === 'ar' ? 'لا توجد إعلانات' : 'Aucune annonce trouvée'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {locale === 'ar'
                                    ? `كن أول من ينشر إعلاناً في قسم: ${pageTitle}`
                                    : `Soyez le premier à publier dans: ${pageTitle}`}
                            </p>
                            <Link href="/post">
                                <Button className="gap-2">
                                    <Plus className="h-5 w-5" />
                                    {tHome('postFreeAd')}
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* SEO Footer Content Block */}
                    <div className="mt-12 p-6 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                        <h2 className="text-lg font-bold mb-3">
                            {locale === 'ar' ? 'حول هذه القائمة' : 'À propos de cette liste'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                            {getSeoDescription(filters, locale)}
                        </p>

                        {/* FAQ Schema Placeholder - In a real app we'd add JSON-LD here */}
                    </div>
                </div>
            </div>
        </div>
    );
}
