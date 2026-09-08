export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/admin/listings
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const city = searchParams.get('city');
        const search = searchParams.get('search');
        const reported = searchParams.get('reported');

        const skip = (page - 1) * limit;

        // Build query
        const where: Prisma.ListingWhereInput = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (city && city !== 'all') {
            where.city = { slug: city };
        }

        if (reported === 'true') {
            where.isReported = true;
        }

        if (search && search.trim()) {
            const s = search.trim();
            where.OR = [
                { id: s },
                { title: { contains: s, mode: 'insensitive' } },
                { brandLabel: { contains: s, mode: 'insensitive' } },
                { carModelLabel: { contains: s, mode: 'insensitive' } },
                { sellerName: { contains: s, mode: 'insensitive' } },
                { agencyName: { contains: s, mode: 'insensitive' } },
            ];
        }

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: { city: true },
            }),
            prisma.listing.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            listings: listings.map((l) => ({
                ...l,
                _id: l.id,
                brand: { label: l.brandLabel, slug: l.brandSlug },
                carModel: { label: l.carModelLabel, slug: l.carModelSlug },
                city: { label: l.city?.name || '', slug: l.city?.slug || '' },
                images: Array.isArray(l.images)
                    ? (l.images as Array<any>).map((img) =>
                          typeof img === 'string'
                              ? { url: img, publicId: '' }
                              : { url: img?.url || '', publicId: img?.publicId || '' }
                      )
                    : [],
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

