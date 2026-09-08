import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// PATCH /api/admin/listings/[id]/status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { status, visibility, rejectionReason } = body;

        const updateData: any = {
            lastModeratedAt: new Date(),
        };

        if (status) {
            updateData.status = status;
            if (status === 'approved') {
                updateData.publishedAt = new Date();
            }
        }

        if (visibility) {
            updateData.visibility = visibility;
        }

        if (rejectionReason !== undefined) {
            updateData.rejectionReason = rejectionReason;
        }

        const listing = await prisma.listing.update({
            where: { id },
            data: updateData,
            include: { city: true }
        });

        console.log(`[Admin] Listing ${id} updated:`, updateData);

        return NextResponse.json({
            success: true,
            listing: {
                ...listing,
                _id: listing.id,
                brand: { label: listing.brandLabel, slug: listing.brandSlug },
                carModel: { label: listing.carModelLabel, slug: listing.carModelSlug },
                city: { label: listing.city?.name || '', slug: listing.city?.slug || '' },
                images: Array.isArray(listing.images)
                    ? (listing.images as Array<any>).map((img) =>
                          typeof img === 'string'
                              ? { url: img, publicId: '' }
                              : { url: img?.url || '', publicId: img?.publicId || '' }
                      )
                    : [],
            },
        });
    } catch (error) {
        console.error('[Admin Listing Status Error]', error);
        return NextResponse.json(
            { error: 'Failed to update listing status' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/listings/[id]/status (or use for delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        await prisma.listing.delete({
            where: { id }
        });

        console.log(`[Admin] Listing ${id} deleted`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Admin Listing Delete Error]', error);
        return NextResponse.json(
            { error: 'Failed to delete listing' },
            { status: 500 }
        );
    }
}

