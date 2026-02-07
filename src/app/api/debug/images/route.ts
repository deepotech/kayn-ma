import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

// DEBUG endpoint to check what images are stored in listings
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get the 5 most recent listings
        const listings = await Listing.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id title images createdAt')
            .lean();

        const debug = listings.map((l: any) => ({
            id: l._id?.toString(),
            title: l.title,
            createdAt: l.createdAt,
            imagesCount: l.images?.length || 0,
            imagesData: l.images, // Show raw image data
            imagesSample: l.images?.slice(0, 2).map((img: any) => {
                if (typeof img === 'string') {
                    return { type: 'string', value: img.substring(0, 100) + '...' };
                }
                if (img && typeof img === 'object') {
                    return {
                        type: 'object',
                        hasUrl: !!img.url,
                        urlStart: img.url?.substring?.(0, 80),
                        hasPublicId: !!img.publicId,
                    };
                }
                return { type: typeof img };
            })
        }));

        return NextResponse.json({
            success: true,
            count: listings.length,
            listings: debug
        });
    } catch (error: any) {
        console.error('Debug error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
