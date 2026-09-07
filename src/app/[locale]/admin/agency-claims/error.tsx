'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export default function AdminAgencyClaimsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    useEffect(() => {
        // Log locally for debugging without exposing raw database details to UI
        console.error('[AdminAgencyClaimsError boundary]', error?.message);
    }, [error]);

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {isRtl
                            ? 'ميزة طلبات توثيق الوكالات غير مفعّلة حالياً'
                            : 'La fonctionnalité des demandes de revendication n\'est pas activée actuellement'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                        {isRtl
                            ? 'تعذر تحميل هذه الصفحة في الوقت الحالي. يرجى المحاولة لاحقاً أو العودة إلى لوحة التحكم.'
                            : 'Impossible de charger cette page pour le moment. Veuillez réessayer plus tard ou revenir au tableau de bord.'}
                    </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {isRtl ? 'إعادة المحاولة' : 'Réessayer'}
                    </button>
                    <Link
                        href={`/${locale}/admin`}
                        className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm"
                    >
                        {isRtl ? 'العودة للوحة التحكم' : 'Retour au tableau de bord'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
