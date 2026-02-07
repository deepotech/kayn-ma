export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Listing from '@/models/Listing';

// GET /api/admin/users
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const role = searchParams.get('role');
        const banned = searchParams.get('banned');
        const search = searchParams.get('search');

        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (banned === 'true') {
            query.isBanned = true;
        } else if (banned === 'false') {
            query.isBanned = false;
        }

        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        // Get listing counts for each user
        const usersWithCounts = await Promise.all(
            users.map(async (user: any) => {
                const listingsCount = await Listing.countDocuments({ userId: user.firebaseUid });
                return {
                    ...user,
                    _id: user._id.toString(),
                    listingsCount,
                };
            })
        );

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            users: usersWithCounts,
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error) {
        console.error('[Admin Users Error]', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
