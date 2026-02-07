'use client';

import { useTranslations } from 'next-intl';
import { Search, Phone, Filter, ShieldAlert, MessageSquare, Clock, Globe, Image as ImageIcon } from 'lucide-react';

export interface FilterState {
    search: string;
    rating: string;
    hasPhone: boolean;
    hasReviews: boolean;
    hideMixed: boolean;
    hasWebsite: boolean;
    hasPhotos: boolean;
    isOpenNow: boolean;
    categories: string[];
}

interface AgencyFiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    availableCategories?: string[]; // For future multi-select
}

export default function AgencyFilters({ filters, onChange, availableCategories = [] }: AgencyFiltersProps) {
    const t = useTranslations('RentAgencies.Filters');

    const updateFilter = (key: keyof FilterState, value: any) => {
        onChange({ ...filters, [key]: value });
    };

    const toggleFilter = (key: keyof FilterState) => {
        const value = filters[key];
        if (typeof value === 'boolean') {
            onChange({ ...filters, [key]: !value });
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 mb-8 sticky top-20 z-20 opacity-95 backdrop-blur-md transition-all">
            <div className="flex flex-col gap-5">
                {/* Top Row: Search & Primary Filters */}
                <div className="flex flex-col xl:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="relative w-full xl:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rtl:right-3 rtl:left-auto" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder') || 'Search name, address, category...'}
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none rtl:pr-11 rtl:pl-5 transition-all text-base"
                        />
                    </div>

                    {/* Filters Group */}
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                        <Filter className="w-5 h-5 text-slate-400 hidden xl:block" />

                        {/* Rating Filter */}
                        <select
                            value={filters.rating}
                            onChange={(e) => updateFilter('rating', e.target.value)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[140px] outline-none"
                        >
                            <option value="">{t('allRatings') || 'All Ratings'}</option>
                            <option value="4.5">4.5+ ★★★★★</option>
                            <option value="4.0">4.0+ ★★★★☆</option>
                            <option value="3.5">3.5+ ★★★☆☆</option>
                        </select>

                        {/* Toggles */}
                        <button
                            onClick={() => toggleFilter('isOpenNow')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap ${filters.isOpenNow
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-300'
                                }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span>{t('isOpenNow') || 'Open Now'}</span>
                        </button>

                        <button
                            onClick={() => toggleFilter('hasPhotos')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap ${filters.hasPhotos
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-300'
                                }`}
                        >
                            <ImageIcon className="w-4 h-4" />
                            <span>{t('hasPhotos') || 'Has Photos'}</span>
                        </button>

                        <button
                            onClick={() => toggleFilter('hasPhone')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap ${filters.hasPhone
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-300'
                                }`}
                        >
                            <Phone className="w-4 h-4" />
                            <span>{t('hasPhone') || 'Phone'}</span>
                        </button>

                        <button
                            onClick={() => toggleFilter('hasWebsite')}
                            className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap ${filters.hasWebsite
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-300'
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            <span>{t('hasWebsite') || 'Website'}</span>
                        </button>

                        <button
                            onClick={() => toggleFilter('hideMixed')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap ${filters.hideMixed
                                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-300'
                                }`}
                            title={t('hideMixedTitle') || 'Hide generic services'}
                        >
                            <ShieldAlert className="w-4 h-4" />
                            <span>{t('hideMixed') || 'Hide Mixed'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
