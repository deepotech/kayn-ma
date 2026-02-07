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

// DELETE /api/favorites/[id] - Remove a favorite
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: 'Favorite ID is required' }, { status: 400 });
        }

        await dbConnect();

        // Try to delete by favorite ID or listingId
        const result = await Favorite.findOneAndDelete({
            $or: [
                { _id: id, userId },
                { listingId: id, userId }
            ]
        });

        if (!result) {
            return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Favorite removed' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }
}
