'use server';

import prisma from '@/lib/db';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function verifyAdminRole(email: string) {
    if (!email) return { isAdmin: false, role: null };

    try {
        const dbUser = await prisma.user.findFirst({
            where: {
                email: { equals: email.trim(), mode: 'insensitive' }
            }
        });

        if (dbUser) {
            const isAdmin = dbUser.role === 'admin' && !dbUser.isBanned;
            return {
                isAdmin,
                role: dbUser.role
            };
        }

        await dbConnect();
        const user = await User.findOne({
            email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
        }).select('role isBanned').lean();

        if (!user) {
            return { isAdmin: false, role: null };
        }

        const isUserBanned = Boolean('isBanned' in user && user.isBanned);
        const isAdmin = user.role === 'admin' && !isUserBanned;
        return {
            isAdmin,
            role: user.role
        };
    } catch (error: unknown) {
        console.error('[AdminCheck] Error:', error);
        return { isAdmin: false, role: null };
    }
}
