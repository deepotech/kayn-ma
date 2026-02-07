import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { getTranslations } from 'next-intl/server';
import { Search } from 'lucide-react';
import ListingsTable from '@/components/admin/ListingsTable';
import Link from 'next/link';
import { requireAdminAccess } from '@/lib/admin-access';

async function getListings(status: string, query: string) {
    await requireAdminAccess();
    await dbConnect();

    const filter: any = {};

    // Status Filter
    if (status && status !== 'all') {
        filter.status = status;
    }

    // Search Filter
    if (query) {
        // Search by title or seller name?
        // sellerName or agencyName
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { sellerName: { $regex: query, $options: 'i' } },
            { agencyName: { $regex: query, $options: 'i' } }
        ];
    }

    // Sort by recent first
    return Listing.find(filter).sort({ createdAt: -1 }).lean();
}

export default async function AdminListingsPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string },
    searchParams: { status?: string; q?: string }
}) {
    const t = await getTranslations({ locale });
    const status = searchParams.status || 'all';
    const query = searchParams.q || '';

    const listings = await getListings(status, query);

    // Tabs
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'pending_review', label: 'Pending Review' },
        { id: 'approved', label: 'Active' },
        { id: 'rejected', label: 'Rejected' },
        { id: 'paused', label: 'Paused' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Listings Management
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Moderate user listings. ({listings.length} results)
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
                            href={`/${locale}/admin/listings?status=${tab.id}${query ? `&q=${query}` : ''}`}
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search listings..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    {status !== 'all' && <input type="hidden" name="status" value={status} />}
                </form>
            </div>

            {/* Table */}
            <ListingsTable listings={JSON.parse(JSON.stringify(listings))} locale={locale} />
        </div>
    );
}
