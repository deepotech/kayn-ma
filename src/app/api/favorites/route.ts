import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
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

export async function GET(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { listing: { include: { city: true } } }
        });

        const validFavorites = favorites.filter(f => f.listing !== null);

        return NextResponse.json({
            success: true,
            data: validFavorites.map(f => ({
                id: f.id,
                listingId: f.listingId,
                listing: f.listing,
                createdAt: f.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await verifyAuth(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { listingId } = await request.json();
        if (!listingId) return NextResponse.json({ error: 'listingId is required' }, { status: 400 });

        const favorite = await prisma.favorite.upsert({
            where: { userId_listingId: { userId, listingId } },
            update: {},
            create: { userId, listingId }
        });

        return NextResponse.json({ success: true, data: favorite }, { status: 201 });
    } catch (error) {
        console.error('Error adding favorite:', error);
        return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }
}
