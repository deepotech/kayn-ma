'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
    Car,
    Phone,
    MessageCircle,
    MapPin,
    Calendar,
    Fuel,
    Gauge,
    Users,
    Briefcase,
    Shield,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Building2,
    ChevronLeft,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { AgencyVehicleNormalized } from '@/lib/rent-agencies/normalize';
import AgencyVehicleCard from './AgencyVehicleCard';

interface VehicleDetailViewProps {
    vehicle: AgencyVehicleNormalized;
    agency: any;
    similarVehicles?: AgencyVehicleNormalized[];
}

export default function VehicleDetailView({
    vehicle,
    agency,
    similarVehicles = []
}: VehicleDetailViewProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const images = vehicle.images && vehicle.images.length > 0
        ? vehicle.images.map(img => img.url)
        : ['/images/placeholder-car.jpg'];

    const [selectedImageIdx, setSelectedImageIdx] = useState(0);

    const agencySlug = agency.slug;
    const citySlug = agency.citySlug || agency.city?.slug || 'marrakech';
    const cityName = agency.city?.name || agency.city || 'Marrakech';
    const agencyPhone = agency.phone || '';
    const agencyWhatsapp = agency.whatsapp || agency.phone || '';

    const handleTrack = (type: 'whatsapp' | 'call') => {
        fetch('/api/agency/stats/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agencyId: agency._id || agency.id,
                vehicleId: vehicle.id,
                type
            })
        }).catch(() => null);
    };

    const whatsappMessage = isRtl
        ? `مرحباً، أود حجز سيارة ${vehicle.brand} ${vehicle.model} (${vehicle.year}) بسعر ${vehicle.dailyPrice} درهم/اليوم عبر موقع Cayn.ma.`
        : `Bonjour, je souhaite réserver la ${vehicle.brand} ${vehicle.model} (${vehicle.year}) à ${vehicle.dailyPrice} DH/jour vue sur Cayn.ma.`;

    const whatsappUrl = agencyWhatsapp
        ? `https://wa.me/212${agencyWhatsapp.replace(/^(\+212|0)/, '')}?text=${encodeURIComponent(whatsappMessage)}`
        : '#';

    // Status display config
    const statusConfig = {
        AVAILABLE: {
            labelAr: 'متاحة للكراء الآن',
            labelFr: 'Disponible à la location',
            bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            icon: CheckCircle2
        },
        RENTED: {
            labelAr: 'محجوزة حالياً',
            labelFr: 'Actuellement réservée',
            bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            icon: Clock
        },
        MAINTENANCE: {
            labelAr: 'غير متاحة مؤقتاً',
            labelFr: 'Indisponible temporairement',
            bg: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
            icon: AlertTriangle
        },
        HIDDEN: {
            labelAr: 'غير منشورة',
            labelFr: 'Non publiée',
            bg: 'bg-red-50 text-red-600 border-red-200',
            icon: AlertTriangle
        }
    };

    const currentStatus = statusConfig[vehicle.status as keyof typeof statusConfig] || statusConfig.AVAILABLE;
    const StatusIcon = currentStatus.icon;

    // Structured Data for Vehicle / Product
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Car',
        name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        brand: {
            '@type': 'Brand',
            name: vehicle.brand
        },
        model: vehicle.model,
        vehicleModelDate: vehicle.year,
        bodyType: vehicle.bodyType,
        fuelType: vehicle.fuel,
        vehicleTransmission: vehicle.transmission,
        seatingCapacity: vehicle.seats,
        image: images,
        offers: {
            '@type': 'Offer',
            price: vehicle.dailyPrice,
            priceCurrency: 'MAD',
            priceValidUntil: '2026-12-31',
            availability: vehicle.status === 'AVAILABLE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'AutoRental',
                name: agency.name,
                telephone: agencyPhone,
                address: agency.address
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumbs */}
            <div className="mb-6 text-sm text-slate-500 flex items-center flex-wrap gap-1.5">
                <Link href={`/${locale}`} className="hover:text-blue-600">{isRtl ? 'الرئيسية' : 'Accueil'}</Link>
                <span>/</span>
                <Link href={`/${locale}/rent-agencies`} className="hover:text-blue-600">{isRtl ? 'وكالات الكراء' : 'Agences de location'}</Link>
                <span>/</span>
                <Link href={`/${locale}/rent-agencies/${citySlug}`} className="hover:text-blue-600 capitalize">{cityName}</Link>
                <span>/</span>
                <Link href={`/${locale}/rent-agencies/${citySlug}/${agencySlug}`} className="hover:text-blue-600 font-medium truncate max-w-[150px]">{agency.name}</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-bold">{vehicle.brand} {vehicle.model}</span>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left (2 cols): Photos & Specs & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Title & Status Bar for Mobile & Desktop */}
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                                {vehicle.brand} {vehicle.model} <span className="text-blue-600">{vehicle.year}</span>
                            </h1>

                            {/* Status Badge */}
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.bg}`}>
                                <StatusIcon className="w-4 h-4" />
                                <span>{isRtl ? currentStatus.labelAr : currentStatus.labelFr}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-500">
                            <Link href={`/${locale}/rent-agencies/${citySlug}/${agencySlug}`} className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <span>{agency.name}</span>
                            </Link>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="capitalize">{cityName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-3 sm:p-4 shadow-sm overflow-hidden">
                        {/* Main selected image */}
                        <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={images[selectedImageIdx]}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                className="w-full h-full object-cover object-center"
                            />

                            {/* Prev / Next navigation buttons */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImageIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                                        className="absolute start-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur transition-all"
                                    >
                                        <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImageIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur transition-all"
                                    >
                                        <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedImageIdx(idx)}
                                        className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                                            selectedImageIdx === idx
                                                ? 'border-blue-600 scale-95 shadow'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Specifications Grid */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Car className="w-5 h-5 text-blue-600" />
                            <span>{isRtl ? 'المواصفات الفنية للسيارة' : 'Fiche technique'}</span>
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                                <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'ناقل الحركة' : 'Boîte de vitesses'}</span>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Gauge className="w-4 h-4 text-blue-600" />
                                    <span>{vehicle.transmission === 'Manual' ? (isRtl ? 'يدوي' : 'Manuel') : (isRtl ? 'أوتوماتيك' : 'Automatique')}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                                <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'نوع الوقود' : 'Carburant'}</span>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Fuel className="w-4 h-4 text-amber-500" />
                                    <span>{vehicle.fuel}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                                <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'عدد المقاعد' : 'Places'}</span>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-4 h-4 text-emerald-600" />
                                    <span>{vehicle.seats} {isRtl ? 'مقاعد' : 'places'}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                                <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'الأبواب' : 'Portes'}</span>
                                <div className="font-bold text-slate-900 dark:text-white">
                                    <span>{vehicle.doors} {isRtl ? 'أبواب' : 'portes'}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                                <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'سعة الحقائب' : 'Bagages'}</span>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-purple-600" />
                                    <span>{vehicle.luggage} {isRtl ? 'حقائب' : 'valises'}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                                <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'نوع الهيكل' : 'Carrosserie'}</span>
                                <div className="font-bold text-slate-900 dark:text-white capitalize">
                                    <span>{vehicle.bodyType}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                                <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'سنة الصنع' : 'Année'}</span>
                                <div className="font-bold text-slate-900 dark:text-white">
                                    <span>{vehicle.year}</span>
                                </div>
                            </div>

                            {vehicle.color && (
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                                    <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'اللون' : 'Couleur'}</span>
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        <span>{vehicle.color}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {vehicle.description && (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{isRtl ? 'الوصف وملاحظات الوكالة' : 'Description'}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                    {vehicle.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Rental Conditions & Pricing Details */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            <span>{isRtl ? 'شروط الكراء والأسعار التفضيلية' : 'Conditions de location et tarifs'}</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Security deposit */}
                            <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-400">{isRtl ? 'مبلغ التأمين / الضمان' : 'Caution requise'}</div>
                                    <div className="text-base font-bold text-slate-900 dark:text-white">
                                        {vehicle.securityDeposit ? `${vehicle.securityDeposit} DH` : (isRtl ? 'حسب الاتفاق' : 'Selon accord')}
                                    </div>
                                </div>
                                <Shield className="w-5 h-5 text-slate-400" />
                            </div>

                            {/* Min rental days */}
                            <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-400">{isRtl ? 'الحد الأدنى للكراء' : 'Durée minimale'}</div>
                                    <div className="text-base font-bold text-slate-900 dark:text-white">
                                        {vehicle.minRentalDays} {isRtl ? 'أيام' : 'jours'}
                                    </div>
                                </div>
                                <Calendar className="w-5 h-5 text-slate-400" />
                            </div>

                            {/* Included mileage */}
                            <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-400">{isRtl ? 'الكيلومترات المشمولة' : 'Kilométrage inclus'}</div>
                                    <div className="text-base font-bold text-slate-900 dark:text-white">
                                        {vehicle.mileagePerDay ? `${vehicle.mileagePerDay} km / jour` : (isRtl ? 'كيلومتر غير محدود' : 'Illimité')}
                                    </div>
                                </div>
                                <Gauge className="w-5 h-5 text-slate-400" />
                            </div>

                            {/* Extra km price */}
                            {vehicle.extraMileagePrice && (
                                <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-slate-400">{isRtl ? 'سعر الكيلومتر الإضافي' : 'Km supplémentaire'}</div>
                                        <div className="text-base font-bold text-slate-900 dark:text-white">
                                            {vehicle.extraMileagePrice} DH / km
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Airport delivery */}
                            {vehicle.airportDeliveryFee !== null && vehicle.airportDeliveryFee !== undefined && (
                                <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-slate-400">{isRtl ? 'توصيل المطار' : 'Livraison aéroport'}</div>
                                        <div className="text-base font-bold text-slate-900 dark:text-white">
                                            {vehicle.airportDeliveryFee === 0 ? (isRtl ? 'مجاني' : 'Gratuit') : `${vehicle.airportDeliveryFee} DH`}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {vehicle.priceNotes && (
                            <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
                                <span className="font-bold">{isRtl ? 'ملاحظة:' : 'Note:'} </span>
                                {vehicle.priceNotes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right (1 col): Sticky Booking / Contact Card & Agency Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Price Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm sticky top-24 space-y-6">
                        <div>
                            <span className="text-xs text-slate-400 block mb-1">{isRtl ? 'السعر اليومي' : 'Prix par jour'}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{vehicle.dailyPrice}</span>
                                <span className="text-sm font-bold text-slate-500">DH / {isRtl ? 'يوم' : 'jour'}</span>
                            </div>
                        </div>

                        {/* Tier pricing tags */}
                        {(vehicle.weeklyPrice || vehicle.monthlyPrice) && (
                            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                {vehicle.weeklyPrice && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">{isRtl ? 'الكراء الأسبوعي (> 7 أيام):' : 'Tarif semaine (> 7j):'}</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{vehicle.weeklyPrice} DH / {isRtl ? 'يوم' : 'jour'}</span>
                                    </div>
                                )}
                                {vehicle.monthlyPrice && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">{isRtl ? 'الكراء الشهري (> 30 يوماً):' : 'Tarif mensuel (> 30j):'}</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{vehicle.monthlyPrice} DH / {isRtl ? 'يوم' : 'jour'}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CTAs */}
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                            {agencyWhatsapp && (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleTrack('whatsapp')}
                                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>{isRtl ? 'حجز عبر WhatsApp' : 'Réserver via WhatsApp'}</span>
                                </a>
                            )}

                            {agencyPhone && (
                                <a
                                    href={`tel:${agencyPhone}`}
                                    onClick={() => handleTrack('call')}
                                    className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>{isRtl ? 'اتصال بالوكالة مباشرة' : 'Appeler l’agence'}</span>
                                </a>
                            )}
                        </div>

                        {/* Agency Box */}
                        <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
                            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
                                {isRtl ? 'معلومات الوكالة' : 'Agence de location'}
                            </h4>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-lg text-blue-600 shrink-0">
                                    {agency.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{agency.name}</div>
                                    <div className="text-xs text-slate-500 truncate">{agency.address}</div>
                                </div>
                            </div>
                            <Link
                                href={`/${locale}/rent-agencies/${citySlug}/${agencySlug}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                            >
                                <span>{isRtl ? 'عرض أسطول وصفحة الوكالة كاملة' : 'Voir toute la flotte de l’agence'}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Cars from the same agency */}
            {similarVehicles.length > 0 && (
                <div className="mt-16 pt-12 border-t border-slate-200 dark:border-zinc-800">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                        {isRtl ? `سيارات أخرى من وكالة ${agency.name}` : `Autres véhicules de l’agence ${agency.name}`}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similarVehicles.map(sim => (
                            <AgencyVehicleCard
                                key={sim.id}
                                vehicle={sim}
                                agencyName={agency.name}
                                agencyPhone={agencyPhone}
                                agencyWhatsapp={agencyWhatsapp}
                                citySlug={citySlug}
                                agencySlug={agencySlug}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
