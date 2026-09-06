import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/agency-auth';

export const dynamic = 'force-dynamic';

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
        const { agencyId, phone, whatsapp, notes, verificationMethod } = body;

        if (!agencyId) {
            return NextResponse.json(
                { error: 'Agency ID is required.' },
                { status: 400 }
            );
        }

        if (!phone && !whatsapp) {
            return NextResponse.json(
                { error: 'A valid contact phone or WhatsApp number is required for verification.' },
                { status: 400 }
            );
        }

        // Find agency by ID or slug
        const agency = await prisma.business.findFirst({
            where: {
                OR: [
                    { id: agencyId },
                    { slug: agencyId }
                ]
            }
        });

        if (!agency) {
            return NextResponse.json(
                { error: 'Agency not found.' },
                { status: 404 }
            );
        }

        // Check if already claimed by someone else and verified
        if (agency.ownerId && agency.ownerId !== user.id && agency.verificationStatus === 'VERIFIED') {
            return NextResponse.json(
                { error: 'This agency is already verified and owned by another user.' },
                { status: 403 }
            );
        }

        // If user already owns another agency, ensure system logic allows or manages it
        // Update agency claim request
        const updatedAgency = await prisma.business.update({
            where: { id: agency.id },
            data: {
                ownerId: user.id,
                verificationStatus: 'PENDING',
                claimed: true,
                claimedAt: new Date(),
                claimPhone: phone || whatsapp,
                claimNotes: notes || null,
                whatsapp: whatsapp || agency.whatsapp || phone,
                verificationMethod: verificationMethod || 'phone'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Claim request submitted successfully. It is under review.',
            agency: {
                id: updatedAgency.id,
                name: updatedAgency.name,
                slug: updatedAgency.slug,
                verificationStatus: updatedAgency.verificationStatus,
                claimedAt: updatedAgency.claimedAt
            }
        });
    } catch (error: any) {
        console.error('[Agency Claim API] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to submit agency claim.' },
            { status: 500 }
        );
    }
}
