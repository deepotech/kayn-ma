'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface FavoriteItem {
    id: string;
    listingId: string;
    listing: {
        _id: string;
        title: string;
        price: number;
        images?: { url: string }[];
    };
    createdAt: string;
}

export default function FavoritesPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();

    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = useCallback(async () => {
        if (!user?.uid) return;

        try {
            // Get user's ID token for auth
            const idToken = await user.getIdToken();
            const res = await fetch('/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setFavorites(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [user, fetchFavorites]);

    const handleRemove = async (favoriteId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return;

        // Optimistic update
        const previousFavorites = [...favorites];
        setFavorites(prev => prev.filter(f => f.id !== favoriteId && f.listingId !== favoriteId));

        try {
            const idToken = await user.getIdToken();
            await fetch(`/api/favorites/${favoriteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });
        } catch (error) {
            console.error('Failed to remove favorite:', error);
            // Rollback
            setFavorites(previousFavorites);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRtl ? 'المفضلة' : 'Mes Favoris'}
            </h1>

            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(item => {
                        const listing = item.listing;
                        if (!listing) return null;

                        const imageUrl = listing.images?.[0]?.url || '/images/placeholder-car.jpg';
                        const listingId = listing._id || item.listingId;

                        return (
                            <Link
                                key={item.id || item.listingId}
                                href={`/${locale}/cars/${listingId}`}
                                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-md transition-all group"
                            >
                                <div className="aspect-[4/3] relative">
                                    <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                                    <button
                                        onClick={(e) => handleRemove(item.id || item.listingId, e)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm"
                                        title={isRtl ? 'ازالة' : 'Retirer'}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">{listing.title}</h3>
                                    <p className="text-blue-600 font-bold">{listing.price?.toLocaleString()} MAD</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {isRtl ? 'أضيف:' : 'Ajouté le:'} {new Date(item.createdAt).toLocaleDateString(locale)}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{isRtl ? 'قائمة المفضلة فارغة.' : 'Aucun favori pour le moment.'}</p>
                </div>
            )}
        </div>
    );
}
