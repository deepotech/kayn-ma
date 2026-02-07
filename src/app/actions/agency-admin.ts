'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import RentAgency from '@/models/RentAgency';
import { verifyAdminRole } from '@/app/actions/admin';
import { getCurrentUser } from '@/lib/server-auth';

// Helper for auth check
async function checkAdminAuth() {
    const user = await getCurrentUser();
    if (!user || !user.email) {
        throw new Error('Unauthorized');
    }
    const { isAdmin } = await verifyAdminRole(user.email);
    if (!isAdmin) {
        throw new Error('Forbidden: Admin access required');
    }
    return user;
}

export async function updateAgencyStatus(id: string, status: 'active' | 'pending' | 'suspended' | 'rejected') {
    try {
        await checkAdminAuth();
        await dbConnect();

        await RentAgency.findByIdAndUpdate(id, { status });

        revalidatePath('/[locale]/admin/agencies');
        revalidatePath('/[locale]/rent-agencies'); // Clear cache for public pages
        return { success: true };
    } catch (error) {
        console.error('Error updating status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function deleteAgency(id: string) {
    try {
        await checkAdminAuth();
        await dbConnect();

        await RentAgency.findByIdAndDelete(id);

        revalidatePath('/[locale]/admin/agencies');
        revalidatePath('/[locale]/rent-agencies');
        return { success: true };
    } catch (error) {
        console.error('Error deleting agency:', error);
        return { success: false, error: 'Failed to delete agency' };
    }
}

export async function updateAgency(id: string, data: Partial<any>) {
    try {
        await checkAdminAuth();
        await dbConnect();

        // Prevent updating sensitive fields if necessary (none for now)
        await RentAgency.findByIdAndUpdate(id, data);

        revalidatePath('/[locale]/admin/agencies');
        revalidatePath('/[locale]/rent-agencies');
        return { success: true };
    } catch (error) {
        console.error('Error updating agency:', error);
        return { success: false, error: 'Failed to update agency' };
    }
}

export async function createAgency(data: any) {
    try {
        await checkAdminAuth();
        await dbConnect();

        // Ensure status is pending or active based on input/default?
        // If created by admin, default active
        await RentAgency.create({ ...data, status: data.status || 'active' });

        revalidatePath('/[locale]/admin/agencies');
        revalidatePath('/[locale]/rent-agencies');
        return { success: true };
    } catch (error) {
        console.error('Error creating agency:', error);
        return { success: false, error: 'Failed to create agency' };
    }
}
