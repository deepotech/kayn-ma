import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let auth: Auth;

// Initialize Firebase Admin with environment variables or service account
function initializeFirebaseAdmin() {
    if (getApps().length === 0) {
        // Option 1: Use FIREBASE_SERVICE_ACCOUNT_KEY JSON blob (Recommended for Vercel)
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccountKey) {
            try {
                const parsed = JSON.parse(serviceAccountKey);
                app = initializeApp({
                    credential: cert(parsed),
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
                return { app, auth: getAuth(app) };
            } catch (e) {
                console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
            }
        }

        // Option 2: Use individual environment variables (Fallback)
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle escaped newlines

        if (projectId && clientEmail && privateKey) {
            app = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                projectId,
            });
        } else {
            console.error('Firebase Admin: Missing credentials. Please set FIREBASE_SERVICE_ACCOUNT_KEY or (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
            // Allow app to crash or initialize in a limited state if desired, but better to fail fast for admin tools
            // For now, init with default application credentials (ADC) as last resort
            app = initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
        }
    } else {
        app = getApps()[0];
    }

    auth = getAuth(app);
    return { app, auth };
}

// Initialize on module load
const initialized = initializeFirebaseAdmin();
app = initialized.app;
auth = initialized.auth;

export { app, auth };
