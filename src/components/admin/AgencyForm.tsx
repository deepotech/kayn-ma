'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAgency, createAgency } from '@/app/actions/agency-admin';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface AgencyFormProps {
    initialData?: any;
    isEdit?: boolean;
    locale: string;
}

export default function AgencyForm({ initialData, isEdit = false, locale }: AgencyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        city: initialData?.city || '',
        address: initialData?.address || '',
        phone: initialData?.phone || '',
        website: initialData?.website || '',
        status: initialData?.status || 'active',
        lat: initialData?.location?.lat || 0,
        lng: initialData?.location?.lng || 0,
        categories: initialData?.categories?.join(', ') || '',
        photos: initialData?.photos?.join('\n') || '',
        source: initialData?.source || 'manual'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            // Process arrays/numbers
            location: {
                lat: Number(formData.lat),
                lng: Number(formData.lng)
            },
            categories: formData.categories.split(',').map((c: string) => c.trim()).filter(Boolean),
            photos: formData.photos.split('\n').map((p: string) => p.trim()).filter(Boolean),
        };

        try {
            let res;
            if (isEdit) {
                res = await updateAgency(initialData._id, payload);
            } else {
                res = await createAgency(payload);
            }

            if (res.success) {
                router.push(`/${locale}/admin/agencies`);
                router.refresh();
            } else {
                alert('Error: ' + res.error);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/${locale}/admin/agencies`}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isEdit ? `Edit Agency: ${initialData.name}` : 'Create New Agency'}
                    </h1>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{isEdit ? 'Update Agency' : 'Create Agency'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Agency Name *</label>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Slug * (Unique)</label>
                                <input
                                    required
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City *</label>
                                <input
                                    required
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address *</label>
                                <input
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Categories (comma separated)</label>
                            <input
                                name="categories"
                                value={formData.categories}
                                onChange={handleChange}
                                placeholder="e.g. 4x4, Luxury, Economy"
                                className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Gallery</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Photo URLs (One per line)</label>
                            <textarea
                                name="photos"
                                value={formData.photos}
                                onChange={handleChange}
                                rows={5}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                            />
                            <p className="text-xs text-slate-500">First photo will be used as cover.</p>
                        </div>
                        {/* Preview */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {formData.photos.split('\n').filter(Boolean).map((url: string, i: number) => (
                                <div key={i} className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
                                    <Image src={url} alt="" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Status & Contact</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
                            <input
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Location (Coords)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="lat"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="lng"
                                    value={formData.lng}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
