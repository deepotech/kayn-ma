export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RentAgency from '@/models/RentAgency';

export async function GET(req: NextRequest) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};

    if (city) {
        query.city = city.toLowerCase();
    }

    if (rating) {
        // Filter by rating greater than or equal to provided value
        query.rating = { $gte: parseFloat(rating) };
    }

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    try {
        const agencies = await RentAgency.find(query)
            .sort({ rating: -1, reviewsCount: -1 }) // Sort by best rated first
            .limit(limit);

        return NextResponse.json(agencies);
    } catch (error) {
        console.error("Error fetching agencies:", error);
        return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
    }
}
