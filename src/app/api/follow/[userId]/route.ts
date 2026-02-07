import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Follow from '@/models/Follow';
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

// GET /api/follow/[userId] - Check if following
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const followerId = await verifyAuth(request);
        if (!followerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const followingId = params.userId;
        if (!followingId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        await dbConnect();

        const exists = await Follow.exists({ followerId, followingId });

        return NextResponse.json({
            success: true,
            isFollowing: !!exists
        });
    } catch (error) {
        console.error('Error checking follow status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/follow/[userId] - Follow user
export async function POST(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const followerId = await verifyAuth(request);
        if (!followerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const followingId = params.userId;
        if (!followingId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        if (followerId === followingId) {
            return NextResponse.json({ error: 'Cannot follow self' }, { status: 400 });
        }

        await dbConnect();

        // Upsert to handle potential race conditions or re-following
        await Follow.findOneAndUpdate(
            { followerId, followingId },
            { followerId, followingId },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            isFollowing: true
        });
    } catch (error) {
        console.error('Error following user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/follow/[userId] - Unfollow user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const followerId = await verifyAuth(request);
        if (!followerId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const followingId = params.userId;
        if (!followingId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        await dbConnect();

        await Follow.findOneAndDelete({ followerId, followingId });

        return NextResponse.json({
            success: true,
            isFollowing: false
        });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
