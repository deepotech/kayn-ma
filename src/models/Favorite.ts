import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavoriteBase {
    _id?: string;
    userId: string;
    listingId: string;
    createdAt?: Date;
}

export interface IFavoriteDocument extends Omit<IFavoriteBase, '_id'>, Document {
    createdAt: Date;
}

const FavoriteSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
}, { timestamps: true });

// Compound unique index to prevent duplicates
FavoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

const Favorite: Model<IFavoriteDocument> = mongoose.models.Favorite || mongoose.model<IFavoriteDocument>('Favorite', FavoriteSchema);

export default Favorite;
