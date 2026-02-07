'use client';

import { DashboardListing } from "@/lib/dashboard-types";
import BadgeStatus from "./SharedComponents";
import { Edit2, Trash2, Copy, EyeOff, Eye, MoreHorizontal } from "lucide-react";
import { Link } from '@/navigation';
import { useState } from "react";

interface ListingRowCardProps {
    listing: DashboardListing;
    locale: string;
    onDelete: (id: string) => void;
    onStatusChange?: (id: string, status: string) => void;
}

export default function ListingRowCard({ listing, locale, onDelete, onStatusChange }: ListingRowCardProps) {
    const isRtl = locale === 'ar';
    const [showMenu, setShowMenu] = useState(false);
    const [isInternalProcessing, setIsInternalProcessing] = useState(false);

    // Normalize ID and Image
    const listingId = listing.id || listing._id || '';
    const imageUrl = listing.image || (listing.images && listing.images.length > 0 ? listing.images[0].url : '/images/placeholder-car.jpg');

    const handleStatusToggle = async () => {
        if (!onStatusChange) return;
        setIsInternalProcessing(true);
        const newStatus = listing.status === 'hidden' ? 'approved' : 'hidden'; // Toggle logic
        try {
            await onStatusChange(listingId, newStatus);
        } finally {
            setIsInternalProcessing(false);
        }
    };

    return (
        <div className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 ${isInternalProcessing ? 'opacity-60 pointer-events-none' : ''}`}>
            {/* Image */}
            <div className="relative w-full sm:w-32 aspect-video sm:aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded text-white font-bold uppercase ${listing.type === 'sale' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                        {listing.type}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{listing.title}</h3>
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white sm:hidden"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-blue-600 font-bold mt-1">{listing.price.toLocaleString()} DH</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{new Date(listing.createdAt).toLocaleDateString(locale)}</span>
                        <span>•</span>
                        <span>{listing.city}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <BadgeStatus status={listing.status} locale={locale} />

                    <div className="hidden sm:flex items-center gap-2">
                        <div className="flex items-center gap-3 text-xs text-gray-400 mr-4">
                            <span title="Views">👁️ {listing.views}</span>
                            <span title="Calls">📞 {listing.calls}</span>
                            <span title="WhatsApp">💬 {listing.whatsapp}</span>
                        </div>

                        <Link
                            href={`/dashboard/listings/${listingId}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={isRtl ? "تعديل" : "Modifier"}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Link>

                        {/* Status Toggle Button */}
                        <button
                            onClick={handleStatusToggle}
                            disabled={isInternalProcessing}
                            className={`p-2 rounded-lg transition-colors ${listing.status === 'hidden'
                                ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                }`}
                            title={isRtl ? (listing.status === 'hidden' ? "إظهار" : "إخفاء") : (listing.status === 'hidden' ? "Afficher" : "Masquer")}
                        >
                            {listing.status === 'hidden' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>

                        <button
                            onClick={() => onDelete(listingId)}
                            disabled={isInternalProcessing}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={isRtl ? "حذف" : "Supprimer"}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Actions Menu */}
            {showMenu && (
                <div className="sm:hidden mt-2 pt-2 border-t border-gray-100 flex justify-between gap-2">
                    <Link href={`/dashboard/listings/${listingId}/edit`} className="flex-1 py-2 text-center bg-gray-100 rounded text-sm font-medium">
                        {isRtl ? "تعديل" : "Modifier"}
                    </Link>
                    <button onClick={handleStatusToggle} className="flex-1 py-2 text-center bg-gray-50 text-gray-700 rounded text-sm font-medium">
                        {listing.status === 'hidden' ? (isRtl ? "إظهار" : "Afficher") : (isRtl ? "إخفاء" : "Masquer")}
                    </button>
                    <button onClick={() => onDelete(listingId)} className="flex-1 py-2 text-center bg-red-50 text-red-600 rounded text-sm font-medium">
                        {isRtl ? "حذف" : "Delete"}
                    </button>
                </div>
            )}
        </div>
    );
}
