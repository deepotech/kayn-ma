
import { IListingBase } from '@/models/Listing';

export interface NormalizedListing extends Omit<IListingBase, 'images'> {
    images: Array<{
        url: string;
        publicId?: string;
    }>;
    coverImage: string;
}

const PLACEHOLDER_IMAGE = '/images/placeholder-car.jpg';

/**
 * Normalizes listing data from various sources (API, raw DB, potentially legacy shapes)
 * into a consistent structure for UI consumption.
 */
export function normalizeListing(raw: any): NormalizedListing | null {
    if (!raw) return null;

    // 1. Normalize Images
    let images: Array<{ url: string; publicId?: string }> = [];

    if (Array.isArray(raw.images)) {
        images = raw.images.map((img: any) => {
            // Case A: Already { url, publicId }
            if (typeof img === 'object' && img !== null && img.url) {
                return {
                    url: img.url,
                    publicId: img.publicId,
                };
            }
            // Case B: String URL
            if (typeof img === 'string' && img.trim().length > 0) {
                return {
                    url: img,
                };
            }
            return null;
        }).filter(Boolean) as Array<{ url: string; publicId?: string }>;
    } else if (typeof raw.image === 'string' && raw.image.trim().length > 0) {
        // Legacy single image field
        images = [{ url: raw.image }];
    }

    // Ensure at least one image (placeholder if empty)
    // BUT: logic might prefer empty array if really no images to show specific UI state?
    // User req: "Guarantee images is always a non-empty array with at least placeholder."
    if (images.length === 0) {
        images = [{ url: PLACEHOLDER_IMAGE }];
    }

    // 2. Cover Image
    const coverImage = images[0]?.url || PLACEHOLDER_IMAGE;

    return {
        ...raw,
        images,
        coverImage,
    };
}
