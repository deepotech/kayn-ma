import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFollowBase {
    followerId: string;
    followingId: string;
    createdAt?: Date;
}

export interface IFollowDocument extends IFollowBase, Document {
    createdAt: Date;
}

const FollowSchema: Schema = new Schema({
    followerId: { type: String, required: true, index: true },
    followingId: { type: String, required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Prevent duplicate follows
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow: Model<IFollowDocument> = mongoose.models.Follow || mongoose.model<IFollowDocument>('Follow', FollowSchema);

export default Follow;
