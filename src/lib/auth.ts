import { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/db';

export interface AuthUser {
    uid: string;
    email: string;
    role: 'user' | 'moderator' | 'admin';
    isBanned: boolean;
    dbUserId: string;
}

/**
 * Verify Firebase token from request headers (or session cookie) and get user data from PostgreSQL
 */
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
    try {
        const authHeader = request.headers.get('authorization');
        let uid: string | null = null;
        let email: string | null = null;
        let name: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            if (token) {
                if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_TEST_AUTH === '1' && token.startsWith('test:')) {
                    uid = token.substring(5);
                    email = `${uid}@cayn.ma`;
                    name = uid;
                } else {
                    const decodedToken = await auth.verifyIdToken(token);
                    uid = decodedToken.uid;
                    email = decodedToken.email || null;
                    name = decodedToken.name || null;
                }
            }
        }

        // Fallback to session cookie if no Bearer token
        if (!uid) {
            const sessionCookie = request.cookies.get('session')?.value;
            if (sessionCookie) {
                try {
                    const decodedSession = await auth.verifySessionCookie(sessionCookie, true);
                    uid = decodedSession.uid;
                    email = decodedSession.email || null;
                    name = decodedSession.name || null;
                } catch {
                    // Session cookie invalid or expired
                }
            }
        }

        if (!uid) {
            return null;
        }

        // Query user from PostgreSQL via Prisma
        let dbUser = await prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (!dbUser && email) {
            dbUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });
            if (dbUser) {
                dbUser = await prisma.user.update({
                    where: { id: dbUser.id },
                    data: { firebaseUid: uid }
                });
            }
        }

        if (!dbUser) {
            try {
                dbUser = await prisma.user.create({
                    data: {
                        firebaseUid: uid,
                        email: (email || `${uid}@placeholder.cayn.ma`).toLowerCase(),
                        displayName: name || '',
                        role: 'user',
                        isBanned: false,
                    }
                });
            } catch {
                dbUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { firebaseUid: uid },
                            ...(email ? [{ email: email.toLowerCase() }] : [])
                        ]
                    }
                });
            }
        }

        if (!dbUser) {
            return null;
        }

        const isBanned = Boolean(dbUser.isBanned);
        const userEmail = email || dbUser.email || '';
        const role: 'user' | 'moderator' | 'admin' = dbUser.role === 'admin'
            ? 'admin'
            : (dbUser.role === 'moderator' ? 'moderator' : 'user');

        return {
            uid,
            email: userEmail,
            role,
            isBanned,
            dbUserId: dbUser.id,
        };
    } catch (error: unknown) {
        console.error('[verifyAuth] Auth verification failed:', error);
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
 * Strictly require admin role (not moderator) for sensitive management actions
 */
export async function requireStrictAdmin(request: NextRequest): Promise<{ user: AuthUser } | { error: string; status: number }> {
    const user = await verifyAuth(request);

    if (!user) {
        return { error: 'Unauthorized. Admin authentication required.', status: 401 };
    }

    if (user.isBanned) {
        return { error: 'Forbidden. Account is banned.', status: 403 };
    }

    if (user.role !== 'admin') {
        return { error: 'Forbidden. Strictly admin access required.', status: 403 };
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
