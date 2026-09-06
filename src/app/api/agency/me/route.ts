import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/agency-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const agency = await prisma.business.findFirst({
            where: { ownerId: user.id },
            include: {
                city: true,
                vehicles: {
                    orderBy: [
                        { order: 'asc' },
                        { createdAt: 'desc' }
                    ]
                }
            }
        });

        if (!agency) {
            return NextResponse.json({
                hasAgency: false,
                agency: null
            });
        }

        // Compute metrics
        const totalVehicles = agency.vehicles.length;
        const availableVehicles = agency.vehicles.filter(v => v.status === 'AVAILABLE').length;
        const rentedVehicles = agency.vehicles.filter(v => v.status === 'RENTED').length;
        const maintenanceVehicles = agency.vehicles.filter(v => v.status === 'MAINTENANCE').length;
        const hiddenVehicles = agency.vehicles.filter(v => v.status === 'HIDDEN').length;

        // Sum vehicle stats
        const vehicleViews = agency.vehicles.reduce((acc, v) => acc + (v.views || 0), 0);
        const vehicleWhatsappClicks = agency.vehicles.reduce((acc, v) => acc + (v.whatsappClicks || 0), 0);
        const vehicleCallClicks = agency.vehicles.reduce((acc, v) => acc + (v.callClicks || 0), 0);

        return NextResponse.json({
            hasAgency: true,
            agency: {
                id: agency.id,
                name: agency.name,
                slug: agency.slug,
                city: agency.city.name,
                citySlug: agency.city.slug,
                address: agency.address,
                phone: agency.phone,
                whatsapp: agency.whatsapp,
                email: agency.email,
                website: agency.website,
                description: agency.description,
                logo: agency.logo,
                coverPhoto: agency.coverPhoto || (agency.photos.length > 0 ? agency.photos[0] : null),
                photos: agency.photos,
                rating: agency.rating,
                reviewsCount: agency.reviewsCount,
                openingHours: agency.openingHours,
                verificationStatus: agency.verificationStatus,
                claimedAt: agency.claimedAt,
                verifiedAt: agency.verifiedAt,
                updatedAt: agency.updatedAt,
                stats: {
                    views: (agency.views || 0) + vehicleViews,
                    whatsappClicks: (agency.whatsappClicks || 0) + vehicleWhatsappClicks,
                    callClicks: (agency.callClicks || 0) + vehicleCallClicks,
                    totalVehicles,
                    availableVehicles,
                    rentedVehicles,
                    maintenanceVehicles,
                    hiddenVehicles,
                },
                vehicles: agency.vehicles
            }
        });
    } catch (error: any) {
        console.error('[Agency Me API] Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch agency.' },
            { status: 500 }
        );
    }
}
