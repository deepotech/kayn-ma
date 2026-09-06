import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import { getAgencyBySlug } from '@/lib/agencies';
import VehicleDetailView from '@/components/agency/VehicleDetailView';
import { AgencyVehicleNormalized } from '@/lib/rent-agencies/normalize';

export const dynamic = 'force-dynamic';

interface Props {
    params: {
        locale: string;
        city: string;
        slug: string; // agency slug
        vehicleSlug: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale, city, slug, vehicleSlug } = params;

    const vehicle = await prisma.agencyVehicle.findUnique({
        where: { slug: vehicleSlug },
        include: { agency: { include: { city: true } } }
    });

    if (!vehicle || vehicle.status === 'HIDDEN') {
        return {
            title: 'Vehicle Not Found | Cayn.ma',
            robots: { index: false, follow: false }
        };
    }

    const agency = vehicle.agency;
    const cityName = agency.city?.name || city;

    const titleAr = `كراء ${vehicle.brand} ${vehicle.model} ${vehicle.year} في ${cityName} | ${agency.name}`;
    const titleFr = `Location ${vehicle.brand} ${vehicle.model} ${vehicle.year} à ${cityName} | ${agency.name}`;
    const title = locale === 'ar' ? titleAr : titleFr;

    const descAr = `احجز ${vehicle.brand} ${vehicle.model} موديل ${vehicle.year} من وكالة ${agency.name} في ${cityName} ابتداءً من ${vehicle.dailyPrice} درهم/اليوم. توفر فوري وتواصل مباشر.`;
    const descFr = `Louez la ${vehicle.brand} ${vehicle.model} ${vehicle.year} chez ${agency.name} à ${cityName} dès ${vehicle.dailyPrice} DH/jour. Réservation directe et rapide.`;
    const description = locale === 'ar' ? descAr : descFr;

    const firstImage = vehicle.featuredImage || (Array.isArray(vehicle.images) && (vehicle.images as any)[0]?.url) || undefined;

    return {
        title: `${title} | Cayn.ma`,
        description,
        alternates: {
            canonical: `https://www.cayn.ma/${locale}/rent-agencies/${city}/${slug}/${vehicleSlug}`,
            languages: {
                ar: `https://www.cayn.ma/ar/rent-agencies/${city}/${slug}/${vehicleSlug}`,
                fr: `https://www.cayn.ma/fr/rent-agencies/${city}/${slug}/${vehicleSlug}`,
            }
        },
        openGraph: {
            title,
            description,
            images: firstImage ? [{ url: firstImage }] : [],
            type: 'website',
            url: `https://www.cayn.ma/${locale}/rent-agencies/${city}/${slug}/${vehicleSlug}`,
            siteName: 'Cayn.ma',
            locale: locale === 'ar' ? 'ar_MA' : 'fr_MA'
        }
    };
}

export default async function VehicleDetailPage({ params }: Props) {
    const { locale, city, slug, vehicleSlug } = params;

    const vehicleRecord = await prisma.agencyVehicle.findUnique({
        where: { slug: vehicleSlug },
        include: {
            agency: {
                include: { city: true }
            }
        }
    });

    if (!vehicleRecord || vehicleRecord.status === 'HIDDEN') {
        notFound();
    }

    const agency = await getAgencyBySlug(city, slug);
    if (!agency) {
        notFound();
    }

    // Increment vehicle view counter silently
    prisma.agencyVehicle.update({
        where: { id: vehicleRecord.id },
        data: { views: { increment: 1 } }
    }).catch(() => null);

    // Fetch similar vehicles from this agency
    const similarRecords = await prisma.agencyVehicle.findMany({
        where: {
            agencyId: vehicleRecord.agencyId,
            id: { not: vehicleRecord.id },
            status: { not: 'HIDDEN' }
        },
        take: 3,
        orderBy: { createdAt: 'desc' }
    });

    const normalizedVehicle: AgencyVehicleNormalized = {
        id: vehicleRecord.id,
        agencyId: vehicleRecord.agencyId,
        brand: vehicleRecord.brand,
        brandSlug: vehicleRecord.brandSlug,
        model: vehicleRecord.model,
        modelSlug: vehicleRecord.modelSlug,
        year: vehicleRecord.year,
        category: vehicleRecord.category,
        bodyType: vehicleRecord.bodyType,
        transmission: vehicleRecord.transmission,
        fuel: vehicleRecord.fuel,
        seats: vehicleRecord.seats,
        doors: vehicleRecord.doors,
        luggage: vehicleRecord.luggage,
        color: vehicleRecord.color,
        description: vehicleRecord.description,
        images: Array.isArray(vehicleRecord.images) ? (vehicleRecord.images as any) : [],
        featuredImage: vehicleRecord.featuredImage,
        dailyPrice: vehicleRecord.dailyPrice,
        weeklyPrice: vehicleRecord.weeklyPrice,
        monthlyPrice: vehicleRecord.monthlyPrice,
        securityDeposit: vehicleRecord.securityDeposit,
        minRentalDays: vehicleRecord.minRentalDays,
        mileagePerDay: vehicleRecord.mileagePerDay,
        extraMileagePrice: vehicleRecord.extraMileagePrice,
        deliveryFee: vehicleRecord.deliveryFee,
        airportDeliveryFee: vehicleRecord.airportDeliveryFee,
        priceNotes: vehicleRecord.priceNotes,
        seasonPricing: vehicleRecord.seasonPricing as any,
        status: vehicleRecord.status,
        lastConfirmedAt: vehicleRecord.lastConfirmedAt ? vehicleRecord.lastConfirmedAt.toISOString() : new Date().toISOString(),
        slug: vehicleRecord.slug,
        views: vehicleRecord.views,
        whatsappClicks: vehicleRecord.whatsappClicks,
        callClicks: vehicleRecord.callClicks,
        order: vehicleRecord.order,
        createdAt: vehicleRecord.createdAt.toISOString(),
        updatedAt: vehicleRecord.updatedAt.toISOString(),
    };

    const normalizedSimilar: AgencyVehicleNormalized[] = similarRecords.map(v => ({
        id: v.id,
        agencyId: v.agencyId,
        brand: v.brand,
        brandSlug: v.brandSlug,
        model: v.model,
        modelSlug: v.modelSlug,
        year: v.year,
        category: v.category,
        bodyType: v.bodyType,
        transmission: v.transmission,
        fuel: v.fuel,
        seats: v.seats,
        doors: v.doors,
        luggage: v.luggage,
        color: v.color,
        description: v.description,
        images: Array.isArray(v.images) ? (v.images as any) : [],
        featuredImage: v.featuredImage,
        dailyPrice: v.dailyPrice,
        weeklyPrice: v.weeklyPrice,
        monthlyPrice: v.monthlyPrice,
        securityDeposit: v.securityDeposit,
        minRentalDays: v.minRentalDays,
        mileagePerDay: v.mileagePerDay,
        extraMileagePrice: v.extraMileagePrice,
        deliveryFee: v.deliveryFee,
        airportDeliveryFee: v.airportDeliveryFee,
        priceNotes: v.priceNotes,
        seasonPricing: v.seasonPricing as any,
        status: v.status,
        lastConfirmedAt: v.lastConfirmedAt ? v.lastConfirmedAt.toISOString() : new Date().toISOString(),
        slug: v.slug,
        views: v.views,
        whatsappClicks: v.whatsappClicks,
        callClicks: v.callClicks,
        order: v.order,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
    }));

    return (
        <VehicleDetailView
            vehicle={normalizedVehicle}
            agency={agency}
            similarVehicles={normalizedSimilar}
        />
    );
}
