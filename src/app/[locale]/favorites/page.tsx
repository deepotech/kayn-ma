'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useFavorites } from '@/components/providers/FavoritesProvider';
import ListingCard from '@/components/listings/ListingCard';
import { Heart, Search, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { IListingBase } from '@/models/Listing';

export default function FavoritesPage() {
    const t = useTranslations('Favorites');
    const { favorites, loading } = useFavorites();
    const [listings, setListings] = useState<IListingBase[]>([]);
    const [loadingListings, setLoadingListings] = useState(true);

    // Fetch full listing data for favorited IDs
    useEffect(() => {
        const fetchListings = async () => {
            if (favorites.length === 0) {
                setListings([]);
                setLoadingListings(false);
                return;
            }

            try {
                // Fetch listings by IDs
                const promises = favorites.map(async (id) => {
                    const res = await fetch(`/api/listings/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        return data.data;
                    }
                    return null;
                });

                const results = await Promise.all(promises);
                setListings(results.filter(Boolean));
            } catch (e) {
                console.error('Failed to fetch listings:', e);
            } finally {
                setLoadingListings(false);
            }
        };

        if (!loading) {
            fetchListings();
        }
    }, [favorites, loading]);

    const isLoading = loading || loadingListings;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <Heart className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {t('title')}
                            </h1>
                            {favorites.length > 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('savedCount', { count: favorites.length })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : favorites.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 bg-gray-100 dark:bg-zinc-800 rounded-full mb-6">
                            <Heart className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('empty')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                            {t('emptySubtitle')}
                        </p>
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <Search className="h-5 w-5" />
                            {t('browseCars')}
                        </Link>
                    </div>
                ) : (
                    /* Listings Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <ListingCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
