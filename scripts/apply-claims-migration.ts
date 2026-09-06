import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/db';

async function main() {
    console.log('=== PREPARING TO APPLY AGENCY CLAIM MIGRATION ===\n');

    const migrationFile = path.join(
        process.cwd(),
        'prisma',
        'migrations',
        '20260906171500_add_agency_claims',
        'migration.sql'
    );

    if (!fs.existsSync(migrationFile)) {
        throw new Error(`Migration file not found at: ${migrationFile}`);
    }

    const sqlContent = fs.readFileSync(migrationFile, 'utf-8');
    console.log(`Migration SQL file loaded (${sqlContent.length} bytes).\n`);

    // Verify existing tables before execution
    const checkBefore = await prisma.$queryRawUnsafe<any[]>(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'AgencyClaim';
    `);

    if (checkBefore.length > 0) {
        console.log('⚠ Table "AgencyClaim" already exists in the database. Aborting to prevent duplicate application.');
        return;
    }

    console.log('Applying migration inside atomic transaction...');

    await prisma.$transaction(async (tx) => {
        // Split statements safely and execute
        const statements = sqlContent
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        for (const statement of statements) {
            console.log(`> Executing: ${statement.substring(0, 60)}...`);
            await tx.$executeRawUnsafe(statement);
        }
    });

    console.log('\n✔ Migration applied successfully within atomic transaction!');

    // Verify post-migration state
    const checkAfter = await prisma.$queryRawUnsafe<any[]>(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'AgencyClaim';
    `);

    const enumCheck = await prisma.$queryRawUnsafe<any[]>(`
        SELECT typname 
        FROM pg_type 
        WHERE typname = 'AgencyClaimStatus';
    `);

    const indexCheck = await prisma.$queryRawUnsafe<any[]>(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'AgencyClaim';
    `);

    console.log('\n=== VERIFICATION RESULTS ===');
    console.log(`- Table "AgencyClaim" created: ${checkAfter.length > 0}`);
    console.log(`- Enum "AgencyClaimStatus" created: ${enumCheck.length > 0}`);
    console.log(`- Indexes created on "AgencyClaim": ${indexCheck.map((i) => i.indexname).join(', ')}`);
}

main()
    .catch((err) => {
        console.error('❌ Migration failed and rolled back:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
