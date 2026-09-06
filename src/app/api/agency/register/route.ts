import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/agency-auth';
import { randomBytes } from 'crypto';

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

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in to register an agency.' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            city, // slug or id
            address,
            phone,
            whatsapp,
            email,
            website,
            description,
            approximateVehicles,
            logo,
            coverPhoto
        } = body;

        if (!name || !city || !address || !phone) {
            return NextResponse.json({ error: 'Name, City, Address, and Phone are required.' }, { status: 400 });
        }

        // Find or create city
        const citySlug = slugify(city);
        const cityRecord = await prisma.city.upsert({
            where: { slug: citySlug },
            update: {},
            create: {
                name: city.charAt(0).toUpperCase() + city.slice(1),
                slug: citySlug
            }
        });

        // Generate unique slug for agency
        const baseSlug = slugify(name);
        let candidateSlug = baseSlug;
        let suffix = 1;

        while (true) {
            const existing = await prisma.business.findUnique({
                where: { slug: candidateSlug }
            });
            if (!existing) break;
            const randHex = randomBytes(2).toString('hex');
            candidateSlug = `${baseSlug}-${randHex}`;
            suffix++;
            if (suffix > 10) break;
        }

        const photos: string[] = [];
        if (coverPhoto) photos.push(coverPhoto);

        const newAgency = await prisma.business.create({
            data: {
                name: name.trim(),
                slug: candidateSlug,
                cityId: cityRecord.id,
                address: address.trim(),
                phone: phone.trim(),
                whatsapp: whatsapp ? String(whatsapp).trim() : phone.trim(),
                email: email ? String(email).trim().toLowerCase() : user.email,
                website: website ? String(website).trim() : null,
                description: description ? String(description).trim() : null,
                logo: logo || null,
                coverPhoto: coverPhoto || null,
                photos,
                source: 'manual',
                status: 'pending', // Pending admin approval
                claimed: true,
                ownerId: user.id,
                verificationStatus: 'PENDING',
                claimedAt: new Date(),
                verificationMethod: 'admin_manual',
                claimPhone: phone.trim(),
                claimNotes: approximateVehicles ? `Approximate vehicles: ${approximateVehicles}` : null
            },
            include: { city: true }
        });

        return NextResponse.json({
            success: true,
            agency: newAgency
        }, { status: 201 });
    } catch (error: any) {
        console.error('[Agency Register POST] Error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to register agency' }, { status: 500 });
    }
}
