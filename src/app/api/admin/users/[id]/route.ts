export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

// PATCH /api/admin/users/[id]
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
        const { isBanned, banReason, bannedUntil, role } = body;

        const updateData: Prisma.UserUpdateInput = {};

        if (typeof isBanned === 'boolean') {
            updateData.isBanned = isBanned;
            if (!isBanned) {
                updateData.banReason = null;
                updateData.bannedUntil = null;
            }
        }

        if (banReason !== undefined) {
            updateData.banReason = banReason;
        }

        if (bannedUntil !== undefined) {
            updateData.bannedUntil = bannedUntil ? new Date(bannedUntil) : null;
        }

        if (role) {
            updateData.role = role;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            user: {
                ...user,
                _id: user.id,
            },
        });
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Admin User Update Error]', errMessage);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
