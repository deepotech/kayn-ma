import { requireAdminAccess } from '@/lib/admin-access';
import prisma from '@/lib/db';
import AdminAgencyClaimsTable from '@/components/admin/AdminAgencyClaimsTable';
import { BadgeCheck } from 'lucide-react';
import { AgencyClaimStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminAgencyClaimsPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    await requireAdminAccess();

    const [claims, pendingCount, approvedCount, rejectedCount] = await Promise.all([
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

    const isRtl = locale === 'ar';

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

            <AdminAgencyClaimsTable
                initialClaims={JSON.parse(JSON.stringify(claims))}
                initialCounts={{
                    total: claims.length,
                    pending: pendingCount,
                    approved: approvedCount,
                    rejected: rejectedCount
                }}
                locale={locale}
            />
        </div>
    );
}

