import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

const revalidateListingPaths = (id: string) => {
    ['ar', 'fr'].forEach(locale => {
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/cars`);
        revalidatePath(`/${locale}/dashboard/listings`);
        revalidatePath(`/${locale}/cars/${id}`);
    });
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!id) return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });

        const listing = await prisma.listing.findUnique({ where: { id }, include: { city: true } });
        if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

        return NextResponse.json(listing);
    } catch (error) {
        console.error('Error fetching listing:', error);
        return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }
}

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

function normalizeField(val: any): { label: string; slug: string } {
    if (!val) return { label: '', slug: '' };
    if (typeof val === 'string') {
        return { label: val, slug: slugify(val) };
    }
    if (typeof val === 'object') {
        const label = val.label || val.name || val.fr || val.ar || '';
        const slug = val.slug || slugify(label);
        return { label, slug };
    }
    return { label: String(val), slug: slugify(String(val)) };
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        if (!id) return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });

        const existingListing = await prisma.listing.findUnique({ where: { id } });
        if (!existingListing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

        if (body.userId && existingListing.userId !== body.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { userId, ...rest } = body;
        const updateData: any = {};

        if (rest.title !== undefined) updateData.title = rest.title;
        if (rest.price !== undefined) updateData.price = Number(rest.price);
        if (rest.description !== undefined) updateData.description = rest.description;
        if (rest.year !== undefined) updateData.year = Number(rest.year);
        if (rest.mileage !== undefined) updateData.mileage = Number(rest.mileage);
        if (rest.phone !== undefined) updateData.phone = rest.phone;
        if (rest.fuelType !== undefined || rest.fuel !== undefined) updateData.fuelType = rest.fuelType || rest.fuel;
        if (rest.transmission !== undefined) updateData.transmission = rest.transmission;
        if (rest.images !== undefined) updateData.images = rest.images;

        if (rest.city) {
            const cityObj = normalizeField(rest.city);
            const citySlug = cityObj.slug || slugify(cityObj.label || 'morocco');
            const cityRecord = await prisma.city.upsert({
                where: { slug: citySlug },
                update: {},
                create: { name: cityObj.label || citySlug, slug: citySlug }
            });
            updateData.cityId = cityRecord.id;
        }

        if (rest.brand) {
            const brandObj = normalizeField(rest.brand);
            updateData.brandLabel = brandObj.label;
            updateData.brandSlug = brandObj.slug;
        }

        if (rest.carModel || rest.model) {
            const modelObj = normalizeField(rest.carModel || rest.model);
            updateData.carModelLabel = modelObj.label;
            updateData.carModelSlug = modelObj.slug;
        }

        if (rest.bodyType) {
            const bodyTypeObj = normalizeField(rest.bodyType);
            updateData.bodyTypeLabel = bodyTypeObj.label;
            updateData.bodyTypeSlug = bodyTypeObj.slug;
        }

        updateData.updatedAt = new Date();

        const updatedListing = await prisma.listing.update({
            where: { id },
            data: updateData
        });

        revalidateListingPaths(id);
        return NextResponse.json({ success: true, data: updatedListing });
    } catch (error: any) {
        console.error('Error updating listing:', error);
        return NextResponse.json({ error: error.message || 'Failed to update listing' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!id) return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });

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
