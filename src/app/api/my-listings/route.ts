import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

// GET /api/my-listings - Get user's listings
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const q = searchParams.get('q');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await dbConnect();

        // Build query
        const query: any = { userId };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { 'brand.label': { $regex: q, $options: 'i' } },
                { 'carModel.label': { $regex: q, $options: 'i' } },
            ];
        }

        const listings = await Listing.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(listings);
    } catch (error) {
        console.error('Error fetching user listings:', error);
        return NextResponse.json({ error: 'Failed to fetch user listings' }, { status: 500 });
    }
}

// POST /api/my-listings - Create new listing
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await dbConnect();

        const listing = await Listing.create({
            ...body,
            status: 'pending_review',
            visibility: 'public',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            data: listing,
            _id: listing._id.toString(),
            id: listing._id.toString(),
        });
    } catch (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }
}
