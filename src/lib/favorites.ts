/**
 * LocalStorage utilities for favorites
 */

const STORAGE_KEY = 'cayn_favorites';

export function getLocalFavorites(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function setLocalFavorites(favorites: string[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.error('Failed to save favorites to localStorage:', e);
    }
}

export function addLocalFavorite(listingId: string): string[] {
    const favorites = getLocalFavorites();
    if (!favorites.includes(listingId)) {
        favorites.push(listingId);
        setLocalFavorites(favorites);
    }
    return favorites;
}

export function removeLocalFavorite(listingId: string): string[] {
    const favorites = getLocalFavorites().filter(id => id !== listingId);
    setLocalFavorites(favorites);
    return favorites;
}

export function clearLocalFavorites(): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear favorites from localStorage:', e);
    }
}

export function isLocalFavorite(listingId: string): boolean {
    return getLocalFavorites().includes(listingId);
}
