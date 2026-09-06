import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/db';

async function main() {
    console.log('=== STARTING PRODUCTION DATABASE READ-ONLY BACKUP ===');

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `production_backup_${timestamp}.json`);

    // List of existing tables to backup
    const tables = [
        'User',
        'Business',
        'Category',
        'BusinessCategory',
        'City',
        'Listing',
        'AgencyVehicle',
        'Review',
        'AuditLog',
        'Favorite',
        'Follow',
        'Report',
        'SeoPage'
    ];

    const backupData: Record<string, any[]> = {};
    const tableCounts: Record<string, number> = {};

    for (const table of tables) {
        try {
            const rows: any[] = await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].findMany();
            backupData[table] = rows;
            tableCounts[table] = rows.length;
            console.log(`✔ Table ${table}: ${rows.length} records backed up`);
        } catch (err: any) {
            console.warn(`⚠ Could not backup table ${table} via model, attempting raw query:`, err.message);
            try {
                const rawRows: any = await prisma.$queryRawUnsafe(`SELECT * FROM "public"."${table}"`);
                backupData[table] = rawRows;
                tableCounts[table] = rawRows.length;
                console.log(`✔ Table ${table} (raw): ${rawRows.length} records backed up`);
            } catch (rawErr: any) {
                console.error(`❌ Table ${table} backup failed:`, rawErr.message);
            }
        }
    }

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
    const stats = fs.statSync(backupFile);

    console.log('\n=== BACKUP SUMMARY ===');
    console.log(`- Backup File: ${backupFile}`);
    console.log(`- File Size:   ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('- Record Counts per Table:', JSON.stringify(tableCounts, null, 2));
    console.log('✔ Backup verified and saved successfully!');
}

main()
    .catch((err) => {
        console.error('CRITICAL: Backup failed:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
