'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function verifyAdminRole(email: string) {
    if (!email) return { isAdmin: false, role: null };

    try {
        await dbConnect();
        // Case insensitive email check
        const user = await User.findOne({
            email: { $regex: new RegExp(`^${email}$`, 'i') }
        }).select('role').lean();

        if (!user) {
            console.log(`[AdminCheck] User not found: ${email}`);
            return { isAdmin: false, role: null };
        }

        const isAdmin = user.role === 'admin' || user.role === 'moderator';
        console.log(`[AdminCheck] ${email} is ${isAdmin ? 'ALLOWED' : 'DENIED'} (Role: ${user.role})`);

        return {
            isAdmin,
            role: user.role
        };
    } catch (error) {
        console.error('[AdminCheck] Error:', error);
        return { isAdmin: false, role: null };
    }
}
