import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agencyId, vehicleId, type } = body;

        if (!type || !['whatsapp', 'call', 'view'].includes(type)) {
            return NextResponse.json({ error: 'Invalid click type' }, { status: 400 });
        }

        if (vehicleId) {
            const dataToIncrement: any = {};
            if (type === 'whatsapp') dataToIncrement.whatsappClicks = { increment: 1 };
            if (type === 'call') dataToIncrement.callClicks = { increment: 1 };
            if (type === 'view') dataToIncrement.views = { increment: 1 };

            await prisma.agencyVehicle.update({
                where: { id: vehicleId },
                data: dataToIncrement
            }).catch(() => null);
        }

        if (agencyId) {
            const agencyDataToIncrement: any = {};
            if (type === 'whatsapp') agencyDataToIncrement.whatsappClicks = { increment: 1 };
            if (type === 'call') agencyDataToIncrement.callClicks = { increment: 1 };
            if (type === 'view') agencyDataToIncrement.views = { increment: 1 };

            await prisma.business.update({
                where: { id: agencyId },
                data: agencyDataToIncrement
            }).catch(() => null);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
