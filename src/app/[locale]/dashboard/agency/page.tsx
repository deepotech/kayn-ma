'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
    Building2,
    Car,
    Phone,
    MessageCircle,
    Eye,
    ShieldCheck,
    Clock,
    AlertCircle,
    CheckCircle2,
    Plus,
    ExternalLink,
    Settings,
    BarChart3,
    Loader2
} from 'lucide-react';
import AgencyFleetManager from '@/components/agency/AgencyFleetManager';
import AgencyProfileEditor from '@/components/agency/AgencyProfileEditor';

export default function AgencyDashboardPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [loading, setLoading] = useState(true);
    const [hasAgency, setHasAgency] = useState(false);
    const [agency, setAgency] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'fleet' | 'profile' | 'stats'>('fleet');

    const fetchAgencyData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/agency/me');
            const data = await res.json();
            if (res.ok && data.hasAgency && data.agency) {
                setHasAgency(true);
                setAgency(data.agency);
            } else {
                setHasAgency(false);
                setAgency(null);
            }
        } catch (e) {
            console.error('Failed to load agency:', e);
            setHasAgency(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgencyData();
    }, [fetchAgencyData]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <span className="text-sm font-semibold text-slate-500">
                        {isRtl ? 'جاري تحميل بيانات الوكالة...' : 'Chargement de votre agence...'}
                    </span>
                </div>
            </div>
        );
    }

    // If user has no agency yet
    if (!hasAgency || !agency) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 sm:p-12 text-center shadow-sm">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Building2 className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
                        {isRtl ? 'لم تسجل وكالتك بعد على Cayn.ma' : 'Vous n’avez pas encore d’agence'}
                    </h2>

                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                        {isRtl
                            ? 'سجل وكالتك لإضافة أسطول سياراتك، تحديد أسعار الكراء اليومية والأسبوعية، واستقبال طلبات الزبائن مباشرة.'
                            : 'Enregistrez votre agence pour publier vos véhicules et recevoir des réservations.'}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href={`/${locale}/register-agency`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{isRtl ? 'تسجيل وكالة جديدة' : 'Créer mon agence'}</span>
                        </Link>

                        <Link
                            href={`/${locale}/rent-agencies`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm transition-all"
                        >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>{isRtl ? 'المطالبة بوكالة موجودة مسبقاً' : 'Revendiquer une agence existante'}</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const publicAgencyUrl = `/${locale}/rent-agencies/${agency.citySlug}/${agency.slug}`;
    const stats = agency.stats || {};

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Agency Banner Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-blue-600/20">
                            {agency.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center flex-wrap gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                                    {agency.name}
                                </h1>

                                {/* Verification Badge */}
                                {agency.verificationStatus === 'VERIFIED' ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{isRtl ? 'وكالة موثقة' : 'Vérifiée'}</span>
                                    </span>
                                ) : agency.verificationStatus === 'PENDING' ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{isRtl ? 'قيد مراجعة الإدارة' : 'En attente de validation'}</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold border border-slate-200">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>{isRtl ? 'غير موثقة' : 'Non vérifiée'}</span>
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-slate-400 mt-1 capitalize">
                                {agency.city} • {agency.address}
                            </p>
                        </div>
                    </div>

                    {/* Action button to public page */}
                    <div className="shrink-0">
                        <Link
                            href={publicAgencyUrl}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow hover:opacity-90 transition-opacity"
                        >
                            <span>{isRtl ? 'مشاهدة الصفحة العامة' : 'Voir la page publique'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40">
                        <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'إجمالي الأسطول' : 'Total véhicules'}</span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Car className="w-5 h-5 text-blue-600" />
                            <span>{stats.totalVehicles || 0}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-1">{isRtl ? 'سيارات متاحة' : 'Disponibles'}</span>
                        <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            <span>{stats.availableVehicles || 0}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40">
                        <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'زيارات ومشاهدات' : 'Vues'}</span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Eye className="w-5 h-5 text-purple-600" />
                            <span>{stats.views || 0}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40">
                        <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'نقرات التواصل' : 'Contacts'}</span>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-emerald-600" />
                            <span>{(stats.whatsappClicks || 0) + (stats.callClicks || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-2">
                <button
                    onClick={() => setActiveTab('fleet')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                        activeTab === 'fleet'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Car className="w-4 h-4" />
                    <span>{isRtl ? 'إدارة أسطول السيارات' : 'Flotte de véhicules'}</span>
                </button>

                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                        activeTab === 'profile'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    <span>{isRtl ? 'بيانات الوكالة' : 'Informations agence'}</span>
                </button>

                <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
                        activeTab === 'stats'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    <span>{isRtl ? 'الإحصائيات والطلبات' : 'Statistiques'}</span>
                </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'fleet' && (
                <AgencyFleetManager
                    initialVehicles={agency.vehicles || []}
                    agencySlug={agency.slug}
                    citySlug={agency.citySlug}
                    onUpdate={fetchAgencyData}
                />
            )}

            {activeTab === 'profile' && (
                <AgencyProfileEditor
                    agency={agency}
                    onUpdate={fetchAgencyData}
                />
            )}

            {activeTab === 'stats' && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm space-y-6">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {isRtl ? 'إحصائيات التفاعل ونقرات الزبائن' : 'Statistiques d’engagement'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500">{isRtl ? 'نقرات WhatsApp' : 'Clics WhatsApp'}</span>
                                <MessageCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="text-3xl font-black text-emerald-600">{stats.whatsappClicks || 0}</div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {isRtl ? 'زبائن فتحوا محادثة واتساب لحجز سيارة' : 'Clients ayant ouvert WhatsApp'}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500">{isRtl ? 'نقرات الاتصال الهاتفي' : 'Appels téléphoniques'}</span>
                                <Phone className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-3xl font-black text-blue-600">{stats.callClicks || 0}</div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {isRtl ? 'زبائن ضغطوا على زر الاتصال بالوكالة' : 'Clients ayant cliqué sur Appeler'}
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500">{isRtl ? 'مجموع المشاهدات' : 'Vues totales'}</span>
                                <Eye className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-3xl font-black text-purple-600">{stats.views || 0}</div>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {isRtl ? 'زيارات صفحة الوكالة وصفحات السيارات' : 'Vues de page et des voitures'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
