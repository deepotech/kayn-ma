'use client';

import { useLocale } from 'next-intl';
import { AdminListingStatus, AdminVisibility, AdminUserRole } from '@/lib/admin-types';

type StatusType = AdminListingStatus | AdminVisibility | AdminUserRole | 'pending' | 'reviewed' | 'dismissed' | 'actioned' | 'banned' | 'active';

interface StatusBadgeProps {
    status: StatusType;
    size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { label: string; labelAr: string; className: string }> = {
    // Listing statuses
    approved: {
        label: 'Approuvé',
        labelAr: 'معتمد',
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    pending_review: {
        label: 'En attente',
        labelAr: 'قيد المراجعة',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    rejected: {
        label: 'Rejeté',
        labelAr: 'مرفوض',
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    paused: {
        label: 'En pause',
        labelAr: 'متوقف',
        className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    },
    // Visibility
    public: {
        label: 'Public',
        labelAr: 'عام',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    hidden: {
        label: 'Masqué',
        labelAr: 'مخفي',
        className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    },
    // User roles
    user: {
        label: 'Utilisateur',
        labelAr: 'مستخدم',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    moderator: {
        label: 'Modérateur',
        labelAr: 'مشرف',
        className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    admin: {
        label: 'Admin',
        labelAr: 'مدير',
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    // Report statuses
    pending: {
        label: 'En attente',
        labelAr: 'قيد الانتظار',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    reviewed: {
        label: 'Examiné',
        labelAr: 'تمت المراجعة',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    dismissed: {
        label: 'Rejeté',
        labelAr: 'مرفوض',
        className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    },
    actioned: {
        label: 'Action prise',
        labelAr: 'تم اتخاذ إجراء',
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    // User states
    banned: {
        label: 'Banni',
        labelAr: 'محظور',
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    active: {
        label: 'Actif',
        labelAr: 'نشط',
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const config = statusConfig[status] || {
        label: status,
        labelAr: status,
        className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    };

    const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1';

    return (
        <span className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses}`}>
            {isRtl ? config.labelAr : config.label}
        </span>
    );
}
