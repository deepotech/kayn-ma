import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { Search } from 'lucide-react';
import ListingsTable from '@/components/admin/ListingsTable';
import Link from 'next/link';
import { requireAdminAccess } from '@/lib/admin-access';

export const dynamic = 'force-dynamic';

async function getListings(status?: string, query?: string) {
    await requireAdminAccess();

    const where: Prisma.ListingWhereInput = {};

    // Status Filter
    if (status && status !== 'all') {
        where.status = status;
    }

    // Search Filter
    if (query && query.trim()) {
        const q = query.trim();
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { sellerName: { contains: q, mode: 'insensitive' } },
            { agencyName: { contains: q, mode: 'insensitive' } },
            { brandLabel: { contains: q, mode: 'insensitive' } },
            { carModelLabel: { contains: q, mode: 'insensitive' } },
        ];
    }

    // Sort by recent first
    const rawListings = await prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            city: true,
        },
        take: 100,
    });

    return rawListings.map((l) => ({
        _id: l.id,
        id: l.id,
        title: l.title,
        price: l.price,
        currency: l.currency,
        images: Array.isArray(l.images)
            ? (l.images as Array<any>).map((img) =>
                  typeof img === 'string'
                      ? { url: img }
                      : { url: img?.url || '' }
              )
            : [],
        status: l.status as 'approved' | 'pending_review' | 'rejected' | 'paused',
        sellerName: l.sellerName || undefined,
        agencyName: l.agencyName || undefined,
        city: l.city ? { label: l.city.name } : undefined,
        createdAt: l.createdAt.toISOString(),
        publishedAt: l.publishedAt ? l.publishedAt.toISOString() : undefined,
    }));
}

export default async function AdminListingsPage({
    params,
    searchParams
}: {
    params: { locale: string },
    searchParams?: { status?: string; q?: string }
}) {
    const locale = params?.locale || 'ar';
    const isRtl = locale === 'ar';
    const status = searchParams?.status || 'all';
    const query = searchParams?.q || '';

    let listings: any[] = [];
    try {
        listings = await getListings(status, query);
    } catch (err) {
        // If NEXT_REDIRECT was thrown, let it bubble up
        if ((err as any)?.digest?.startsWith('NEXT_REDIRECT')) {
            throw err;
        }
        console.error('[AdminListingsPage Error]', err);
    }

    // Tabs
    const tabs = [
        { id: 'all', label: isRtl ? 'الكل' : 'All' },
        { id: 'pending_review', label: isRtl ? 'قيد المراجعة' : 'Pending Review' },
        { id: 'approved', label: isRtl ? 'نشطة' : 'Active' },
        { id: 'rejected', label: isRtl ? 'مرفوضة' : 'Rejected' },
        { id: 'paused', label: isRtl ? 'متوقفة' : 'Paused' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isRtl ? 'إدارة الإعلانات' : 'Listings Management'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isRtl
                            ? `مراجعة إعلانات المستخدمين. (${listings.length} نتيجة)`
                            : `Moderate user listings. (${listings.length} results)`}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                {/* Status Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    {tabs.map(tab => (
                        <Link
                            key={tab.id}
                            href={`/${locale}/admin/listings?status=${tab.id}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${status === tab.id
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
                                }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>

                {/* Search */}
                <form className="relative w-full sm:w-64">
                    <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder={isRtl ? 'بحث في الإعلانات...' : 'Search listings...'}
                        className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                    {status !== 'all' && <input type="hidden" name="status" value={status} />}
                </form>
            </div>

            {/* Table */}
            <ListingsTable listings={listings} locale={locale} />
        </div>
    );
}

