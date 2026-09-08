'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    useEffect(() => {
        console.error('[Admin Layout Error Boundary]', error);
    }, [error]);

    return (
        <div className="p-6 max-w-2xl mx-auto my-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
                    <AlertCircle className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">
                        {isRtl ? 'حدث خطأ في لوحة التحكم' : 'Une erreur est survenue dans le panneau d\'administration'}
                    </h2>
                    <p className="text-sm text-zinc-400 max-w-md mx-auto">
                        {isRtl
                            ? 'تعذر تحميل هذه الصفحة. يرجى إعادة المحاولة أو العودة إلى الصفحة الرئيسية للوحة التحكم.'
                            : 'Impossible de charger cette page. Veuillez réessayer ou retourner au tableau de bord.'}
                    </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {isRtl ? 'إعادة المحاولة' : 'Réessayer'}
                    </button>

                    <Link
                        href={`/${locale}/admin`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-colors text-sm border border-zinc-700"
                    >
                        <Home className="w-4 h-4" />
                        {isRtl ? 'لوحة التحكم' : 'Tableau de bord'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
