'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { CITIES } from '@/constants/cities';
import { MapPin, Search, ChevronDown, Check } from 'lucide-react';

interface CitySelectProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
}

export default function CitySelect({
    value,
    onChange,
    label,
    error,
    placeholder,
    disabled = false
}: CitySelectProps) {
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter cities based on search term
    const filteredCities = CITIES.filter(city => {
        const nameAr = city.name.ar.toLowerCase();
        const nameFr = city.name.fr.toLowerCase();
        const search = searchTerm.toLowerCase();
        return nameAr.includes(search) || nameFr.includes(search);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get selected city name for display
    const getSelectedLabel = () => {
        if (!value) return placeholder || (locale === 'ar' ? 'اختر المدينة' : 'Choisir la ville');
        if (value === 'other') return locale === 'ar' ? 'مدينة أخرى' : 'Autre ville';

        const city = CITIES.find(c => c.slug === value);
        return city ? (locale === 'ar' ? city.name.ar : city.name.fr) : value;
    };

    const handleSelect = (slug: string) => {
        onChange(slug);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-zinc-800 transition-all ${error
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-zinc-700 focus:ring-blue-500 focus:border-blue-500'
                    } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={`block truncate ${!value ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                    {getSelectedLabel()}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg bg-white dark:bg-zinc-800 shadow-xl border border-gray-200 dark:border-zinc-700 max-h-80 flex flex-col">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-800 rounded-t-lg z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={locale === 'ar' ? 'بحث...' : 'Rechercher...'}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Cities List */}
                    <div className="overflow-y-auto flex-1">
                        {filteredCities.length === 0 && (
                            <div className="p-4 text-center text-sm text-gray-500">
                                {locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat'}
                            </div>
                        )}

                        {filteredCities.map((city) => (
                            <button
                                key={city.slug}
                                type="button"
                                onClick={() => handleSelect(city.slug)}
                                className={`w-full text-start px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between ${value === city.slug ? 'text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-200'
                                    }`}
                            >
                                <span>{locale === 'ar' ? city.name.ar : city.name.fr}</span>
                                {value === city.slug && <Check className="h-4 w-4" />}
                            </button>
                        ))}
                    </div>

                    {/* Other Option - Always fixed at bottom */}
                    <div className="border-t border-gray-100 dark:border-zinc-700 p-1">
                        <button
                            type="button"
                            onClick={() => handleSelect('other')}
                            className={`w-full text-start px-4 py-2.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 ${value === 'other' ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-200'
                                }`}
                        >
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>
                                {locale === 'ar' ? 'لم تجد مدينتك؟ اختر (مدينة أخرى)' : 'Ville non trouvée ? Choisir (Autre ville)'}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
