import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
        }

        // Verify the ID token using Firebase Admin
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();

        // Update or create user in PostgreSQL via Prisma
        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (!user) {
            user = await prisma.user.findUnique({
                where: { email: normalizedEmail }
            });
            if (user) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        firebaseUid: uid,
                        displayName: name || user.displayName
                    }
                });
            }
        }

        if (!user) {
            try {
                user = await prisma.user.create({
                    data: {
                        firebaseUid: uid,
                        email: normalizedEmail,
                        displayName: name || '',
                        role: 'user',
                        isBanned: false,
                    }
                });
            } catch {
                user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { firebaseUid: uid },
                            { email: normalizedEmail }
                        ]
                    }
                });
            }
        }

        // Create a session cookie if credentials permit
        try {
            const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
            const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

            const cookieOptions: any = {
                maxAge: expiresIn,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                sameSite: 'lax',
            };

            if (process.env.COOKIE_DOMAIN) {
                cookieOptions.domain = process.env.COOKIE_DOMAIN;
            }

            cookies().set('session', sessionCookie, cookieOptions);
        } catch (cookieErr: any) {
            console.warn('[API/Session] Session cookie creation skipped:', cookieErr?.message);
        }

        const userRole = user?.role || 'user';
        console.log(`[API/Session] Session sync success for ${normalizedEmail} (Role: ${userRole})`);

        return NextResponse.json({ status: 'success', role: userRole }, { status: 200 });
    } catch (error) {
        console.error('[API/Session] Error creating session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
