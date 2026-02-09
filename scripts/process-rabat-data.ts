/**
 * Rabat Data Processing Script
 * 
 * This script:
 * 1. Reads raw Rabat JSON data
 * 2. Cleans and deduplicates entries
 * 3. Filters entries with missing phone or category
 * 4. Normalizes categories to: "Car Rental Agency" or "Used Car Dealer"
 * 5. Generates SEO-ready slugs
 * 6. Outputs cleaned data ready for MongoDB seeding
 */

import fs from 'fs';
import path from 'path';

// Category normalization mapping
const CATEGORY_MAP: Record<string, string> = {
    // English variations
    'car rental agency': 'Car Rental Agency',
    'car rental': 'Car Rental Agency',
    'rent a car': 'Car Rental Agency',
    'vehicle rental': 'Car Rental Agency',
    'auto rental': 'Car Rental Agency',

    'used car dealer': 'Used Car Dealer',
    'used car dealership': 'Used Car Dealer',
    'car dealer': 'Used Car Dealer',
    'auto dealer': 'Used Car Dealer',
    'car dealership': 'Used Car Dealer',

    // Arabic variations (from Marrakech data)
    'وكالة تأجير السيارات': 'Car Rental Agency',
    'تأجير سيارات': 'Car Rental Agency',
    'كراء السيارات': 'Car Rental Agency',

    'بيع السيارات المستعملة': 'Used Car Dealer',
    'تاجر سيارات مستعملة': 'Used Car Dealer',
    'معرض سيارات': 'Used Car Dealer',
};

// Valid categories we want to keep
const VALID_CATEGORIES = ['Car Rental Agency', 'Used Car Dealer'];

interface RawAgency {
    title: string;
    address: string;
    phone: string | null;
    website?: string | null;
    location: { lat: number; lng: number };
    categories: string[];
    categoryName: string;
    city: string;
    imageUrl?: string | null;
    imageUrls?: string[];
    reviews?: any[];
    openingHours?: any[];
    placeId?: string;
}

interface CleanedAgency {
    name: string;
    slug: string;
    city: string;
    address: string;
    phone: string | null;
    website: string | null;
    location: { lat: number; lng: number };
    categories: string[];
    rating: number | null;
    reviewsCount: number | null;
    photos: string[];
    source: 'apify';
    status: 'active';
    claimed: boolean;
}

function generateSlug(name: string, city: string): string {
    const cleanName = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .trim();

    const cleanCity = city.toLowerCase().replace(/\s+/g, '-');

    return `${cleanName}-${cleanCity}`.slice(0, 100); // Limit slug length
}

function normalizeCategory(categoryName: string): string | null {
    const normalized = categoryName.toLowerCase().trim();

    // Direct match
    if (CATEGORY_MAP[normalized]) {
        return CATEGORY_MAP[normalized];
    }

    // Partial match
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }

    return null; // Invalid category
}

function calculateRating(reviews: any[]): number | null {
    if (!reviews || reviews.length === 0) return null;

    const validReviews = reviews.filter(r => r.stars && typeof r.stars === 'number');
    if (validReviews.length === 0) return null;

    const sum = validReviews.reduce((acc, r) => acc + r.stars, 0);
    return Math.round((sum / validReviews.length) * 10) / 10; // Round to 1 decimal
}

function cleanPhone(phone: string | null): string | null {
    if (!phone) return null;

    // Remove extra spaces and normalize format
    return phone.replace(/\s+/g, ' ').trim();
}

function processRabatData() {
    const inputPath = path.join(__dirname, '../data/rabat.json');
    const outputPath = path.join(__dirname, '../data/rabat-cleaned.json');

    console.log('📖 Reading Rabat data...');
    const rawData: RawAgency[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    console.log(`   Found ${rawData.length} raw entries`);

    const seenPlaceIds = new Set<string>();
    const seenNames = new Set<string>();
    const cleaned: CleanedAgency[] = [];

    let skippedNoPhone = 0;
    let skippedNoCategory = 0;
    let skippedDuplicate = 0;
    let skippedInvalidCategory = 0;

    for (const agency of rawData) {
        // Skip if no phone
        if (!agency.phone) {
            skippedNoPhone++;
            continue;
        }

        // Skip if no category
        if (!agency.categoryName && (!agency.categories || agency.categories.length === 0)) {
            skippedNoCategory++;
            continue;
        }

        // Deduplicate by placeId
        if (agency.placeId && seenPlaceIds.has(agency.placeId)) {
            skippedDuplicate++;
            continue;
        }

        // Deduplicate by name (case-insensitive)
        const normalizedName = agency.title.toLowerCase().trim();
        if (seenNames.has(normalizedName)) {
            skippedDuplicate++;
            continue;
        }

        // Normalize category
        const primaryCategory = agency.categoryName || agency.categories[0];
        const normalizedCategory = normalizeCategory(primaryCategory);

        if (!normalizedCategory || !VALID_CATEGORIES.includes(normalizedCategory)) {
            skippedInvalidCategory++;
            continue;
        }

        // Mark as seen
        if (agency.placeId) seenPlaceIds.add(agency.placeId);
        seenNames.add(normalizedName);

        // Build cleaned entry
        const cleanedAgency: CleanedAgency = {
            name: agency.title.trim(),
            slug: generateSlug(agency.title, 'rabat'),
            city: 'rabat', // Normalize city name
            address: agency.address || '',
            phone: cleanPhone(agency.phone),
            website: agency.website || null,
            location: agency.location,
            categories: [normalizedCategory],
            rating: calculateRating(agency.reviews || []),
            reviewsCount: agency.reviews?.length || 0,
            photos: agency.imageUrls || (agency.imageUrl ? [agency.imageUrl] : []),
            source: 'apify',
            status: 'active',
            claimed: false,
        };

        cleaned.push(cleanedAgency);
    }

    console.log('\n📊 Processing Summary:');
    console.log(`   ✅ Valid agencies: ${cleaned.length}`);
    console.log(`   ❌ Skipped (no phone): ${skippedNoPhone}`);
    console.log(`   ❌ Skipped (no category): ${skippedNoCategory}`);
    console.log(`   ❌ Skipped (duplicate): ${skippedDuplicate}`);
    console.log(`   ❌ Skipped (invalid category): ${skippedInvalidCategory}`);

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    for (const agency of cleaned) {
        const cat = agency.categories[0];
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }

    console.log('\n📁 Category Breakdown:');
    for (const [cat, count] of Object.entries(categoryCount)) {
        console.log(`   ${cat}: ${count}`);
    }

    // Save cleaned data
    fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2), 'utf-8');
    console.log(`\n💾 Saved cleaned data to: ${outputPath}`);

    return cleaned;
}

// Run if executed directly
processRabatData();
