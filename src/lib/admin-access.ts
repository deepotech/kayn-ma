import { getCurrentUser } from '@/lib/server-auth';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';

export async function requireAdminAccess() {
    const user = await getCurrentUser();
    if (!user?.uid) {
        redirect('/login');
    }

    const dbUser = await prisma.user.findUnique({
        where: { firebaseUid: user.uid }
    });

    if (!dbUser || dbUser.role !== 'admin' || dbUser.isBanned) {
        redirect('/');
    }

    return dbUser;
}

export async function verifyAdminAction() {
    const user = await getCurrentUser();
    if (!user?.uid) {
        throw new Error('Unauthorized');
    }

    const dbUser = await prisma.user.findUnique({
        where: { firebaseUid: user.uid }
    });

    if (!dbUser || dbUser.role !== 'admin' || dbUser.isBanned) {
        throw new Error('Forbidden: Admin access required');
    }

    return dbUser;
}
