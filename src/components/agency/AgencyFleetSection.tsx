'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Car, Plus, ShieldCheck, MessageCircle, Phone } from 'lucide-react';
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
    const t = useTranslations('RentAgencies.Fleet');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const publishedVehicles = vehicles.filter(v => v.status !== 'HIDDEN');
    const isVerified = agency.verificationStatus === 'VERIFIED';
    const isPending = agency.verificationStatus === 'PENDING';

    const contactWhatsapp = agency.whatsapp || agency.phone;
    const whatsappMessage = isRtl
        ? `مرحباً، أود الاستفسار عن كراء سيارة من وكالة ${agency.name} على Cayn.ma.`
        : `Bonjour, je souhaite me renseigner sur la location d'un véhicule chez ${agency.name} sur Cayn.ma.`;
    const whatsappUrl = contactWhatsapp
        ? `https://wa.me/212${contactWhatsapp.replace(/^(\+212|0)/, '')}?text=${encodeURIComponent(whatsappMessage)}`
        : null;

    return (
        <section id="agency-fleet" className="mb-12 scroll-mt-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                        <Car className="w-6 h-6 text-blue-600" />
                        <span>{t('title')}</span>
                        {publishedVehicles.length > 0 && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-0.5 rounded-full">
                                {publishedVehicles.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        {publishedVehicles.length > 0
                            ? (isRtl
                                ? `تصفح أسطول السيارات المتوفرة للكراء لدى ${agency.name} مع الأسعار والتوفر المحدث.`
                                : `Découvrez les véhicules disponibles à la location chez ${agency.name}.`)
                            : t('emptySubtitle')
                        }
                    </p>
                </div>

                {/* Quick Header CTA button */}
                <div>
                    {isOwner ? (
                        <Link
                            href={`/${locale}/dashboard/agency/vehicles/new`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{isRtl ? 'إضافة سيارة جديدة' : 'Ajouter un véhicule'}</span>
                        </Link>
                    ) : !isVerified && !isPending ? (
                        <AgencyClaimModal
                            agencyId={agency._id}
                            agencyName={agency.name}
                            agencyPhone={agency.phone}
                            verificationStatus={agency.verificationStatus}
                            isOwner={isOwner}
                        />
                    ) : null}
                </div>
            </div>

            {/* Grid or Empty state */}
            {publishedVehicles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {t('emptyTitle')}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 max-w-lg mx-auto leading-relaxed">
                        {t('emptySubtitle')}
                    </p>

                    {/* Conditional Action based on ownership & verification */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {isOwner ? (
                            <Link
                                href={`/${locale}/dashboard/agency/vehicles/new`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{t('addVehiclesNow')}</span>
                            </Link>
                        ) : !isVerified && !isPending ? (
                            <AgencyClaimModal
                                agencyId={agency._id}
                                agencyName={agency.name}
                                agencyPhone={agency.phone}
                                verificationStatus={agency.verificationStatus}
                                isOwner={isOwner}
                                triggerText={t('addVehiclesNow')}
                            />
                        ) : (
                            /* Verified agency with 0 cars currently added: offer direct contact */
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {whatsappUrl && (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>{isRtl ? 'استفسار عبر واتساب' : 'Contacter par WhatsApp'}</span>
                                    </a>
                                )}
                                {agency.phone && (
                                    <a
                                        href={`tel:${agency.phone}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>{isRtl ? 'اتصال بالوكالة' : "Appeler l'agence"}</span>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
