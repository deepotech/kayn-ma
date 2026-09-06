import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/agency-auth';

export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to claim this agency.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { agencyId, fullName, phone, email, notes } = body;

        // 1. Validate inputs
        if (!agencyId || typeof agencyId !== 'string' || !agencyId.trim()) {
            return NextResponse.json(
                { error: 'Agency ID is required.' },
                { status: 400 }
            );
        }

        if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
            return NextResponse.json(
                { error: 'Full name is required (minimum 2 characters).' },
                { status: 400 }
            );
        }

        if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
            return NextResponse.json(
                { error: 'A valid phone number is required (minimum 8 characters).' },
                { status: 400 }
            );
        }

        const contactEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : user.email;
        if (!isValidEmail(contactEmail)) {
            return NextResponse.json(
                { error: 'A valid email address is required.' },
                { status: 400 }
            );
        }

        // 2. Find agency by ID or slug
        const agency = await prisma.business.findFirst({
            where: {
                OR: [
                    { id: agencyId.trim() },
                    { slug: agencyId.trim() }
                ]
            }
        });

        if (!agency) {
            return NextResponse.json(
                { error: 'Agency not found.' },
                { status: 404 }
            );
        }

        // 3. Prevent claiming an already verified agency
        if (agency.verificationStatus === 'VERIFIED') {
            return NextResponse.json(
                { error: 'This agency is already verified and cannot be claimed.' },
                { status: 400 }
            );
        }

        // 4. Prevent duplicate pending claim for the same user and agency
        const existingPendingClaim = await prisma.agencyClaim.findFirst({
            where: {
                agencyId: agency.id,
                userId: user.id,
                status: 'PENDING'
            }
        });

        if (existingPendingClaim) {
            return NextResponse.json(
                { error: 'You already have a pending claim for this agency.' },
                { status: 400 }
            );
        }

        // 5. Create AgencyClaim record with PENDING status (userId extracted exclusively from session)
        // Note: Do NOT set Business.ownerId here!
        const claim = await prisma.agencyClaim.create({
            data: {
                agencyId: agency.id,
                userId: user.id,
                fullName: fullName.trim(),
                phone: phone.trim(),
                email: contactEmail,
                notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
                status: 'PENDING'
            },
            include: {
                agency: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });

        // 6. Update business verification status to PENDING if currently UNVERIFIED
        if (agency.verificationStatus === 'UNVERIFIED') {
            await prisma.business.update({
                where: { id: agency.id },
                data: {
                    verificationStatus: 'PENDING'
                }
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Claim request submitted successfully. It is under review.',
                claim: {
                    id: claim.id,
                    agencyId: claim.agencyId,
                    agencyName: claim.agency.name,
                    status: claim.status,
                    createdAt: claim.createdAt
                }
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        // Handle database unique constraint violation (Prisma P2002)
        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            (error as { code: string }).code === 'P2002'
        ) {
            const meta =
                'meta' in error &&
                typeof (error as { meta?: unknown }).meta === 'object' &&
                (error as { meta?: unknown }).meta !== null
                    ? (error as { meta: { target?: unknown } }).meta
                    : null;

            const target = meta?.target;
            const targetStr = Array.isArray(target)
                ? target.join(',')
                : typeof target === 'string'
                ? target
                : '';

            const isPendingClaimViolation =
                targetStr.includes('unique_user_agency_pending_claim') ||
                (targetStr.includes('agencyId') && targetStr.includes('userId'));

            if (isPendingClaimViolation) {
                return NextResponse.json(
                    { error: 'You already have a pending claim for this agency.' },
                    { status: 409 }
                );
            }

            console.error('[Agency Claim API] Unexpected unique constraint violation:', targetStr);
            return NextResponse.json(
                { error: 'Failed to submit agency claim. Please try again later.' },
                { status: 500 }
            );
        }

        const message = error instanceof Error ? error.message : 'Failed to submit agency claim.';
        console.error('[Agency Claim API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to submit agency claim. Please try again later.' },
            { status: 500 }
        );
    }
}
