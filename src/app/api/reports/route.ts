import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/db';
import Report from '@/models/Report';
import Listing from '@/models/Listing';
import { getCurrentUserId, getClientIp } from '@/lib/auth';

// Validation schema
const reportSchema = z.object({
    listingId: z.string().min(1, 'Listing ID is required'),
    reason: z.enum(['scam', 'duplicate', 'wrong_info', 'spam', 'illegal', 'other']),
    message: z.string().max(500).optional(),
});

// Rate limiting config
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // Max 5 reports per hour

// In-memory rate limit (use Redis in production)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(identifier, { count: 1, timestamp: now });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

// Auto-hide threshold
const AUTO_HIDE_THRESHOLD = 3;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = reportSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { listingId, reason, message } = validation.data;
        const userId = await getCurrentUserId(request);
        const clientIp = getClientIp(request);

        // Rate limiting by user ID or IP
        const rateLimitKey = userId || `ip:${clientIp}`;
        if (!checkRateLimit(rateLimitKey)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        await dbConnect();

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return NextResponse.json(
                { success: false, error: 'Listing not found' },
                { status: 404 }
            );
        }

        // Prevent self-reporting
        if (userId && listing.userId === userId) {
            return NextResponse.json(
                { success: false, error: 'Cannot report your own listing' },
                { status: 400 }
            );
        }

        // Check for duplicate report (same user, same listing)
        if (userId) {
            const existingReport = await Report.findOne({
                listingId,
                reporterId: userId,
            });

            if (existingReport) {
                return NextResponse.json(
                    { success: false, error: 'You have already reported this listing' },
                    { status: 400 }
                );
            }
        }

        // Create report
        const report = await Report.create({
            listingId,
            reporterId: userId || null,
            reporterIp: clientIp,
            reason,
            message: message || undefined,
            status: 'open',
        });

        // Atomically update listing: increment reportsCount, set isReported
        const updatedListing = await Listing.findByIdAndUpdate(
            listingId,
            {
                $inc: { reportsCount: 1 },
                $set: { isReported: true },
            },
            { new: true }
        );

        // Auto-hide if threshold reached
        if (updatedListing && updatedListing.reportsCount >= AUTO_HIDE_THRESHOLD) {
            await Listing.findByIdAndUpdate(listingId, {
                $set: {
                    visibility: 'hidden',
                    status: 'pending_review',
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Report submitted successfully',
            data: { reportId: report._id },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit report' },
            { status: 500 }
        );
    }
}

// GET - Fetch reports (for admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const listingId = searchParams.get('listingId');

        await dbConnect();

        const query: any = {};
        if (status) query.status = status;
        if (listingId) query.listingId = listingId;

        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return NextResponse.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}
