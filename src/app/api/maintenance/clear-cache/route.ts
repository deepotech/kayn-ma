import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        // Revalidate all key pages 
        revalidatePath('/', 'layout'); // Clear everything
        revalidatePath('/cars');
        revalidatePath('/fr/cars');
        revalidatePath('/ar/cars');

        // Specific ones to be safe
        revalidatePath('/cars/sedan');
        revalidatePath('/fr/cars/sedan');
        revalidatePath('/ar/cars/sedan');

        revalidatePath('/cars/dacia');
        revalidatePath('/fr/cars/dacia');
        revalidatePath('/ar/cars/dacia');

        return NextResponse.json({ success: true, message: "Cache cleared for all major routes." });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
