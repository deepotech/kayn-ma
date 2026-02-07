'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    MoreHorizontal,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    MapPin,
    Phone,
    Link as LinkIcon,
    Building2,
    Eye
} from 'lucide-react';
import { updateAgencyStatus, deleteAgency } from '@/app/actions/agency-admin';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Agency {
    _id: string;
    name: string;
    slug: string;
    city: string;
    address: string;
    phone: string | null;
    website: string | null;
    categories: string[];
    rating: number | null;
    reviewsCount: number | null;
    photos: string[];
    status: 'active' | 'pending' | 'suspended' | 'rejected';
    claimed: boolean;
    createdAt: string;
}

export default function AgenciesTable({ agencies, locale }: { agencies: Agency[]; locale: string }) {
    const router = useRouter();
    const t = useTranslations('Admin'); // Assuming valid namespace or fallback
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [actionOpenId, setActionOpenId] = useState<string | null>(null);

    const handleStatusChange = async (id: string, newStatus: Agency['status']) => {
        setLoadingId(id);
        const res = await updateAgencyStatus(id, newStatus);
        setLoadingId(null);
        if (res.success) {
            router.refresh();
        } else {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agency?')) return;
        setLoadingId(id);
        const res = await deleteAgency(id);
        setLoadingId(null);
        if (res.success) {
            router.refresh();
        } else {
            alert('Failed to delete agency');
        }
    };

    // Helper for status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Active</span>;
            case 'pending':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">Pending</span>;
            case 'suspended':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">Suspended</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-400 border border-slate-200 dark:border-zinc-700">{status}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-6 py-4">Agency</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {agencies.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No agencies found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            agencies.map((agency) => (
                                <tr key={agency._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    {/* Agency Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-zinc-800 relative overflow-hidden shrink-0">
                                                {agency.photos?.[0] ? (
                                                    <Image
                                                        src={agency.photos[0]}
                                                        alt={agency.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="40px"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Building2 className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {agency.name}
                                                    {agency.rating && (
                                                        <span className="flex items-center text-xs font-normal text-slate-500 bg-slate-100 dark:bg-zinc-800 px-1.5 rounded">
                                                            ★ {agency.rating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500">{agency.slug}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        {getStatusBadge(agency.status || 'active')}
                                    </td>

                                    {/* Location */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="capitalize">{agency.city}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 truncate max-w-[150px]" title={agency.address}>
                                                {agency.address}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {agency.phone ? (
                                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                                    <Phone className="w-3 h-3" /> {agency.phone}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No phone</span>
                                            )}
                                            {agency.website && (
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <LinkIcon className="w-3 h-3 text-blue-400" />
                                                    <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[120px]">Website</a>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                                            {loadingId === agency._id ? (
                                                <div className="h-4 w-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    {/* Approve/Reject Buttons for Pending */}
                                                    {agency.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(agency._id, 'active')}
                                                                title="Approve"
                                                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(agency._id, 'rejected')}
                                                                title="Reject"
                                                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Toggle Status */}
                                                    {agency.status === 'active' && (
                                                        <button
                                                            onClick={() => handleStatusChange(agency._id, 'suspended')}
                                                            title="Suspend"
                                                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                                                        >
                                                            <AlertCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {agency.status === 'suspended' && (
                                                        <button
                                                            onClick={() => handleStatusChange(agency._id, 'active')}
                                                            title="Activate"
                                                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* View/Edit/Delete */}
                                                    <a
                                                        href={`/${agency.slug}`} // Or admin edit link
                                                        target="_blank"
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                        title="View Public Page"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>

                                                    {/* Edit Button */}
                                                    <Link
                                                        href={`/${locale}/admin/agencies/${agency._id}`}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(agency._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
