'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Eye, Check, X, EyeOff, Trash2, MoreVertical, Flag } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { AdminListing } from '@/lib/admin-types';

interface AdminListingRowProps {
    listing: AdminListing;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onHide: (id: string) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
}

export default function AdminListingRow({
    listing,
    onApprove,
    onReject,
    onHide,
    onDelete,
    isLoading = false,
}: AdminListingRowProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const imageUrl = listing.images?.[0]?.url || '/placeholder-car.jpg';

    return (
        <div className={`bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 hover:bg-zinc-800 transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex flex-col md:flex-row gap-4">
                {/* Image */}
                <div className="relative w-full md:w-32 h-24 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                    <Image
                        src={imageUrl}
                        alt={listing.title}
                        fill
                        className="object-cover"
                    />
                    {listing.isReported && (
                        <div className="absolute top-1 right-1 p-1 bg-red-500 rounded-full">
                            <Flag className="h-3 w-3 text-white" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <Link
                                href={`/${locale}/admin/listings/${listing._id}`}
                                className="font-bold text-white hover:text-blue-400 transition-colors line-clamp-1"
                            >
                                {listing.title}
                            </Link>
                            <p className="text-sm text-zinc-400">
                                {listing.brand.label} {listing.carModel.label} • {listing.year}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={listing.status} size="sm" />
                            {listing.visibility === 'hidden' && (
                                <StatusBadge status="hidden" size="sm" />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 mb-3">
                        <span>{listing.city.label}</span>
                        <span>{listing.price.toLocaleString()} {listing.currency}</span>
                        <span>{listing.sellerName || 'Anonyme'}</span>
                        {listing.reportsCount > 0 && (
                            <span className="text-red-400">🚨 {listing.reportsCount} signalement(s)</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/${locale}/admin/listings/${listing._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                        >
                            <Eye className="h-3 w-3" />
                            {isRtl ? 'عرض' : 'Voir'}
                        </Link>

                        {listing.status !== 'approved' && (
                            <button
                                onClick={() => onApprove(listing._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                            >
                                <Check className="h-3 w-3" />
                                {isRtl ? 'موافقة' : 'Approuver'}
                            </button>
                        )}

                        {listing.status !== 'rejected' && (
                            <button
                                onClick={() => onReject(listing._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                            >
                                <X className="h-3 w-3" />
                                {isRtl ? 'رفض' : 'Rejeter'}
                            </button>
                        )}

                        <button
                            onClick={() => onHide(listing._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors"
                        >
                            <EyeOff className="h-3 w-3" />
                            {listing.visibility === 'hidden' ? (isRtl ? 'إظهار' : 'Afficher') : (isRtl ? 'إخفاء' : 'Masquer')}
                        </button>

                        <button
                            onClick={() => onDelete(listing._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        >
                            <Trash2 className="h-3 w-3" />
                            {isRtl ? 'حذف' : 'Supprimer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
