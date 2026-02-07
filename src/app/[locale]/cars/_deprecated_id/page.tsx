import { getFormatter, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/Button';
import { Phone, MessageCircle, MapPin, Eye, ArrowLeft, Share2, Heart, Shield } from 'lucide-react';
import ImageGallery from '@/components/listings/ImageGallery';
import SpecsGrid from '@/components/listings/SpecsGrid';
import SellerCard from '@/components/listings/SellerCard';
import StickyContactCTA from '@/components/listings/StickyContactCTA';
import ReportButton from '@/components/listings/ReportButton';
import ListingContactButtons from '@/components/listings/ListingContactButtons';
import { getRelativeTime, formatViews } from '@/lib/timeUtils';

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

export async function generateMetadata({ params: { id, locale } }: any) {
    const listing = await getListing(id);

    if (!listing) return { title: 'Not Found' };

    const purposeLabel = locale === 'ar'
        ? (listing.purpose === 'rent' ? 'للكراء' : 'للبيع')
        : (listing.purpose === 'rent' ? 'à louer' : 'à vendre');

    const title = `${listing.brand} ${listing.carModel} ${listing.year} ${purposeLabel} ${locale === 'ar' ? 'في' : 'à'} ${listing.city} - ${listing.price.toLocaleString()} DH`;

    return {
        title: `${title} | Cayn.ma`,
        description: `${listing.brand} ${listing.carModel} ${listing.year}. ${locale === 'ar' ? 'الثمن:' : 'Prix:'} ${listing.price.toLocaleString()} DH. ${listing.city}`,
        openGraph: {
            title,
            description: listing.description?.substring(0, 160),
            images: listing.images?.[0]?.url ? [listing.images[0].url] : [],
            type: 'website',
        },
    };
}

export default async function ListingPage({ params: { id, locale } }: any) {
    const listing = await getListing(id);
    const t = await getTranslations('ListingPage');
    const tCommon = await getTranslations('Common');
    const format = await getFormatter();

    if (!listing) notFound();

    const phoneNumber = listing.phone || "0612345678";
    const whatsappMessage = locale === 'ar'
        ? `مرحبا، أنا مهتم بإعلانك على Cayn.ma: ${listing.brand} ${listing.carModel} ${listing.year}`
        : `Bonjour, je suis intéressé par votre annonce sur Cayn.ma: ${listing.brand} ${listing.carModel} ${listing.year}`;
    const whatsappUrl = `https://wa.me/212${phoneNumber.substring(1)}?text=${encodeURIComponent(whatsappMessage)}`;

    // Time and views
    const timeAgo = listing.createdAt ? getRelativeTime(listing.createdAt, locale) : '';
    // Deterministic fallback for views based on listing ID to prevent hydration mismatch
    const getHashedViews = (id: string): number => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash % 450) + 50; // Returns 50-500
    };
    const views = listing.views ?? getHashedViews(id);

    // Enhanced JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${listing.brand} ${listing.carModel} ${listing.year}`,
        image: listing.images?.map((img: any) => img.url) || [],
        description: listing.description,
        brand: {
            '@type': 'Brand',
            name: listing.brand
        },
        model: listing.carModel,
        productionDate: String(listing.year),
        offers: {
            '@type': 'Offer',
            priceCurrency: 'MAD',
            price: listing.price,
            itemCondition: 'https://schema.org/UsedCondition',
            availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            url: `https://cayn.ma/${locale}/cars/${id}`,
            seller: {
                '@type': listing.sellerType === 'agency' ? 'Organization' : 'Person',
                name: listing.sellerName || 'Vendeur'
            }
        },
        vehicleTransmission: listing.transmission,
        fuelType: listing.fuelType,
        mileageFromOdometer: {
            '@type': 'QuantitativeValue',
            value: listing.mileage,
            unitCode: 'KMT'
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-24 lg:pb-8">
                {/* Top Bar */}
                <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-zinc-800">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <Link
                            href="/search"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="text-sm font-medium">{t('backToListings')}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <Heart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image Gallery */}
                            <ImageGallery
                                images={listing.images || []}
                                alt={`${listing.brand} ${listing.carModel} ${listing.year}`}
                            />

                            {/* Mobile: Title & Price */}
                            <div className="lg:hidden space-y-3">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {listing.brand} {listing.carModel} {listing.year}
                                </h1>
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <MapPin className="h-4 w-4 text-blue-500" />
                                    <span>{listing.city}</span>
                                </div>
                                <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent flex items-baseline gap-2">
                                    {format.number(listing.price, { style: 'decimal' })} DH
                                    {(listing.purpose === 'rent' || listing.adType === 'rental') && (
                                        <span className="text-xl font-medium text-gray-500 dark:text-gray-400">
                                            {listing.pricePeriod === 'week' ? tCommon('perWeek') : listing.pricePeriod === 'month' ? tCommon('perMonth') : tCommon('perDay')}
                                        </span>
                                    )}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        {formatViews(views, locale)} {t('views')}
                                    </span>
                                    <span>•</span>
                                    <span>{timeAgo}</span>
                                </div>
                            </div>

                            {/* Specs Grid */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    {t('specifications')}
                                </h2>
                                <SpecsGrid
                                    brand={listing.brand}
                                    model={listing.carModel}
                                    year={listing.year}
                                    mileage={listing.mileage}
                                    fuelType={listing.fuelType}
                                    transmission={listing.transmission}
                                />
                            </div>

                            {/* Description */}
                            {listing.description && (
                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-gray-100 dark:border-zinc-800">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                        {t('description')}
                                    </h2>
                                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {listing.description}
                                    </p>
                                </div>
                            )}

                            {/* Mobile: Seller Card */}
                            <div className="lg:hidden">
                                <SellerCard
                                    sellerName={listing.sellerName}
                                    sellerType={listing.sellerType}
                                    memberSince={listing.createdAt}
                                    isVerified={true}
                                />
                            </div>

                            {/* Trust & Safety */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-gray-100 dark:border-zinc-800">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    {t('trustSafety')}
                                </h2>
                                <ReportButton listingId={id} />
                            </div>
                        </div>

                        {/* Desktop Sidebar */}
                        <div className="hidden lg:block">
                            <div className="sticky top-24 space-y-4">
                                {/* Price Card */}
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-lg">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {listing.brand} {listing.carModel} {listing.year}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                        <span>{listing.city}</span>
                                    </div>
                                    <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-3 flex items-baseline gap-2">
                                        {format.number(listing.price, { style: 'decimal' })} DH
                                        {(listing.purpose === 'rent' || listing.adType === 'rental') && (
                                            <span className="text-xl font-medium text-gray-500 dark:text-gray-400">
                                                {listing.pricePeriod === 'week' ? tCommon('perWeek') : listing.pricePeriod === 'month' ? tCommon('perMonth') : tCommon('perDay')}
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            {formatViews(views, locale)} {t('views')}
                                        </span>
                                        <span>•</span>
                                        <span>{timeAgo}</span>
                                    </div>

                                    {/* CTA Buttons */}
                                    <ListingContactButtons
                                        phoneNumber={phoneNumber}
                                        whatsappUrl={whatsappUrl}
                                        listingId={id}
                                    />

                                    {/* Safety Warning */}
                                    <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-4">
                                        {t('safetyWarning')}
                                    </p>
                                </div>

                                {/* Seller Card */}
                                <SellerCard
                                    sellerName={listing.sellerName}
                                    sellerType={listing.sellerType}
                                    memberSince={listing.createdAt}
                                    isVerified={true}
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
