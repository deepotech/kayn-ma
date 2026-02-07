'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Search, RefreshCw, Loader2 } from 'lucide-react';
import AdminUserRow from '@/components/admin/AdminUserRow';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { AdminUser, AdminUsersResponse } from '@/lib/admin-types';

const ROLE_OPTIONS = [
    { value: 'all', labelFr: 'Tous', labelAr: 'الكل' },
    { value: 'user', labelFr: 'Utilisateurs', labelAr: 'مستخدمين' },
    { value: 'admin', labelFr: 'Admins', labelAr: 'مدراء' },
    { value: 'moderator', labelFr: 'Modérateurs', labelAr: 'مشرفين' },
];

export default function AdminUsersPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [role, setRole] = useState('all');
    const [search, setSearch] = useState('');
    const [showBanned, setShowBanned] = useState(false);

    // Modals
    const [banModal, setBanModal] = useState<{ isOpen: boolean; userId: string | null }>({
        isOpen: false,
        userId: null,
    });
    const [adminModal, setAdminModal] = useState<{ isOpen: boolean; userId: string | null; action: 'promote' | 'demote' }>({
        isOpen: false,
        userId: null,
        action: 'promote',
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });
            if (role !== 'all') params.set('role', role);
            if (search) params.set('search', search);
            if (showBanned) params.set('banned', 'true');

            const res = await fetch(`/api/admin/users?${params}`);
            const data: AdminUsersResponse = await res.json();

            setUsers(data.users);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [page, role, search, showBanned]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const updateUser = async (id: string, data: any) => {
        setActionLoading(id);
        try {
            await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleBan = (id: string) => setBanModal({ isOpen: true, userId: id });
    const handleUnban = (id: string) => updateUser(id, { isBanned: false });
    const handleMakeAdmin = (id: string) => setAdminModal({ isOpen: true, userId: id, action: 'promote' });
    const handleRemoveAdmin = (id: string) => setAdminModal({ isOpen: true, userId: id, action: 'demote' });

    const confirmBan = async (reason?: string) => {
        if (banModal.userId) {
            await updateUser(banModal.userId, { isBanned: true, banReason: reason });
        }
    };

    const confirmAdminAction = async () => {
        if (adminModal.userId) {
            const newRole = adminModal.action === 'promote' ? 'admin' : 'user';
            await updateUser(adminModal.userId, { role: newRole });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isRtl ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs'}
                    </h1>
                    <p className="text-zinc-400">
                        {total} {isRtl ? 'مستخدم' : 'utilisateur(s)'}
                    </p>
                </div>
                <button
                    onClick={() => fetchUsers()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {isRtl ? 'تحديث' : 'Actualiser'}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder={isRtl ? 'بحث بالإيميل أو الاسم...' : 'Rechercher par email ou nom...'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isRtl ? opt.labelAr : opt.labelFr}
                            </option>
                        ))}
                    </select>

                    {/* Banned Toggle */}
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showBanned}
                            onChange={(e) => setShowBanned(e.target.checked)}
                            className="rounded bg-zinc-600 border-zinc-500 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-white text-sm">
                            {isRtl ? 'المحظورين فقط' : 'Bannis uniquement'}
                        </span>
                    </label>
                </div>
            </div>

            {/* Users List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400">
                        {isRtl ? 'لا يوجد مستخدمين' : 'Aucun utilisateur trouvé'}
                    </div>
                ) : (
                    users.map((user) => (
                        <AdminUserRow
                            key={user._id}
                            user={user}
                            onBan={handleBan}
                            onUnban={handleUnban}
                            onMakeAdmin={handleMakeAdmin}
                            onRemoveAdmin={handleRemoveAdmin}
                            isLoading={actionLoading === user._id}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRtl ? 'السابق' : 'Précédent'}
                    </button>
                    <span className="text-zinc-400">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRtl ? 'التالي' : 'Suivant'}
                    </button>
                </div>
            )}

            {/* Ban Modal */}
            <ConfirmModal
                isOpen={banModal.isOpen}
                onClose={() => setBanModal({ isOpen: false, userId: null })}
                onConfirm={confirmBan}
                title={isRtl ? 'حظر المستخدم' : 'Bannir l\'utilisateur'}
                message={isRtl ? 'هل أنت متأكد من حظر هذا المستخدم؟' : 'Êtes-vous sûr de vouloir bannir cet utilisateur?'}
                confirmText={isRtl ? 'حظر' : 'Bannir'}
                variant="danger"
                showReasonInput
                reasonPlaceholder={isRtl ? 'سبب الحظر...' : 'Raison du ban...'}
            />

            {/* Admin Action Modal */}
            <ConfirmModal
                isOpen={adminModal.isOpen}
                onClose={() => setAdminModal({ isOpen: false, userId: null, action: 'promote' })}
                onConfirm={confirmAdminAction}
                title={adminModal.action === 'promote'
                    ? (isRtl ? 'ترقية لمدير' : 'Promouvoir Admin')
                    : (isRtl ? 'إزالة صلاحيات المدير' : 'Retirer Admin')
                }
                message={adminModal.action === 'promote'
                    ? (isRtl ? 'هل أنت متأكد من ترقية هذا المستخدم؟' : 'Êtes-vous sûr de vouloir promouvoir cet utilisateur?')
                    : (isRtl ? 'هل أنت متأكد من إزالة صلاحيات المدير؟' : 'Êtes-vous sûr de vouloir retirer les droits admin?')
                }
                confirmText={isRtl ? 'تأكيد' : 'Confirmer'}
                variant={adminModal.action === 'promote' ? 'info' : 'warning'}
            />
        </div>
    );
}
