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

    const queryParams = new URLSearchParams();
    if (filters.bodyType) {
        queryParams.set('bodyType', filters.bodyType);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    if (filters.brand && filters.city) {
        return `/${locale}/cars/brand/${filters.brand}/city/${filters.city}${queryString}`;
    }
    if (filters.city && !filters.brand) {
        return `/${locale}/cars/city/${filters.city}${queryString}`;
    }
    if (filters.brand && !filters.city) {
        return `/${locale}/cars/brand/${filters.brand}${queryString}`;
    }
    if (filters.bodyType) {
        return `/${locale}/cars?bodyType=${filters.bodyType}`;
    }
    return null;
}

import { carCatalog } from '@/constants/car-brands-models';
import { BRANDS } from '@/constants/data';
import { findCityBySlug, getCityName, CITIES } from '@/constants/cities';

function isInvalidName(str: string | null | undefined): boolean {
    if (!str || typeof str !== 'string') return true;
    const lower = str.trim().toLowerCase();
    if (['undefined', 'null', 'unknown', 'other', 'n/a', 'none', 'sans'].includes(lower)) return true;
    if (isValidObjectId(str)) return true;
    return false;
}

function getListingBrand(rawListing: any, locale: string): string {
    const slug = (
        rawListing.brandSlug ||
        (typeof rawListing.brand === 'object' ? rawListing.brand?.slug : rawListing.brand) ||
        ''
    ).toLowerCase().trim();

    if (slug && !isInvalidName(slug)) {
        const fromCatalog = carCatalog.find(b => b.slug.toLowerCase() === slug);
        if (fromCatalog) return locale === 'ar' ? fromCatalog.ar : fromCatalog.fr;

        const fromData = BRANDS.find(b => b.id.toLowerCase() === slug);
        if (fromData) return fromData.name;
    }

    const rawLabel = rawListing.brandLabel || (typeof rawListing.brand === 'string' ? rawListing.brand : '') || '';
    if (!isInvalidName(rawLabel)) {
        return rawLabel.trim();
    }
    return '';
}

function getListingModel(rawListing: any, locale: string, brandSlug?: string): string {
    const bSlug = (brandSlug || rawListing.brandSlug || '').toLowerCase().trim();
    const mSlug = (
        rawListing.carModelSlug ||
        (typeof rawListing.carModel === 'object' ? rawListing.carModel?.slug : rawListing.carModel) ||
        ''
    ).toLowerCase().trim();

    if (bSlug && mSlug && !isInvalidName(bSlug) && !isInvalidName(mSlug)) {
        const fromCatalog = carCatalog.find(b => b.slug.toLowerCase() === bSlug);
        if (fromCatalog) {
            const model = fromCatalog.models.find(m => m.slug.toLowerCase() === mSlug);
            if (model) return locale === 'ar' ? model.ar : model.fr;
        }
    }

    const rawLabel = rawListing.carModelLabel || (typeof rawListing.carModel === 'string' ? rawListing.carModel : '') || '';
    if (!isInvalidName(rawLabel)) {
        return rawLabel.trim();
    }
    return '';
}

function getListingCity(rawListing: any, locale: string): string {
    const cityObj = rawListing.city;
    const citySlug = (typeof cityObj === 'object' && cityObj?.slug)
        ? cityObj.slug
        : (typeof cityObj === 'string' ? cityObj : (rawListing.cityId || ''));

    if (citySlug && !isInvalidName(citySlug)) {
        const found = findCityBySlug(citySlug.toLowerCase().trim());
        if (found) return getCityName(found, locale);
    }

    if (typeof cityObj === 'object' && cityObj?.name && !isInvalidName(cityObj.name)) {
        const trimmedName = cityObj.name.trim();
        const foundByName = CITIES.find(
            c => c.name.ar === trimmedName || c.name.fr.toLowerCase() === trimmedName.toLowerCase() || c.slug === trimmedName.toLowerCase()
        );
        if (foundByName) return getCityName(foundByName, locale);
        return trimmedName;
    }

    return '';
}

function buildListingTitle(brand: string, model: string, city: string, locale: string): string {
    const isAr = locale === 'ar';

    if (brand && model && city) {
        return isAr
            ? `${brand} ${model} مستعملة للبيع في ${city} | Cayn.ma`
            : `${brand} ${model} d'occasion à vendre à ${city} | Cayn.ma`;
    }

    if (brand && model && !city) {
        return isAr
            ? `${brand} ${model} مستعملة للبيع في المغرب | Cayn.ma`
            : `${brand} ${model} d'occasion à vendre au Maroc | Cayn.ma`;
    }

    if (brand && !model && city) {
        return isAr
            ? `سيارات ${brand} مستعملة للبيع في ${city} | Cayn.ma`
            : `Voitures ${brand} d'occasion à vendre à ${city} | Cayn.ma`;
    }

    if (brand && !model && !city) {
        return isAr
            ? `سيارات ${brand} مستعملة للبيع في المغرب | Cayn.ma`
            : `Voitures ${brand} d'occasion à vendre au Maroc | Cayn.ma`;
    }

    if (!brand && city) {
        return isAr
            ? `سيارات مستعملة للبيع في ${city} | Cayn.ma`
            : `Voitures d'occasion à vendre à ${city} | Cayn.ma`;
    }

    return isAr
        ? `سيارات مستعملة للبيع في المغرب | Cayn.ma`
        : `Voitures d'occasion à vendre au Maroc | Cayn.ma`;
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

            const brand = getListingBrand(rawListing, locale);
            const model = getListingModel(rawListing, locale, rawListing.brandSlug);
            const city = getListingCity(rawListing, locale);

            const title = buildListingTitle(brand, model, city, locale);

            const carDescriptor = [brand, model, rawListing.year].filter(Boolean).join(' ');
            const locationStr = city ? (locale === 'ar' ? `في ${city}` : `à ${city}`) : (locale === 'ar' ? 'في المغرب' : 'au Maroc');
            const description = locale === 'ar'
                ? `${carDescriptor} مستعملة للبيع ${locationStr} على Cayn.ma. تفاصيل ومواصفات وتواصل مباشر مع البائع.`
                : `${carDescriptor} d'occasion à vendre ${locationStr} sur Cayn.ma. Détails, équipements et contact direct avec le vendeur.`;

            const canonicalUrl = `https://www.cayn.ma/${locale}/cars/${idOrFirstSlug}`;

            return {
                title: {
                    absolute: title
                },
                description: description.substring(0, 160),
                alternates: {
                    canonical: canonicalUrl,
                    languages: {
                        'ar-MA': `https://www.cayn.ma/ar/cars/${idOrFirstSlug}`,
                        'fr-MA': `https://www.cayn.ma/fr/cars/${idOrFirstSlug}`,
                        'x-default': `https://www.cayn.ma/ar/cars/${idOrFirstSlug}`,
                    }
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
