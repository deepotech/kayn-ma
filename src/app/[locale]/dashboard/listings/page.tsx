'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { PlusCircle, Search, RefreshCw, Loader2 } from 'lucide-react';
import { getMyListings, deleteListing, updateListingStatus } from '@/lib/dashboard-api';
import { DashboardListing } from '@/lib/dashboard-types';
import ListingRowCard from '@/components/dashboard/ListingRowCard';
import { ConfirmModal } from '@/components/dashboard/SharedComponents';
import { useAuth } from '@/components/auth/AuthContext';

export default function MyListingsPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();

    const [listings, setListings] = useState<DashboardListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchListings = useCallback(async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            const data = await getMyListings(user.uid, { status: filterStatus, q: searchQuery });
            setListings(data);
        } catch (error) {
            console.error("Failed to fetch listings", error);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, filterStatus, searchQuery]);

    useEffect(() => {
        if (user?.uid) {
            fetchListings();
        }
    }, [user?.uid, filterStatus]); // Re-fetch on status or user change

    // --- Actions ---

    // Status Update (Hide/Show)
    const handleStatusChange = async (id: string, newStatus: string) => {
        if (!user?.uid) return;

        // Optimistic update
        const previousListings = [...listings];
        setListings(prev => prev.map(l =>
            (l.id === id || l._id === id) ? { ...l, status: newStatus as any } : l
        ));
        setActionLoading(id);

        try {
            await updateListingStatus(id, user.uid, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            // Rollback on error
            setListings(previousListings);
            alert(isRtl ? 'فشل تحديث الحالة' : 'Échec de la mise à jour');
        } finally {
            setActionLoading(null);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!itemToDelete || !user?.uid) return;

        // Optimistic update
        const previousListings = [...listings];
        setListings(prev => prev.filter(l => l.id !== itemToDelete && l._id !== itemToDelete));
        setShowDeleteModal(false);
        setActionLoading(itemToDelete);

        try {
            await deleteListing(itemToDelete, user.uid);
        } catch (error) {
            console.error("Failed to delete listing", error);
            // Rollback
            setListings(previousListings);
            alert(isRtl ? 'فشل حذف الإعلان' : 'Échec de la suppression');
        } finally {
            setActionLoading(null);
            setItemToDelete(null);
        }
    };

    const confirmDelete = (id: string) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const handleSearch = () => {
        fetchListings();
    };

    const tabs = [
        { id: 'all', labelAr: 'الكل', labelFr: 'Tous' },
        { id: 'approved', labelAr: 'نشط', labelFr: 'Actifs' },
        { id: 'pending_review', labelAr: 'بانتظار المراجعة', labelFr: 'En attente' },
        { id: 'rejected', labelAr: 'مرفوض', labelFr: 'Rejetés' },
        { id: 'hidden', labelAr: 'مخفي', labelFr: 'Masqués' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isRtl ? 'إعلاناتي' : 'Mes Annonces'}
                </h1>
                <Link
                    href={`/${locale}/dashboard/listings/new`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span>{isRtl ? 'إضافة إعلان' : 'Ajouter une annonce'}</span>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterStatus(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === tab.id
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                }`}
                        >
                            {isRtl ? tab.labelAr : tab.labelFr}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64 flex gap-2">
                    <div className="relative flex-1">
                        <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                        <input
                            type="text"
                            placeholder={isRtl ? "بحث..." : "Rechercher..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className={`w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-lg h-10 text-sm focus:ring-2 focus:ring-blue-500 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Listings List */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
                </div>
            ) : listings.length > 0 ? (
                <div className="space-y-4">
                    {listings.map(item => (
                        <ListingRowCard
                            key={item._id || item.id}
                            listing={item}
                            locale={locale}
                            onDelete={confirmDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                    <p className="text-gray-500 text-lg mb-4">{isRtl ? 'لا توجد إعلانات بعد.' : 'Aucune annonce trouvée.'}</p>
                    <Link
                        href={`/${locale}/dashboard/listings/new`}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        {isRtl ? 'أضف أول إعلان لك' : 'Publiez votre première annonce'}
                    </Link>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title={isRtl ? "حذف الإعلان" : "Supprimer l'annonce"}
                message={isRtl ? "هل أنت متأكد أنك تريد حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء." : "Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible."}
                isDestructive={true}
                confirmLabel={isRtl ? "حذف" : "Supprimer"}
                cancelLabel={isRtl ? "إلغاء" : "Annuler"}
            />
        </div>
    );
}
