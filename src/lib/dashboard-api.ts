import { DashboardListing, DashboardStats, FavoriteItem } from './dashboard-types';

const API_BASE = '/api/my-listings';

// Helper for API calls with detailed logging and error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log(`[API Call] ${options.method || 'GET'} ${endpoint}`);
    if (options.body) {
        // Log body keys to avoid leaking huge data, but log full body if small
        try {
            const bodyObj = JSON.parse(options.body as string);
            const keys = Object.keys(bodyObj);
            console.log(`[API Payload Keys]`, keys);
            // console.log(`[API Payload sample]`, bodyObj); // Uncomment if needed
        } catch {
            console.log(`[API Body] (Not JSON)`);
        }
    }

    const res = await fetch(endpoint, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ...' // If needed in future
            ...options.headers,
        },
    });

    console.log(`[API Response] Status: ${res.status} ${res.statusText}`);

    // Clone response to read text for error logging if JSON parsing fails
    const resClone = res.clone();
    let json: any;

    try {
        json = await res.json();
    } catch (e) {
        const text = await resClone.text();
        console.error(`[API Error] Failed to parse JSON. Raw response:`, text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }

    if (!res.ok) {
        // Detailed error for debugging
        console.error(`[API Error Response]`, json);
        const errorMessage = json.error || json.message || `API Error ${res.status}`;
        throw new Error(errorMessage);
    }

    // Handle { success: true, data: ... } or direct response
    return json.data !== undefined ? json.data : json;
}

/**
 * Get user's listings
 */
export async function getMyListings(
    userId: string,
    filters?: { status?: string; q?: string }
): Promise<DashboardListing[]> {
    const params = new URLSearchParams({ userId });

    if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
    }
    if (filters?.q) {
        params.append('q', filters.q);
    }

    const rawData = await fetchApi<any[]>(`${API_BASE}?${params.toString()}`);

    return rawData.map((l: any) => ({
        id: l._id?.toString() || l.id,
        _id: l._id?.toString(),
        title: l.title,
        price: l.price,
        currency: l.currency || 'MAD',
        status: l.status,
        type: l.purpose || l.type || 'sale',
        image: l.images?.[0]?.url || '/images/placeholder-car.jpg',
        images: l.images,
        views: l.views || 0,
        calls: l.callClicks || 0,
        whatsapp: l.whatsappClicks || 0,
        createdAt: l.createdAt,
        city: typeof l.city === 'object' ? l.city.label : l.city,
        brand: typeof l.brand === 'object' ? l.brand.label : l.brand,
        model: typeof l.carModel === 'object' ? l.carModel.label : l.carModel,
        year: l.year
    }));
}

/**
 * Get single listing by ID
 */
export async function getListingById(id: string): Promise<any | null> {
    try {
        const listing = await fetchApi<any>(`${API_BASE}/${id}`);
        return listing;
    } catch (error) {
        console.error('Failed to fetch listing:', error);
        return null;
    }
}

/**
 * Create new listing
 */
export async function createListing(userId: string, payload: any): Promise<{ id: string }> {
    // Ensure numeric types
    const mappedPayload = {
        ...payload,
        price: Number(payload.price) || 0,
        year: Number(payload.year) || new Date().getFullYear(),
        mileage: Number(payload.mileage) || 0,
        userId
    };

    const result = await fetchApi<{ _id: string; id: string }>(`${API_BASE}`, {
        method: 'POST',
        body: JSON.stringify(mappedPayload),
    });
    return { id: result._id || result.id };
}

/**
 * Update listing
 */
export async function updateListing(id: string, userId: string, payload: any): Promise<boolean> {
    const mappedPayload = {
        ...payload,
        price: Number(payload.price) || 0,
        year: Number(payload.year) || new Date().getFullYear(),
        mileage: Number(payload.mileage) || 0,
        userId
    };

    await fetchApi(`${API_BASE}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(mappedPayload),
    });
    return true;
}

/**
 * Update listing status (hide/show)
 */
export async function updateListingStatus(id: string, userId: string, status: string): Promise<boolean> {
    await fetchApi(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, userId }),
    });
    return true;
}

/**
 * Delete listing
 */
export async function deleteListing(id: string, userId: string): Promise<boolean> {
    await fetchApi(`${API_BASE}/${id}?userId=${userId}`, {
        method: 'DELETE',
    });
    return true;
}

/**
 * Get dashboard stats (calculated from listings)
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    const listings = await getMyListings(userId);
    return {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'approved').length,
        totalViews: listings.reduce((acc, l) => acc + (l.views || 0), 0),
        totalInteractions: listings.reduce((acc, l) => acc + (l.calls || 0) + (l.whatsapp || 0), 0),
    };
}

/**
 * Get favorites
 */
export async function getMyFavorites(userId: string): Promise<FavoriteItem[]> {
    try {
        const rawData = await fetchApi<any[]>(`/api/favorites?userId=${userId}`);
        return rawData.map((l: any) => ({
            id: l._id || l.id,
            title: l.title,
            price: l.price,
            image: l.images?.[0]?.url || '/images/placeholder-car.jpg',
            addedAt: l.createdAt,
            status: l.status,
        }));
    } catch {
        return [];
    }
}

/**
 * Remove favorite
 */
export async function removeFavorite(id: string, userId: string): Promise<boolean> {
    await fetchApi(`/api/favorites/${id}?userId=${userId}`, {
        method: 'DELETE',
    });
    return true;
}
