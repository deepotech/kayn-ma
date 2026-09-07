export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/users
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
        const role = searchParams.get('role');
        const banned = searchParams.get('banned');
        const search = searchParams.get('search')?.trim();

        const skip = (page - 1) * limit;

        // Build Prisma where query
        const where: Prisma.UserWhereInput = {};

        if (role && role !== 'all') {
            where.role = role;
        }

        if (banned === 'true') {
            where.isBanned = true;
        } else if (banned === 'false') {
            where.isBanned = false;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { displayName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const fetchUsersAndCounts = async () => {
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.user.count({ where }),
            ]);

            // Get listings count for these users
            const userFirebaseUids = users.map(u => u.firebaseUid).filter(Boolean);
            const listingCounts = userFirebaseUids.length > 0
                ? await prisma.listing.groupBy({
                    by: ['userId'],
                    where: {
                        userId: { in: userFirebaseUids }
                    },
                    _count: {
                        id: true
                    }
                })
                : [];

            return { users, total, listingCounts };
        };

        let timerId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timerId = setTimeout(() => {
                reject(new Error('ADMIN_USERS_TIMEOUT'));
            }, 8000);
            if (typeof timerId.unref === 'function') timerId.unref();
        });

        const { users, total, listingCounts } = await Promise.race([
            fetchUsersAndCounts(),
            timeoutPromise,
        ]).finally(() => {
            if (timerId) clearTimeout(timerId);
        });

        const countMap = new Map<string, number>();
        listingCounts.forEach(lc => {
            if (lc.userId) {
                countMap.set(lc.userId, lc._count.id);
            }
        });

        const formattedUsers = users.map(u => ({
            _id: u.id,
            id: u.id,
            firebaseUid: u.firebaseUid,
            email: u.email,
            displayName: u.displayName || undefined,
            role: u.role as any,
            isBanned: u.isBanned,
            banReason: u.banReason || undefined,
            bannedUntil: u.bannedUntil ? u.bannedUntil.toISOString() : undefined,
            listingsCount: countMap.get(u.firebaseUid) || 0,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
        }));

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            users: formattedUsers,
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Admin Users Error]', errMessage);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
