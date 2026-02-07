import { getTranslations } from 'next-intl/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import ListingCard from '@/components/listings/ListingCard';
import SeoHeader from '@/components/seo/SeoHeader';
import InternalLinks from '@/components/seo/InternalLinks';

// Fetch Listings from Individuals only
async function getDirectListings() {
    await dbConnect();
    const listings = await Listing.find({
        sellerType: { $ne: 'agency' }, // Not agency
        status: 'active'
    })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

    return JSON.parse(JSON.stringify(listings));
}

export async function generateMetadata({ params: { locale } }: any) {
    const title = locale === 'ar'
        ? 'سيارات للبيع من المالك مباشرة - بدون وسطاء | Cayn.ma'
        : 'Voitures à vendre particulier à particulier - Sans intermédiaire | Cayn.ma';

    return { title };
}

export default async function DirectPage({ params: { locale } }: any) {
    const listings = await getDirectListings();

    const title = locale === 'ar'
        ? 'سيارات للبيع بدون وسطاء (بيع مباشر)'
        : 'Vente de voitures de particulier à particulier';

    const description = locale === 'ar'
        ? 'تصفح سيارات للبيع من المالك مباشرة في المغرب. وفر فلوس السمسار وتواصل نيشان مع مول الطوموبيل. همزات وعروض حصرية.'
        : 'Parcourez les voitures à vendre directement par les propriétaires au Maroc. Économisez les frais d\'intermédiaire et contactez directement le vendeur.';

    const breadcrumbs = [
        { label: locale === 'ar' ? 'الرئيسية' : 'Accueil', href: '/' },
        { label: locale === 'ar' ? 'بدون وسطاء' : 'Sans intermédiaire', href: '/cars/direct' },
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

                <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-center border border-blue-100 dark:border-blue-900/30">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                        {locale === 'ar' ? 'بغيتي تبيع طوموبيلتك؟' : 'Voulez-vous vendre votre voiture ?'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                        {locale === 'ar'
                            ? 'نشر إعلانك مجاناً على Cayn.ma وتواصل مع آلاف الشراية بلا وسيط.'
                            : 'Publiez votre annonce gratuitement sur Cayn.ma et touchez des milliers d\'acheteurs sans intermédiaire.'}
                    </p>
                    <a
                        href="/post"
                        className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                        {locale === 'ar' ? 'نشر إعلان مجاني' : 'Publier une annonce gratuite'}
                    </a>
                </div>

                <InternalLinks />
            </div>
        </>
    );
}
