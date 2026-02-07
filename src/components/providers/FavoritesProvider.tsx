'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import {
    getLocalFavorites,
    addLocalFavorite,
    removeLocalFavorite,
    clearLocalFavorites,
    setLocalFavorites
} from '@/lib/favorites';

interface FavoritesContextType {
    favorites: string[];
    loading: boolean;
    addFavorite: (listingId: string) => Promise<void>;
    removeFavorite: (listingId: string) => Promise<void>;
    isFavorite: (listingId: string) => boolean;
    favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Get auth token for API calls
    const getAuthToken = useCallback(async (): Promise<string | null> => {
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch {
            return null;
        }
    }, [user]);

    // Fetch favorites from API
    const fetchFromAPI = useCallback(async () => {
        const token = await getAuthToken();
        if (!token) return [];

        try {
            const response = await fetch('/api/favorites', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                return data.data?.map((f: any) => f.listingId?.toString()) || [];
            }
        } catch (e) {
            console.error('Failed to fetch favorites:', e);
        }
        return [];
    }, [getAuthToken]);

    // Sync localStorage to API on login
    const syncToAPI = useCallback(async (localIds: string[]) => {
        if (localIds.length === 0) return;

        const token = await getAuthToken();
        if (!token) return;

        try {
            await fetch('/api/favorites/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ listingIds: localIds })
            });
            // Clear localStorage after successful sync
            clearLocalFavorites();
        } catch (e) {
            console.error('Failed to sync favorites:', e);
        }
    }, [getAuthToken]);

    // Initialize favorites
    useEffect(() => {
        const initFavorites = async () => {
            if (authLoading) return;

            setLoading(true);

            if (user) {
                // User is logged in
                const localFavs = getLocalFavorites();

                // Sync local favorites to API first
                if (localFavs.length > 0) {
                    await syncToAPI(localFavs);
                }

                // Fetch from API
                const apiFavs = await fetchFromAPI();
                setFavorites(apiFavs);
                // Also cache in localStorage for faster subsequent loads
                setLocalFavorites(apiFavs);
            } else {
                // User is logged out - use localStorage
                setFavorites(getLocalFavorites());
            }

            setLoading(false);
        };

        initFavorites();
    }, [user, authLoading, fetchFromAPI, syncToAPI]);

    // Add favorite
    const addFavorite = useCallback(async (listingId: string) => {
        // Optimistic update
        setFavorites(prev => [...prev, listingId]);
        addLocalFavorite(listingId);

        if (user) {
            const token = await getAuthToken();
            if (token) {
                try {
                    await fetch('/api/favorites', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ listingId })
                    });
                } catch (e) {
                    console.error('Failed to add favorite:', e);
                }
            }
        }
    }, [user, getAuthToken]);

    // Remove favorite
    const removeFavorite = useCallback(async (listingId: string) => {
        // Optimistic update
        setFavorites(prev => prev.filter(id => id !== listingId));
        removeLocalFavorite(listingId);

        if (user) {
            const token = await getAuthToken();
            if (token) {
                try {
                    await fetch(`/api/favorites/${listingId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (e) {
                    console.error('Failed to remove favorite:', e);
                }
            }
        }
    }, [user, getAuthToken]);

    // Check if listing is favorited
    const isFavorite = useCallback((listingId: string) => {
        return favorites.includes(listingId);
    }, [favorites]);

    return (
        <FavoritesContext.Provider value={{
            favorites,
            loading,
            addFavorite,
            removeFavorite,
            isFavorite,
            favoritesCount: favorites.length
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
