'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, X, EyeOff, Trash2, Loader2, Phone, MapPin, Calendar, Gauge, Fuel, Settings2, User } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { AdminListing } from '@/lib/admin-types';

export default function AdminListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const listingId = params.id as string;

    const [listing, setListing] = useState<AdminListing | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    // Modals
    const [rejectModal, setRejectModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);

    useEffect(() => {
        fetchListing();
    }, [listingId]);

    const fetchListing = async () => {
        try {
            const res = await fetch(`/api/admin/listings?search=${listingId}`);
            const data = await res.json();
            const found = data.listings?.find((l: AdminListing) => l._id === listingId);
            setListing(found || null);
        } catch (error) {
            console.error('Failed to fetch listing:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status: string, visibility?: string, rejectionReason?: string) => {
        setActionLoading(true);
        try {
            const body: any = { status };
            if (visibility) body.visibility = visibility;
            if (rejectionReason) body.rejectionReason = rejectionReason;

            await fetch(`/api/admin/listings/${listingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            fetchListing();
        } catch (error) {
            console.error('Failed to update:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const deleteListing = async () => {
        setActionLoading(true);
        try {
            await fetch(`/api/admin/listings/${listingId}/status`, {
                method: 'DELETE',
            });
            router.push(`/${locale}/admin/listings`);
        } catch (error) {
            console.error('Failed to delete:', error);
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-white mb-2">
                    {isRtl ? 'الإعلان غير موجود' : 'Annonce non trouvée'}
                </h2>
                <Link
                    href={`/${locale}/admin/listings`}
                    className="text-red-400 hover:underline"
                >
                    {isRtl ? 'العودة' : 'Retour'}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/${locale}/admin/listings`}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-zinc-400" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-white line-clamp-1">{listing.title}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={listing.status} />
                        {listing.visibility === 'hidden' && <StatusBadge status="hidden" />}
                        {listing.isReported && (
                            <span className="text-xs text-red-400">🚨 {listing.reportsCount} signalement(s)</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Images */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                        <Image
                            src={listing.images[selectedImage]?.url || '/placeholder-car.jpg'}
                            alt={listing.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {listing.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {listing.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === idx ? 'border-red-500' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <Image src={img.url} alt="" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Details */}
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-white">
                            {isRtl ? 'تفاصيل السيارة' : 'Détails du véhicule'}
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Calendar className="h-5 w-5" />
                                <span>{listing.year}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Gauge className="h-5 w-5" />
                                <span>{listing.mileage?.toLocaleString()} km</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Fuel className="h-5 w-5" />
                                <span>{listing.fuelType}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Settings2 className="h-5 w-5" />
                                <span>{listing.transmission}</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <MapPin className="h-5 w-5" />
                                <span>{listing.city.label}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-700">
                            <p className="text-2xl font-bold text-white">
                                {listing.price.toLocaleString()} {listing.currency}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Actions */}
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3">
                        <h3 className="font-bold text-white mb-4">
                            {isRtl ? 'الإجراءات' : 'Actions'}
                        </h3>

                        {listing.status !== 'approved' && (
                            <button
                                onClick={() => updateStatus('approved', 'public')}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Check className="h-4 w-4" />
                                {isRtl ? 'موافقة' : 'Approuver'}
                            </button>
                        )}

                        {listing.status !== 'rejected' && (
                            <button
                                onClick={() => setRejectModal(true)}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                                {isRtl ? 'رفض' : 'Rejeter'}
                            </button>
                        )}

                        <button
                            onClick={() => updateStatus(listing.status, listing.visibility === 'hidden' ? 'public' : 'hidden')}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            <EyeOff className="h-4 w-4" />
                            {listing.visibility === 'hidden'
                                ? (isRtl ? 'إظهار' : 'Afficher')
                                : (isRtl ? 'إخفاء' : 'Masquer')
                            }
                        </button>

                        <button
                            onClick={() => setDeleteModal(true)}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-600 text-red-400 hover:bg-red-600/10 font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            {isRtl ? 'حذف نهائي' : 'Supprimer'}
                        </button>
                    </div>

                    {/* Seller Info */}
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {isRtl ? 'معلومات البائع' : 'Infos Vendeur'}
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">{isRtl ? 'الاسم' : 'Nom'}</span>
                                <span className="text-white">{listing.sellerName || 'Anonyme'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">{isRtl ? 'النوع' : 'Type'}</span>
                                <span className="text-white">{listing.sellerType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">{isRtl ? 'الهاتف' : 'Téléphone'}</span>
                                <a href={`tel:${listing.phone}`} className="text-blue-400 hover:underline">
                                    {listing.phone}
                                </a>
                            </div>
                            {listing.whatsapp && (
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">WhatsApp</span>
                                    <span className="text-white">{listing.whatsapp}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    {listing.rejectionReason && (
                        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4">
                            <h3 className="font-bold text-red-400 mb-2">
                                {isRtl ? 'سبب الرفض' : 'Raison du rejet'}
                            </h3>
                            <p className="text-sm text-zinc-300">{listing.rejectionReason}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={rejectModal}
                onClose={() => setRejectModal(false)}
                onConfirm={(reason) => updateStatus('rejected', undefined, reason)}
                title={isRtl ? 'رفض الإعلان' : 'Rejeter l\'annonce'}
                message={isRtl ? 'هل أنت متأكد من رفض هذا الإعلان؟' : 'Êtes-vous sûr de vouloir rejeter cette annonce?'}
                confirmText={isRtl ? 'رفض' : 'Rejeter'}
                variant="danger"
                showReasonInput
                reasonPlaceholder={isRtl ? 'سبب الرفض...' : 'Raison du rejet...'}
            />

            <ConfirmModal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
                onConfirm={deleteListing}
                title={isRtl ? 'حذف الإعلان' : 'Supprimer l\'annonce'}
                message={isRtl ? 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.' : 'Êtes-vous sûr? Cette action est irréversible.'}
                confirmText={isRtl ? 'حذف' : 'Supprimer'}
                variant="danger"
            />
        </div>
    );
}
