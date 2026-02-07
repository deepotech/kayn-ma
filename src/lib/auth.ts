import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import dbConnect from '@/lib/db';
import User, { IUser } from '@/models/User';

export interface AuthUser {
    uid: string;
    email: string;
    role: 'user' | 'moderator' | 'admin';
    isBanned: boolean;
}

/**
 * Verify Firebase token from request headers and get user data
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const decodedToken = await auth.verifyIdToken(token);

        // Get or create user in our database
        await dbConnect();
        let user = await User.findOne({ firebaseUid: decodedToken.uid }).lean() as IUser | null;

        if (!user) {
            // Create new user record (lazy creation)
            user = await User.create({
                firebaseUid: decodedToken.uid,
                email: decodedToken.email || '',
                displayName: decodedToken.name || '',
                role: 'user',
                isBanned: false,
            });
        }

        return {
            uid: decodedToken.uid,
            email: decodedToken.email || user.email,
            role: (process.env.ADMIN_EMAIL && (decodedToken.email === process.env.ADMIN_EMAIL || user.email === process.env.ADMIN_EMAIL)) ? 'admin' : user.role,
            isBanned: user.isBanned,
        };
    } catch (error) {
        console.error('Auth verification failed:', error);
        return null;
    }
}

/**
 * Verify that user has admin or moderator role
 */
export async function requireAdmin(request: NextRequest): Promise<{ user: AuthUser } | { error: string; status: number }> {
    const user = await verifyAuth(request);

    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }

    if (user.isBanned) {
        return { error: 'Account is banned', status: 403 };
    }

    if (!['admin', 'moderator'].includes(user.role)) {
        return { error: 'Forbidden - Admin access required', status: 403 };
    }

    return { user };
}

/**
 * Get current user ID from request (for non-protected routes)
 */
export async function getCurrentUserId(request: NextRequest): Promise<string | null> {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken.uid;
    } catch {
        return null;
    }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';
}
