'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Car, Users, Flag, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { AdminStats } from '@/lib/admin-types';

export default function AdminDashboard() {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={isRtl ? 'إجمالي الإعلانات' : 'Total Annonces'}
                    value={stats?.totalListings || 0}
                    icon={Car}
                    color="blue"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'في انتظار المراجعة' : 'En attente'}
                    value={stats?.pendingListings || 0}
                    icon={Clock}
                    color="yellow"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'المستخدمين' : 'Utilisateurs'}
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    color="purple"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'البلاغات' : 'Signalements'}
                    value={stats?.reportsCount || 0}
                    icon={Flag}
                    color="red"
                    isLoading={loading}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title={isRtl ? 'الإعلانات المعتمدة' : 'Annonces approuvées'}
                    value={stats?.approvedListings || 0}
                    icon={CheckCircle}
                    color="green"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'الإعلانات المرفوضة' : 'Annonces rejetées'}
                    value={stats?.rejectedListings || 0}
                    icon={XCircle}
                    color="red"
                    isLoading={loading}
                />
                <StatCard
                    title={isRtl ? 'المستخدمين المحظورين' : 'Utilisateurs bannis'}
                    value={stats?.bannedUsers || 0}
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
