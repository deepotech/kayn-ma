import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';

        const where: any = {};
        if (status !== 'all') {
            where.verificationStatus = status;
        }

        const agencies = await prisma.business.findMany({
            where,
            include: {
                city: true,
                owner: {
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                        firebaseUid: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ success: true, agencies });
    } catch (error: any) {
        console.error('[Admin Claims GET] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch claims' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const body = await request.json();
        const { agencyId, verificationStatus, ownerId, verificationMethod } = body;

        if (!agencyId || !verificationStatus) {
            return NextResponse.json({ error: 'Agency ID and verificationStatus are required' }, { status: 400 });
        }

        const validStatuses = ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'];
        if (!validStatuses.includes(verificationStatus)) {
            return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
        }

        const updateData: any = {
            verificationStatus,
            claimed: verificationStatus === 'VERIFIED'
        };

        if (verificationStatus === 'VERIFIED') {
            updateData.verifiedAt = new Date();
            if (verificationMethod) updateData.verificationMethod = verificationMethod;
        }

        if (ownerId !== undefined) {
            updateData.ownerId = ownerId;
        }

        const updated = await prisma.business.update({
            where: { id: agencyId },
            data: updateData,
            include: { city: true, owner: true }
        });

        return NextResponse.json({ success: true, agency: updated });
    } catch (error: any) {
        console.error('[Admin Claims PATCH] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update claim' }, { status: 500 });
    }
}
