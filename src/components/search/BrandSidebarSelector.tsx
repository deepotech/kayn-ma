import { BRANDS } from '@/constants/data';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface BrandSidebarSelectorProps {
    value?: string;
    onChange: (value: string) => void;
}

export default function BrandSidebarSelector({ value, onChange }: BrandSidebarSelectorProps) {
    const t = useTranslations('Common');
    const [isExpanded, setIsExpanded] = useState(false);

    // Show top 9 initially
    const visibleBrands = isExpanded ? BRANDS : BRANDS.slice(0, 9);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                {visibleBrands.map((brand) => {
                    const isSelected = value === brand.id;
                    return (
                        <button
                            key={brand.id}
                            onClick={() => onChange(brand.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all h-20 group",
                                isSelected
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500"
                                    : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                            )}
                            type="button"
                            title={brand.name}
                        >
                            <div className="relative w-8 h-8 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate w-full text-center">
                                {brand.name}
                            </span>
                            {isSelected && (
                                <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {BRANDS.length > 9 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors py-1"
                    type="button"
                >
                    {isExpanded ? (
                        <span>Okay</span> // Or "Less" translation
                    ) : (
                        <>
                            <span>{BRANDS.length - 9}+</span>
                            <ChevronDown className="w-3 h-3" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
