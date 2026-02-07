import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Calendar, Gauge, Fuel, Settings, Car, FileText, MapPin } from 'lucide-react';

function simpleSlug(str: string) {
    return str.toLowerCase().trim().replace(/\s+/g, '-');
}

interface SpecsGridProps {
    brand: string;
    brandSlug?: string;
    model: string;
    modelSlug?: string;
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    city?: string;
    bodyType?: string;
    bodyTypeSlug?: string;
}

export default function SpecsGrid({
    brand, brandSlug,
    model, modelSlug,
    year,
    mileage,
    fuelType,
    transmission,
    city,
    bodyType, bodyTypeSlug
}: SpecsGridProps) {
    const t = useTranslations('ListingPage');

    const bSlug = brandSlug || simpleSlug(brand);
    // city is usually passed as prop to ListingDetail, but SpecsGrid didn't have it. 
    // I will add it to props.

    const specs = [
        {
            icon: Calendar,
            label: t('year'),
            value: year,
            href: `/search?minYear=${year}&maxYear=${year}`
        },
        {
            icon: Fuel,
            label: t('fuel'),
            value: fuelType,
            href: `/search?q=${simpleSlug(fuelType)}`
        },
        {
            icon: Settings,
            label: t('transmission'),
            value: transmission,
            href: `/search?q=${simpleSlug(transmission)}`
        },
        {
            icon: Gauge,
            label: t('mileage'),
            value: `${mileage.toLocaleString()} km`,
            href: null // Mileage usually not filterable like this
        },
        {
            icon: Car,
            label: t('brand'),
            value: brand,
            href: `/cars/${bSlug}`
        },
        {
            icon: FileText,
            label: t('model'),
            value: model,
            href: `/cars/${bSlug}?model=${modelSlug || simpleSlug(model)}`
        },
    ];

    if (bodyType) {
        specs.push({
            icon: Car,
            label: t('bodyType'), // Need to ensure translation key exists or use fallback
            value: bodyType,
            href: `/cars/${bodyTypeSlug || simpleSlug(bodyType)}`
        });
    }

    if (city) {
        specs.push({
            icon: MapPin, // Need to import MapPin
            label: t('city'), // Check key
            value: city,
            href: `/cars/${simpleSlug(city)}`
        });
    }

    // Original grid was fixed 6. Now dynamic.

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {specs.map((spec, index) => {
                const Content = (
                    <>
                        <spec.icon className="h-5 w-5 text-blue-500 mb-2" />
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{spec.label}</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm whitespace-nowrap overflow-hidden text-ellipsis px-1">
                                {spec.value}
                            </p>
                        </div>
                    </>
                );

                if (spec.href) {
                    return (
                        <Link
                            key={index}
                            href={spec.href}
                            className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                        >
                            {Content}
                        </Link>
                    );
                }

                return (
                    <div
                        key={index}
                        className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700"
                    >
                        {Content}
                    </div>
                );
            })}
        </div>
    );
}
