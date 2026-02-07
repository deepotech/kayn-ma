import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
import { auth } from '@/lib/firebase-admin';

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

// POST /api/favorites/sync - Sync localStorage favorites to DB
export async function POST(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listingIds } = await request.json();
        if (!Array.isArray(listingIds)) {
            return NextResponse.json({ error: 'listingIds must be an array' }, { status: 400 });
        }

        await dbConnect();

        // Bulk upsert all favorites
        const operations = listingIds.map(listingId => ({
            updateOne: {
                filter: { userId, listingId },
                update: { userId, listingId },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Favorite.bulkWrite(operations);
        }

        // Fetch all favorites after sync
        const favorites = await Favorite.find({ userId }).lean();

        return NextResponse.json({
            success: true,
            synced: listingIds.length,
            data: favorites.map(f => f.listingId.toString())
        });
    } catch (error) {
        console.error('Error syncing favorites:', error);
        return NextResponse.json({ error: 'Failed to sync favorites' }, { status: 500 });
    }
}
