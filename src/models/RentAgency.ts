
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRentAgency extends Document {
    name: string;
    slug: string;
    city: string;
    address: string;
    phone: string | null;
    website: string | null;
    location: {
        lat: number;
        lng: number;
    };
    categories: string[];
    rating: number | null;
    reviewsCount: number | null;
    photos: string[];
    source: 'apify' | 'manual';
    status: 'active' | 'pending' | 'suspended' | 'rejected';
    claimed: boolean;
    createdAt: Date;
    updatedAt: Date;
    reviews: any[];
    openingHours: any[];
}

const RentAgencySchema = new Schema<IRentAgency>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        city: { type: String, required: true, index: true }, // Indexed for filtering
        address: { type: String, required: true },
        phone: { type: String, default: null },
        website: { type: String, default: null },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
        categories: { type: [String], default: [] },
        rating: { type: Number, default: null },
        reviewsCount: { type: Number, default: null },
        photos: { type: [String], default: [] },
        source: { type: String, enum: ['apify', 'manual'], default: 'apify' },
        status: { type: String, enum: ['active', 'pending', 'suspended', 'rejected'], default: 'active', index: true },
        reviews: { type: [], default: [] }, // Store raw review objects
        openingHours: { type: [], default: [] },
        claimed: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Prevent model overwrite in development
const RentAgency: Model<IRentAgency> =
    mongoose.models.RentAgency || mongoose.model<IRentAgency>('RentAgency', RentAgencySchema);

export default RentAgency;
