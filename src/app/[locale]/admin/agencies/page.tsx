import dbConnect from '@/lib/db';
import RentAgency from '@/models/RentAgency';
import { getTranslations } from 'next-intl/server';
import { Building2, Plus, Search } from 'lucide-react';
import AgenciesTable from '@/components/admin/AgenciesTable';
import Link from 'next/link';

import { requireAdminAccess } from '@/lib/admin-access';

async function getAgencies(status: string, query: string) {
    await requireAdminAccess(); // Ensure admin
    await dbConnect();

    const filter: any = {};

    // Status Filter
    if (status && status !== 'all') {
        filter.status = status;
    }

    // Search Filter
    if (query) {
        filter.$or = [
            { name: { $regex: query, $options: 'i' } },
            { city: { $regex: query, $options: 'i' } },
            { slug: { $regex: query, $options: 'i' } }
        ];
    }

    // Recent first
    return RentAgency.find(filter).sort({ createdAt: -1 }).lean();
}

export default async function AdminAgenciesPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string },
    searchParams: { status?: string; q?: string }
}) {
    const t = await getTranslations({ locale });
    const status = searchParams.status || 'all';
    const query = searchParams.q || '';

    const agencies = await getAgencies(status, query);

    // Helper for tabs
    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'pending', label: 'Pending' },
        { id: 'suspended', label: 'Suspended' },
        { id: 'rejected', label: 'Rejected' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Rent Agencies Management
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage car rental agencies directory. ({agencies.length} results)
                    </p>
                </div>
                <Link
                    href={`/${locale}/admin/agencies/new`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Agency</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                {/* Status Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    {tabs.map(tab => (
                        <Link
                            key={tab.id}
                            href={`/${locale}/admin/agencies?status=${tab.id}${query ? `&q=${query}` : ''}`}
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
                        placeholder="Search agencies..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    {status !== 'all' && <input type="hidden" name="status" value={status} />}
                </form>
            </div>

            {/* Table */}
            <AgenciesTable agencies={JSON.parse(JSON.stringify(agencies))} locale={locale} />
        </div>
    );
}
