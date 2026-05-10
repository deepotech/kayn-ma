import { NextRequest, NextResponse } from 'next/server';
import { getAgencyBySlug } from '@/lib/rent-agencies/getAgenciesByCity';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
    const { slug } = params;
    try {
        const agency = await getAgencyBySlug('', slug);
        if (!agency) return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        return NextResponse.json(agency);
    } catch (error) {
        console.error("Error fetching agency:", error);
        return NextResponse.json({ error: 'Failed to fetch agency' }, { status: 500 });
    }
}
