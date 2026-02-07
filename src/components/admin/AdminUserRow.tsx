'use client';

import { useLocale } from 'next-intl';
import { Ban, UserCheck, Shield, ShieldOff, MoreVertical } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { AdminUser } from '@/lib/admin-types';

interface AdminUserRowProps {
    user: AdminUser;
    onBan: (id: string) => void;
    onUnban: (id: string) => void;
    onMakeAdmin: (id: string) => void;
    onRemoveAdmin: (id: string) => void;
    isLoading?: boolean;
}

export default function AdminUserRow({
    user,
    onBan,
    onUnban,
    onMakeAdmin,
    onRemoveAdmin,
    isLoading = false,
}: AdminUserRowProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    return (
        <div className={`bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 hover:bg-zinc-800 transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* User Info */}
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold text-zinc-400">
                        {user.displayName?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h3 className="font-bold text-white">
                            {user.displayName || 'Utilisateur'}
                        </h3>
                        <p className="text-sm text-zinc-400">{user.email}</p>
                    </div>
                </div>

                {/* Status & Stats */}
                <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={user.role} />
                    {user.isBanned && <StatusBadge status="banned" />}
                    {!user.isBanned && <StatusBadge status="active" />}

                    {user.listingsCount !== undefined && (
                        <span className="text-sm text-zinc-500">
                            {user.listingsCount} {isRtl ? 'إعلانات' : 'annonces'}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {user.isBanned ? (
                        <button
                            onClick={() => onUnban(user._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                        >
                            <UserCheck className="h-3 w-3" />
                            {isRtl ? 'رفع الحظر' : 'Débannir'}
                        </button>
                    ) : (
                        <button
                            onClick={() => onBan(user._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        >
                            <Ban className="h-3 w-3" />
                            {isRtl ? 'حظر' : 'Bannir'}
                        </button>
                    )}

                    {user.role === 'admin' ? (
                        <button
                            onClick={() => onRemoveAdmin(user._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors"
                        >
                            <ShieldOff className="h-3 w-3" />
                            {isRtl ? 'إزالة صلاحيات' : 'Retirer Admin'}
                        </button>
                    ) : (
                        <button
                            onClick={() => onMakeAdmin(user._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors"
                        >
                            <Shield className="h-3 w-3" />
                            {isRtl ? 'ترقية لمدير' : 'Promouvoir Admin'}
                        </button>
                    )}
                </div>
            </div>

            {/* Ban reason if exists */}
            {user.isBanned && user.banReason && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                    <p className="text-sm text-red-400">
                        <strong>{isRtl ? 'سبب الحظر:' : 'Raison du ban:'}</strong> {user.banReason}
                    </p>
                </div>
            )}
        </div>
    );
}
