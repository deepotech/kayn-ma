'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
    Plus,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Upload,
    Check,
    Loader2,
    ExternalLink,
    X
} from 'lucide-react';
import { AgencyVehicleNormalized } from '@/lib/rent-agencies/normalize';
import VehicleCsvImportModal from './VehicleCsvImportModal';

interface AgencyFleetManagerProps {
    initialVehicles: AgencyVehicleNormalized[];
    agencySlug: string;
    citySlug: string;
    onUpdate?: () => void;
}

export default function AgencyFleetManager({
    initialVehicles,
    agencySlug,
    citySlug,
    onUpdate
}: AgencyFleetManagerProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [vehicles, setVehicles] = useState<AgencyVehicleNormalized[]>(initialVehicles);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [newPrice, setNewPrice] = useState<string>('');
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleStatusChange = async (vehicleId: string, newStatus: string) => {
        setUpdatingId(vehicleId);
        try {
            const res = await fetch(`/api/agency/vehicles/${vehicleId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok && data.vehicle) {
                setVehicles(prev =>
                    prev.map(v => (v.id === vehicleId ? { ...v, status: newStatus, lastConfirmedAt: data.vehicle.lastConfirmedAt } : v))
                );
                onUpdate?.();
            }
        } catch (e) {
            console.error('Error changing status:', e);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleQuickPriceSave = async (vehicleId: string) => {
        if (!newPrice || parseFloat(newPrice) <= 0) {
            setEditingPriceId(null);
            return;
        }

        setUpdatingId(vehicleId);
        try {
            const res = await fetch(`/api/agency/vehicles/${vehicleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dailyPrice: parseFloat(newPrice) })
            });
            const data = await res.json();
            if (res.ok && data.vehicle) {
                setVehicles(prev =>
                    prev.map(v => (v.id === vehicleId ? { ...v, dailyPrice: data.vehicle.dailyPrice } : v))
                );
                setEditingPriceId(null);
                onUpdate?.();
            }
        } catch (e) {
            console.error('Error updating price:', e);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (vehicleId: string) => {
        setUpdatingId(vehicleId);
        try {
            const res = await fetch(`/api/agency/vehicles/${vehicleId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setVehicles(prev => prev.filter(v => v.id !== vehicleId));
                setDeleteConfirmId(null);
                onUpdate?.();
            }
        } catch (e) {
            console.error('Error deleting vehicle:', e);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {isRtl ? 'إدارة أسطول السيارات' : 'Gestion de la flotte'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {isRtl
                            ? `لديك ${vehicles.length} سيارات مسجلة في أسطولك.`
                            : `${vehicles.length} véhicules enregistrés dans votre flotte.`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowCsvModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        <span>{isRtl ? 'استيراد CSV' : 'Importer CSV'}</span>
                    </button>

                    <Link
                        href={`/${locale}/dashboard/agency/vehicles/new`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isRtl ? 'إضافة سيارة' : 'Ajouter un véhicule'}</span>
                    </Link>
                </div>
            </div>

            {/* Vehicles Table / List */}
            {vehicles.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {isRtl ? 'لا توجد أي سيارة في أسطولك بعد' : 'Votre flotte est vide'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                        {isRtl
                            ? 'أضف سياراتك الآن لتظهر مباشرة على صفحة وكالتك وفي نتائج البحث العامة.'
                            : 'Ajoutez vos véhicules dès maintenant pour les rendre visibles sur votre page.'}
                    </p>
                    <Link
                        href={`/${locale}/dashboard/agency/vehicles/new`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{isRtl ? 'إضافة أول سيارة' : 'Ajouter le premier véhicule'}</span>
                    </Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
                    {vehicles.map((car) => {
                        const isUpdating = updatingId === car.id;
                        const coverImg = car.featuredImage || (car.images && car.images[0]?.url) || '/images/placeholder-car.jpg';
                        const publicUrl = `/${locale}/rent-agencies/${citySlug}/${agencySlug}/${car.slug}`;

                        return (
                            <div key={car.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                {/* Left info */}
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 relative border border-slate-200 dark:border-zinc-700">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={coverImg} alt={car.model} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
                                                {car.brand} {car.model}
                                            </h4>
                                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-semibold">
                                                {car.year}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span>{car.transmission === 'Manual' ? (isRtl ? 'يدوي' : 'Manuel') : (isRtl ? 'أوتوماتيك' : 'Auto')}</span>
                                            <span>•</span>
                                            <span>{car.fuel}</span>
                                            <span>•</span>
                                            <span>{car.seats} {isRtl ? 'مقاعد' : 'places'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center: Price & Status */}
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                    {/* Daily price inline edit */}
                                    <div>
                                        <span className="text-[10px] text-slate-400 block mb-0.5">{isRtl ? 'السعر اليومي' : 'Prix par jour'}</span>
                                        {editingPriceId === car.id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={newPrice}
                                                    onChange={(e) => setNewPrice(e.target.value)}
                                                    className="w-20 px-2 py-1 border rounded-lg text-xs font-bold"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleQuickPriceSave(car.id)}
                                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingPriceId(null)}
                                                    className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingPriceId(car.id);
                                                    setNewPrice(String(car.dailyPrice));
                                                }}
                                                className="text-sm font-black text-blue-600 dark:text-blue-400 hover:underline"
                                                title={isRtl ? 'انقر لتعديل السعر' : 'Modifier le prix'}
                                            >
                                                {car.dailyPrice} DH
                                            </button>
                                        )}
                                    </div>

                                    {/* Status selector */}
                                    <div>
                                        <span className="text-[10px] text-slate-400 block mb-0.5">{isRtl ? 'الحالة' : 'Statut'}</span>
                                        <select
                                            disabled={isUpdating}
                                            value={car.status}
                                            onChange={(e) => handleStatusChange(car.id, e.target.value)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                                                car.status === 'AVAILABLE'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : car.status === 'RENTED'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                                                    : car.status === 'MAINTENANCE'
                                                    ? 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300'
                                                    : 'bg-red-50 text-red-600 border-red-200'
                                            }`}
                                        >
                                            <option value="AVAILABLE">{isRtl ? 'متاحة' : 'Disponible'}</option>
                                            <option value="RENTED">{isRtl ? 'محجوزة' : 'Louée'}</option>
                                            <option value="MAINTENANCE">{isRtl ? 'صيانة' : 'Maintenance'}</option>
                                            <option value="HIDDEN">{isRtl ? 'مخفية' : 'Masquée'}</option>
                                        </select>
                                    </div>

                                    {/* Analytics */}
                                    <div className="hidden lg:block text-end text-xs text-slate-400">
                                        <div>{car.views || 0} {isRtl ? 'مشاهدة' : 'vues'}</div>
                                        <div className="text-[11px] text-emerald-600 font-medium">
                                            {(car.whatsappClicks || 0) + (car.callClicks || 0)} {isRtl ? 'تواصل' : 'contacts'}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {/* View public page */}
                                        <Link
                                            href={publicUrl}
                                            target="_blank"
                                            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                            title={isRtl ? 'معاينة في صفحة السيارة' : 'Voir la page'}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>

                                        {/* Edit */}
                                        <Link
                                            href={`/${locale}/dashboard/agency/vehicles/${car.id}/edit`}
                                            className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title={isRtl ? 'تعديل التفاصيل' : 'Modifier'}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Link>

                                        {/* Delete */}
                                        {deleteConfirmId === car.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDelete(car.id)}
                                                    className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700"
                                                >
                                                    {isRtl ? 'تأكيد' : 'Oui'}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(null)}
                                                    className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                                                >
                                                    {isRtl ? 'إلغاء' : 'Non'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setDeleteConfirmId(car.id)}
                                                className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title={isRtl ? 'حذف السيارة' : 'Supprimer'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CSV Import Modal */}
            {showCsvModal && (
                <VehicleCsvImportModal
                    onClose={() => setShowCsvModal(false)}
                    onSuccess={(importedCount) => {
                        setShowCsvModal(false);
                        onUpdate?.();
                    }}
                />
            )}
        </div>
    );
}
