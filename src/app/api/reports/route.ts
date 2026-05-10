export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getCurrentUserId, getClientIp } from '@/lib/auth';

const reportSchema = z.object({
    listingId: z.string().min(1, 'Listing ID is required'),
    reason: z.enum(['scam', 'duplicate', 'wrong_info', 'spam', 'illegal', 'other']),
    message: z.string().max(500).optional(),
});

const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const AUTO_HIDE_THRESHOLD = 3;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);
    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(identifier, { count: 1, timestamp: now });
        return true;
    }
    if (record.count >= RATE_LIMIT_MAX) return false;
    record.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = reportSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.issues[0].message }, { status: 400 });
        }

        const { listingId, reason, message } = validation.data;
        const userId = await getCurrentUserId(request);
        const clientIp = getClientIp(request);

        const rateLimitKey = userId || `ip:${clientIp}`;
        if (!checkRateLimit(rateLimitKey)) {
            return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
        }

        // Check listing exists
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });

        // Prevent self-reporting
        if (userId && listing.userId === userId) {
            return NextResponse.json({ success: false, error: 'Cannot report your own listing' }, { status: 400 });
        }

        // Check duplicate report
        if (userId) {
            const existingReport = await prisma.report.findFirst({
                where: { listingId, reporterId: userId }
            });
            if (existingReport) {
                return NextResponse.json({ success: false, error: 'You have already reported this listing' }, { status: 400 });
            }
        }

        // Create report
        const report = await prisma.report.create({
            data: {
                listingId,
                reporterId: userId || null,
                reporterIp: clientIp,
                reason,
                message: message || null,
                status: 'open',
            }
        });

        // Update listing reports count atomically
        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                reportsCount: { increment: 1 },
                isReported: true,
            }
        });

        // Auto-hide if threshold reached
        if (updatedListing.reportsCount >= AUTO_HIDE_THRESHOLD) {
            await prisma.listing.update({
                where: { id: listingId },
                data: { visibility: 'hidden', status: 'pending_review' }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Report submitted successfully',
            data: { reportId: report.id },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ success: false, error: 'Failed to submit report' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const listingId = searchParams.get('listingId');

        const where: any = {};
        if (status) where.status = status;
        if (listingId) where.listingId = listingId;

        const reports = await prisma.report.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
    }
}
