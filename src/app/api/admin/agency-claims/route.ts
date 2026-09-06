import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireStrictAdmin } from '@/lib/auth';
import { AgencyClaimStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const authResult = await requireStrictAdmin(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    try {
        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get('status')?.toUpperCase() || 'ALL';

        const whereClause: { status?: AgencyClaimStatus } = {};
        if (statusParam !== 'ALL' && Object.values(AgencyClaimStatus).includes(statusParam as AgencyClaimStatus)) {
            whereClause.status = statusParam as AgencyClaimStatus;
        }

        const [claims, pendingCount] = await Promise.all([
            prisma.agencyClaim.findMany({
                where: whereClause,
                include: {
                    agency: {
                        include: {
                            city: true
                        }
                    },
                    applicant: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                            firebaseUid: true
                        }
                    },
                    reviewer: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            }),
            prisma.agencyClaim.count({
                where: { status: AgencyClaimStatus.PENDING }
            })
        ]);

        return NextResponse.json({
            success: true,
            claims,
            pendingCount
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch agency claims';
        console.error('[Admin Claims GET] Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

class ClaimConflictError extends Error {
    statusCode = 409;
    constructor(message: string) {
        super(message);
        this.name = 'ClaimConflictError';
    }
}

class ClaimNotFoundError extends Error {
    statusCode = 404;
    constructor(message: string) {
        super(message);
        this.name = 'ClaimNotFoundError';
    }
}

export async function PATCH(request: NextRequest) {
    const authResult = await requireStrictAdmin(request);
    if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const adminUser = authResult.user;

    try {
        const body = await request.json();
        const { claimId, action, rejectionReason } = body;

        if (!claimId || typeof claimId !== 'string' || !claimId.trim()) {
            return NextResponse.json({ error: 'claimId is required' }, { status: 400 });
        }

        if (action !== 'APPROVE' && action !== 'REJECT') {
            return NextResponse.json({ error: 'Action must be APPROVE or REJECT' }, { status: 400 });
        }

        // Handle APPROVE action
        if (action === 'APPROVE') {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Atomic conditional update on AgencyClaim:
                // Only a claim that is currently in PENDING status can be transitioned to APPROVED.
                // Under concurrent calls, exactly one update will succeed (count === 1).
                const claimUpdateResult = await tx.agencyClaim.updateMany({
                    where: {
                        id: claimId.trim(),
                        status: AgencyClaimStatus.PENDING
                    },
                    data: {
                        status: AgencyClaimStatus.APPROVED,
                        reviewedById: adminUser.dbUserId,
                        reviewedAt: new Date()
                    }
                });

                if (claimUpdateResult.count === 0) {
                    const existingClaim = await tx.agencyClaim.findUnique({
                        where: { id: claimId.trim() },
                        select: { status: true }
                    });

                    if (!existingClaim) {
                        throw new ClaimNotFoundError('Agency claim not found');
                    }
                    throw new ClaimConflictError(
                        `This claim has already been processed with status: ${existingClaim.status}`
                    );
                }

                // 2. Fetch the claim and current agency state
                const claim = await tx.agencyClaim.findUniqueOrThrow({
                    where: { id: claimId.trim() },
                    include: { agency: true }
                });

                // 3. Atomic conditional update on Business:
                // Ensure Business is NOT already VERIFIED.
                // If another admin or concurrent transaction verified it, count will be 0.
                const businessUpdateResult = await tx.business.updateMany({
                    where: {
                        id: claim.agencyId,
                        verificationStatus: { not: 'VERIFIED' }
                    },
                    data: {
                        ownerId: claim.userId,
                        verificationStatus: 'VERIFIED',
                        claimed: true,
                        claimedAt: claim.agency.claimedAt || claim.createdAt,
                        verifiedAt: new Date(),
                        verificationMethod: 'admin_manual'
                    }
                });

                if (businessUpdateResult.count === 0) {
                    // Revert/abort transaction if agency is already verified
                    throw new ClaimConflictError(
                        'This agency is already verified. Cannot accept another claim for the same agency.'
                    );
                }

                // 4. Automatically reject any other PENDING claims for this same agency
                await tx.agencyClaim.updateMany({
                    where: {
                        agencyId: claim.agencyId,
                        id: { not: claim.id },
                        status: AgencyClaimStatus.PENDING
                    },
                    data: {
                        status: AgencyClaimStatus.REJECTED,
                        rejectionReason: 'Agency verified for another approved claim',
                        reviewedById: adminUser.dbUserId,
                        reviewedAt: new Date()
                    }
                });

                const updatedClaim = await tx.agencyClaim.findUniqueOrThrow({
                    where: { id: claim.id }
                });

                const updatedBusiness = await tx.business.findUniqueOrThrow({
                    where: { id: claim.agencyId }
                });

                return { updatedClaim, updatedBusiness };
            });

            return NextResponse.json({
                success: true,
                message: 'Agency claim approved successfully.',
                claim: result.updatedClaim,
                business: result.updatedBusiness
            });
        }

        // Handle REJECT action
        if (action === 'REJECT') {
            if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length < 3) {
                return NextResponse.json(
                    { error: 'A valid rejection reason is required (minimum 3 characters).' },
                    { status: 400 }
                );
            }

            const result = await prisma.$transaction(async (tx) => {
                // 1. Atomic conditional update on AgencyClaim:
                // Only PENDING claims can be transitioned to REJECTED.
                const claimUpdateResult = await tx.agencyClaim.updateMany({
                    where: {
                        id: claimId.trim(),
                        status: AgencyClaimStatus.PENDING
                    },
                    data: {
                        status: AgencyClaimStatus.REJECTED,
                        rejectionReason: rejectionReason.trim(),
                        reviewedById: adminUser.dbUserId,
                        reviewedAt: new Date()
                    }
                });

                if (claimUpdateResult.count === 0) {
                    const existingClaim = await tx.agencyClaim.findUnique({
                        where: { id: claimId.trim() },
                        select: { status: true }
                    });

                    if (!existingClaim) {
                        throw new ClaimNotFoundError('Agency claim not found');
                    }
                    throw new ClaimConflictError(
                        `Only pending claims can be rejected. Current status: ${existingClaim.status}`
                    );
                }

                // 2. Fetch the updated claim
                const updatedClaim = await tx.agencyClaim.findUniqueOrThrow({
                    where: { id: claimId.trim() }
                });

                // Note: Rejection NEVER modifies Business (ownerId or verificationStatus).
                // Existing verified or unverified businesses retain their status and ownership untouched.

                return updatedClaim;
            });

            return NextResponse.json({
                success: true,
                message: 'Agency claim rejected successfully.',
                claim: result
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: unknown) {
        if (error instanceof ClaimConflictError) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }
        if (error instanceof ClaimNotFoundError) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        const message = error instanceof Error ? error.message : 'Failed to update agency claim';
        console.error('[Admin Claims PATCH] Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

