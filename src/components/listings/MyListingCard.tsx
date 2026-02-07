'use client';

import { Link } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Eye, Edit, Trash2, PauseCircle, PlayCircle, Building2, User } from 'lucide-react';
import { getRelativeTime, formatViews } from '@/lib/timeUtils';
import { Button } from '@/components/ui/Button';
import { getCityDisplayName } from '@/lib/cityUtils';

interface MyListingCardProps {
    listing: any;
    onStatusChange: (id: string, newStatus: string) => void;
    onDelete: (id: string) => void;
    isProcessing: boolean;
}

export default function MyListingCard({
    listing,
    onStatusChange,
    onDelete,
    isProcessing
}: MyListingCardProps) {
    const locale = useLocale();
    const t = useTranslations('MyListings');
    const tCard = useTranslations('ListingCard');
    const listingId = listing._id || '';

    // Get relative time
    const timeAgo = listing.createdAt ? getRelativeTime(listing.createdAt, locale) : '';

    // Status Badge Logic
    const getStatusBadge = () => {
        switch (listing.status) {
            case 'published':
            case 'approved':
                return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full text-xs font-bold">{t('status.published')}</span>;
            case 'paused':
                return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold">{t('status.paused')}</span>;
            case 'sold':
                return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold">{t('status.sold')}</span>;
            default:
                return null;
        }
    };

    return (
        <div className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800">
            {/* Image (Small on mobile, specific aspect on desktop) */}
            <Link
                href={`/cars/${listing._id}`}
                className="relative aspect-video sm:w-48 sm:aspect-[4/3] bg-gray-100 dark:bg-zinc-800 overflow-hidden shrink-0"
            >
                {listing.images && listing.images.length > 0 ? (
                    <Image
                        src={listing.images[0].url}
                        alt={`${listing.brand?.label || listing.brand || ''} ${listing.carModel?.label || listing.carModel || ''}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, 200px"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        <span className="text-2xl">🚗</span>
                    </div>
                )}

                {/* Status Badge Overlay (Mobile only) */}
                <div className="absolute top-2 left-2 sm:hidden">
                    {getStatusBadge()}
                </div>
            </Link>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="hidden sm:block mb-2">{getStatusBadge()}</div>
                            <Link href={`/cars/${listing._id}`}>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 hover:text-blue-600">
                                    {listing.title || `${typeof listing.brand === 'object' ? listing.brand.label : listing.brand} ${typeof listing.carModel === 'object' ? listing.carModel.label : listing.carModel} ${listing.year}`}
                                </h3>
                            </Link>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {getCityDisplayName(listing.city, undefined, locale)} • {listing.fuelType}
                            </div>
                        </div>
                        <p className="text-lg font-bold text-blue-600 whitespace-nowrap">
                            {listing.price.toLocaleString()} DH
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                        <span>{timeAgo}</span>
                        {/* <span>{listing.views || 0} views</span> */}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <Link href={`/post?edit=${listingId}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2 h-9" disabled={isProcessing}>
                            <Edit className="h-4 w-4" />
                            {t('actions.edit')}
                        </Button>
                    </Link>

                    {listing.status === 'published' || listing.status === 'approved' ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 gap-2 h-9"
                            onClick={() => onStatusChange(listingId, 'paused')}
                            disabled={isProcessing}
                        >
                            <PauseCircle className="h-4 w-4" />
                            {t('actions.pause')}
                        </Button>
                    ) : (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 gap-2 h-9 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20"
                            onClick={() => onStatusChange(listingId, 'approved')}
                            disabled={isProcessing}
                        >
                            <PlayCircle className="h-4 w-4" />
                            {t('actions.resume')}
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => onDelete(listingId)}
                        disabled={isProcessing}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
