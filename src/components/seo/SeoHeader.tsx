'use client';

import { useLocale } from 'next-intl';

interface SeoHeaderProps {
    title: string;
    description: string;
    breadcrumbs?: Array<{ label: string; href: string }>;
}

export default function SeoHeader({ title, description, breadcrumbs }: SeoHeaderProps) {
    const locale = useLocale();

    return (
        <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 pb-8 pt-4 mb-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumbs */}
                {breadcrumbs && (
                    <nav className="flex items-center text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.href} className="flex items-center">
                                {index > 0 && <span className="mx-2 text-gray-300">/</span>}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <a
                                        href={crumb.href}
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        {crumb.label}
                                    </a>
                                )}
                            </div>
                        ))}
                    </nav>
                )}

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    {title}
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                    {description}
                </p>

                {/* Trust Badges - Static for SEO pages to reinforce trust */}
                <div className="flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                        <span>✓</span>
                        {locale === 'ar' ? 'إعلانات موثوقة' : 'Annonces vérifiées'}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                        <span>✓</span>
                        {locale === 'ar' ? 'تواصل مباشر' : 'Contact direct'}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full">
                        <span>✓</span>
                        {locale === 'ar' ? 'بدون وسطاء' : 'Sans intermédiaires'}
                    </div>
                </div>
            </div>
        </div>
    );
}
