import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
    listingId: mongoose.Types.ObjectId;
    reporterId: string | null; // Firebase UID, null for anonymous
    reporterIp: string;
    reason: 'scam' | 'duplicate' | 'wrong_info' | 'spam' | 'illegal' | 'other';
    message?: string;
    status: 'open' | 'resolved' | 'dismissed';
    resolvedBy?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
    listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
    reporterId: { type: String, default: null, index: true },
    reporterIp: { type: String, required: true },
    reason: {
        type: String,
        enum: ['scam', 'duplicate', 'wrong_info', 'spam', 'illegal', 'other'],
        required: true
    },
    message: { type: String, maxlength: 500 },
    status: {
        type: String,
        enum: ['open', 'resolved', 'dismissed'],
        default: 'open',
        index: true
    },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
}, { timestamps: true });

// Compound index to prevent duplicate reports from same user on same listing
ReportSchema.index({ listingId: 1, reporterId: 1 }, { unique: true, sparse: true });

// Index for rate limiting queries
ReportSchema.index({ reporterId: 1, createdAt: -1 });
ReportSchema.index({ reporterIp: 1, createdAt: -1 });

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
