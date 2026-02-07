'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    CheckCircle,
    XCircle,
    Trash2,
    Eye,
    AlertCircle,
    Calendar,
    User,
    DollarSign
} from 'lucide-react';
import { approveListing, rejectListing, deleteListing } from '@/app/actions/listing-admin';
import Link from 'next/link';

interface Listing {
    _id: string;
    title: string;
    price: number;
    currency: string;
    images: Array<{ url: string }>;
    status: 'approved' | 'pending_review' | 'rejected' | 'paused';
    sellerName?: string;
    agencyName?: string;
    city?: { label: string };
    createdAt: string;
    publishedAt?: string;
}

export default function ListingsTable({ listings, locale }: { listings: Listing[]; locale: string }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        setLoadingId(id);
        const res = await approveListing(id);
        setLoadingId(null);
        if (res.success) router.refresh();
        else alert('Failed to approve');
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Reason for rejection (optional):');
        if (reason === null) return;
        setLoadingId(id);
        const res = await rejectListing(id, reason);
        setLoadingId(null);
        if (res.success) router.refresh();
        else alert('Failed to reject');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        setLoadingId(id);
        const res = await deleteListing(id);
        setLoadingId(null);
        if (res.success) router.refresh();
        else alert('Failed to delete');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Active</span>;
            case 'pending_review':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>;
            case 'rejected':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Rejected</span>;
            case 'paused':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Paused</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 font-medium border-b border-slate-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-6 py-4">Listing</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Seller</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {listings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No listings found.
                                </td>
                            </tr>
                        ) : (
                            listings.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-16 rounded-md bg-slate-100 relative overflow-hidden shrink-0">
                                                {item.images?.[0]?.url ? (
                                                    <Image
                                                        src={item.images[0].url}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-zinc-800">
                                                        <span className="text-xs text-slate-400">No img</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="max-w-[200px]">
                                                <div className="font-medium text-slate-900 dark:text-white truncate" title={item.title}>
                                                    {item.title}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">
                                                    {item.city?.label || 'Unknown City'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {item.price.toLocaleString()} <span className="text-xs text-slate-500">{item.currency}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {item.agencyName || item.sellerName || 'Anonymous'}
                                            </span>
                                            {item.agencyName && <span className="text-slate-400 text-[10px] uppercase">Agency</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {loadingId === item._id ? (
                                                <div className="h-4 w-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    {item.status === 'pending_review' && (
                                                        <button
                                                            onClick={() => handleApprove(item._id)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {(item.status === 'approved' || item.status === 'pending_review') && (
                                                        <button
                                                            onClick={() => handleReject(item._id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/${locale}/cars/${item._id}`}
                                                        target="_blank"
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
