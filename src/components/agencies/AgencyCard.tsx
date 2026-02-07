
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

export default function AgencyCard({ agency }: AgencyCardProps) {
    const t = useTranslations('RentAgencies.Listing');

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full bg-slate-100 dark:bg-zinc-800">
                {agency.photos && agency.photos.length > 0 ? (
                    <Image
                        src={agency.photos[0]}
                        alt={agency.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <span className="text-4xl font-bold opacity-20">{agency.name.charAt(0)}</span>
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
