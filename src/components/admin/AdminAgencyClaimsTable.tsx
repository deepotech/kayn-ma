'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    XCircle,
    Building2,
    Phone,
    Mail,
    Calendar,
    ExternalLink,
    AlertCircle,
    Info,
    ShieldCheck,
    Clock,
    User,
    FileText,
    Check,
    X,
    Loader2
} from 'lucide-react';

export interface ClaimRecord {
    id: string;
    agencyId: string;
    userId: string;
    fullName: string;
    phone: string;
    email: string;
    notes: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason: string | null;
    reviewedById: string | null;
    reviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
    agency: {
        id: string;
        name: string;
        slug: string;
        phone: string | null;
        verificationStatus: string;
        ownerId: string | null;
        city: {
            name: string;
            slug: string;
        } | null;
        vehicles?: { id: string }[];
    };
    applicant: {
        id: string;
        email: string;
        displayName: string | null;
        firebaseUid: string;
    };
    reviewer: {
        id: string;
        email: string;
        displayName: string | null;
    } | null;
}

interface AdminAgencyClaimsTableProps {
    initialClaims: ClaimRecord[];
    initialCounts: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    locale: string;
}

const COMMON_REJECTION_REASONS_AR = [
    'تعذر التواصل بالهاتف للتحقق من هوية صاحب الطلب',
    'الوثائق المقدمة غير متطابقة مع الاسم القانوني للوكالة',
    'بيانات الاتصال المدخلة غير صحيحة',
    'طلب مكرر أو غير مصرح به من الإدارة الرسمية للوكالة'
];

const COMMON_REJECTION_REASONS_FR = [
    'Impossible de joindre le demandeur par téléphone pour confirmation',
    'Justificatifs non conformes au nom légal de l\'agence',
    'Coordonnées de contact incorrectes ou incomplètes',
    'Demande en double ou non autorisée par la direction de l\'agence'
];

export default function AdminAgencyClaimsTable({
    initialClaims,
    initialCounts,
    locale
}: AdminAgencyClaimsTableProps) {
    const router = useRouter();
    const isRtl = locale === 'ar';

    const [claims, setClaims] = useState<ClaimRecord[]>(initialClaims);
    const [counts, setCounts] = useState(initialCounts);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    // Modals
    const [detailClaim, setDetailClaim] = useState<ClaimRecord | null>(null);
    const [confirmApproveClaim, setConfirmApproveClaim] = useState<ClaimRecord | null>(null);
    const [rejectingClaim, setRejectingClaim] = useState<ClaimRecord | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Loading & feedback
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const filteredClaims = claims.filter(c => {
        if (statusFilter === 'ALL') return true;
        return c.status === statusFilter;
    });

    const handleApprove = async () => {
        if (!confirmApproveClaim) return;
        setSubmitting(true);
        setFeedback(null);

        try {
            const res = await fetch('/api/admin/agency-claims', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    claimId: confirmApproveClaim.id,
                    action: 'APPROVE'
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to approve claim');
            }

            // Update local state
            setClaims(prev => prev.map(item => {
                if (item.id === confirmApproveClaim.id) {
                    return {
                        ...item,
                        status: 'APPROVED',
                        reviewedAt: new Date().toISOString(),
                        agency: {
                            ...item.agency,
                            verificationStatus: 'VERIFIED',
                            ownerId: item.userId
                        }
                    };
                }
                // Automatically reject other pending claims for this agency
                if (item.agencyId === confirmApproveClaim.agencyId && item.status === 'PENDING') {
                    return {
                        ...item,
                        status: 'REJECTED',
                        rejectionReason: 'Agency verified for another approved claim'
                    };
                }
                return item;
            }));

            setCounts(prev => ({
                ...prev,
                pending: Math.max(0, prev.pending - 1),
                approved: prev.approved + 1
            }));

            setConfirmApproveClaim(null);
            if (detailClaim?.id === confirmApproveClaim.id) {
                setDetailClaim(prev => prev ? { ...prev, status: 'APPROVED' } : null);
            }

            setFeedback({
                type: 'success',
                message: isRtl
                    ? `تم قبول وتوثيق الوكالة "${confirmApproveClaim.agency.name}" بنجاح!`
                    : `L'agence "${confirmApproveClaim.agency.name}" a été validée avec succès !`
            });
            router.refresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error approving claim';
            setFeedback({ type: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectingClaim) return;
        if (!rejectionReason || rejectionReason.trim().length < 3) {
            setFeedback({
                type: 'error',
                message: isRtl ? 'المرجو إدخال سبب الرفض (3 أحرف على الأقل).' : 'Veuillez saisir un motif de refus (minimum 3 caractères).'
            });
            return;
        }

        setSubmitting(true);
        setFeedback(null);

        try {
            const res = await fetch('/api/admin/agency-claims', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    claimId: rejectingClaim.id,
                    action: 'REJECT',
                    rejectionReason: rejectionReason.trim()
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to reject claim');
            }

            setClaims(prev => prev.map(item => {
                if (item.id === rejectingClaim.id) {
                    return {
                        ...item,
                        status: 'REJECTED',
                        rejectionReason: rejectionReason.trim(),
                        reviewedAt: new Date().toISOString()
                    };
                }
                return item;
            }));

            setCounts(prev => ({
                ...prev,
                pending: Math.max(0, prev.pending - 1),
                rejected: prev.rejected + 1
            }));

            setRejectingClaim(null);
            setRejectionReason('');
            if (detailClaim?.id === rejectingClaim.id) {
                setDetailClaim(prev => prev ? { ...prev, status: 'REJECTED', rejectionReason } : null);
            }

            setFeedback({
                type: 'success',
                message: isRtl ? 'تم رفض الطلب وحفظ سبب الرفض.' : 'La demande a été rejetée avec succès.'
            });
            router.refresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error rejecting claim';
            setFeedback({ type: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: ClaimRecord['status']) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isRtl ? 'مقبول وموثق' : 'Acceptée & Vérifiée'}
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1 w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        {isRtl ? 'قيد المراجعة' : 'En attente'}
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1 w-fit">
                        <XCircle className="w-3.5 h-3.5" />
                        {isRtl ? 'مرفوض' : 'Rejetée'}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Feedback Alert */}
            {feedback && (
                <div
                    className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
                        feedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {feedback.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <span className="font-medium">{feedback.message}</span>
                    </div>
                    <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    onClick={() => setStatusFilter('PENDING')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        statusFilter === 'PENDING'
                            ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-amber-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                            {isRtl ? 'طلبات قيد المراجعة' : 'En attente'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {counts.pending}
                        {counts.pending > 0 && (
                            <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                        )}
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter('APPROVED')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        statusFilter === 'APPROVED'
                            ? 'bg-emerald-500/10 border-emerald-500 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                            {isRtl ? 'طلبات مقبولة' : 'Acceptées'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                        {counts.approved}
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter('REJECTED')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        statusFilter === 'REJECTED'
                            ? 'bg-rose-500/10 border-rose-500 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-rose-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                            {isRtl ? 'طلبات مرفوضة' : 'Rejetées'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                            <XCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                        {counts.rejected}
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter('ALL')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        statusFilter === 'ALL'
                            ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-blue-400'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            {isRtl ? 'إجمالي الطلبات' : 'Total des demandes'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                        {counts.total}
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
                <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        statusFilter === 'ALL'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                >
                    {isRtl ? 'جميع الطلبات' : 'Toutes'} ({counts.total})
                </button>
                <button
                    onClick={() => setStatusFilter('PENDING')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        statusFilter === 'PENDING'
                            ? 'bg-amber-600 text-white'
                            : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'قيد المراجعة' : 'En attente'}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-700 text-white text-[10px]">
                        {counts.pending}
                    </span>
                </button>
                <button
                    onClick={() => setStatusFilter('APPROVED')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        statusFilter === 'APPROVED'
                            ? 'bg-emerald-600 text-white'
                            : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    }`}
                >
                    {isRtl ? 'مقبولة' : 'Acceptées'} ({counts.approved})
                </button>
                <button
                    onClick={() => setStatusFilter('REJECTED')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        statusFilter === 'REJECTED'
                            ? 'bg-rose-600 text-white'
                            : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    }`}
                >
                    {isRtl ? 'مرفوضة' : 'Rejetées'} ({counts.rejected})
                </button>
            </div>

            {/* Table */}
            {filteredClaims.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center text-slate-500">
                    <Info className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                    <p className="font-semibold">{isRtl ? 'لا توجد طلبات مطابقة لهذا الفلتر.' : 'Aucune demande trouvée pour ce filtre.'}</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4">{isRtl ? 'الوكالة والمدينة' : 'Agence & Ville'}</th>
                                    <th className="px-6 py-4">{isRtl ? 'مقدم الطلب' : 'Demandeur'}</th>
                                    <th className="px-6 py-4">{isRtl ? 'الاتصال' : 'Contact'}</th>
                                    <th className="px-6 py-4">{isRtl ? 'تاريخ الطلب' : 'Date de demande'}</th>
                                    <th className="px-6 py-4">{isRtl ? 'الحالة' : 'Statut'}</th>
                                    <th className="px-6 py-4 text-end">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {filteredClaims.map((claim) => (
                                    <tr key={claim.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        {claim.agency.name}
                                                        <a
                                                            href={`/${locale}/rent-agencies/${claim.agency.city?.slug || 'marrakech'}/${claim.agency.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-400 hover:text-blue-600 transition-colors"
                                                            title={isRtl ? 'فتح صفحة الوكالة' : "Voir la page de l'agence"}
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {claim.agency.city?.name || 'المغرب'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5">
                                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {claim.fullName}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    <span>{claim.applicant.displayName || claim.applicant.email}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-emerald-600" />
                                                    <span dir="ltr">{claim.phone}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3 text-blue-600" />
                                                    <span className="truncate max-w-[180px]">{claim.email}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{new Date(claim.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(claim.status)}
                                        </td>

                                        <td className="px-6 py-4 text-end">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setDetailClaim(claim)}
                                                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-1"
                                                    title={isRtl ? 'عرض التفاصيل' : 'Voir les détails'}
                                                >
                                                    <Info className="w-3.5 h-3.5" />
                                                    <span>{isRtl ? 'التفاصيل' : 'Détails'}</span>
                                                </button>

                                                {claim.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => setConfirmApproveClaim(claim)}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                                                            title={isRtl ? 'قبول الطلب وتوثيق الوكالة' : 'Valider la demande'}
                                                        >
                                                            <Check className="w-3.5 h-3.5" />
                                                            <span>{isRtl ? 'قبول' : 'Valider'}</span>
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setRejectingClaim(claim);
                                                                setRejectionReason('');
                                                            }}
                                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                                            title={isRtl ? 'رفض الطلب مع ذكر السبب' : 'Rejeter avec motif'}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            <span>{isRtl ? 'رفض' : 'Rejeter'}</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {detailClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-zinc-800 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setDetailClaim(null)}
                            className="absolute top-4 end-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {detailClaim.agency.name}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {detailClaim.agency.city?.name} • ID: {detailClaim.agency.id}
                                </p>
                            </div>
                            <div className="ms-auto">
                                {getStatusBadge(detailClaim.status)}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Applicant Data */}
                            <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {isRtl ? 'بيانات مقدم الطلب' : 'Informations du demandeur'}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500 text-xs block">{isRtl ? 'الاسم الكامل:' : 'Nom complet:'}</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{detailClaim.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs block">{isRtl ? 'الهاتف للتواصل:' : 'Téléphone:'}</span>
                                        <span className="font-semibold text-slate-900 dark:text-white" dir="ltr">{detailClaim.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs block">{isRtl ? 'البريد الإلكتروني المدخل:' : 'E-mail fourni:'}</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{detailClaim.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs block">{isRtl ? 'الحساب المسجل بالموقع:' : 'Compte enregistré:'}</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{detailClaim.applicant.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {isRtl ? 'ملاحظات وإثباتات مقدم الطلب' : 'Remarques & Justificatifs'}
                                </h4>
                                <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {detailClaim.notes || (isRtl ? 'لا توجد ملاحظات إضافية.' : 'Aucune remarque fournie.')}
                                </div>
                            </div>

                            {/* Rejection Details if rejected */}
                            {detailClaim.status === 'REJECTED' && (
                                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-sm text-rose-800 dark:text-rose-300 space-y-1">
                                    <div className="font-bold flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{isRtl ? 'سبب الرفض المسجل:' : 'Motif du refus :'}</span>
                                    </div>
                                    <p className="text-sm ps-5">{detailClaim.rejectionReason}</p>
                                </div>
                            )}

                            {/* Audit Metadata */}
                            <div className="text-xs text-slate-500 space-y-1 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                <p>{isRtl ? 'تاريخ إرسال الطلب:' : 'Date de soumission :'} {new Date(detailClaim.createdAt).toLocaleString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}</p>
                                {detailClaim.reviewedAt && (
                                    <p>{isRtl ? 'تاريخ المراجعة:' : 'Date de révision :'} {new Date(detailClaim.reviewedAt).toLocaleString(locale === 'ar' ? 'ar-MA' : 'fr-FR')}</p>
                                )}
                                {detailClaim.reviewer && (
                                    <p>{isRtl ? 'المراجع:' : 'Examinateur :'} {detailClaim.reviewer.displayName || detailClaim.reviewer.email}</p>
                                )}
                            </div>

                            {/* Actions if PENDING */}
                            {detailClaim.status === 'PENDING' && (
                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                                    <button
                                        onClick={() => {
                                            setRejectingClaim(detailClaim);
                                            setDetailClaim(null);
                                        }}
                                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold transition-colors"
                                    >
                                        {isRtl ? 'رفض الطلب' : 'Rejeter la demande'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setConfirmApproveClaim(detailClaim);
                                            setDetailClaim(null);
                                        }}
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-colors"
                                    >
                                        {isRtl ? 'قبول وتوثيق الوكالة' : 'Valider & certifier'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Accept */}
            {confirmApproveClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {isRtl ? 'تأكيد قبول طلب المطالبة بالوكالة' : 'Confirmer la validation de l\'agence'}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                            {isRtl ? (
                                <>
                                    هل أنت متأكد من ربط وتوثيق ملكية وكالة <strong>{confirmApproveClaim.agency.name}</strong> بالمستخدم <strong>{confirmApproveClaim.fullName}</strong> ({confirmApproveClaim.applicant.email})؟
                                    <br />
                                    <span className="text-xs text-amber-600 block mt-2">
                                        سيتم تغيير حالة الوكالة إلى موثقة (VERIFIED) ورفض أي طلبات أخرى معلقة تلقائياً.
                                    </span>
                                </>
                            ) : (
                                <>
                                    Voulez-vous valider la propriété de <strong>{confirmApproveClaim.agency.name}</strong> pour <strong>{confirmApproveClaim.fullName}</strong> ({confirmApproveClaim.applicant.email}) ?
                                    <br />
                                    <span className="text-xs text-amber-600 block mt-2">
                                        L'agence passera en statut VERIFIED et toutes les autres demandes en attente seront rejetées.
                                    </span>
                                </>
                            )}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                disabled={submitting}
                                onClick={() => setConfirmApproveClaim(null)}
                                className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium"
                            >
                                {isRtl ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button
                                disabled={submitting}
                                onClick={handleApprove}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isRtl ? 'نعم، قبول وتوثيق' : 'Oui, valider'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal with Mandatory Reason */}
            {rejectingClaim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-rose-600">
                                <XCircle className="w-6 h-6" />
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {isRtl ? 'رفض طلب المطالبة بالوكالة' : 'Rejeter la demande de l\'agence'}
                                </h4>
                            </div>
                            <button
                                onClick={() => {
                                    setRejectingClaim(null);
                                    setRejectionReason('');
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                            {isRtl
                                ? `يرجى كتابة سبب رفض طلب ${rejectingClaim.fullName} لوكالة ${rejectingClaim.agency.name}. سيتم حفظ السبب في سجل المراجعة.`
                                : `Indiquez le motif du refus pour ${rejectingClaim.fullName} concernant l'agence ${rejectingClaim.agency.name}. Ce motif sera archivé.`}
                        </p>

                        {/* Quick reason suggestions */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-2">
                                {isRtl ? 'أسباب شائعة مقترحة (اضغط للاختيار):' : 'Motifs fréquents suggérés :'}
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {(isRtl ? COMMON_REJECTION_REASONS_AR : COMMON_REJECTION_REASONS_FR).map((reason, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setRejectionReason(reason)}
                                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-lg text-start transition-colors"
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {isRtl ? 'سبب الرفض (إلزامي) *' : 'Motif de refus (Obligatoire) *'}
                            </label>
                            <textarea
                                rows={3}
                                required
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={isRtl ? 'اكتب سبب الرفض بالتفصيل...' : 'Saisissez le motif détaillé du refus...'}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                disabled={submitting}
                                onClick={() => {
                                    setRejectingClaim(null);
                                    setRejectionReason('');
                                }}
                                className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium"
                            >
                                {isRtl ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button
                                disabled={submitting || rejectionReason.trim().length < 3}
                                onClick={handleReject}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isRtl ? 'تأكيد الرفض' : 'Confirmer le refus'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

