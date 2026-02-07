

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env.local parser to avoid dependencies
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            process.env[key] = value;
        }
    });
}

// Setup Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

console.log('--- Firebase Admin Diagnostic ---');

if (!serviceAccount) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing from .env.local');
    process.exit(1);
}

try {
    console.log('1. Parsing Service Account Key...');
    const parsed = JSON.parse(serviceAccount);
    console.log('✅ JSON Parse Successful');
    console.log(`   - Project ID: ${parsed.project_id}`);
    console.log(`   - Client Email: ${parsed.client_email}`);

    console.log('2. Initializing App...');
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(parsed)
        });
    }
    console.log('✅ App Initialized');

    console.log('3. Testing Connectivity (Listing Users)...');
    admin.auth().listUsers(1)
        .then((listUsersResult) => {
            console.log('✅ Connection Successful!');
            console.log(`   - Successfully retrieved ${listUsersResult.users.length} user(s).`);
            console.log('--- Diagnosis Complete: SUCCESS ---');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Connection Failed:', error.code);
            console.error('   - Message:', error.message);
            console.log('--- Diagnosis Complete: FAILURE ---');
            process.exit(1);
        });

} catch (error: any) {
    console.error('❌ Initialization Failed');
    console.error('   - Error:', error.message);
    process.exit(1);
}
