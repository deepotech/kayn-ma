'use client';

import { Link } from '@/navigation';
import { IListingBase } from '@/models/Listing';
import { useFormatter, useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { MapPin, Phone, MessageCircle, Heart, Eye, User, Building2 } from 'lucide-react';
import { getRelativeTime, formatViews } from '@/lib/timeUtils';
import { useFavorites } from '@/components/providers/FavoritesProvider';
import { getCityDisplayName } from '@/lib/cityUtils';
import { useState } from 'react';

interface ListingCardProps {
    listing: IListingBase;
    showCTA?: boolean;
}

import { normalizeListing } from '@/lib/listings/normalizeListing';

export default function ListingCard({
    listing: rawListing,
    showCTA = true,
}: ListingCardProps) {
    // Normalize data immediately
    const listing = normalizeListing(rawListing as any) || rawListing as any;

    const format = useFormatter();
    const locale = useLocale();
    const t = useTranslations('Common');
    const tBadges = useTranslations('Badges');
    const tCard = useTranslations('ListingCard');
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    // Use the normalized coverImage, fallback handled in normalizer
    const [imageSrc, setImageSrc] = useState(listing.coverImage);

    const listingId = listing._id || '';
    const isListingFavorite = isFavorite(listingId);
    const isRtl = locale === 'ar';

    const phoneNumber = listing.phone || "0612345678";
    const whatsappUrl = `https://wa.me/212${phoneNumber.substring(1)}?text=${encodeURIComponent(
        locale === 'ar'
            ? `مرحبا، أنا مهتم بـ: ${listing.brand.label} ${listing.carModel.label} ${listing.year}`
            : `Bonjour, je suis intéressé par: ${listing.brand.label} ${listing.carModel.label} ${listing.year}`
    )}`;
    const telUrl = `tel:${phoneNumber}`;

    // Purpose determination
    const purpose = listing.purpose || (listing.adType === 'rental' ? 'rent' : 'sale');
    const sellerType = listing.sellerType || 'individual';
    const SellerIcon = sellerType === 'agency' ? Building2 : User;
    const timeAgo = listing.createdAt ? getRelativeTime(listing.createdAt, locale) : '';

    const getHashedViews = (id: string): number => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash % 180) + 20;
    };
    const views = (listing as any).views ?? getHashedViews(listingId);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isListingFavorite) {
            removeFavorite(listingId);
        } else {
            addFavorite(listingId);
        }
    };

    // Safe Title Access
    const brandName = typeof listing.brand === 'object' ? listing.brand.label : listing.brand;
    const modelName = typeof listing.carModel === 'object' ? listing.carModel.label : listing.carModel;
    const computedTitle = listing.title || [brandName, modelName, listing.year].filter(Boolean).join(" ");

    return (
        <div className="group flex flex-col h-full overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900 dark:border-zinc-800 dir-rtl">
            {/* Image Container: Aspect Ratio 4/3 */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                <Link href={`/cars/${listing._id}`} className="block w-full h-full">
                    <Image
                        src={imageSrc}
                        alt={computedTitle}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                        onError={() => setImageSrc('/images/placeholder-car.jpg')}
                    />
                </Link>

                {/* Badges - Top Right (RTL aware) */}
                <div className="absolute top-3 end-3 flex flex-col gap-1.5 z-10 items-end pointer-events-none">
                    <span className={`px-2.5 py-1 rounded-lg shadow-sm text-[10px] font-bold text-white uppercase tracking-wide ${purpose === 'rent'
                        ? 'bg-purple-600'
                        : 'bg-blue-600'
                        }`}>
                        {purpose === 'rent' ? tBadges('rent') : tBadges('sale')}
                    </span>
                    {listing.condition === 'new' && (
                        <span className="px-2.5 py-1 rounded-lg shadow-sm text-[10px] font-bold text-white uppercase bg-emerald-500">
                            {tBadges('new')}
                        </span>
                    )}
                </div>

                {/* Favorite Button - Top Left */}
                <div className="absolute top-3 start-3 z-10">
                    <button
                        className={`p-2 rounded-full shadow-md transition-all duration-200 backdrop-blur-sm ${isListingFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500 dark:bg-zinc-900/60 dark:text-gray-300'
                            }`}
                        onClick={handleFavoriteClick}
                        aria-label={tCard('addToFavorites')}
                    >
                        <Heart className={`h-4 w-4 ${isListingFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Image Count Badge */}
                {listing.images && listing.images.length > 0 && (
                    <div className="absolute bottom-2 end-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="font-medium">📷 {listing.images.length}</span>
                    </div>
                )}
            </div>

            {/* Card Content - Flex Column with Footer Pushed Down */}
            <div className="flex flex-col flex-1 p-3 sm:p-4">
                <Link href={`/cars/${listing._id}`} className="block">
                    {/* Title: Line Clamp 2 + Fixed Height */}
                    <h3
                        className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] leading-snug mb-1"
                        title={computedTitle}
                    >
                        {computedTitle}
                    </h3>

                    {/* Location & Seller */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span className="truncate max-w-[100px]">{getCityDisplayName(listing.city, undefined, locale)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <SellerIcon className="h-3.5 w-3.5" />
                            <span>{tCard(sellerType)}</span>
                        </div>
                    </div>
                </Link>

                {/* Price & Footer (mt-auto pushes this to bottom) */}
                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex items-baseline justify-between mb-3">
                        <div className="font-extrabold text-gray-900 dark:text-white text-lg">
                            {format.number(listing.price, { style: 'decimal' })}
                            <span className="text-xs font-normal text-gray-500 ms-1">DH</span>
                        </div>
                        {purpose === 'rent' && (
                            <span className="text-xs text-gray-400 font-medium">
                                / {listing.pricePeriod === 'week' ? t('perWeek') : listing.pricePeriod === 'month' ? t('perMonth') : t('perDay')}
                            </span>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-3">
                        <span>{timeAgo}</span>
                        <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatViews(views, locale)} {tCard('views')}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {showCTA && (
                        <div className="grid grid-cols-2 gap-2">
                            <a
                                href={telUrl}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fetch(`/api/listings/${listingId}/contact`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ type: 'call' })
                                    });
                                }}
                                className="flex items-center justify-center gap-1.5 py-2 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                {t('call')}
                            </a>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fetch(`/api/listings/${listingId}/contact`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ type: 'whatsapp' })
                                    });
                                }}
                                className="flex items-center justify-center gap-1.5 py-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-bold rounded-lg hover:bg-green-100 transition"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                {t('whatsapp')}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
