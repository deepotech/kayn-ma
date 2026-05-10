export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};

    if (city) {
        where.city = { slug: city.toLowerCase() };
    }

    if (rating) {
        where.rating = { gte: parseFloat(rating) };
    }

    if (search) {
        where.name = { contains: search, mode: 'insensitive' };
    }

    try {
        const agencies = await prisma.business.findMany({
            where,
            orderBy: [
                { rating: 'desc' },
                { reviewsCount: 'desc' }
            ],
            take: limit,
            include: {
                city: true,
                categories: { include: { category: true } }
            }
        });

        return NextResponse.json(agencies);
    } catch (error) {
        console.error("Error fetching agencies:", error);
        return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
    }
}
