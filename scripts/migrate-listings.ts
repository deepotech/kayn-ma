import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define the old schema interface to read data
// We don't import the model because it might have the NEW schema strict types
const listingSchema = new mongoose.Schema({}, { strict: false });
const RawListing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Simple slugify for migration (duplicated for standalone script)
function slugify(text: string): string {
    if (!text) return '';
    return text.toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function normalize(label: string, custom?: string) {
    const finalLabel = (custom && label === 'other') ? custom : (label || 'unknown');
    return {
        label: finalLabel,
        slug: slugify(finalLabel)
    };
}

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        const listings = await RawListing.find({});
        console.log(`Found ${listings.length} listings to process.`);

        let updatedCount = 0;
        let errorsCount = 0;
        let alreadyNormalizedCount = 0;

        for (const doc of listings) {
            try {
                const updates: any = {};
                let needsUpdate = false;

                // 1. Status Migration
                // If status is 'published', change to 'active' or keep 'published' if we want backward compat?
                // The new schema says 'active' is default, but 'published' is allowed.
                // Let's standardize to 'active' for consistency with the user plan.
                if (doc.status === 'published') {
                    updates.status = 'active';
                    needsUpdate = true;
                } else if (!doc.status) {
                    updates.status = doc.publishedAt ? 'active' : 'paused';
                    needsUpdate = true;
                }

                // 2. Normalize Brand
                if (typeof doc.brand === 'string') {
                    updates.brand = normalize(doc.brand, doc.brandCustom);
                    needsUpdate = true;
                } else if (doc.brand && doc.brand.slug && doc.brand.label) {
                    // Already normalized
                }

                // 3. Normalize Model
                if (typeof doc.carModel === 'string') {
                    updates.carModel = normalize(doc.carModel, doc.modelCustom);
                    needsUpdate = true;
                } else if (typeof doc.model === 'string') { // Old field name check
                    updates.carModel = normalize(doc.model, doc.modelCustom);
                    needsUpdate = true;
                }

                // 4. Normalize City
                if (typeof doc.city === 'string') {
                    updates.city = normalize(doc.city, doc.cityCustom);
                    needsUpdate = true;
                }

                // 5. Normalize BodyType
                if (typeof doc.bodyType === 'string') {
                    updates.bodyType = normalize(doc.bodyType);
                    needsUpdate = true;
                }

                // 6. Ensure publishedAt exists for active listings
                if ((updates.status === 'active' || doc.status === 'active' || doc.status === 'published') && !doc.publishedAt) {
                    updates.publishedAt = doc.createdAt || new Date();
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    // Unset old fields to clean up
                    const unset: any = {};
                    if (doc.brandSlug) unset.brandSlug = 1;
                    if (doc.modelSlug) unset.modelSlug = 1;
                    if (doc.bodyTypeSlug) unset.bodyTypeSlug = 1;

                    // console.log(`Updating ${doc._id}:`, updates);

                    await RawListing.updateOne(
                        { _id: doc._id },
                        {
                            $set: updates,
                            $unset: unset
                        }
                    );
                    updatedCount++;
                } else {
                    alreadyNormalizedCount++;
                }

                process.stdout.write(`\rProcessed: ${updatedCount + alreadyNormalizedCount}/${listings.length}`);

            } catch (err) {
                console.error(`\nError processing ${doc._id}:`, err);
                errorsCount++;
            }
        }

        console.log('\n\nMutation Complete.');
        console.log(`Updated: ${updatedCount}`);
        console.log(`Already Normalized / Skipped: ${alreadyNormalizedCount}`);
        console.log(`Errors: ${errorsCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
