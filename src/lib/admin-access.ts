import { getCurrentUser } from '@/lib/server-auth';
import { verifyAdminRole } from '@/app/actions/admin';
import { redirect } from 'next/navigation';

export async function requireAdminAccess() {
    const user = await getCurrentUser();
    if (!user?.email) {
        redirect('/login');
    }

    const { isAdmin } = await verifyAdminRole(user.email);
    if (!isAdmin) {
        redirect('/');
    }

    return user;
}

export async function verifyAdminAction() {
    const user = await getCurrentUser();
    if (!user?.email) {
        throw new Error('Unauthorized');
    }

    const { isAdmin } = await verifyAdminRole(user.email);
    if (!isAdmin) {
        throw new Error('Forbidden');
    }

    return user;
}
