'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useTranslations, useLocale } from 'next-intl';
import { UserMinus, MapPin, Calendar, ArrowRight, Loader2, User } from 'lucide-react';
import Link from 'next/link';
import { Link as NavigationLink } from '@/navigation';

interface FollowedSeller {
    seller: {
        id: string;
        name: string;
        photoURL?: string;
    };
    listings: Array<{
        _id: string;
        title: string;
        price: number;
        currency: string;
        images: Array<{ url: string }>;
        year: number;
        mileage: number;
        fuelType: string;
        transmission: string;
        brand: { label: string };
        carModel: { label: string };
        city: { label: string };
        slug: string; // If you have slugs
    }>;
}

export default function FollowingPage() {
    const { user, loading: authLoading } = useAuth();
    const t = useTranslations('Follow');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const [following, setFollowing] = useState<FollowedSeller[]>([]);
    const [loading, setLoading] = useState(true);
    const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        fetchFollowing();
    }, [user, authLoading]);

    const fetchFollowing = async () => {
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/following', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setFollowing(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch following:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (sellerId: string) => {
        if (!confirm(t('unfollowConfirm'))) return;

        setUnfollowingId(sellerId);
        try {
            const token = await user?.getIdToken();
            const res = await fetch(`/api/follow/${sellerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Remove from local state
                setFollowing(prev => prev.filter(item => item.seller.id !== sellerId));
            }
        } catch (error) {
            console.error('Failed to unfollow:', error);
        } finally {
            setUnfollowingId(null);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (following.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-zinc-800">
                    <div className="bg-gray-100 dark:bg-zinc-800 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserMinus className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('noFollowing')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        {t('noFollowingDesc')}
                    </p>
                    <Link
                        href={`/${locale}/search`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
                    >
                        {tCommon('cars')} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <User className="h-6 w-6" />
                </span>
                {t('followedSellers')}
            </h1>

            <div className="space-y-8">
                {following.map(({ seller, listings }) => (
                    <div
                        key={seller.id}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm"
                    >
                        {/* Seller Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                    {seller.photoURL ? (
                                        <img src={seller.photoURL} alt={seller.name} className="h-full w-full rounded-full object-cover" />
                                    ) : (
                                        seller.name.substring(0, 1).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {seller.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {listings.length} {t('latestListings')}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleUnfollow(seller.id)}
                                disabled={unfollowingId === seller.id}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                            >
                                {unfollowingId === seller.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UserMinus className="h-4 w-4" />
                                )}
                                {t('unfollow')}
                            </button>
                        </div>

                        {/* Recent Listings Grid */}
                        <div className="p-6">
                            {listings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {listings.map(listing => (
                                        <NavigationLink
                                            key={listing._id}
                                            href={`/cars/${listing._id}`} // Assuming ID based routing for now or update if slug is available
                                            className="group block bg-gray-50 dark:bg-zinc-800/50 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-all"
                                        >
                                            <div className="aspect-[4/3] bg-gray-200 dark:bg-zinc-700 relative overflow-hidden">
                                                {listing.images?.[0] ? (
                                                    <img
                                                        src={listing.images[0].url}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <User className="h-8 w-8" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-medium">
                                                    {listing.price.toLocaleString()} {listing.currency}
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm mb-1">
                                                    {listing.brand.label} {listing.carModel.label}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-0.5">
                                                        <Calendar className="h-3 w-3" /> {listing.year}
                                                    </span>
                                                    <span className="flex items-center gap-0.5">
                                                        <MapPin className="h-3 w-3" /> {listing.city.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </NavigationLink>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 italic text-sm">
                                    {t('noListingsAvailable')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
