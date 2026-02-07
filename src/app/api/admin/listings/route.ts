export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

// GET /api/admin/listings
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const city = searchParams.get('city');
        const search = searchParams.get('search');
        const reported = searchParams.get('reported');

        const skip = (page - 1) * limit;

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (city && city !== 'all') {
            query['city.slug'] = city;
        }

        if (reported === 'true') {
            query.isReported = true;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'brand.label': { $regex: search, $options: 'i' } },
                { 'carModel.label': { $regex: search, $options: 'i' } },
                { sellerName: { $regex: search, $options: 'i' } },
            ];
        }

        const [listings, total] = await Promise.all([
            Listing.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Listing.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            listings: listings.map((l: any) => ({
                ...l,
                _id: l._id.toString(),
            })),
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error) {
        console.error('[Admin Listings Error]', error);
        return NextResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
        );
    }
}
