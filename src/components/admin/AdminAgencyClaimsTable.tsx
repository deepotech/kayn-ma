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
    Car,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

interface ClaimItem {
    id: string;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    claimPhone: string | null;
    claimNotes: string | null;
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    claimedAt: string | null;
    verifiedAt: string | null;
    city?: { name: string; slug: string };
    owner?: {
        id: string;
        email: string | null;
        displayName: string | null;
        phoneNumber?: string | null;
    };
    vehicles: { id: string }[];
}

export default function AdminAgencyClaimsTable({
    claims,
    locale
}: {
    claims: ClaimItem[];
    locale: string;
}) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleAction = async (agencyId: string, status: 'VERIFIED' | 'REJECTED') => {
        setLoadingId(agencyId);
        try {
            const res = await fetch('/api/admin/agency-claims', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agencyId,
                    verificationStatus: status,
                    verificationMethod: status === 'VERIFIED' ? 'manual_admin' : undefined
                })
            });
            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update claim');
            }
        } catch (e: any) {
            alert(e?.message || 'Error updating status');
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusBadge = (status: ClaimItem['verificationStatus']) => {
        switch (status) {
            case 'VERIFIED':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3.5 h-3.5" /> موثقة (Verified)
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3.5 h-3.5" /> قيد المراجعة (Pending)
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 flex items-center gap-1 w-fit">
                        <XCircle className="w-3.5 h-3.5" /> مرفوضة (Rejected)
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300">
                        غير موثقة
                    </span>
                );
        }
    };

    if (!claims || claims.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-12 text-center text-slate-500">
                لا توجد طلبات توثيق أو وكالات مسجلة حالياً.
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-start">
                    <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-6 py-4">الوكالة (Agency)</th>
                            <th className="px-6 py-4">صاحب الطلب (Owner User)</th>
                            <th className="px-6 py-4">بيانات التحقق (Claim Info)</th>
                            <th className="px-6 py-4">الحالة (Status)</th>
                            <th className="px-6 py-4">الأسطول</th>
                            <th className="px-6 py-4 text-end">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {claims.map((agency) => (
                            <tr key={agency.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                {agency.name}
                                                <a
                                                    href={`/${locale}/rent-agencies/${agency.city?.slug || 'marrakech'}/${agency.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-blue-600"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {agency.city?.name || 'المغرب'} • {agency.slug}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    {agency.owner ? (
                                        <div className="space-y-0.5">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                {agency.owner.displayName || 'مستخدم مسجل'}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {agency.owner.email}
                                            </div>
                                            {agency.owner.phoneNumber && (
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {agency.owner.phoneNumber}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">بدون مستخدم مرتبط</span>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        {agency.claimPhone && (
                                            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-emerald-600" /> هاتف التحقق: {agency.claimPhone}
                                            </div>
                                        )}
                                        {agency.claimNotes && (
                                            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 p-2 rounded max-w-xs line-clamp-2" title={agency.claimNotes}>
                                                {agency.claimNotes}
                                            </div>
                                        )}
                                        {agency.claimedAt && (
                                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(agency.claimedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    {getStatusBadge(agency.verificationStatus)}
                                </td>

                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">
                                        <Car className="w-3.5 h-3.5" />
                                        {agency.vehicles?.length || 0} سيارات
                                    </span>
                                </td>

                                <td className="px-6 py-4 text-end">
                                    <div className="flex items-center justify-end gap-2">
                                        {loadingId === agency.id ? (
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                {agency.verificationStatus !== 'VERIFIED' && (
                                                    <button
                                                        onClick={() => handleAction(agency.id, 'VERIFIED')}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                                        title="تأكيد وقبول الوكالة"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        قبول وتوثيق
                                                    </button>
                                                )}
                                                {agency.verificationStatus !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleAction(agency.id, 'REJECTED')}
                                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                                        title="رفض الطلب"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        رفض
                                                    </button>
                                                )}
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
    );
}
