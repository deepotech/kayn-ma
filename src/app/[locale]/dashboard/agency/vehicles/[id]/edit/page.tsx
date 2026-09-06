'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import AgencyVehicleForm from '@/components/agency/AgencyVehicleForm';

export default function EditVehiclePage({ params }: { params: { id: string } }) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [vehicle, setVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const res = await fetch(`/api/agency/vehicles/${params.id}`);
                const data = await res.json();
                if (res.ok && data.vehicle) {
                    setVehicle(data.vehicle);
                } else {
                    setError(data.error || 'Failed to load vehicle');
                }
            } catch (err) {
                setError('Error fetching vehicle');
            } finally {
                setLoading(false);
            }
        };

        fetchCar();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="max-w-md mx-auto py-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{error || 'Vehicle not found'}</h3>
                <Link
                    href={`/${locale}/dashboard/agency`}
                    className="text-sm font-bold text-blue-600 hover:underline"
                >
                    {isRtl ? 'العودة للوحة التحكم' : 'Retour au tableau de bord'}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${locale}/dashboard/agency`}
                        className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                            {isRtl ? `تعديل ${vehicle.brand} ${vehicle.model}` : `Modifier ${vehicle.brand} ${vehicle.model}`}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {isRtl ? 'تعديل الأسعار والتوفر والمواصفات.' : 'Mise à jour des tarifs et caractéristiques.'}
                        </p>
                    </div>
                </div>
            </div>

            <AgencyVehicleForm initialData={vehicle} isEditing={true} />
        </div>
    );
}
