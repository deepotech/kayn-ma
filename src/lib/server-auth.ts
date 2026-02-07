import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase-admin';

export async function getCurrentUser() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;

    try {
        // Verify the session cookie. In this case, checkRevoked is true.
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        return {
            uid: decodedClaims.uid,
            email: decodedClaims.email,
            picture: decodedClaims.picture,
            name: decodedClaims.name,
        };
    } catch (error) {
        // likely expired or invalid
        return null;
    }
}
