import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/db';
import JsonLd from '@/components/seo/JsonLd';
import ListingDetail from '@/components/listings/ListingDetail';
import { isValidObjectId, parseSeoSlugs } from '@/lib/seo-utils';
import { normalizeListing } from '@/lib/listings/normalizeListing';

export const dynamic = 'force-dynamic';

function getLegacyTargetUrl(slug: string[], locale: string): string | null {
    if (slug.length === 1 && slug[0].toLowerCase() === 'search') {
        return `/${locale}/search`;
    }
    const filters = parseSeoSlugs(slug);
    if (!filters.isValid) return null;

    if (filters.brand && filters.city) {
        return `/${locale}/cars/brand/${filters.brand}/city/${filters.city}`;
    }
    if (filters.city && !filters.brand) {
        return `/${locale}/cars/city/${filters.city}`;
    }
    if (filters.brand && !filters.city) {
        return `/${locale}/cars/brand/${filters.brand}`;
    }
    return null;
}

export async function generateMetadata({ params: { slug, locale } }: { params: { slug: string[]; locale: string } }) {
    const idOrFirstSlug = slug[0];

    // Case 1: Listing Detail
    if (isValidObjectId(idOrFirstSlug) && slug.length === 1) {
        try {
            const rawListing = await prisma.listing.findUnique({
                where: { id: idOrFirstSlug },
                include: { city: true }
            });
            if (!rawListing) return { title: 'Not Found' };
            const l = normalizeListing(rawListing) as any;

            const purposeLabel = locale === 'ar'
                ? (l.purpose === 'rent' ? 'للكراء' : 'للبيع')
                : (l.purpose === 'rent' ? 'à louer' : 'à vendre');

            const brandLabel = typeof l.brand === 'object' ? l.brand?.label : l.brand;
            const modelLabel = typeof l.carModel === 'object' ? l.carModel?.label : l.carModel;
            const cityLabel = typeof l.city === 'object' ? (l.city?.label || l.city?.name || l.city?.slug || '') : (l.city || '');

            const title = `${brandLabel} ${modelLabel} ${l.year} - ${cityLabel} | Cayn.ma`;
            const conditionLabel = locale === 'ar' ? (l.condition === 'new' ? 'جديدة' : 'مستعملة') : (l.condition === 'new' ? 'Neuve' : 'Occasion');
            const description = `${brandLabel} ${modelLabel} ${l.year} ${purposeLabel} ${locale === 'ar' ? 'ب' : 'à'} ${cityLabel}. ${conditionLabel}, ${l.fuelType}, ${l.transmission}. ${l.mileage}km. ${l.price?.toLocaleString()} DH.`;

            const canonicalUrl = `https://www.cayn.ma/${locale}/cars/${l.id || l._id}`;

            return {
                title: {
                    absolute: title
                },
                description: description.substring(0, 160),
                alternates: {
                    canonical: canonicalUrl,
                },
                openGraph: {
                    title,
                    description,
                    url: canonicalUrl,
                    images: l.images?.[0]?.url ? [{ url: l.images[0].url, width: 1200, height: 630, alt: title }] : [],
                    type: 'website',
                    locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
                }
            };
        } catch {
            return { title: 'Error' };
        }
    }

    // Case 2: Legacy slugs redirect target exists
    const targetUrl = getLegacyTargetUrl(slug, locale);
    if (targetUrl) {
        redirect(targetUrl);
    }

    return { title: 'Not Found' };
}

export default async function DynamicCarPage({
    params: { slug, locale }
}: {
    params: { slug: string[]; locale: string };
}) {
    const idOrFirstSlug = slug[0];

    // 1. Check if it's a Listing Detail Page
    if (isValidObjectId(idOrFirstSlug) && slug.length === 1) {
        const rawListing = await prisma.listing.findUnique({
            where: { id: idOrFirstSlug },
            include: { city: true }
        }) as any;

        if (!rawListing) {
            notFound();
        }

        const l = normalizeListing(rawListing) as any;
        const brandLabel = (typeof l.brand === 'object' ? (l.brand?.label || l.brand?.name) : l.brand) || '';
        const modelLabel = (typeof l.carModel === 'object' ? (l.carModel?.label || l.carModel?.name) : l.carModel) || '';

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
                "url": `https://www.cayn.ma/${locale}/cars/${l.id || l._id}`,
                "priceCurrency": "MAD",
                "price": l.price,
                "itemCondition": l.condition === 'new' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": l.sellerType === 'agency' ? "Organization" : "Person",
                    "name": l.agencyName || "Cayn.ma User"
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

    // 2. Safely redirect legacy slugs to official clean routes
    const targetUrl = getLegacyTargetUrl(slug, locale);
    if (targetUrl) {
        redirect(targetUrl);
    }

    // 3. Reject any other random slug
    notFound();
}
