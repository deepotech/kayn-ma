import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
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

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const favorites = await Favorite.find({ userId })
            .sort({ createdAt: -1 })
            .populate('listingId')
            .lean();

        // Filter out favorites where listing was deleted
        const validFavorites = favorites.filter(f => f.listingId !== null);

        return NextResponse.json({
            success: true,
            data: validFavorites.map(f => ({
                _id: f._id,
                listingId: typeof f.listingId === 'object' ? (f.listingId as any)._id : f.listingId,
                listing: f.listingId,
                createdAt: f.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

// POST /api/favorites - Add a favorite
export async function POST(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listingId } = await request.json();
        if (!listingId) {
            return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
        }

        await dbConnect();

        // Upsert pattern - create if not exists
        const favorite = await Favorite.findOneAndUpdate(
            { userId, listingId },
            { userId, listingId },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: favorite }, { status: 201 });
    } catch (error) {
        console.error('Error adding favorite:', error);
        return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }
}
