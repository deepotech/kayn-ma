'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, Car } from 'lucide-react';
import AgencyVehicleForm from '@/components/agency/AgencyVehicleForm';

export default function NewVehiclePage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';

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
                            {isRtl ? 'إضافة سيارة جديدة إلى أسطولك' : 'Ajouter un véhicule à la flotte'}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {isRtl ? 'حدد المواصفات والأسعار وارفع صور السيارة.' : 'Renseignez les détails, prix et photos.'}
                        </p>
                    </div>
                </div>
            </div>

            <AgencyVehicleForm />
        </div>
    );
}
