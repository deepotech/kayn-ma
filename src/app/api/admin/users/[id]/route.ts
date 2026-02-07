import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// PATCH /api/admin/users/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { id } = params;
        const body = await request.json();
        const { isBanned, banReason, bannedUntil, role } = body;

        const updateData: any = {};

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

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.log(`[Admin] User ${id} updated:`, updateData);

        return NextResponse.json({
            success: true,
            user: {
                ...user,
                _id: (user as any)._id.toString(),
            },
        });
    } catch (error) {
        console.error('[Admin User Update Error]', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
