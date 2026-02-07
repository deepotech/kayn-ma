import { NormalizedAgency } from '@/lib/rent-agencies/normalize';
import { Link } from '@/navigation';
import { MapPin, Phone, Star, Image as ImageIcon, ExternalLink, Clock, Navigation, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface AgencyCardProps {
    agency: NormalizedAgency;
}

export default function AgencyCard({ agency }: AgencyCardProps) {
    const t = useTranslations('RentAgencies.Card');
    const tCommon = useTranslations('Common');

    // Thumbnail logic: prefer first photo, fallback to placeholder
    const thumbnail = agency.photos && agency.photos.length > 0 ? agency.photos[0] : null;

    // Build google maps direction link
    // Build google maps direction link
    const mapsLink = agency.location?.lat
        ? `https://www.google.com/maps/dir/?api=1&destination=${agency.location.lat},${agency.location.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.name + ' ' + agency.city)}`;

    return (
        <div className="group bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row overflow-hidden h-full md:h-52">
            {/* Image Section */}
            <div className="relative h-48 md:h-full w-full md:w-1/3 min-w-[33%] md:max-w-[15rem] shrink-0 bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={agency.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 300px"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <ImageIcon className="w-12 h-12 opacity-50" />
                    </div>
                )}

                {/* Rating Badge (Absolute on image for mobile, hidden on desktop usually or kept small) */}
                {agency.rating && (
                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur px-2 py-1 rounded-md flex items-center shadow-sm z-10 rtl:right-3 rtl:left-auto border border-white/10">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 me-1" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {agency.rating.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-500 ms-1">
                            ({agency.reviewsCount})
                        </span>
                    </div>
                )}

                {/* Mixed Services Badge */}
                {agency.isMixedService && (
                    <div className="absolute bottom-3 right-3 bg-amber-100 dark:bg-amber-900/90 backdrop-blur px-2 py-1 rounded-md flex items-center shadow-sm border border-amber-200 dark:border-amber-700 z-10 rtl:left-3 rtl:right-auto">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 uppercase tracking-tight">
                            {t('mixedServices') || 'Mixed Services'}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                            <Link href={`/rent-agencies/${agency.citySlug}/${agency.slug}`}>
                                {agency.name}
                            </Link>
                        </h3>
                        {/* Open/Closed Indicator (Simplified) */}
                        {agency.openingHours && agency.openingHours.length > 0 && (
                            <span className="hidden md:inline-flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50 whitespace-nowrap shrink-0 ms-2">
                                <Clock className="w-3 h-3 me-1" />
                                {t('openNow') || 'Open Now'}
                            </span>
                        )}
                    </div>

                    {/* Address */}
                    <div className="flex items-start mb-3">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 me-1.5 shrink-0" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 md:line-clamp-1">
                            {agency.address}
                        </p>
                    </div>

                    {/* Tags Chips - Max 3 */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {agency.categories.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded text-xs border border-slate-200 dark:border-zinc-700 truncate max-w-[120px]">
                                {tag}
                            </span>
                        ))}
                        {agency.categories.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-zinc-800 text-slate-400 rounded text-xs">
                                +{agency.categories.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="flex items-center gap-2 pt-3 md:pt-0 mt-auto md:justify-end border-t md:border-t-0 border-slate-100 dark:border-zinc-800">
                    <a
                        href={mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Directions"
                    >
                        <Navigation className="w-4 h-4" />
                    </a>

                    {agency.website && (
                        <a
                            href={agency.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={t('website') || "Website"}
                        >
                            <Globe className="w-4 h-4" />
                        </a>
                    )}

                    {agency.phone ? (
                        <a
                            href={`tel:${agency.phone}`}
                            className="hidden md:flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 dark:border-emerald-900/50"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            {tCommon('call') || 'Call'}
                        </a>
                    ) : null}

                    <Link
                        href={`/rent-agencies/${agency.citySlug}/${agency.slug}`}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
                    >
                        {t('viewDetails') || 'View Details'}
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
