import { getFormatter, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { Link } from '@/navigation';
import { Phone, MessageCircle, MapPin, Eye, ArrowLeft, Share2, Shield, Settings } from 'lucide-react';
import ImageGallery from '@/components/listings/ImageGallery';
import ShareButton from './ShareButton';
import SpecsGrid from '@/components/listings/SpecsGrid';
import SellerCard from '@/components/listings/SellerCard';
import StickyContactCTA from '@/components/listings/StickyContactCTA';
import ReportButton from '@/components/listings/ReportButton';
import ListingContactButtons from '@/components/listings/ListingContactButtons';
import SimilarListings from '@/components/listings/SimilarListings';
import FavoriteButton from '@/components/listings/FavoriteButton';
import { getRelativeTime, formatViews } from '@/lib/timeUtils';
import { normalizeListing } from '@/lib/listings/normalizeListing';

async function getListing(id: string) {
    try {
        await dbConnect();
        const listing = await Listing.findById(id).lean();
        if (!listing) return null;
        return JSON.parse(JSON.stringify(listing));
    } catch (e) {
        return null;
    }
}

interface ListingDetailProps {
    id: string;
    locale: string;
    initialData?: any;
}

export default async function ListingDetail({ id, locale, initialData }: ListingDetailProps) {
    const rawListing = initialData || await getListing(id);
    const t = await getTranslations('ListingPage');
    const tCommon = await getTranslations('Common');
    const format = await getFormatter();

    if (!rawListing) notFound();

    const listing = normalizeListing(rawListing)!;

    // --- Helpers for UI logic ---
    const phoneNumber = listing.phone || "0600000000";

    // Helper object for loose access to legacy/mixed types
    const l = listing as any;

    // Safely extract labels
    const brandLabel = l.brand?.label || l.brand || '';
    const modelLabel = l.carModel?.label || l.carModel || '';
    const cityLabel = l.city?.label || l.city || '';

    const whatsappMessage = locale === 'ar'
        ? `مرحبا، أنا مهتم بإعلانك على Cayn.ma: ${brandLabel} ${modelLabel} ${l.year}`
        : `Bonjour, je suis intéressé par votre annonce sur Cayn.ma: ${brandLabel} ${modelLabel} ${l.year}`;
    const whatsappUrl = `https://wa.me/212${phoneNumber.substring(1)}?text=${encodeURIComponent(whatsappMessage)}`;

    // Time and Views
    const timeAgo = l.createdAt ? getRelativeTime(l.createdAt, locale) : '';
    const getHashedViews = (id: string): number => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash % 450) + 50;
    };
    const views = l.views ?? getHashedViews(id);

    // Home > AdType > Brand > Model > City
    const isRent = l.purpose === 'rent' || l.adType === 'rental';
    const purposeSlug = isRent ? 'rent' : 'sale';

    // Safely extract slugs
    const brandSlugRaw = l.brand?.slug || l.brandSlug || (typeof l.brand === 'string' ? l.brand.toLowerCase() : 'unknown');
    const modelSlugRaw = l.carModel?.slug || l.modelSlug || (typeof l.carModel === 'string' ? l.carModel.toLowerCase() : 'unknown');
    const citySlugRaw = l.city?.slug || (typeof l.city === 'string' ? l.city.toLowerCase() : 'unknown');

    const brandSlug = brandSlugRaw;
    const modelSlug = modelSlugRaw;
    const citySlug = citySlugRaw;

    // --- JSON-LD ---
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': isRent ? 'Product' : 'Vehicle',
        name: `${brandLabel} ${modelLabel} ${l.year}`,
        image: listing.images?.map((img: any) => img.url) || [],
        description: l.description,
        brand: { '@type': 'Brand', name: brandLabel },
        model: modelLabel,
        vehicleModelDate: l.year,
        offers: {
            '@type': 'Offer',
            priceCurrency: 'MAD',
            price: l.price,
            availability: l.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            itemCondition: 'https://schema.org/UsedCondition',
            seller: {
                '@type': l.sellerType === 'agency' ? 'Organization' : 'Person',
                name: l.sellerName || 'Vendeur'
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-24 lg:pb-12 text-gray-900 dark:text-gray-100">
                {/* 1. Improved Top Bar / Navigation */}
                <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <Link href="/search" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors flex-shrink-0">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>

                            {/* Breadcrumbs (Desktop) */}
                            <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500 overflow-hidden whitespace-nowrap">
                                <Link href="/" className="hover:text-blue-600">{tCommon('home')}</Link>
                                <span>/</span>
                                <Link href={`/search?purpose=${purposeSlug}`} className="hover:text-blue-600">
                                    {isRent ? tCommon('rent') : tCommon('sale')}
                                </Link>
                                <span>/</span>
                                <Link href={`/cars/${brandSlug}`} className="hover:text-blue-600 font-medium text-gray-900 dark:text-white">
                                    {brandLabel}
                                </Link>
                                <span>/</span>
                                <Link href={`/cars/${brandSlug}?model=${modelSlug}`} className="hover:text-blue-600">
                                    {modelLabel}
                                </Link>
                            </nav>
                        </div>

                        {/* Actions: Save, Share, Report */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <ShareButton
                                title={`${brandLabel} ${modelLabel} ${l.year} | Cayn.ma`}
                                text={locale === 'ar' ? 'شاهد هذا الإعلان على Cayn.ma' : 'Regardez cette annonce sur Cayn.ma'}
                                url={`https://cayn.ma/cars/${id}`}
                                label={t('share')}
                            />
                            <FavoriteButton listingId={id} />

                            <ReportButton listingId={id} locale={locale}>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <Shield className="h-5 w-5" />
                                </button>
                            </ReportButton>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN (Image & Details) */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Hero Image Gallery */}
                            <div className="rounded-2xl overflow-hidden shadow-sm bg-black aspect-[4/3] sm:aspect-[16/9]">
                                <ImageGallery
                                    images={listing.images || []}
                                    alt={`${brandLabel} ${modelLabel}`}
                                />
                            </div>

                            {/* Mobile Header (Title, Price, Features) */}
                            <div className="block lg:hidden space-y-4">
                                <div>
                                    <div className="flex items-start justify-between gap-4">
                                        <h1 className="text-2xl font-bold leading-tight">
                                            {brandLabel} {modelLabel} {l.year}
                                        </h1>
                                        {/* Badge */}
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${isRent
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {isRent ? tCommon('rent') : tCommon('sale')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
                                        <MapPin className="h-4 w-4" />
                                        <Link href={`/cars/${citySlug}`} className="hover:underline">{cityLabel}</Link>
                                        <span>•</span>
                                        <span>{timeAgo}</span>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-500">
                                        {format.number(l.price, { style: 'decimal' })} <span className="text-lg">DH</span>
                                    </span>
                                    {isRent && (
                                        <span className="text-gray-500 text-sm font-medium">
                                            / {l.pricePeriod === 'week' ? tCommon('perWeek') : l.pricePeriod === 'month' ? tCommon('perMonth') : tCommon('perDay')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Clickable Specs Grid */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
                                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-gray-400" />
                                    {t('specifications')}
                                </h3>
                                <SpecsGrid
                                    brand={brandLabel}
                                    brandSlug={brandSlug}
                                    model={modelLabel}
                                    modelSlug={modelSlug}
                                    year={l.year}
                                    mileage={l.mileage}
                                    fuelType={l.fuelType}
                                    transmission={l.transmission}
                                    city={cityLabel}
                                    bodyType={l.bodyType?.label || l.bodyType}
                                    bodyTypeSlug={l.bodyType?.slug || l.bodyTypeSlug}
                                />
                            </div>

                            {/* Description */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
                                <h3 className="text-lg font-bold mb-4">{t('description')}</h3>
                                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {l.description || t('noDescription')}
                                </div>
                            </div>

                            {/* Trust Section */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/20">
                                <div className="flex items-start gap-4">
                                    <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">{t('trustSafety')}</h4>
                                        <p className="text-sm text-blue-800 dark:text-blue-200 opacity-80 mb-4">
                                            {t('safetyWarning')}
                                        </p>
                                        <ReportButton listingId={id} locale={locale} />
                                    </div>
                                </div>
                            </div>

                            {/* Similar Listings */}
                            <div id="similar-section">
                                <SimilarListings currentListing={l} locale={locale} />
                            </div>

                        </div>

                        {/* RIGHT COLUMN (Sticky Sidebar) */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-6">

                                {/* Desktop Price & Title Card */}
                                <div className="hidden lg:block bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-lg shadow-gray-100 dark:shadow-none">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${isRent
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {isRent ? tCommon('rent') : tCommon('sale')}
                                            </span>
                                            <div className="text-2xl font-bold leading-tight mb-1">
                                                {brandLabel} {modelLabel} {l.year}
                                            </div>
                                            <div className="text-gray-500 text-sm flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {cityLabel}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-500">
                                                {format.number(l.price, { style: 'decimal' })}
                                            </span>
                                            <span className="text-xl font-bold text-gray-400">DH</span>
                                        </div>
                                        {isRent && (
                                            <p className="text-gray-500 text-sm font-medium mt-1">
                                                {l.pricePeriod === 'week' ? tCommon('perWeek') : l.pricePeriod === 'month' ? tCommon('perMonth') : tCommon('perDay')}
                                            </p>
                                        )}
                                    </div>

                                    <ListingContactButtons
                                        phoneNumber={phoneNumber}
                                        whatsappUrl={whatsappUrl}
                                        listingId={id}
                                    />

                                    <div className="mt-4 flex justify-center gap-2 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" /> {formatViews(views, locale)}
                                        </span>
                                        <span>•</span>
                                        <span>Ref: {id.substring(id.length - 6).toUpperCase()}</span>
                                    </div>
                                </div>

                                {/* Seller Card */}
                                <SellerCard
                                    sellerName={l.sellerName}
                                    sellerType={l.sellerType}
                                    memberSince={l.createdAt ? new Date(l.createdAt).toISOString() : undefined}
                                    isVerified={true}
                                    sellerId={l.userId}
                                />

                            </div>
                        </div>

                    </div>
                </div>

                {/* Mobile Sticky CTA */}
                <StickyContactCTA phoneNumber={phoneNumber} whatsappUrl={whatsappUrl} listingId={id} />
            </div>
        </>
    );
}
