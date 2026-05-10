import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { type } = await request.json();

        if (!id || !['whatsapp', 'call'].includes(type)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        await prisma.listing.update({
            where: { id },
            data: type === 'whatsapp'
                ? { whatsappClicks: { increment: 1 } }
                : { callClicks: { increment: 1 } }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking contact click:', error);
        return NextResponse.json({ error: 'Failed to track contact' }, { status: 500 });
    }
}
