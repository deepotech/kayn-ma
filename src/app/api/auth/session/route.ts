import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import dbConnect from '@/lib/db';
import User from '@/models/User';

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

        // Connect to DB and upsert user
        await dbConnect();

        // Prepare user data
        const updateData: any = {
            email: normalizedEmail,
            lastLoginAt: new Date(),
        };

        if (name) updateData.displayName = name;
        if (picture) updateData.photoURL = picture;

        // Update or create user in MongoDB
        // Default role is 'user'. Admin role must be set manually or via seed script.
        const user = await User.findOneAndUpdate(
            { firebaseUid: uid },
            {
                $set: updateData,
                $setOnInsert: {
                    role: 'user',
                    createdAt: new Date()
                }
            },
            { upsert: true, new: true }
        );

        // Create a session cookie
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

        // Set the cookie with strict security options
        cookies().set('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        });

        console.log(`[API/Session] Session created for ${normalizedEmail} (Role: ${user.role})`);

        return NextResponse.json({ status: 'success', role: user.role }, { status: 200 });
    } catch (error) {
        console.error('[API/Session] Error creating session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
