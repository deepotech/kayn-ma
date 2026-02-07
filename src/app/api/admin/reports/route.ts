import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

// GET /api/admin/reports - Get reported listings as "reports"
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const skip = (page - 1) * limit;

        // Get reported listings
        const query = { isReported: true };

        const [reportedListings, total] = await Promise.all([
            Listing.find(query)
                .sort({ reportsCount: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Listing.countDocuments(query),
        ]);

        // Transform to report-like format
        const reports = reportedListings.map((listing: any) => ({
            _id: listing._id.toString(),
            listingId: listing._id.toString(),
            listingTitle: listing.title,
            listingImage: listing.images?.[0]?.url,
            reporterEmail: 'Multiple reporters',
            reason: `${listing.reportsCount} signalement(s)`,
            status: listing.visibility === 'hidden' ? 'actioned' : 'pending',
            createdAt: listing.updatedAt,
        }));

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            reports,
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error) {
        console.error('[Admin Reports Error]', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}
