import { requireAdminAccess } from '@/lib/admin-access';
import prisma from '@/lib/db';
import AdminAgencyClaimsTable from '@/components/admin/AdminAgencyClaimsTable';
import { BadgeCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { AgencyClaimStatus, Prisma } from '@prisma/client';
import RetryButton from './RetryButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type ClaimWithRelations = Prisma.AgencyClaimGetPayload<{
    include: {
        agency: {
            include: {
                city: true;
                vehicles: {
                    select: { id: true };
                };
            };
        };
        applicant: {
            select: {
                id: true;
                email: true;
                displayName: true;
                firebaseUid: true;
            };
        };
        reviewer: {
            select: {
                id: true;
                email: true;
                displayName: true;
            };
        };
    };
}>;

export default async function AdminAgencyClaimsPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    await requireAdminAccess();
    const isRtl = locale === 'ar';

    let claims: ClaimWithRelations[] = [];
    let totalCount = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let isFeatureUnavailable = false;
    let isGenericError = false;

    try {
        const results = await Promise.all([
            prisma.agencyClaim.findMany({
                include: {
                    agency: {
                        include: {
                            city: true,
                            vehicles: {
                                select: { id: true }
                            }
                        }
                    },
                    applicant: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                            firebaseUid: true
                        }
                    },
                    reviewer: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            }),
            prisma.agencyClaim.count(),
            prisma.agencyClaim.count({
                where: { status: AgencyClaimStatus.PENDING }
            }),
            prisma.agencyClaim.count({
                where: { status: AgencyClaimStatus.APPROVED }
            }),
            prisma.agencyClaim.count({
                where: { status: AgencyClaimStatus.REJECTED }
            })
        ]);

        claims = results[0];
        totalCount = results[1];
        pendingCount = results[2];
        approvedCount = results[3];
        rejectedCount = results[4];
    } catch (error: unknown) {
        // Safe internal logging without exposing table/db details to user interface
        console.error(
            '[AdminAgencyClaimsPage DB Error]',
            error instanceof Prisma.PrismaClientKnownRequestError
                ? error.code
                : (error instanceof Error ? error.message : 'Unknown error')
        );

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
            isFeatureUnavailable = true;
        } else {
            isGenericError = true;
        }
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BadgeCheck className="w-7 h-7 text-blue-600" />
                        {isRtl ? 'طلبات تأكيد وتوثيق الوكالات (Agency Claims)' : 'Revendications des agences (Agency Claims)'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {isRtl
                            ? 'مراجعة واعتماد طلبات أصحاب الوكالات لربط ملكية وكالاتهم على المنصة وإدارتها.'
                            : 'Gérer et vérifier les demandes de propriété des agences soumises par les gérants.'}
                    </p>
                </div>
            </div>

            {isFeatureUnavailable ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {isRtl
                                ? 'ميزة طلبات توثيق الوكالات غير مفعّلة حالياً'
                                : "La fonctionnalité des demandes de revendication d'agences n'est pas activée actuellement"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                            {isRtl
                                ? 'هذه الميزة غير مفعّلة في النظام حالياً أو تتطلب تهيئة إضافية من قبل مدير النظام. يرجى المحاولة لاحقاً.'
                                : "Cette fonctionnalité n'est pas encore activée sur le système. Veuillez réessayer ultérieurement."}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <RetryButton label={isRtl ? 'إعادة المحاولة' : 'Réessayer'} />
                        <Link
                            href={`/${locale}/admin`}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm"
                        >
                            {isRtl ? 'العودة للوحة التحكم' : 'Retour au tableau de bord'}
                        </Link>
                    </div>
                </div>
            ) : isGenericError ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {isRtl
                                ? 'تعذر تحميل بيانات طلبات التوثيق'
                                : 'Impossible de charger les demandes de revendication'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                            {isRtl
                                ? 'حدث خطأ مؤقت أثناء جلب البيانات من الخادم. يرجى إعادة المحاولة.'
                                : 'Une erreur temporaire est survenue lors du chargement des données. Veuillez réessayer.'}
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <RetryButton label={isRtl ? 'إعادة المحاولة' : 'Réessayer'} />
                        <Link
                            href={`/${locale}/admin`}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm"
                        >
                            {isRtl ? 'العودة للوحة التحكم' : 'Retour au tableau de bord'}
                        </Link>
                    </div>
                </div>
            ) : (
                <AdminAgencyClaimsTable
                    initialClaims={JSON.parse(JSON.stringify(claims))}
                    initialCounts={{
                        total: totalCount,
                        pending: pendingCount,
                        approved: approvedCount,
                        rejected: rejectedCount
                    }}
                    locale={locale}
                />
            )}
        </div>
    );
}

