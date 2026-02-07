
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RentAgency from '@/models/RentAgency';

export async function GET() {
    await dbConnect();

    const agencies = [
        {
            name: "Majd Cars",
            slug: "majd-cars-marrakech",
            city: "marrakech",
            address: "Av. Allal Al Fassi, Marrakech 40000",
            phone: "+212 661-123456",
            website: "https://majdcars.ma",
            location: { lat: 31.6445, lng: -8.0245 },
            categories: ["Car Rental", "Utility Vehicle Rental"],
            rating: 4.8,
            reviewsCount: 120,
            photos: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000", "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1000"],
            source: "manual",
            claimed: false,
        },
        {
            name: "Samicar Marrakech",
            slug: "samicar-marrakech",
            city: "marrakech",
            address: "Aéroport Marrakech Menara, Marrakech",
            phone: "+212 524-444444",
            website: "https://samicar.com",
            location: { lat: 31.6069, lng: -8.0363 },
            categories: ["Car Rental", "Airport Transfer"],
            rating: 4.5,
            reviewsCount: 85,
            photos: ["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000"],
            source: "manual",
            claimed: false,
        },
        {
            name: "Sovoy Cars",
            slug: "sovoy-cars-marrakech",
            city: "marrakech",
            address: "Gueliz, Marrakech 40000",
            phone: "+212 600-000000",
            website: null,
            location: { lat: 31.6346, lng: -8.0083 },
            categories: ["Car Rental"],
            rating: 3.9,
            reviewsCount: 20,
            photos: [],
            source: "manual",
            claimed: false,
        },
        {
            name: "Yara Rent",
            slug: "yara-rent-marrakech",
            city: "marrakech",
            address: "Route de Casa, Marrakech",
            phone: "+212 612-345678",
            website: null,
            location: { lat: 31.6500, lng: -8.0100 },
            categories: ["Car Rental", "Luxury Cars"],
            rating: 5.0,
            reviewsCount: 15,
            photos: ["https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=1000"],
            source: "manual",
            claimed: false,
        }
    ];

    try {
        // Clear existing for idempotency during dev
        await RentAgency.deleteMany({ city: 'marrakech' });

        await RentAgency.insertMany(agencies);

        return NextResponse.json({ success: true, message: 'Seeded Marrakech agencies', count: agencies.length });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
