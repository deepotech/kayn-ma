import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';

// POST /api/listings/[id]/contact
// Track contact clicks (whatsapp/call)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { type } = await request.json();

        if (!id || !['whatsapp', 'call'].includes(type)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        await dbConnect();

        // Increment the appropriate counter
        const update = type === 'whatsapp'
            ? { $inc: { whatsappClicks: 1 } }
            : { $inc: { callClicks: 1 } };

        await Listing.findByIdAndUpdate(id, update);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking contact click:', error);
        return NextResponse.json({ error: 'Failed to track contact' }, { status: 500 });
    }
}
