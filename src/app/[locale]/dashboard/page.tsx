'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/auth/AuthContext'; // ADDED import
import { StatCard } from '@/components/dashboard/SharedComponents';
import { LayoutDashboard, CheckCircle, Eye, Hand } from 'lucide-react';
import { getDashboardStats } from '@/lib/dashboard-api';
import { DashboardStats } from '@/lib/dashboard-types';

export default function DashboardPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user, loading: authLoading } = useAuth(); // ADDED: Auth hook
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        if (user) {
            getDashboardStats(user.uid).then(setStats);
        }
    }, [user]);

    // Skeletons
    if (!stats) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
        </div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRtl ? 'نظرة عامة' : 'Vue d\'ensemble'}
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={isRtl ? 'إجمالي الإعلانات' : 'Total Annonces'}
                    value={stats.totalListings}
                    icon={LayoutDashboard}
                    color="blue"
                />
                <StatCard
                    title={isRtl ? 'إعلانات نشطة' : 'Annonces Actives'}
                    value={stats.activeListings}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title={isRtl ? 'المشاهدات' : 'Vues Totales'}
                    value={stats.totalViews}
                    icon={Eye}
                    color="purple"
                    trend="+12% this week"
                />
                <StatCard
                    title={isRtl ? 'تفاعلات' : 'Interactions'}
                    value={stats.totalInteractions}
                    icon={Hand}
                    color="orange"
                />
            </div>

            {/* Recent Activity / Quick Actions could go here */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800">
                <h3 className="text-lg font-bold mb-4">{isRtl ? 'نصائح لزيادة مبيعاتك' : 'Conseils pour booster vos ventes'}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>{isRtl ? 'أضف صوراً عالية الجودة وواضحة.' : 'Ajoutez des photos claires et de haute qualité.'}</li>
                    <li>{isRtl ? 'اكتب وصفاً دقيقاً ومفصلاً للسيارة.' : 'Rédigez une description précise et détaillée.'}</li>
                    <li>{isRtl ? 'شارك إعلانك على وسائل التواصل الاجتماعي.' : 'Partagez votre annonce sur les réseaux sociaux.'}</li>
                </ul>
            </div>
        </div>
    );
}
