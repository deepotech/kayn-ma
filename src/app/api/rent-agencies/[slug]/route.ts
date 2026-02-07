
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RentAgency from '@/models/RentAgency';

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    await dbConnect();

    const { slug } = params;

    try {
        const agency = await RentAgency.findOne({ slug });

        if (!agency) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        return NextResponse.json(agency);
    } catch (error) {
        console.error("Error fetching agency:", error);
        return NextResponse.json({ error: 'Failed to fetch agency' }, { status: 500 });
    }
}
