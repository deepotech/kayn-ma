import mongoose, { Schema, Document, Model } from 'mongoose';

// Base interface for UI and Data
export interface IListingBase {
    _id?: string;
    purpose: 'sale' | 'rent';
    adType?: 'sale' | 'rental'; // Deprecated
    condition: 'new' | 'used';
    sellerType: 'individual' | 'agency';
    title: string;
    description: string;
    price: number;
    pricePeriod?: 'day' | 'week' | 'month' | null;
    currency: string;

    // New Structured Fields
    brand: { label: string; slug: string };
    carModel: { label: string; slug: string }; // Changed from 'model' to 'carModel' to avoid mongoose conflict if any
    city: { label: string; slug: string };
    bodyType: { label: string; slug: string };

    year: number;
    mileage: number;
    fuelType: 'Diesel' | 'Petrol' | 'Hybrid' | 'Electric';
    transmission: 'Manual' | 'Automatic';

    images: Array<{
        url: string;
        publicId: string;
    }>;

    // Moderation fields
    status: 'approved' | 'pending_review' | 'rejected' | 'paused';
    visibility: 'public' | 'hidden';
    isReported: boolean;
    reportsCount: number;
    moderatedBy?: string;
    lastModeratedAt?: Date | string;
    rejectionReason?: string;

    publishedAt?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    phone?: string;
    whatsapp?: string;
    userId?: string;
    sellerName?: string;
    agencyName?: string;
    isAgencyVerified?: boolean;
    isFeatured?: boolean;
    marketPrice?: number;
    whatsappClicks?: number;
    callClicks?: number;
}

// Mongoose Document Interface
export interface IListingDocument extends Omit<IListingBase, '_id'>, Document {
    createdAt: Date;
    updatedAt: Date;
}

const ListingSchema: Schema = new Schema({
    purpose: { type: String, enum: ['sale', 'rent'], default: 'sale', required: true },
    adType: { type: String, enum: ['sale', 'rental'] }, // Keep for now
    condition: { type: String, enum: ['new', 'used'], default: 'used' },
    sellerType: { type: String, enum: ['individual', 'agency'], default: 'individual' },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    pricePeriod: { type: String, enum: ['day', 'week', 'month'], default: null },
    currency: { type: String, default: 'MAD' },

    // Structured Objects
    brand: {
        label: { type: String, required: true },
        slug: { type: String, required: true, index: true }
    },
    carModel: {
        label: { type: String, required: true },
        slug: { type: String, required: true, index: true }
    },
    city: {
        label: { type: String, required: true },
        slug: { type: String, required: true, index: true }
    },
    bodyType: {
        label: { type: String, required: true },
        slug: { type: String, required: true, index: true }
    },

    // Legacy fields - optional for migration
    brandCustom: { type: String },
    modelCustom: { type: String },
    cityCustom: { type: String },

    year: { type: Number, required: true },
    mileage: { type: Number, default: 0 },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'Hybrid', 'Electric'], required: true },
    transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },

    images: [{
        url: String,
        publicId: String
    }],

    // Moderation fields
    status: {
        type: String,
        enum: ['approved', 'pending_review', 'rejected', 'paused'],
        default: 'approved',
        index: true
    },
    visibility: {
        type: String,
        enum: ['public', 'hidden'],
        default: 'public',
        index: true
    },
    isReported: { type: Boolean, default: false, index: true },
    reportsCount: { type: Number, default: 0 },
    moderatedBy: { type: String },
    lastModeratedAt: { type: Date },
    rejectionReason: { type: String },

    phone: { type: String, required: true },
    whatsapp: { type: String },
    userId: { type: String, index: true },
    sellerName: { type: String },
    agencyName: { type: String },
    isAgencyVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    marketPrice: { type: Number },
    whatsappClicks: { type: Number, default: 0 },
    callClicks: { type: Number, default: 0 },
    publishedAt: { type: Date, index: true },
}, { timestamps: true });

// Indexes
// 1. Public Approved Listings (Main query pattern)
ListingSchema.index({ status: 1, visibility: 1, publishedAt: -1 });

// 2. Filter Indexes
ListingSchema.index({ "brand.slug": 1, status: 1, visibility: 1, publishedAt: -1 });
ListingSchema.index({ "city.slug": 1, status: 1, visibility: 1, publishedAt: -1 });
ListingSchema.index({ "bodyType.slug": 1, status: 1, visibility: 1, publishedAt: -1 });
ListingSchema.index({ "carModel.slug": 1, status: 1, visibility: 1, publishedAt: -1 });
ListingSchema.index({ purpose: 1, status: 1, visibility: 1, publishedAt: -1 });

// 3. Compound Filter (Common search patterns)
ListingSchema.index({ "brand.slug": 1, "city.slug": 1, status: 1, visibility: 1, publishedAt: -1 });

// 4. Admin/Moderation indexes
ListingSchema.index({ isReported: 1, status: 1 });
ListingSchema.index({ userId: 1, createdAt: -1 });

// Prevent overwrite model error
const Listing: Model<IListingDocument> = mongoose.models.Listing || mongoose.model<IListingDocument>('Listing', ListingSchema);

export type IListing = IListingDocument;
export default Listing;

