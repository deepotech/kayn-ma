'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import ListingFormWizard from '@/components/dashboard/ListingFormWizard';
import { ArrowLeft } from 'lucide-react';

export default function NewListingPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/${locale}/dashboard/listings`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <ArrowLeft className={`h-6 w-6 ${isRtl ? 'rotate-180' : ''}`} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isRtl ? 'إضافة إعلان جديد' : 'Nouvelle Annonce'}
                </h1>
            </div>

            <ListingFormWizard mode="create" />
        </div>
    );
}
