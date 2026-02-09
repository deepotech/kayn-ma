import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// Lazy loading wrapper to prevent build-time initialization errors
// Firebase Admin should only initialize when actually used at runtime, not during build.

let initializedApp: App | undefined;
let initializedAuth: Auth | undefined;

function getFirebaseAdmin(): { app: App; auth: Auth } {
    if (initializedApp && initializedAuth) {
        return { app: initializedApp, auth: initializedAuth };
    }

    // Safety check: if already initialized by another call
    if (getApps().length > 0) {
        initializedApp = getApps()[0];
        initializedAuth = getAuth(initializedApp);
        return { app: initializedApp, auth: initializedAuth };
    }

    console.log('[Firebase Admin] Initializing...');

    // Option 1: Use FIREBASE_SERVICE_ACCOUNT_KEY JSON blob (Recommended for Vercel/Railway)
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
        try {
            const parsed = JSON.parse(serviceAccountKey);
            initializedApp = initializeApp({
                credential: cert(parsed),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
            initializedAuth = getAuth(initializedApp);
            console.log('[Firebase Admin] Initialized with Service Account JSON');
            return { app: initializedApp, auth: initializedAuth };
        } catch (e) {
            console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
            // Fallthrough to Option 2
        }
    }

    // Option 2: Use individual environment variables (Fallback)
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle escaped newlines

    if (projectId && clientEmail && privateKey) {
        initializedApp = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
            projectId,
        });
        initializedAuth = getAuth(initializedApp);
        console.log('[Firebase Admin] Initialized with Individual Env Vars');
        return { app: initializedApp, auth: initializedAuth };
    }

    // Error Handling - Missing credentials
    const missingVars = [];
    if (!serviceAccountKey) missingVars.push('FIREBASE_SERVICE_ACCOUNT_KEY');
    if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');

    const errorMsg = `[Firebase Admin] Missing credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY or (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Missing: ${missingVars.join(', ')}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
}

// Use Proxies for lazy loading - prevents build-time initialization
// The actual initialization only happens when a property is accessed at runtime
const app = new Proxy({} as App, {
    get: (_target, prop) => {
        const { app } = getFirebaseAdmin();
        return (app as any)[prop];
    }
});

const auth = new Proxy({} as Auth, {
    get: (_target, prop) => {
        const { auth } = getFirebaseAdmin();
        return (auth as any)[prop];
    }
});

export { app, auth };
