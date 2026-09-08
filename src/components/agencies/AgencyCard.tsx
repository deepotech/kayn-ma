
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Phone } from 'lucide-react';

interface AgencyCardProps {
    agency: {
        name: string;
        slug: string;
        city: string;
        address: string;
        phone: string | null;
        rating: number | null;
        reviewsCount: number | null;
        photos: string[];
        categories: string[];
    };
}

import { useTranslations } from 'next-intl';

const FALLBACK_CAR_IMAGES = [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800'
];

function getFallbackCarImage(identifier: string): string {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
        hash = (hash << 5) - hash + identifier.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % FALLBACK_CAR_IMAGES.length;
    return FALLBACK_CAR_IMAGES[index];
}

export default function AgencyCard({ agency }: AgencyCardProps) {
    const t = useTranslations('RentAgencies.Listing');

    // Filter all non-gps valid photos
    const validPhotos = (agency.photos || []).filter(
        p => p && typeof p === 'string' && !p.includes('googleusercontent.com/gps-cs-s/')
    );

    const [photoIndex, setPhotoIndex] = useState(0);
    const [usedFallback, setUsedFallback] = useState(validPhotos.length === 0);

    const currentSrc = !usedFallback && validPhotos.length > 0 && photoIndex < validPhotos.length
        ? validPhotos[photoIndex]
        : getFallbackCarImage(agency.slug || agency.name || 'car');

    const handleImageError = () => {
        if (!usedFallback && photoIndex + 1 < validPhotos.length) {
            setPhotoIndex(prev => prev + 1);
        } else {
            setUsedFallback(true);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <Image
                    src={currentSrc}
                    alt={agency.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    onError={handleImageError}
                />

                {usedFallback && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none flex flex-col justify-end p-2.5 z-[5]">
                        <div className="flex items-center gap-1.5 text-white/90">
                            <span className="w-5 h-5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold flex items-center justify-center shadow">
                                {agency.name ? agency.name.charAt(0).toUpperCase() : 'C'}
                            </span>
                            <span className="text-[11px] font-medium truncate drop-shadow">
                                {agency.name}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Link href={`/rent-agencies/${agency.city}/${agency.slug}`} className="hover:underline">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{agency.name}</h3>
                    </Link>
                    {agency.rating && (
                        <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-xs font-medium text-yellow-700 dark:text-yellow-500">
                            <Star className="w-3 h-3 me-1 fill-current" />
                            {agency.rating.toFixed(1)} <span className="text-slate-400 ms-1">({agency.reviewsCount})</span>
                        </div>
                    )}
                </div>

                <div className="flex items-start text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <MapPin className="w-4 h-4 me-1.5 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{agency.address}</span>
                </div>

                {agency.phone && (
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <Phone className="w-4 h-4 me-1.5 shrink-0" />
                        <span>{agency.phone}</span>
                    </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                    {agency.categories.slice(0, 3).map((cat, i) => (
                        <span key={i} className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-px rounded-full">
                            {cat}
                        </span>
                    ))}
                </div>

                <Link
                    href={`/rent-agencies/${agency.city}/${agency.slug}`}
                    className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                    {t('viewDetails')}
                </Link>
            </div>
        </div>
    );
}
