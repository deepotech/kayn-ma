import { Link } from '@/navigation';
import ListingCard from './ListingCard';
import { getSimilarListings } from '@/lib/listings';
import { getTranslations } from 'next-intl/server';

interface SimilarListingsProps {
    currentListing: {
        _id: string;
        brandSlug?: string;
        bodyTypeSlug?: string;
        price: number;
        city: string | any;
        brand: string | any;
        bodyType?: string | any;
    };
    locale: string;
}

export default async function SimilarListings({ currentListing, locale }: SimilarListingsProps) {
    const t = await getTranslations('ListingPage');

    // Safely extract slugs or strings
    const brandSlug = currentListing.brandSlug || (typeof currentListing.brand === 'object' ? (currentListing.brand as any).slug : currentListing.brand?.toLowerCase());
    const citySlug = typeof currentListing.city === 'object' ? (currentListing.city as any).slug : currentListing.city?.toLowerCase();
    const bodyTypeSlug = currentListing.bodyTypeSlug || (typeof currentListing.bodyType === 'object' ? (currentListing.bodyType as any).slug : currentListing.bodyType?.toLowerCaseLiteral?.());
    // Typescript safe extraction
    const safeBodySlug = currentListing.bodyTypeSlug || (typeof (currentListing as any).bodyType === 'object' ? (currentListing as any).bodyType.slug : undefined);

    const similar = await getSimilarListings(currentListing._id, {
        brandSlug: brandSlug,
        bodyTypeSlug: safeBodySlug,
        price: currentListing.price,
        city: citySlug
    });

    if (!similar || similar.length === 0) return null;

    return (
        <div className="mt-12 pt-12 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('similarListings')}
                </h2>
                <Link
                    href={`/cars/${brandSlug || 'sedan'}`} // Fallback to safe slug
                    className="text-blue-600 dark:text-blue-500 hover:underline text-sm font-medium"
                >
                    {t('viewMore')}
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map((listing: any) => (
                    <ListingCard key={listing._id} listing={listing} />
                ))}
            </div>
        </div>
    );
}
