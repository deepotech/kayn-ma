'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Car, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { Agency, AgencyVehicleNormalized } from '@/lib/rent-agencies/normalize';
import AgencyVehicleCard from './AgencyVehicleCard';
import AgencyClaimModal from './AgencyClaimModal';

interface AgencyFleetSectionProps {
    agency: Agency;
    vehicles?: AgencyVehicleNormalized[];
    isOwner?: boolean;
}

export default function AgencyFleetSection({
    agency,
    vehicles = [],
    isOwner = false
}: AgencyFleetSectionProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const publishedVehicles = vehicles.filter(v => v.status !== 'HIDDEN');

    return (
        <section id="agency-fleet" className="mb-12 scroll-mt-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                        <Car className="w-6 h-6 text-blue-600" />
                        <span>{isRtl ? 'سيارات هذه الوكالة' : 'Véhicules de cette agence'}</span>
                        {publishedVehicles.length > 0 && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full">
                                {publishedVehicles.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {isRtl
                            ? `تصفح أسطول السيارات المتوفرة للكراء لدى ${agency.name} مع الأسعار والتوفر المحدث.`
                            : `Découvrez les véhicules disponibles à la location chez ${agency.name}.`}
                    </p>
                </div>

                {/* Quick CTA button */}
                <div>
                    {isOwner ? (
                        <Link
                            href={`/${locale}/dashboard/agency/vehicles/new`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{isRtl ? 'إضافة سيارة جديدة' : 'Ajouter un véhicule'}</span>
                        </Link>
                    ) : (
                        <AgencyClaimModal
                            agencyId={agency._id}
                            agencyName={agency.name}
                            agencyPhone={agency.phone}
                            verificationStatus={agency.verificationStatus}
                        />
                    )}
                </div>
            </div>

            {/* Grid or Empty state */}
            {publishedVehicles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedVehicles.map((vehicle) => (
                        <AgencyVehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            agencyName={agency.name}
                            agencyPhone={agency.phone}
                            agencyWhatsapp={agency.whatsapp}
                            citySlug={agency.citySlug}
                            agencySlug={agency.slug}
                        />
                    ))}
                </div>
            ) : (
                /* Empty state */
                <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                        <Car className="w-8 h-8" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {isRtl ? 'لا توجد سيارات منشورة حالياً لهذه الوكالة' : 'Aucun véhicule publié pour le moment'}
                    </h3>

                    {isOwner ? (
                        <div className="max-w-md mx-auto">
                            <p className="text-sm text-slate-500 mb-6">
                                {isRtl
                                    ? 'ابدأ بإضافة أول سيارة إلى أسطولك لجذب العملاء وعرض أسعارك للزوار مباشرة.'
                                    : 'Commencez à ajouter votre premier véhicule pour présenter votre flotte aux clients.'}
                            </p>
                            <Link
                                href={`/${locale}/dashboard/agency/vehicles/new`}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{isRtl ? 'أضف أول سيارة لأسطولك' : 'Ajouter un premier véhicule'}</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                {isRtl
                                    ? 'هل أنت صاحب هذه الوكالة؟ طالب بملكيتها لإضافة السيارات والأسعار وإدارة الحجوزات مباشرة.'
                                    : 'Êtes-vous le gérant de cette agence ? Revendiquez-la pour ajouter vos véhicules et tarifs.'}
                            </p>
                            <AgencyClaimModal
                                agencyId={agency._id}
                                agencyName={agency.name}
                                agencyPhone={agency.phone}
                                verificationStatus={agency.verificationStatus}
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
