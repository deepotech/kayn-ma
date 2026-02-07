import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import ListingCard from '@/components/listings/ListingCard';
import SeoHeader from '@/components/seo/SeoHeader';
import InternalLinks from '@/components/seo/InternalLinks';
import { CITIES } from '@/constants/data';
import { getTranslations } from 'next-intl/server';

// Generate static params for all cities to enable SSG (Static Site Generation)
export async function generateStaticParams() {
    return CITIES.map((city) => ({
        city: city.id,
    }));
}

// Metadata for SEO
export async function generateMetadata({ params: { city, locale } }: any) {
    const cityData = CITIES.find(c => c.id === city);
    if (!cityData) return {};

    const cityName = locale === 'ar' ? cityData.ar : cityData.fr;
    const year = new Date().getFullYear();

    const title = locale === 'ar'
        ? `سيارات مستعملة للبيع في ${cityName} - أفضل العروض ${year} | Cayn.ma`
        : `Voitures d'occasion à vendre à ${cityName} - Meilleures offres ${year} | Cayn.ma`;

    const description = locale === 'ar'
        ? `تصفح مئات السيارات المستعملة للبيع في ${cityName}. بيع وشري طوموبيلت بدون وسطاء. عروض حصرية وأثمنة مناسبة في ${cityName}.`
        : `Trouvez des voitures d'occasion à vendre à ${cityName}. Achetez et vendez sans intermédiaires. Offres exclusives et bons prix à ${cityName}.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/cars/city/${city}`,
        },
    };
}

async function getCityListings(cityId: string) {
    await dbConnect();
    // Case insensitive search for city
    const listings = await Listing.find({
        city: { $regex: new RegExp(`^${cityId}$`, 'i') },
        status: 'active'
    })
        .sort({ isFeatured: -1, createdAt: -1 }) // Featured first
        .limit(20)
        .lean();

    return JSON.parse(JSON.stringify(listings));
}

export default async function CityPage({ params: { city, locale } }: any) {
    const cityData = CITIES.find(c => c.id === city);

    if (!cityData) {
        notFound();
    }

    const tCommon = await getTranslations('Common');
    const cityName = locale === 'ar' ? cityData.ar : cityData.fr;
    const listings = await getCityListings(city);
    const count = listings.length;
    const year = new Date().getFullYear();

    // Programmatic Content Generation
    const title = locale === 'ar'
        ? `سيارات للبيع في ${cityName}`
        : `Voitures à vendre à ${cityName}`;

    const description = locale === 'ar'
        ? `واش كتقلب على طوموبيل في ${cityName}؟ Cayn.ma كيوفر ليك ${count > 0 ? count : ''} سيارة مضمونة للبيع. من داسيا لمرسيدس، لقا الطوموبيل اللي كتناسبك في ${cityName} وبدون سمسار. شوف العروض دابا!`
        : `Vous cherchez une voiture à ${cityName} ? Cayn.ma vous propose ${count > 0 ? count : ''} véhicules vérifiés. De Dacia à Mercedes, trouvez la voiture qu'il vous faut à ${cityName} sans intermédiaire. Découvrez les offres maintenant !`;

    const breadcrumbs = [
        { label: locale === 'ar' ? 'الرئيسية' : 'Accueil', href: '/' },
        { label: locale === 'ar' ? 'السيارات' : 'Voitures', href: '/search' },
        { label: cityName, href: `/cars/city/${city}` },
    ];

    // Schema Markup (CollectionPage)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description: description,
        url: `https://cayn.ma/${locale}/cars/city/${city}`,
        numberOfItems: listings.length,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.label,
                item: `https://cayn.ma${crumb.href}` // Naive URL construction, ideally use absolute domain env var
            }))
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <SeoHeader
                title={title}
                description={description}
                breadcrumbs={breadcrumbs}
            />

            <div className="container mx-auto px-4 pb-16">
                {listings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((l: any) => (
                            <ListingCard key={l._id} listing={l} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            {locale === 'ar'
                                ? `ماكاين حتى سيارة حاليا في ${cityName}. كن أول واحد ينشر إعلان!`
                                : `Aucune voiture disponible actuellement à ${cityName}. Soyez le premier à publier !`}
                        </p>
                    </div>
                )}

                {/* FAQ Section for extra SEO content */}
                <div className="mt-16 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        {locale === 'ar' ? `أسئلة شائعة حول شراء السيارات في ${cityName}` : `Questions fréquentes sur l'achat de voitures à ${cityName}`}
                    </h2>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <h3 className="font-bold text-lg mb-2">
                                {locale === 'ar' ? 'كيفاش نشري طوموبيل في هاد المدينة؟' : 'Comment acheter une voiture ici ?'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {locale === 'ar'
                                    ? `تصفح الإعلانات الموجودة أعلاه، اختار السيارة اللي عجباتك، وتواصل مباشرة مع البائع عبر الهاتف أو الواتساب. تلاقاو في مكان عمومي في ${cityName} باش تقلب الطوموبيل.`
                                    : `Parcourez les annonces ci-dessus, choisissez la voiture qui vous plaît, et contactez directement le vendeur par téléphone ou WhatsApp. Rencontrez-vous dans un lieu public à ${cityName} pour inspecter le véhicule.`}
                            </p>
                        </div>
                    </div>
                </div>

                <InternalLinks />
            </div>
        </>
    );
}
