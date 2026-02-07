import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Follow from '@/models/Follow';
import Listing from '@/models/Listing';
import User from '@/models/User';
import { auth } from '@/lib/firebase-admin';

// Helper to verify Firebase token
async function verifyAuth(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken.uid;
    } catch {
        return null;
    }
}

// GET /api/following - Get followed sellers & their latest listings
export async function GET(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // 1. Get all following IDs
        const follows = await Follow.find({ followerId: userId })
            .sort({ createdAt: -1 })
            .select('followingId')
            .lean();

        if (!follows.length) {
            return NextResponse.json({ success: true, data: [] });
        }

        const followingIds = follows.map(f => f.followingId);

        // 2. Fetch seller details and their latest listings
        // We'll process this in parallel for efficiency

        // Get user details
        const sellers = await User.find({ firebaseUid: { $in: followingIds } })
            .select('firebaseUid displayName email photoURL') // Adjust fields based on your User model
            .lean();

        const sellersMap = new Map(sellers.map(s => [s.firebaseUid, s]));

        // Fetch latest listings for each seller
        const results = await Promise.all(followingIds.map(async (sellerId) => {
            const seller = sellersMap.get(sellerId);
            if (!seller) return null; // Should not happen ideally

            // Get latest 4 active listings for this seller
            const listings = await Listing.find({
                userId: sellerId,
                status: 'approved',
                visibility: 'public'
            })
                .sort({ publishedAt: -1 })
                .limit(4)
                .select('title price currency images year mileage fuelType transmission brand carModel city slug')
                .lean();

            // If seller has no active listings, we still show them? 
            // Yes, user follows the SELLER, not just listings. 
            // But maybe we want to filter empty ones? For now let's keep them.

            return {
                seller: {
                    id: seller.firebaseUid,
                    name: seller.displayName || 'Unknown Seller',
                    // Fallback to email username if no display name
                    // In real app, user model might have more details
                },
                listings: listings.map(l => ({
                    ...l,
                    _id: l._id.toString(),
                    // Flatten some fields if needed for UI, but frontend can handle nested
                }))
            };
        }));

        // Filter out nulls
        const data = results.filter(Boolean);

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error fetching following feed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
