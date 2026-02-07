import { getTranslations } from 'next-intl/server';
import ListingCard from '@/components/listings/ListingCard';
import SearchFilters from '@/components/search/SearchFilters';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { getListings, SearchParams } from '@/lib/listings';

// function capitalize is defined below

function capitalize(s: string) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: { locale }, searchParams }: any) {
    const brand = searchParams.brand ? capitalize(searchParams.brand) : '';
    const city = searchParams.city ? searchParams.city : ''; // Need name
    const model = searchParams.model ? capitalize(searchParams.model) : '';

    // Construct Dynamic Title
    let title = '';
    let description = '';

    if (locale === 'ar') {
        const brandText = brand ? `${brand} ${model}` : 'سيارات';
        const cityText = city ? `في ${city}` : 'في المغرب';
        title = `${brandText} للبيع ${cityText} | Cayn.ma`;
        description = `أفضل عروض ${brandText} ${cityText}. تصفح آلاف الإعلانات الحقيقية، قارن الأسعار وتواصل مع البائع مباشرة.`;
    } else {
        const brandText = brand ? `${brand} ${model}` : 'Voitures';
        const cityText = city ? `à ${city}` : 'au Maroc';
        title = `${brandText} à vendre ${cityText} | Cayn.ma`;
        description = `Meilleures offres de ${brandText} ${cityText}. Parcourez des milliers d'annonces vérifiées, comparez les prix et contactez le vendeur en direct.`;
    }

    // Canonical handling: Clean pagination params if feasible, or just current full path
    // Ideally should be absolute path without tracking params
    const canonicalPath = new URLSearchParams(searchParams);
    canonicalPath.delete('page'); // Canonical usually points to page 1 or self? Google says self.
    // Actually simplicity: Canonical = current URL
    const queryString = new URLSearchParams(searchParams).toString();
    const cleanQuery = queryString ? `?${queryString}` : '';

    return {
        title,
        description: description.substring(0, 160),
        alternates: {
            canonical: `https://cayn.ma/${locale}/cars${cleanQuery}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
        }
    };
}

export default async function CarsPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string };
    searchParams: SearchParams;
}) {

    // 1. Fetch Listings with NO slug filters
    const listings = await getListings(searchParams, null);

    const t = await getTranslations('Common');
    const tHome = await getTranslations('Home');

    // Simple title logic (can be enhanced if needed, but SEO pages cover specific cases)
    const pageTitle = locale === 'ar' ? 'كل السيارات' : 'Toutes les voitures';

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Filters Sidebar */}
                <SearchFilters totalResults={listings.length} />

                {/* Results */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        {pageTitle}
                        <span className="text-gray-500 font-normal text-lg ms-2">
                            ({listings.length})
                        </span>
                    </h1>

                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((listing: any) => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                            <span className="text-5xl mb-4">🚗</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {locale === 'ar' ? 'لا توجد إعلانات' : 'Aucune annonce trouvée'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {locale === 'ar'
                                    ? 'كن أول من ينشر إعلانه هنا'
                                    : 'Soyez le premier à publier ici'}
                            </p>
                            <Link href="/post">
                                <Button className="gap-2">
                                    <Plus className="h-5 w-5" />
                                    {tHome('postFreeAd')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
