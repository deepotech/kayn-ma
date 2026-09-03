import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/db';

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
        const hasAuthHeader = Boolean(authHeader);
        const startsWithBearer = Boolean(authHeader?.startsWith('Bearer '));

        console.log(`[verifyAuth] Header check: present=${hasAuthHeader}, startsWithBearer=${startsWithBearer}`);

        if (!authHeader || !startsWithBearer) {
            console.log('[verifyAuth] Rejected: Missing or non-Bearer authorization header');
            return null;
        }

        const token = authHeader.substring(7).trim();
        if (!token) {
            console.log('[verifyAuth] Rejected: Bearer token is empty');
            return null;
        }

        const decodedToken = await auth.verifyIdToken(token);
        console.log(`[verifyAuth] Token verified successfully for UID: ${decodedToken.uid}`);

        // Query user from PostgreSQL via Prisma
        let dbUser = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid }
        });

        if (!dbUser && decodedToken.email) {
            dbUser = await prisma.user.findUnique({
                where: { email: decodedToken.email.toLowerCase() }
            });
            if (dbUser) {
                dbUser = await prisma.user.update({
                    where: { id: dbUser.id },
                    data: { firebaseUid: decodedToken.uid }
                });
            }
        }

        if (!dbUser) {
            try {
                dbUser = await prisma.user.create({
                    data: {
                        firebaseUid: decodedToken.uid,
                        email: (decodedToken.email || `${decodedToken.uid}@placeholder.cayn.ma`).toLowerCase(),
                        displayName: decodedToken.name || '',
                        role: 'user',
                        isBanned: false,
                    }
                });
            } catch {
                // If parallel creation or email conflict occurred, query existing
                dbUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { firebaseUid: decodedToken.uid },
                            ...(decodedToken.email ? [{ email: decodedToken.email.toLowerCase() }] : [])
                        ]
                    }
                });
            }
        }

        const isBanned = Boolean(dbUser?.isBanned);
        const userEmail = decodedToken.email || dbUser?.email || '';
        const isAdmin = Boolean(process.env.ADMIN_EMAIL && (userEmail === process.env.ADMIN_EMAIL || decodedToken.email === process.env.ADMIN_EMAIL));
        const role: 'user' | 'moderator' | 'admin' = isAdmin
            ? 'admin'
            : ((dbUser?.role as any) || 'user');

        console.log(`[verifyAuth] Auth resolved for UID: ${decodedToken.uid}, role: ${role}, isBanned: ${isBanned}`);

        return {
            uid: decodedToken.uid,
            email: userEmail,
            role,
            isBanned,
        };
    } catch (error: any) {
        console.error('[verifyAuth] Auth verification failed:', error?.code || error?.message || error);
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

        const token = authHeader.substring(7).trim();
        if (!token) return null;

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
