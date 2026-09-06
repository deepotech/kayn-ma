import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser as getServerUser } from '@/lib/server-auth';
import { auth } from '@/lib/firebase-admin';

export interface AuthenticatedUser {
    id: string;
    firebaseUid: string;
    email: string;
    role: string;
}

/**
 * Get authenticated user from Authorization header (Bearer token) or Session Cookie
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
    try {
        let firebaseUid: string | null = null;
        let email: string | null = null;

        // 1. Check Authorization Bearer header if request is provided
        if (request) {
            const authHeader = request.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.substring(7).trim();
                if (token) {
                    try {
                        const decoded = await auth.verifyIdToken(token);
                        firebaseUid = decoded.uid;
                        email = decoded.email || null;
                    } catch (err) {
                        console.warn('[agency-auth] Bearer token verification failed:', err);
                    }
                }
            }
        }

        // 2. Fallback to session cookie
        if (!firebaseUid) {
            const sessionUser = await getServerUser();
            if (sessionUser) {
                firebaseUid = sessionUser.uid;
                email = sessionUser.email || null;
            }
        }

        if (!firebaseUid) {
            return null;
        }

        // 3. Find or sync user in PostgreSQL
        let dbUser = await prisma.user.findUnique({
            where: { firebaseUid }
        });

        if (!dbUser && email) {
            dbUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });
            if (dbUser) {
                dbUser = await prisma.user.update({
                    where: { id: dbUser.id },
                    data: { firebaseUid }
                });
            }
        }

        if (!dbUser) {
            try {
                dbUser = await prisma.user.create({
                    data: {
                        firebaseUid,
                        email: (email || `${firebaseUid}@cayn.ma`).toLowerCase(),
                        role: 'user'
                    }
                });
            } catch {
                dbUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { firebaseUid },
                            ...(email ? [{ email: email.toLowerCase() }] : [])
                        ]
                    }
                });
            }
        }

        if (!dbUser) return null;

        return {
            id: dbUser.id,
            firebaseUid: dbUser.firebaseUid,
            email: dbUser.email,
            role: dbUser.role
        };
    } catch (error) {
        console.error('[agency-auth] Authentication error:', error);
        return null;
    }
}

/**
 * Get agency owned by the specified user ID
 */
export async function getAgencyForUser(userId: string) {
    return prisma.business.findFirst({
        where: { ownerId: userId },
        include: {
            city: true,
            vehicles: {
                orderBy: [
                    { order: 'asc' },
                    { createdAt: 'desc' }
                ]
            }
        }
    });
}
