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

        // Create a session cookie (mandatory for server-side auth)
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        let sessionCookie: string;
        try {
            sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
        } catch (cookieErr: unknown) {
            const errMessage = cookieErr instanceof Error ? cookieErr.message : 'Unknown session cookie error';
            console.error('[API/Session] Failed to create session cookie:', errMessage);
            return NextResponse.json(
                { error: 'Failed to establish secure session' },
                { status: 500 }
            );
        }

        const cookieOptions: {
            maxAge: number;
            httpOnly: boolean;
            secure: boolean;
            path: string;
            sameSite: 'lax' | 'strict' | 'none';
            domain?: string;
        } = {
            maxAge: expiresIn / 1000, // 5 days in seconds (Next.js maxAge expects seconds)
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        };

        if (process.env.COOKIE_DOMAIN) {
            cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }

        cookies().set('session', sessionCookie, cookieOptions);

        const userRole = user?.role || 'user';
        console.log(`[API/Session] Session established successfully for user (Role: ${userRole})`);

        return NextResponse.json({ status: 'success', role: userRole }, { status: 200 });
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[API/Session] Error establishing session:', errMessage);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
