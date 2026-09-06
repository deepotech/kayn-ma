import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/agency-auth';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

        return NextResponse.json({ success: true, vehicle });
    } catch (error: any) {
        console.error('[Agency Vehicle GET] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch vehicle' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    return handleUpdateVehicle(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    return handleUpdateVehicle(request, params);
}

async function handleUpdateVehicle(request: NextRequest, params: { id: string }) {
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
        const updateData: any = {};

        if (body.brand) {
            updateData.brand = body.brand.trim();
            updateData.brandSlug = slugify(body.brand);
        }
        if (body.model) {
            updateData.model = body.model.trim();
            updateData.modelSlug = slugify(body.model);
        }
        if (body.year) updateData.year = parseInt(body.year, 10);
        if (body.category !== undefined) updateData.category = body.category;
        if (body.bodyType !== undefined) updateData.bodyType = body.bodyType;
        if (body.transmission !== undefined) updateData.transmission = body.transmission;
        if (body.fuel !== undefined) updateData.fuel = body.fuel;
        if (body.seats !== undefined) updateData.seats = parseInt(body.seats, 10);
        if (body.doors !== undefined) updateData.doors = parseInt(body.doors, 10);
        if (body.luggage !== undefined) updateData.luggage = parseInt(body.luggage, 10);
        if (body.color !== undefined) updateData.color = body.color ? String(body.color).trim() : null;
        if (body.description !== undefined) updateData.description = body.description ? String(body.description).trim() : null;
        if (body.images !== undefined && Array.isArray(body.images)) {
            updateData.images = body.images;
            updateData.featuredImage = body.images[0]?.url || null;
        }
        if (body.dailyPrice !== undefined) updateData.dailyPrice = parseFloat(body.dailyPrice);
        if (body.weeklyPrice !== undefined) updateData.weeklyPrice = body.weeklyPrice ? parseFloat(body.weeklyPrice) : null;
        if (body.monthlyPrice !== undefined) updateData.monthlyPrice = body.monthlyPrice ? parseFloat(body.monthlyPrice) : null;
        if (body.securityDeposit !== undefined) updateData.securityDeposit = body.securityDeposit ? parseFloat(body.securityDeposit) : null;
        if (body.minRentalDays !== undefined) updateData.minRentalDays = parseInt(body.minRentalDays, 10);
        if (body.mileagePerDay !== undefined) updateData.mileagePerDay = body.mileagePerDay ? parseInt(body.mileagePerDay, 10) : null;
        if (body.extraMileagePrice !== undefined) updateData.extraMileagePrice = body.extraMileagePrice ? parseFloat(body.extraMileagePrice) : null;
        if (body.deliveryFee !== undefined) updateData.deliveryFee = body.deliveryFee ? parseFloat(body.deliveryFee) : null;
        if (body.airportDeliveryFee !== undefined) updateData.airportDeliveryFee = body.airportDeliveryFee ? parseFloat(body.airportDeliveryFee) : null;
        if (body.priceNotes !== undefined) updateData.priceNotes = body.priceNotes ? String(body.priceNotes).trim() : null;
        if (body.seasonPricing !== undefined) updateData.seasonPricing = body.seasonPricing;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.order !== undefined) updateData.order = parseInt(body.order, 10);

        updateData.lastConfirmedAt = new Date();

        const updated = await prisma.agencyVehicle.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json({ success: true, vehicle: updated });
    } catch (error: any) {
        console.error('[Agency Vehicle PUT] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to update vehicle' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

        await prisma.agencyVehicle.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true, message: 'Vehicle deleted successfully.' });
    } catch (error: any) {
        console.error('[Agency Vehicle DELETE] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete vehicle' }, { status: 500 });
    }
}
