'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useCallback, useTransition } from 'react';
import { CITIES } from '@/constants/cities';
import { BRANDS, YEARS } from '@/constants/data';
import { MapPin, DollarSign, Car, Calendar, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import BodyTypeSelector from './BodyTypeSelector';
import BrandSidebarSelector from './BrandSidebarSelector';

interface SearchFiltersProps {
    totalResults?: number;
}

export default function SearchFilters({ totalResults }: SearchFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const t = useTranslations('Search');
    const [isPending, startTransition] = useTransition();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Current filter values from URL
    const currentCity = searchParams.get('city') || '';
    const currentBrand = searchParams.get('brand') || '';
    const currentBodyType = searchParams.get('bodyType') || '';
    const currentMinPrice = searchParams.get('minPrice') || '';
    const currentMaxPrice = searchParams.get('maxPrice') || '';
    const currentMinYear = searchParams.get('minYear') || '';
    const currentMaxYear = searchParams.get('maxYear') || '';

    // Count active filters
    const activeFiltersCount = [
        currentCity, currentBrand, currentBodyType, currentMinPrice, currentMaxPrice, currentMinYear, currentMaxYear
    ].filter(Boolean).length;

    // Update URL params
    const updateFilters = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    }, [pathname, router, searchParams]);

    // Reset all filters
    const resetFilters = useCallback(() => {
        startTransition(() => {
            router.push(pathname, { scroll: false });
        });
        setIsMobileOpen(false);
    }, [pathname, router]);

    // Select component
    const FilterSelect = ({
        label,
        icon: Icon,
        name,
        value,
        options,
        placeholder
    }: {
        label: string;
        icon: any;
        name: string;
        value: string;
        options: { value: string; label: string }[];
        placeholder: string;
    }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon className="h-4 w-4 text-blue-500" />
                {label}
            </label>
            <select
                name={name}
                value={value}
                onChange={(e) => updateFilters(name, e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    // Input component
    const FilterInput = ({
        label,
        icon: Icon,
        name,
        value,
        placeholder,
        type = 'number'
    }: {
        label: string;
        icon: any;
        name: string;
        value: string;
        placeholder: string;
        type?: string;
    }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Icon className="h-4 w-4 text-blue-500" />
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={(e) => updateFilters(name, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
            />
        </div>
    );

    // Filter content (shared between desktop and mobile)
    const FilterContent = () => (
        <div className="space-y-5">
            {/* City */}
            <FilterSelect
                label={t('city')}
                icon={MapPin}
                name="city"
                value={currentCity}
                placeholder={t('allCities')}
                options={CITIES.map(c => ({ value: c.slug, label: locale === 'ar' ? c.name.ar : c.name.fr }))}
            />

            {/* Price Range */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    {t('priceRange')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="number"
                        name="minPrice"
                        value={currentMinPrice}
                        onChange={(e) => updateFilters('minPrice', e.target.value)}
                        placeholder={t('min')}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
                    />
                    <input
                        type="number"
                        name="maxPrice"
                        value={currentMaxPrice}
                        onChange={(e) => updateFilters('maxPrice', e.target.value)}
                        placeholder={t('max')}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
                    />
                </div>
            </div>

            {/* Body Type */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Car className="h-4 w-4 text-blue-500" />
                    {t('bodyType')}
                </label>
                <BodyTypeSelector
                    value={currentBodyType}
                    onChange={(val) => updateFilters('bodyType', val === currentBodyType ? '' : val)} // Toggle logic
                />
            </div>

            {/* Brand */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Car className="h-4 w-4 text-blue-500" />
                    {t('brand')}
                </label>
                <BrandSidebarSelector
                    value={currentBrand}
                    onChange={(val) => updateFilters('brand', val === currentBrand ? '' : val)}
                />
            </div>

            {/* Year Range */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    {t('yearRange')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <select
                        name="minYear"
                        value={currentMinYear}
                        onChange={(e) => updateFilters('minYear', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
                    >
                        <option value="">{t('from')}</option>
                        {YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <select
                        name="maxYear"
                        value={currentMaxYear}
                        onChange={(e) => updateFilters('maxYear', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
                    >
                        <option value="">{t('to')}</option>
                        {YEARS.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reset Button */}
            {activeFiltersCount > 0 && (
                <button
                    onClick={resetFilters}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                >
                    <RotateCcw className="h-4 w-4" />
                    {t('reset')}
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 flex-shrink-0">
                <div className={`sticky top-24 rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 ${isPending ? 'opacity-70' : ''}`}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                            <SlidersHorizontal className="h-5 w-5 text-blue-500" />
                            {t('filters')}
                        </h2>
                        {activeFiltersCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                {activeFiltersCount}
                            </span>
                        )}
                    </div>
                    <FilterContent />
                </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                    <SlidersHorizontal className="h-5 w-5" />
                    {t('filters')}
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Filter Drawer */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                <SlidersHorizontal className="h-5 w-5 text-blue-500" />
                                {t('filters')}
                            </h2>
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-zinc-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 overflow-y-auto max-h-[65vh]">
                            <FilterContent />
                        </div>

                        {/* Apply Button */}
                        <div className="p-5 border-t border-gray-100 dark:border-zinc-800">
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                {t('showResults', { count: totalResults || 0 })}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Slide-up animation */}
            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
