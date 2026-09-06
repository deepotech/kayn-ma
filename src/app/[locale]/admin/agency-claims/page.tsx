import { requireAdminAccess } from '@/lib/admin-access';
import prisma from '@/lib/db';
import AdminAgencyClaimsTable from '@/components/admin/AdminAgencyClaimsTable';
import { BadgeCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAgencyClaimsPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    await requireAdminAccess();

    const claims = await prisma.business.findMany({
        where: {
            OR: [
                { verificationStatus: 'PENDING' },
                { verificationStatus: 'VERIFIED' },
                { verificationStatus: 'REJECTED' },
                { ownerId: { not: null } }
            ]
        },
        include: {
            city: true,
            owner: {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    firebaseUid: true
                }
            },
            vehicles: {
                select: {
                    id: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' },
        take: 100
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BadgeCheck className="w-7 h-7 text-blue-600" />
                        طلبات تأكيد وتوثيق الوكالات (Agency Claims)
                    </h1>
                    <p className="text-slate-500 mt-1">
                        مراجعة طلبات أصحاب الوكالات لربط وتأكيد ملكية وكالاتهم على المنصة ({claims.length} وكالة)
                    </p>
                </div>
            </div>

            <AdminAgencyClaimsTable claims={JSON.parse(JSON.stringify(claims))} locale={locale} />
        </div>
    );
}
