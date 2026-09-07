export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/reports - Get reported listings
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));

        const skip = (page - 1) * limit;

        // Get reported listings
        const query = { isReported: true };

        const queryPromise = Promise.all([
            prisma.listing.findMany({
                where: query,
                orderBy: [
                    { reportsCount: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.listing.count({ where: query }),
        ]);

        let timerId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timerId = setTimeout(() => {
                reject(new Error('ADMIN_REPORTS_TIMEOUT'));
            }, 8000);
            if (typeof timerId.unref === 'function') timerId.unref();
        });

        const [reportedListings, total] = await Promise.race([queryPromise, timeoutPromise]).finally(() => {
            if (timerId) clearTimeout(timerId);
        });

        // Transform to report-like format expected by admin UI
        const reports = reportedListings.map((listing) => {
            let firstImageUrl: string | undefined;
            if (Array.isArray(listing.images) && listing.images.length > 0) {
                const firstImg = listing.images[0] as any;
                firstImageUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
            }

            return {
                _id: listing.id,
                id: listing.id,
                listingId: listing.id,
                listingTitle: listing.title,
                listingImage: firstImageUrl,
                reporterEmail: 'Signalement utilisateurs',
                reason: `${listing.reportsCount} signalement(s)`,
                status: listing.visibility === 'hidden' ? 'actioned' : 'pending',
                createdAt: listing.updatedAt.toISOString(),
            };
        });

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            reports,
            total,
            page,
            limit,
            totalPages,
        });
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Admin Reports Error]', errMessage);
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}
