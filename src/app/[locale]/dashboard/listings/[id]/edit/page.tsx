'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ListingFormWizard from '@/components/dashboard/ListingFormWizard';
import { getListingById } from '@/lib/dashboard-api';

export default function EditListingPage() {
    const params = useParams();
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const listingId = params.id as string;

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const data = await getListingById(listingId);
                if (!data) {
                    setError(isRtl ? 'الإعلان غير موجود' : 'Annonce non trouvée');
                } else {
                    setListing(data);
                }
            } catch (err) {
                setError(isRtl ? 'فشل تحميل الإعلان' : 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };

        if (listingId) {
            fetchListing();
        }
    }, [listingId, isRtl]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-4">{error}</p>
                <Link
                    href={`/${locale}/dashboard/listings`}
                    className="text-blue-600 font-bold hover:underline"
                >
                    {isRtl ? 'العودة للإعلانات' : 'Retour aux annonces'}
                </Link>
            </div>
        );
    }

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
                    {isRtl ? 'تعديل الإعلان' : 'Modifier l\'annonce'}
                </h1>
            </div>

            <ListingFormWizard
                mode="edit"
                listingId={listingId}
                initialData={listing}
            />
        </div>
    );
}
