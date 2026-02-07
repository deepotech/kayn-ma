'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { verifyAdminAction } from '@/lib/admin-access';

export async function approveListing(id: string) {
    try {
        const user = await verifyAdminAction();
        await dbConnect();

        await Listing.findByIdAndUpdate(id, {
            status: 'approved',
            moderatedBy: user.email,
            lastModeratedAt: new Date()
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
        await dbConnect();

        await Listing.findByIdAndUpdate(id, {
            status: 'rejected',
            rejectionReason: reason,
            moderatedBy: user.email,
            lastModeratedAt: new Date()
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
        await dbConnect();

        await Listing.findByIdAndDelete(id);

        revalidatePath('/[locale]/admin/listings');
        return { success: true };
    } catch (error) {
        console.error('Error deleting listing:', error);
        return { success: false, error: 'Failed' };
    }
}
