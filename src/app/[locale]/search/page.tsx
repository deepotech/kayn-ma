import { getTranslations } from 'next-intl/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import ListingCard from '@/components/listings/ListingCard';
import SearchFilters from '@/components/search/SearchFilters';

async function getListings(searchParams: any) {
    await dbConnect();

    const query: any = { status: 'approved', visibility: 'public' };

    // City Filter
    if (searchParams.city) query.city = searchParams.city;

    // Brand Filter
    if (searchParams.brand) query.brand = searchParams.brand;

    // Price Filter
    if (searchParams.minPrice || searchParams.maxPrice) {
        query.price = {};
        if (searchParams.minPrice) query.price.$gte = Number(searchParams.minPrice);
        if (searchParams.maxPrice) query.price.$lte = Number(searchParams.maxPrice);
    }

    // Year Filter
    if (searchParams.minYear || searchParams.maxYear) {
        query.year = {};
        if (searchParams.minYear) query.year.$gte = Number(searchParams.minYear);
        if (searchParams.maxYear) query.year.$lte = Number(searchParams.maxYear);
    }

    const listings = await Listing.find(query).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(listings));
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const t = await getTranslations('Common');
    const listings = await getListings(searchParams);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Filters */}
                <SearchFilters totalResults={listings.length} />

                {/* Results Grid */}
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        {listings.length} {listings.length === 1 ? 'Résultat' : 'Résultats'}
                    </h1>

                    {listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((l: any) => (
                                <ListingCard key={l._id} listing={l} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                            <span className="text-4xl mb-4">🔍</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Aucune annonce trouvée
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Essayez de modifier vos critères de recherche
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
