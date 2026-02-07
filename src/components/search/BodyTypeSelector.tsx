import { BODY_TYPES } from '@/constants/data';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BodyTypeSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function BodyTypeSelector({ value, onChange, className }: BodyTypeSelectorProps) {
    const t = useTranslations('Common');

    return (
        <div className={cn("grid grid-cols-3 gap-2", className)}>
            {BODY_TYPES.map((type) => {
                const isSelected = value === type.id;

                return (
                    <button
                        key={type.id}
                        onClick={() => onChange(type.id)}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                            isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400"
                                : "border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-600 dark:text-gray-400"
                        )}
                        type="button"
                    >
                        <div className="h-6 w-10 mb-2 relative flex items-center justify-center">
                            <Image
                                src={type.image}
                                alt={t(`BodyTypes.${type.id}`, { fallback: type.id })}
                                width={40}
                                height={24}
                                className={cn(
                                    "object-contain transition-all",
                                    isSelected
                                        ? "opacity-100"
                                        : "opacity-60 dark:invert dark:opacity-50"
                                )}
                            />
                        </div>
                        <span className="text-xs font-medium text-center">{t(`BodyTypes.${type.id}`, { fallback: type.id })}</span>
                    </button>
                );
            })}
        </div>
    );
}
