'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ListingCard from '@/components/listings/ListingCard';
import ListingSkeleton from '@/components/listings/ListingSkeleton';
import { IListingBase } from '@/models/Listing';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2, ChevronDown } from 'lucide-react';
import { Link } from '@/navigation';
import { dedupeById } from '@/lib/dedupeById';
import axios from 'axios';

interface LatestListingsTabsProps {
    saleListings: IListingBase[];
    rentListings: IListingBase[];
    allListings: IListingBase[];
}

type TabType = 'sale' | 'rent' | 'all';

export default function LatestListingsTabs({
    saleListings,
    rentListings,
    allListings
}: LatestListingsTabsProps) {
    const t = useTranslations('Home.Tabs');
    const tHome = useTranslations('Home');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [activeTab, setActiveTab] = useState<TabType>('sale');

    // State for managing listings and pagination per tab
    // Initialize with data passed from server (page 1)
    const [listingsState, setListingsState] = useState({
        sale: { data: saleListings || [], page: 1, hasMore: (saleListings?.length || 0) >= 8, loading: false },
        rent: { data: rentListings || [], page: 1, hasMore: (rentListings?.length || 0) >= 8, loading: false },
        all: { data: allListings || [], page: 1, hasMore: (allListings?.length || 0) >= 8, loading: false }
    });

    const activeState = listingsState[activeTab];

    const loadMore = async () => {
        const nextPage = activeState.page + 1;

        // precise state update specifically for active tab
        setListingsState(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], loading: true }
        }));

        try {
            // Fetch next page
            const response = await axios.get(`/api/listings`, {
                params: {
                    page: nextPage,
                    limit: 8,
                    purpose: activeTab
                }
            });

            const newListings: IListingBase[] = response.data.data || [];
            const pagination = response.data.pagination;

            setListingsState(prev => {
                const combined = dedupeById([...prev[activeTab].data, ...newListings]) as IListingBase[];
                return {
                    ...prev,
                    [activeTab]: {
                        // Guard: if combined is empty for any reason, preserve existing data
                        data: combined.length > 0 ? combined : prev[activeTab].data,
                        page: nextPage,
                        hasMore: newListings.length > 0 && nextPage < (pagination?.pages || 1),
                        loading: false
                    }
                };
            });
        } catch (error) {
            console.error('Failed to load more listings:', error);
            setListingsState(prev => ({
                ...prev,
                [activeTab]: { ...prev[activeTab], loading: false }
            }));
        }
    };

    return (
        <div className="space-y-8">
            {/* Tabs Navigation */}
            <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-xl shadow-inner relative z-0">
                    {[
                        { id: 'sale', label: t('sale'), color: 'text-blue-600' },
                        { id: 'rent', label: t('rent'), color: 'text-green-600' },
                        { id: 'all', label: t('all'), color: 'text-gray-800 dark:text-gray-100' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`relative z-10 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === tab.id
                                    ? `bg-white dark:bg-zinc-700 ${tab.color} shadow-sm`
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="min-h-[400px]">
                {activeState.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeState.data.map((listing) => (
                            <div key={listing._id || (listing as any).id} className="h-full">
                                <ListingCard listing={listing} />
                            </div>
                        ))}

                        {/* Skeleton Loading State for Load More - append to grid */}
                        {activeState.loading && Array.from({ length: 4 }).map((_, i) => (
                            <div key={`skeleton-${i}`} className="h-full">
                                <ListingSkeleton />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border-2 border-dashed border-blue-200 dark:border-zinc-700 max-w-2xl mx-auto">
                        <div className="text-5xl mb-4">🚗</div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">{tHome('noListings')}</p>
                        <Link href="/post">
                            <Button className="gap-2 px-8 py-3 text-base">
                                <Plus className="h-5 w-5" />
                                {tHome('postFreeAd')}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Load More Button and View All Cars */}
            {activeState.data.length > 0 && (
                <div className="text-center pt-8 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-4">
                    {!activeState.loading && activeState.hasMore ? (
                        <Button
                            variant="outline"
                            onClick={loadMore}
                            className="rounded-xl px-8 py-3.5 text-base font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {isRtl ? 'عرض المزيد من السيارات' : 'Charger plus de voitures'}{' '}
                            <ChevronDown className="mx-2 h-4 w-4" />
                        </Button>
                    ) : activeState.loading ? (
                        <div className="flex justify-center py-2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : null}

                    <Link
                        href={activeTab === 'all' ? '/cars' : `/cars?purpose=${activeTab}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm"
                    >
                        <span>{isRtl ? 'عرض جميع السيارات' : 'Voir toutes les voitures'}</span>
                        <span className={isRtl ? 'rotate-180 inline-block' : 'inline-block'}>→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}

