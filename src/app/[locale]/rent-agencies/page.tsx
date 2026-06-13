
import Link from 'next/link';
import { Metadata } from 'next';
import { MapPin, Car, ArrowRight, Star } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Car Rental Agencies in Morocco',
    description: 'Find the best car rental agencies in Marrakech, Casablanca, and all over Morocco.',
};

const CITIES = [
    { name: 'Marrakech', nameAr: 'مراكش', slug: 'marrakech', active: true, image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&q=80&w=600' },
    { name: 'Rabat', nameAr: 'الرباط', slug: 'rabat', active: true, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=600' },
    { name: 'Casablanca', nameAr: 'الدار البيضاء', slug: 'casablanca', active: true, image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&q=80&w=600' },
    { name: 'Safi', nameAr: 'آسفي', slug: 'safi', active: true, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=600' },
    { name: 'Berrechid', nameAr: 'برشيد', slug: 'berrechid', active: true, image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=600' },
    { name: 'Settat', nameAr: 'سطات', slug: 'settat', active: true, image: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&q=80&w=600' },
    { name: 'Khemisset', nameAr: 'الخميسات', slug: 'khemisset', active: true, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600' },
    { name: 'Kenitra', nameAr: 'القنيطرة', slug: 'kenitra', active: true, image: 'https://images.unsplash.com/photo-1510662145379-13537db782dc?auto=format&fit=crop&q=80&w=600' },
    { name: 'Oujda', nameAr: 'وجدة', slug: 'oujda', active: true, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600' },
    { name: 'Fès', nameAr: 'فاس', slug: 'fes', active: true, image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600' },
    { name: 'Meknès', nameAr: 'مكناس', slug: 'meknes', active: true, image: 'https://images.unsplash.com/photo-1596700813955-46743387b998?auto=format&fit=crop&q=80&w=600' },
    { name: 'Tanger', nameAr: 'طنجة', slug: 'tanger', active: true, image: 'https://images.unsplash.com/photo-1589365252845-092198ba5334?auto=format&fit=crop&q=80&w=600' },
    { name: 'Agadir', nameAr: 'أكادير', slug: 'agadir', active: true, image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=600' },
    { name: 'Tétouan', nameAr: 'تطوان', slug: 'tetouan', active: true, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600' },
    { name: 'Kelaat Sraghna', nameAr: 'قلعة السراغنة', slug: 'kelaat-sraghna', active: true, image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=600' },
    { name: 'Beni Mellal', nameAr: 'بني ملال', slug: 'beni-mellal', active: true, image: 'https://images.unsplash.com/photo-1549880180-250a468a4b6e?auto=format&fit=crop&q=80&w=600' },
];

import { useTranslations } from 'next-intl';

interface Props {
    params: {
        locale: string;
    };
}

export default function RentAgenciesPage({ params: { locale } }: Props) {
    const t = useTranslations('RentAgencies.Landing');
    // const locale = useLocale(); // Removed

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    {t('title')}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    {t('subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {CITIES.map((city) => (
                    <Link
                        key={city.slug}
                        href={city.active ? `/${locale}/rent-agencies/${city.slug}` : '#'}
                        className={`group relative overflow-hidden rounded-xl aspect-video ${!city.active ? 'cursor-not-allowed opacity-60 grayscale' : ''}`}
                    >
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />
                        {city.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={city.image}
                                alt={city.name}
                                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-800 w-full h-full" />
                        )}

                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                            <h2 className="text-2xl font-bold mb-2">{locale === 'ar' ? city.nameAr : city.name}</h2>
                            {city.active ? (
                                <span className="flex items-center text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                                    {t('browseAgencies')} <ArrowRight className="w-4 h-4 ms-1" />
                                </span>
                            ) : (
                                <span className="text-sm font-medium bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                                    {t('comingSoon')}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}

                {/* Placeholder for future expansion visualization */}
                <div className="relative overflow-hidden rounded-xl aspect-video border-2 border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <MapPin className="w-8 h-8 mb-2 opacity-50" />
                    <p className="font-medium">{t('moreCities')}</p>
                    <p className="text-xs mt-1">{t('citiesList')}</p>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
                <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Car className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{t('Features.verifiedTitle')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('Features.verifiedDesc')}</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{t('Features.localTitle')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('Features.localDesc')}</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{t('Features.ratingsTitle')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('Features.ratingsDesc')}</p>
                </div>
            </div>
        </div>
    );
}
