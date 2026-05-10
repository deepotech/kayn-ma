import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

const revalidateListingPaths = (listingId: string) => {
    ['ar', 'fr'].forEach(locale => {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/cars`);
        revalidatePath(`/${locale}/my-listings`);
        revalidatePath(`/${locale}/cars/${listingId}`);
    });
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!id) return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });

        const listing = await prisma.listing.findUnique({
            where: { id },
            include: { city: true }
        });

        if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: listing });
    } catch (error) {
        console.error('Error fetching listing:', error);
        return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const existingListing = await prisma.listing.findUnique({ where: { id } });
        if (!existingListing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

        if (body.userId && existingListing.userId !== body.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updateData: any = { updatedAt: new Date() };

        if (body.status) {
            updateData.status = body.status;
            if (['active', 'published', 'approved'].includes(body.status)) {
                updateData.publishedAt = new Date();
                updateData.status = 'approved';
            }
        }

        const allowedUpdates = ['title', 'price', 'description', 'images', 'sold'];
        allowedUpdates.forEach(key => {
            if (body[key] !== undefined) updateData[key] = body[key];
        });

        const updatedListing = await prisma.listing.update({ where: { id }, data: updateData });

        revalidateListingPaths(id);
        return NextResponse.json({ success: true, data: updatedListing });
    } catch (error) {
        console.error('Error updating listing:', error);
        return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const existingListing = await prisma.listing.findUnique({ where: { id } });
        if (!existingListing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

        if (userId && existingListing.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await prisma.listing.delete({ where: { id } });

        revalidateListingPaths(id);
        return NextResponse.json({ success: true, message: 'Listing deleted' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }
}
