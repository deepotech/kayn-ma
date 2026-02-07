'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { RefreshCw, Loader2, Eye, XCircle, EyeOff, Trash2, Flag } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Report, AdminReportsResponse } from '@/lib/admin-types';

export default function AdminReportsPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Modals
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        reportId: string | null;
        action: 'dismiss' | 'hide' | 'delete';
    }>({
        isOpen: false,
        reportId: null,
        action: 'dismiss',
    });

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });

            const res = await fetch(`/api/admin/reports?${params}`);
            const data: AdminReportsResponse = await res.json();

            setReports(data.reports);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleAction = async (reportId: string, action: 'dismiss' | 'hide' | 'delete') => {
        setActionLoading(reportId);
        try {
            await fetch(`/api/admin/reports/${reportId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            fetchReports();
        } catch (error) {
            console.error('Failed to process action:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const openActionModal = (reportId: string, action: 'dismiss' | 'hide' | 'delete') => {
        setActionModal({ isOpen: true, reportId, action });
    };

    const confirmAction = async () => {
        if (actionModal.reportId && actionModal.action) {
            await handleAction(actionModal.reportId, actionModal.action);
        }
    };

    const getActionModalContent = () => {
        switch (actionModal.action) {
            case 'dismiss':
                return {
                    title: isRtl ? 'تجاهل البلاغ' : 'Ignorer le signalement',
                    message: isRtl ? 'هل أنت متأكد من تجاهل هذا البلاغ؟' : 'Êtes-vous sûr de vouloir ignorer ce signalement?',
                    confirmText: isRtl ? 'تجاهل' : 'Ignorer',
                    variant: 'info' as const,
                };
            case 'hide':
                return {
                    title: isRtl ? 'إخفاء الإعلان' : 'Masquer l\'annonce',
                    message: isRtl ? 'سيتم إخفاء هذا الإعلان من العرض العام' : 'Cette annonce sera masquée du public',
                    confirmText: isRtl ? 'إخفاء' : 'Masquer',
                    variant: 'warning' as const,
                };
            case 'delete':
                return {
                    title: isRtl ? 'حذف الإعلان' : 'Supprimer l\'annonce',
                    message: isRtl ? 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.' : 'Êtes-vous sûr? Cette action est irréversible.',
                    confirmText: isRtl ? 'حذف' : 'Supprimer',
                    variant: 'danger' as const,
                };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isRtl ? 'البلاغات' : 'Signalements'}
                    </h1>
                    <p className="text-zinc-400">
                        {total} {isRtl ? 'بلاغ' : 'signalement(s)'}
                    </p>
                </div>
                <button
                    onClick={() => fetchReports()}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {isRtl ? 'تحديث' : 'Actualiser'}
                </button>
            </div>

            {/* Reports List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12">
                        <Flag className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">
                            {isRtl ? 'لا توجد بلاغات' : 'Aucun signalement'}
                        </p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div
                            key={report._id}
                            className={`bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 hover:bg-zinc-800 transition-all ${actionLoading === report._id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Image */}
                                <div className="relative w-full md:w-24 h-20 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
                                    <Image
                                        src={report.listingImage || '/placeholder-car.jpg'}
                                        alt={report.listingTitle}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <Link
                                                href={`/${locale}/admin/listings/${report.listingId}`}
                                                className="font-bold text-white hover:text-blue-400 transition-colors line-clamp-1"
                                            >
                                                {report.listingTitle}
                                            </Link>
                                            <p className="text-sm text-zinc-400 mt-1">
                                                {report.reason}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            status={report.status as any}
                                            size="sm"
                                        />
                                    </div>

                                    <p className="text-xs text-zinc-500 mb-3">
                                        {isRtl ? 'من:' : 'Par:'} {report.reporterEmail}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            href={`/${locale}/admin/listings/${report.listingId}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                                        >
                                            <Eye className="h-3 w-3" />
                                            {isRtl ? 'عرض' : 'Voir'}
                                        </Link>

                                        <button
                                            onClick={() => openActionModal(report.listingId, 'dismiss')}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                                        >
                                            <XCircle className="h-3 w-3" />
                                            {isRtl ? 'تجاهل' : 'Ignorer'}
                                        </button>

                                        <button
                                            onClick={() => openActionModal(report.listingId, 'hide')}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors"
                                        >
                                            <EyeOff className="h-3 w-3" />
                                            {isRtl ? 'إخفاء' : 'Masquer'}
                                        </button>

                                        <button
                                            onClick={() => openActionModal(report.listingId, 'delete')}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            {isRtl ? 'حذف' : 'Supprimer'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
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

            {/* Action Modal */}
            <ConfirmModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ isOpen: false, reportId: null, action: 'dismiss' })}
                onConfirm={confirmAction}
                {...getActionModalContent()}
            />
        </div>
    );
}
