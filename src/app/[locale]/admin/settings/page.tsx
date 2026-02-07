'use client';

import { useLocale } from 'next-intl';
import { Settings, Shield, Bell, Database, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const settingSections = [
        {
            icon: Shield,
            titleFr: 'Sécurité',
            titleAr: 'الأمان',
            descFr: 'Configurer les paramètres de sécurité',
            descAr: 'تكوين إعدادات الأمان',
            status: 'coming_soon',
        },
        {
            icon: Bell,
            titleFr: 'Notifications',
            titleAr: 'الإشعارات',
            descFr: 'Gérer les notifications email et push',
            descAr: 'إدارة الإشعارات',
            status: 'coming_soon',
        },
        {
            icon: Database,
            titleFr: 'Base de données',
            titleAr: 'قاعدة البيانات',
            descFr: 'Statistiques et maintenance',
            descAr: 'إحصائيات وصيانة',
            status: 'coming_soon',
        },
        {
            icon: Globe,
            titleFr: 'SEO & Marketing',
            titleAr: 'SEO والتسويق',
            descFr: 'Optimisation et analytics',
            descAr: 'التحسين والتحليلات',
            status: 'coming_soon',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Settings className="h-6 w-6" />
                    {isRtl ? 'الإعدادات' : 'Paramètres'}
                </h1>
                <p className="text-zinc-400 mt-1">
                    {isRtl ? 'إعدادات المنصة والتكوين' : 'Configuration de la plateforme'}
                </p>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settingSections.map((section, idx) => (
                    <div
                        key={idx}
                        className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 relative overflow-hidden"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-zinc-700 rounded-xl">
                                <section.icon className="h-6 w-6 text-zinc-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white">
                                    {isRtl ? section.titleAr : section.titleFr}
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1">
                                    {isRtl ? section.descAr : section.descFr}
                                </p>
                            </div>
                        </div>

                        {section.status === 'coming_soon' && (
                            <div className="absolute top-3 right-3">
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                                    {isRtl ? 'قريباً' : 'Bientôt'}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Platform Info */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                    {isRtl ? 'معلومات المنصة' : 'Informations Plateforme'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-zinc-400">{isRtl ? 'الإصدار' : 'Version'}</p>
                        <p className="text-white font-mono">1.0.0</p>
                    </div>
                    <div>
                        <p className="text-zinc-400">{isRtl ? 'البيئة' : 'Environnement'}</p>
                        <p className="text-white font-mono">Production</p>
                    </div>
                    <div>
                        <p className="text-zinc-400">{isRtl ? 'قاعدة البيانات' : 'Base de données'}</p>
                        <p className="text-green-400 font-mono">● Connected</p>
                    </div>
                    <div>
                        <p className="text-zinc-400">{isRtl ? 'آخر نشر' : 'Dernier déploiement'}</p>
                        <p className="text-white font-mono">2026-02-05</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
