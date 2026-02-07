// Admin Panel Types

export type AdminListingStatus = 'approved' | 'pending_review' | 'rejected' | 'paused';
export type AdminVisibility = 'public' | 'hidden';
export type AdminUserRole = 'user' | 'moderator' | 'admin';

export interface AdminStats {
    totalListings: number;
    pendingListings: number;
    approvedListings: number;
    rejectedListings: number;
    totalUsers: number;
    bannedUsers: number;
    reportsCount: number;
    reportsPending: number;
}

export interface AdminListing {
    _id: string;
    title: string;
    price: number;
    currency: string;
    status: AdminListingStatus;
    visibility: AdminVisibility;
    isReported: boolean;
    reportsCount: number;
    rejectionReason?: string;
    images: Array<{ url: string; publicId: string }>;
    brand: { label: string; slug: string };
    carModel: { label: string; slug: string };
    city: { label: string; slug: string };
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    phone: string;
    whatsapp?: string;
    userId: string;
    sellerName?: string;
    sellerType: 'individual' | 'agency';
    createdAt: string;
    publishedAt?: string;
    moderatedBy?: string;
    lastModeratedAt?: string;
}

export interface AdminUser {
    _id: string;
    firebaseUid: string;
    email: string;
    displayName?: string;
    role: AdminUserRole;
    isBanned: boolean;
    banReason?: string;
    bannedUntil?: string;
    listingsCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Report {
    _id: string;
    listingId: string;
    listingTitle: string;
    listingImage?: string;
    reporterEmail: string;
    reporterId?: string;
    reason: string;
    details?: string;
    status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
    actionTaken?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    createdAt: string;
}

// API Response Types
export interface AdminListingsResponse {
    listings: AdminListing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminUsersResponse {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AdminReportsResponse {
    reports: Report[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Action Types
export interface ListingStatusUpdate {
    status: AdminListingStatus;
    visibility?: AdminVisibility;
    rejectionReason?: string;
}

export interface UserUpdate {
    isBanned?: boolean;
    banReason?: string;
    bannedUntil?: string;
    role?: AdminUserRole;
}

export interface ReportAction {
    status: 'reviewed' | 'dismissed' | 'actioned';
    actionTaken?: string;
}
