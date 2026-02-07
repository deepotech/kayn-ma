import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    firebaseUid: string;
    email: string;
    displayName?: string;
    role: 'user' | 'moderator' | 'admin';
    isBanned: boolean;
    banReason?: string;
    bannedUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    displayName: { type: String },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user',
        index: true
    },
    isBanned: { type: Boolean, default: false, index: true },
    banReason: { type: String },
    bannedUntil: { type: Date },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
