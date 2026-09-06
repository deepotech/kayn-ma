'use client';

import { useState } from 'react';
import { Car, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLocale } from 'next-intl';

interface AgencyCoverImageProps {
    src?: string | null;
    alt: string;
    agencyName: string;
    cityName?: string;
    isMixedService?: boolean;
    verificationStatus?: string;
    className?: string;
}

const DEFAULT_COVER = '/images/agency-placeholder.jpg';

function cleanImageUrl(url?: string | null): string {
    if (!url || typeof url !== 'string') return DEFAULT_COVER;
    const trimmed = url.trim();
    if (!trimmed) return DEFAULT_COVER;

    // Filter out expired Google Maps session tokens that always 404/403
    if (trimmed.includes('googleusercontent.com/gps-cs-s/')) {
        return DEFAULT_COVER;
    }

    return trimmed;
}

export default function AgencyCoverImage({
    src,
    alt,
    agencyName,
    cityName,
    isMixedService = false,
    verificationStatus,
    className = 'w-full h-full object-cover'
}: AgencyCoverImageProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const isVerified = verificationStatus === 'VERIFIED';

    const cleaned = cleanImageUrl(src);
    const [imgSrc, setImgSrc] = useState<string>(cleaned);
    const [isFallback, setIsFallback] = useState<boolean>(cleaned === DEFAULT_COVER);

    const handleError = () => {
        if (imgSrc !== DEFAULT_COVER) {
            setImgSrc(DEFAULT_COVER);
            setIsFallback(true);
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-900 to-blue-950 select-none">
            {/* Background Image Layer */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={imgSrc}
                alt={alt || agencyName}
                className={`${className} ${isFallback ? 'opacity-25 mix-blend-luminosity filter blur-[1px]' : 'opacity-90'}`}
                onError={handleError}
                loading="eager"
            />

            {/* Gradient Overlays for High-End Cinematic Look */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* Top Bar Badges */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                {/* Category & Service Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/15 shadow-sm">
                        <Car className="w-3.5 h-3.5 text-blue-400" />
                        <span>{isRtl ? 'وكالة كراء سيارات' : 'Agence de location'}</span>
                    </span>

                    {isMixedService && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-white backdrop-blur-md border border-white/20 shadow-sm">
                            {isRtl ? 'بيع وكراء' : 'Vente & Location'}
                        </span>
                    )}
                </div>

                {/* Verified / Trust Watermark */}
                {isVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-md border border-white/20 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                        <span>{isRtl ? 'معتمدة على Cayn' : 'Certifiée Cayn'}</span>
                    </span>
                ) : (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold text-zinc-400 bg-black/40 backdrop-blur-sm border border-white/5">
                        Cayn.ma
                    </span>
                )}
            </div>

            {/* In-Cover Branded Identity (Shown prominently when in fallback mode or wide screen) */}
            {isFallback && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner backdrop-blur-sm">
                        <Car className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md max-w-xl">
                        {agencyName}
                    </h2>
                    {cityName && (
                        <div className="inline-flex items-center gap-1.5 mt-2 text-xs sm:text-sm font-semibold text-zinc-300 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span className="capitalize">{cityName}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
