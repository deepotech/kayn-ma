'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Phone, MessageCircle, Fuel, Gauge, Users, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AgencyVehicleNormalized } from '@/lib/rent-agencies/normalize';

interface AgencyVehicleCardProps {
    vehicle: AgencyVehicleNormalized;
    agencyName: string;
    agencyPhone?: string | null;
    agencyWhatsapp?: string | null;
    citySlug: string;
    agencySlug: string;
}

function timeAgo(dateString: string, locale: string) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) return locale === 'ar' ? 'اليوم' : "aujourd'hui";
        if (diffInDays === 1) return locale === 'ar' ? 'أمس' : 'hier';
        if (diffInDays < 30) return locale === 'ar' ? `منذ ${diffInDays} أيام` : `il y a ${diffInDays}j`;
        return locale === 'ar' ? `منذ شهر` : 'il y a 1 mois';
    } catch {
        return '';
    }
}

export default function AgencyVehicleCard({
    vehicle,
    agencyName,
    agencyPhone,
    agencyWhatsapp,
    citySlug,
    agencySlug
}: AgencyVehicleCardProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const detailUrl = `/${locale}/rent-agencies/${citySlug}/${agencySlug}/${vehicle.slug}`;

    const contactPhone = agencyPhone || '';
    const contactWhatsapp = agencyWhatsapp || agencyPhone || '';

    const handleTrackClick = (type: 'whatsapp' | 'call') => {
        fetch('/api/agency/stats/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agencyId: vehicle.agencyId,
                vehicleId: vehicle.id,
                type
            })
        }).catch(() => null);
    };

    const whatsappMessage = isRtl
        ? `مرحباً، أود الاستفسار عن كراء سيارة ${vehicle.brand} ${vehicle.model} ${vehicle.year} من وكالة ${agencyName} على Cayn.ma`
        : `Bonjour, je souhaite me renseigner sur la location de la ${vehicle.brand} ${vehicle.model} ${vehicle.year} chez ${agencyName} sur Cayn.ma`;

    const whatsappUrl = contactWhatsapp
        ? `https://wa.me/212${contactWhatsapp.replace(/^(\+212|0)/, '')}?text=${encodeURIComponent(whatsappMessage)}`
        : '#';

    // Status styling
    const statusConfig = {
        AVAILABLE: {
            labelAr: 'متاحة للكراء',
            labelFr: 'Disponible',
            bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle2
        },
        RENTED: {
            labelAr: 'محجوزة حالياً',
            labelFr: 'Réservée',
            bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            icon: Clock
        },
        MAINTENANCE: {
            labelAr: 'غير متاحة مؤقتاً',
            labelFr: 'Non disponible',
            bg: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
            icon: AlertTriangle
        },
        HIDDEN: {
            labelAr: 'غير منشورة',
            labelFr: 'Masquée',
            bg: 'bg-red-50 text-red-600 border-red-200',
            icon: AlertTriangle
        }
    };

    const statusInfo = statusConfig[vehicle.status as keyof typeof statusConfig] || statusConfig.AVAILABLE;
    const StatusIcon = statusInfo.icon;

    const coverPhoto = vehicle.featuredImage || (vehicle.images && vehicle.images[0]?.url) || '/images/placeholder-car.jpg';

    return (
        <div className="group flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative aspect-[16/10] bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <Link href={detailUrl} className="block w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={coverPhoto}
                        alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                </Link>

                {/* Status Badge */}
                <div className="absolute top-3 start-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm shadow-sm ${statusInfo.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{isRtl ? statusInfo.labelAr : statusInfo.labelFr}</span>
                    </span>
                </div>

                {/* Year Badge */}
                <div className="absolute top-3 end-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-lg text-xs font-bold">
                    {vehicle.year}
                </div>
            </div>

            {/* Body Info */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <Link href={detailUrl}>
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {vehicle.brand} {vehicle.model}
                        </h3>
                    </Link>

                    {/* Specs chips */}
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-800/60 px-2 py-1 rounded-lg">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{vehicle.transmission === 'Manual' ? (isRtl ? 'يدوي' : 'Manuel') : (isRtl ? 'أوتوماتيك' : 'Auto')}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-800/60 px-2 py-1 rounded-lg">
                            <Fuel className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{vehicle.fuel}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-800/60 px-2 py-1 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{vehicle.seats} {isRtl ? 'مقاعد' : 'places'}</span>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <div className="flex items-baseline justify-between">
                            <div>
                                <span className="text-xs text-slate-400">
                                    {isRtl ? 'ابتداءً من' : 'À partir de'}
                                </span>
                                <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                                    {vehicle.dailyPrice} <span className="text-xs font-bold text-slate-500">{isRtl ? 'درهم / اليوم' : 'DH / jour'}</span>
                                </div>
                            </div>
                            {vehicle.securityDeposit !== null && vehicle.securityDeposit !== undefined && (
                                <div className="text-end">
                                    <span className="text-[10px] text-slate-400 block">{isRtl ? 'الضمان' : 'Caution'}</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{vehicle.securityDeposit} DH</span>
                                </div>
                            )}
                        </div>

                        {/* Confirmation time */}
                        <div className="mt-2 text-[11px] text-slate-400">
                            {isRtl ? 'آخر تأكيد للتوفر: ' : 'Disponibilité confirmée: '}
                            <span className="text-slate-500 font-medium">{timeAgo(vehicle.lastConfirmedAt, locale)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    {contactWhatsapp && (
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleTrackClick('whatsapp')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'واتساب' : 'WhatsApp'}</span>
                        </a>
                    )}
                    {contactPhone && (
                        <a
                            href={`tel:${contactPhone}`}
                            onClick={() => handleTrackClick('call')}
                            className="p-2 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            title={isRtl ? 'اتصال' : 'Appeler'}
                        >
                            <Phone className="w-4 h-4" />
                        </a>
                    )}
                    <Link
                        href={detailUrl}
                        className="px-3 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-colors text-center"
                    >
                        {isRtl ? 'التفاصيل' : 'Détails'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
