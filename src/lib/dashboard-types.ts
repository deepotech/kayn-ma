export type UserRole = 'user' | 'agency' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    city?: string;
    createdAt: string;
}

export type ListingStatus = 'approved' | 'pending_review' | 'rejected' | 'paused' | 'hidden';
export type ListingType = 'sale' | 'rent';

export interface DashboardListing {
    id: string;
    _id?: string; // For compatibility with MongoDB documents
    title: string;
    price: number;
    currency: string;
    status: ListingStatus;
    type: ListingType;
    image: string;
    images?: Array<{ url: string }>; // For real API compatibility
    views: number;
    calls: number;
    whatsapp: number;
    createdAt: string;
    city: string;
    brand: string;
    model: string;
    year: number;
}

export interface DashboardStats {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalInteractions: number; // calls + whatsapp
}

export interface FavoriteItem {
    id: string; // listing id
    title: string;
    price: number;
    image: string;
    addedAt: string;
    status: ListingStatus;
}
