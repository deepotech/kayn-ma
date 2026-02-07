import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import ListingCard from '@/components/listings/ListingCard';
import SeoHeader from '@/components/seo/SeoHeader';
import InternalLinks from '@/components/seo/InternalLinks';

// Define allowed ranges
const VALID_RANGES = ['under-50000', '50000-100000', '100000-200000', 'over-200000'];

// Parse range string to mongo query
function parseRange(range: string) {
    if (range === 'under-50000') return { $lt: 50000 };
    if (range === '50000-100000') return { $gte: 50000, $lte: 100000 };
    if (range === '100000-200000') return { $gte: 100000, $lte: 200000 };
    if (range === 'over-200000') return { $gt: 200000 };
    return null;
}

export async function generateStaticParams() {
    return VALID_RANGES.map((range) => ({
        range,
    }));
}

export async function generateMetadata({ params: { range, locale } }: any) {
    // Basic dynamic title
    return {
        title: locale === 'ar' ? 'سيارات حسب الميزانية' : 'Voitures par budget'
    };
}

export default async function BudgetPage({ params: { range, locale } }: any) {
    if (!VALID_RANGES.includes(range)) notFound();

    await dbConnect();
    const priceQuery = parseRange(range);
    const listings = await Listing.find({
        price: priceQuery,
        status: 'active'
    })
        .sort({ price: 1 }) // Sort by price asc for budget pages usually
        .limit(30)
        .lean();

    const count = listings.length;

    // Content Generation
    let title = '';
    let description = '';

    if (locale === 'ar') {
        if (range === 'under-50000') title = 'سيارات رخيصة أقل من 5 ملايين (50,000 درهم)';
        else if (range === '50000-100000') title = 'سيارات متوسطة بين 5 و 10 مليون';
        else if (range === '100000-200000') title = 'سيارات بين 10 و 20 مليون';
        else title = 'سيارات فاخرة أكثر من 20 مليون';

        description = `تصفح ${count} سيارة للبيع في المغرب حسب ميزانيتك. عروض حصرية ${title}.`;
    } else {
        if (range === 'under-50000') title = 'Voitures pas chères moins de 50 000 DH';
        else if (range === '50000-100000') title = 'Voitures entre 50k et 100k DH';
        else if (range === '100000-200000') title = 'Voitures entre 100k et 200k DH';
        else title = 'Voitures de luxe plus de 200k DH';

        description = `Trouvez une voiture selon votre budget. ${count} annonces disponibles pour ${title}.`;
    }

    const breadcrumbs = [
        { label: locale === 'ar' ? 'الرئيسية' : 'Accueil', href: '/' },
        { label: locale === 'ar' ? 'الميزانية' : 'Budget', href: '#' },
        { label: title, href: `/cars/budget/${range}` },
    ];

    return (
        <>
            <SeoHeader
                title={title}
                description={description}
                breadcrumbs={breadcrumbs}
            />

            <div className="container mx-auto px-4 pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((l: any) => (
                        <ListingCard key={l._id} listing={l} />
                    ))}
                </div>
                <InternalLinks />
            </div>
        </>
    );
}
