import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/agency-auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'HIDDEN'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vehicle = await prisma.agencyVehicle.findUnique({
            where: { id: params.id },
            include: { agency: true }
        });

        if (!vehicle) {
            return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
        }

        if (vehicle.agency.ownerId !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden. You do not own this vehicle.' }, { status: 403 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
                { status: 400 }
            );
        }

        const updated = await prisma.agencyVehicle.update({
            where: { id: params.id },
            data: {
                status,
                lastConfirmedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            vehicle: updated
        });
    } catch (error: any) {
        console.error('[Vehicle Status API] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update vehicle status' }, { status: 500 });
    }
}
