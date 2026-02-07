import { Link } from '@/navigation';
import { BRANDS } from '@/constants/data';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function BrandSection() {
    const t = useTranslations('Common');

    // Display top 12 brands or standard set
    const displayedBrands = BRANDS.slice(0, 12);

    return (
        <section className="py-10 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('browseByBrand')}
                    </h2>
                    <Link href="/cars" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {t('viewAll')}
                    </Link>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                    {displayedBrands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/cars/brands/${brand.id}`}
                            className="flex flex-col items-center group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            <div className="relative w-16 h-16 mb-3 grayscale group-hover:grayscale-0 transition-all duration-300">
                                <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                                {brand.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
