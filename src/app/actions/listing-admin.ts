'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { verifyAdminAction } from '@/lib/admin-access';

export async function approveListing(id: string) {
    try {
        const user = await verifyAdminAction();

        await prisma.listing.update({
            where: { id },
            data: {
                status: 'approved',
                publishedAt: new Date(),
                moderatedBy: user.email,
                lastModeratedAt: new Date()
            }
        });

        revalidatePath('/[locale]/admin/listings');
        return { success: true };
    } catch (error) {
        console.error('Error approving listing:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function rejectListing(id: string, reason?: string) {
    try {
        const user = await verifyAdminAction();

        await prisma.listing.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectionReason: reason || null,
                moderatedBy: user.email,
                lastModeratedAt: new Date()
            }
        });

        revalidatePath('/[locale]/admin/listings');
        return { success: true };
    } catch (error) {
        console.error('Error rejecting listing:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function deleteListing(id: string) {
    try {
        await verifyAdminAction();

        await prisma.listing.delete({
            where: { id }
        });

        revalidatePath('/[locale]/admin/listings');
        return { success: true };
    } catch (error) {
        console.error('Error deleting listing:', error);
        return { success: false, error: 'Failed' };
    }
}

