'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/components/providers/FavoritesProvider';

interface FavoriteButtonProps {
    listingId: string;
    size?: 'sm' | 'md';
}

export default function FavoriteButton({ listingId, size = 'md' }: FavoriteButtonProps) {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const isListingFavorite = isFavorite(listingId);

    const handleClick = () => {
        if (isListingFavorite) {
            removeFavorite(listingId);
        } else {
            addFavorite(listingId);
        }
    };

    const iconSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';

    return (
        <button
            onClick={handleClick}
            className={`p-2 rounded-full transition ${isListingFavorite
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
            aria-label={isListingFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart className={`${iconSize} ${isListingFavorite ? 'fill-current' : ''}`} />
        </button>
    );
}
