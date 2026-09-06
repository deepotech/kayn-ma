'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MapPin, Phone, Star, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { NormalizedAgency } from '@/lib/rent-agencies/normalize';
import { useLocale } from 'next-intl';

interface RelatedAgenciesCarouselProps {
    agencies: NormalizedAgency[];
    title: string;
    subtitle?: string;
}

const DEFAULT_COVER = '/images/agency-placeholder.jpg';

function cleanUrl(url?: string | null): string {
    if (!url || typeof url !== 'string') return DEFAULT_COVER;
    const trimmed = url.trim();
    if (!trimmed || trimmed.includes('googleusercontent.com/gps-cs-s/')) {
        return DEFAULT_COVER;
    }
    return trimmed;
}

export default function RelatedAgenciesCarousel({
    agencies,
    title,
    subtitle
}: RelatedAgenciesCarouselProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    if (!agencies || agencies.length === 0) return null;

    const checkScrollButtons = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxScroll = scrollWidth - clientWidth;
        const currentAbs = Math.abs(scrollLeft);
        setCanScrollLeft(currentAbs > 10);
        setCanScrollRight(currentAbs < maxScroll - 10);
    };

    const scroll = (direction: 'prev' | 'next') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const scrollAmount = Math.max(el.clientWidth * 0.75, 300);
        const sign = isRtl ? (direction === 'next' ? -1 : 1) : (direction === 'next' ? 1 : -1);
        el.scrollBy({ left: sign * scrollAmount, behavior: 'smooth' });
    };

    return (
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-zinc-800">
            {/* Header with Navigation Controls */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Arrow navigation buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => scroll('prev')}
                        aria-label="Previous agencies"
                        className="w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 flex items-center justify-center transition-all shadow-sm"
                    >
                        {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => scroll('next')}
                        aria-label="Next agencies"
                        className="w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 active:scale-95 flex items-center justify-center transition-all shadow-sm"
                    >
                        {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Scrollable Track */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScrollButtons}
                className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-2 pb-6 px-1 -mx-1 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {agencies.map((agency) => {
                    const detailHref = `/${locale}/rent-agencies/${agency.citySlug}/${agency.slug}`;
                    const photoSrc = cleanUrl(
                        agency.coverPhoto || (agency.photos && agency.photos.length > 0 ? agency.photos[0] : null)
                    );

                    return (
                        <div
                            key={agency._id}
                            className="w-[82vw] max-w-[310px] sm:w-[290px] md:w-[305px] shrink-0 snap-start bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                        >
                            {/* Card Top: Image */}
                            <div>
                                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                                    <Link href={detailHref} className="block w-full h-full">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={photoSrc}
                                            alt={agency.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (target.src !== DEFAULT_COVER) {
                                                    target.src = DEFAULT_COVER;
                                                }
                                            }}
                                        />
                                    </Link>
                                    {agency.verificationStatus === 'VERIFIED' && (
                                        <div className="absolute top-2.5 start-2.5">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[11px] font-bold shadow-md">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>{isRtl ? 'موثقة' : 'Vérifiée'}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Body Info */}
                                <div className="p-4">
                                    <Link href={detailHref} className="block">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {agency.name}
                                        </h3>
                                    </Link>

                                    {/* Rating & City */}
                                    <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                                        {agency.rating ? (
                                            <div className="flex items-center text-slate-800 dark:text-zinc-200">
                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 me-1" />
                                                <span className="font-bold">{agency.rating.toFixed(1)}</span>
                                                <span className="text-slate-400 ms-1">({agency.reviewsCount})</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">{isRtl ? 'وكالة جديدة' : 'Nouvelle'}</span>
                                        )}
                                        <span className="text-slate-300 dark:text-zinc-700">•</span>
                                        <div className="flex items-center text-slate-700 dark:text-zinc-300 capitalize truncate">
                                            <MapPin className="w-3.5 h-3.5 me-1 text-blue-500 shrink-0" />
                                            <span className="truncate">{agency.citySlug}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Bottom: Actions */}
                            <div className="p-4 pt-0 border-t border-slate-100 dark:border-zinc-800/80 mt-2 flex items-center gap-2">
                                <Link
                                    href={detailHref}
                                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-sm shadow-blue-600/20"
                                >
                                    {isRtl ? 'عرض الوكالة' : "Voir l'agence"}
                                </Link>
                                {agency.phone && (
                                    <a
                                        href={`tel:${agency.phone}`}
                                        className="p-2.5 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors shrink-0"
                                        title={isRtl ? 'اتصال' : 'Appeler'}
                                    >
                                        <Phone className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
                {/* Trailing spacer to guarantee last card is never cut off on scroll */}
                <div className="w-2 sm:w-6 shrink-0" aria-hidden="true" />
            </div>
        </div>
    );
}
