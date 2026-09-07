export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// PATCH /api/admin/reports/[id] - Take action on a reported listing
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const { id } = params;
        const body = await request.json();
        const { action } = body; // 'dismiss' | 'hide' | 'delete'

        if (action === 'dismiss') {
            await prisma.$transaction([
                prisma.listing.update({
                    where: { id },
                    data: {
                        isReported: false,
                        reportsCount: 0,
                    },
                }),
                prisma.report.updateMany({
                    where: { listingId: id },
                    data: { status: 'dismissed' },
                }),
            ]);

            return NextResponse.json({ success: true, action: 'dismissed' });
        }

        if (action === 'hide') {
            await prisma.$transaction([
                prisma.listing.update({
                    where: { id },
                    data: {
                        visibility: 'hidden',
                        isReported: false,
                    },
                }),
                prisma.report.updateMany({
                    where: { listingId: id },
                    data: { status: 'resolved' },
                }),
            ]);

            return NextResponse.json({ success: true, action: 'hidden' });
        }

        if (action === 'delete') {
            await prisma.$transaction([
                prisma.report.deleteMany({
                    where: { listingId: id },
                }),
                prisma.listing.delete({
                    where: { id },
                }),
            ]);
            return NextResponse.json({ success: true, action: 'deleted' });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Admin Report Action Error]', errMessage);
        return NextResponse.json(
            { error: 'Failed to process report action' },
            { status: 500 }
        );
    }
}
