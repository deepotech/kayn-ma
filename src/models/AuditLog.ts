import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    actorId: string; // Firebase UID of the admin/moderator
    actorEmail?: string;
    action: string; // e.g., 'approve_listing', 'reject_listing', 'ban_user', etc.
    targetType: 'listing' | 'user' | 'report';
    targetId: string;
    meta?: Record<string, any>; // Additional context (old values, reason, etc.)
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    actorId: { type: String, required: true, index: true },
    actorEmail: { type: String },
    action: { type: String, required: true, index: true },
    targetType: {
        type: String,
        enum: ['listing', 'user', 'report'],
        required: true,
        index: true
    },
    targetId: { type: String, required: true, index: true },
    meta: { type: Schema.Types.Mixed },
}, { timestamps: true });

// Index for querying recent actions
AuditLogSchema.index({ createdAt: -1 });

// Compound index for filtering by target
AuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
