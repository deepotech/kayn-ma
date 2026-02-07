import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { BODY_TYPES } from '@/constants/data';
import Image from 'next/image';

export default function BodyTypeSection() {
    const t = useTranslations('Common');

    return (
        <section className="py-10 bg-white dark:bg-zinc-950">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {t('browseByBodyType')}
                </h2>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
                    {BODY_TYPES.map((type) => (
                        <Link
                            key={type.id}
                            href={`/cars/${type.id}`}
                            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all group bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800"
                        >
                            <div className="h-10 w-16 mb-3 relative flex items-center justify-center">
                                <Image
                                    src={type.image}
                                    alt={t(`BodyTypes.${type.id}`, { fallback: type.id })}
                                    width={64}
                                    height={40}
                                    className="object-contain text-gray-400 group-hover:text-blue-600 transition-colors dark:invert dark:opacity-70 dark:group-hover:opacity-100"
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700">
                                {t(`BodyTypes.${type.id}`, { fallback: type.id })}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
