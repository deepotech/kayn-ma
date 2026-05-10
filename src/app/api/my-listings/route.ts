import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const q = searchParams.get('q');

        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        const where: any = { userId };
        if (status && status !== 'all') where.status = status;
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { brandLabel: { contains: q, mode: 'insensitive' } },
                { carModelLabel: { contains: q, mode: 'insensitive' } },
            ];
        }

        const listings = await prisma.listing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { city: true }
        });

        return NextResponse.json(listings);
    } catch (error) {
        console.error('Error fetching user listings:', error);
        return NextResponse.json({ error: 'Failed to fetch user listings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body.userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        const listing = await prisma.listing.create({
            data: {
                ...body,
                status: 'pending_review',
                visibility: 'public',
            }
        });

        return NextResponse.json({ success: true, data: listing, id: listing.id });
    } catch (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }
}
