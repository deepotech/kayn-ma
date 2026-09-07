'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Car, Users, Flag, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { AdminStats } from '@/lib/admin-types';
import { useAuth } from '@/components/auth/AuthContext';

export default function AdminDashboard() {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const headers: Record<string, string> = {};
            if (user) {
                try {
                    const token = await user.getIdToken();
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                    }
                } catch {
                    // Fallback to cookie
                }
            }

            const res = await fetch('/api/admin/stats', { headers });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setError(isRtl ? 'تعذر تحميل الإحصائيات. يرجى التحقق من الصلاحيات والمحاولة مجدداً.' : 'Échec du chargement des statistiques. Veuillez vérifier vos accès et réessayer.');
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [user, isRtl]);

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchStats();
            } else {
                setLoading(false);
            }
        }
    }, [authLoading, user, fetchStats]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                    {isRtl ? 'لوحة التحكم' : 'Tableau de bord'}
                </h1>
                <p className="text-zinc-400">
                    {isRtl ? 'نظرة عامة على المنصة' : 'Vue d\'ensemble de la plateforme'}
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <span className="text-red-300 text-sm font-medium">{error}</span>
                    </div>
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{isRtl ? 'إعادة المحاولة' : 'Réessayer'}</span>
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={isRtl ? 'إجمالي الإعلانات' : 'Total Annonces'}
                    value={stats ? stats.totalListings : '—'}
                    icon={Car}
                    color="blue"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'في انتظار المراجعة' : 'En attente'}
                    value={stats ? stats.pendingListings : '—'}
                    icon={Clock}
                    color="yellow"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'المستخدمين' : 'Utilisateurs'}
                    value={stats ? stats.totalUsers : '—'}
                    icon={Users}
                    color="purple"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'البلاغات' : 'Signalements'}
                    value={stats ? stats.reportsCount : '—'}
                    icon={Flag}
                    color="red"
                    isLoading={loading}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title={isRtl ? 'الإعلانات المعتمدة' : 'Annonces approuvées'}
                    value={stats ? stats.approvedListings : '—'}
                    icon={CheckCircle}
                    color="green"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'الإعلانات المرفوضة' : 'Annonces rejetées'}
                    value={stats ? stats.rejectedListings : '—'}
                    icon={XCircle}
                    color="red"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'المستخدمين المحظورين' : 'Utilisateurs bannis'}
                    value={stats ? stats.bannedUsers : '—'}
                    icon={AlertTriangle}
                    color="red"
                    isLoading={loading}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Car className="h-5 w-5 text-blue-400" />
                        {isRtl ? 'إدارة الإعلانات' : 'Gestion des Annonces'}
                    </h2>
                    <p className="text-zinc-400 text-sm mb-4">
                        {isRtl
                            ? 'مراجعة والموافقة أو رفض الإعلانات المعلقة'
                            : 'Examiner et approuver ou rejeter les annonces en attente'
                        }
                    </p>
                    <Link
                        href={`/${locale}/admin/listings`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        {isRtl ? 'عرض الإعلانات' : 'Voir les annonces'}
                    </Link>
                </div>

                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-400" />
                        {isRtl ? 'إدارة المستخدمين' : 'Gestion des Utilisateurs'}
                    </h2>
                    <p className="text-zinc-400 text-sm mb-4">
                        {isRtl
                            ? 'إدارة حسابات المستخدمين والصلاحيات'
                            : 'Gérer les comptes utilisateurs et les permissions'
                        }
                    </p>
                    <Link
                        href={`/${locale}/admin/users`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                    >
                        {isRtl ? 'عرض المستخدمين' : 'Voir les utilisateurs'}
                    </Link>
                </div>
            </div>

            {/* Reports Section */}
            {stats && stats.reportsCount > 0 && (
                <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <Flag className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">
                                    {isRtl ? 'بلاغات تحتاج إلى مراجعة' : 'Signalements en attente'}
                                </h3>
                                <p className="text-red-400 text-sm">
                                    {stats.reportsCount} {isRtl ? 'بلاغ جديد' : 'signalement(s)'}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/${locale}/admin/reports`}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                            {isRtl ? 'معالجة' : 'Traiter'}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
