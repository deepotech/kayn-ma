import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/agency-auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const agency = await prisma.business.findFirst({
            where: { ownerId: user.id }
        });

        if (!agency) {
            return NextResponse.json(
                { error: 'No agency found for this account.' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            name,
            phone,
            whatsapp,
            email,
            address,
            description,
            website,
            openingHours,
            logo,
            coverPhoto
        } = body;

        const updateData: any = {};
        if (name && typeof name === 'string') updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null;
        if (whatsapp !== undefined) updateData.whatsapp = whatsapp ? String(whatsapp).trim() : null;
        if (email !== undefined) updateData.email = email ? String(email).trim().toLowerCase() : null;
        if (address !== undefined) updateData.address = String(address).trim();
        if (description !== undefined) updateData.description = description ? String(description).trim() : null;
        if (website !== undefined) updateData.website = website ? String(website).trim() : null;
        if (openingHours !== undefined) updateData.openingHours = openingHours;
        if (logo !== undefined) updateData.logo = logo;
        if (coverPhoto !== undefined) {
            updateData.coverPhoto = coverPhoto;
            if (coverPhoto && !agency.photos.includes(coverPhoto)) {
                updateData.photos = [coverPhoto, ...agency.photos];
            }
        }

        const updated = await prisma.business.update({
            where: { id: agency.id },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            agency: updated
        });
    } catch (error: any) {
        console.error('[Agency Profile API] Update error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to update agency profile.' },
            { status: 500 }
        );
    }
}
