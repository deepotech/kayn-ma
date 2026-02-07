
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    role: { type: String, required: true },
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function setAdmin() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        const email = 'dev23hecoplus93mor@gmail.com';
        const normalizedEmail = email.toLowerCase();

        const result = await User.findOneAndUpdate(
            { email: normalizedEmail },
            { $set: { role: 'admin' } },
            { new: true }
        );

        if (result) {
            console.log(`Successfully updated role to ADMIN for user: ${email}`);
            console.log('User details:', result);
        } else {
            console.error(`User with email ${email} not found. Please log in first to create the user record.`);
        }

    } catch (error) {
        console.error('Error setting admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

setAdmin();
