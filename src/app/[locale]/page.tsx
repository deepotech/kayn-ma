import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Search, BadgeCheck, MessageCircle, Banknote, ChevronDown, Car, RefreshCw, Building2, Key, Shield, Phone, AlertTriangle, Plus } from 'lucide-react';
import { Link } from '@/navigation';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import ListingCard from '@/components/listings/ListingCard';
import { CITIES, getCityName } from '@/constants/cities';
import TopAgenciesTeaser from '@/components/home/TopAgenciesTeaser';

const QUICK_CATEGORIES = [
  { key: 'carsForSale', icon: Car, href: '/cars?purpose=sale' },
  { key: 'usedCars', icon: RefreshCw, href: '/cars?condition=used' },
  { key: 'agencies', icon: Building2, href: '/cars?sellerType=agency' },
  { key: 'rental', icon: Key, href: '/cars?purpose=rent' },
];

import LatestListingsTabs from '@/components/home/LatestListingsTabs';
import BodyTypeSection from '@/components/home/BodyTypeSection';
import BrandSection from '@/components/home/BrandSection';

async function getListingsByType(type: 'sale' | 'rent' | 'all') {
  try {
    await dbConnect();
    const query: any = { status: 'approved', visibility: 'public' };

    if (type !== 'all') {
      const isRent = type === 'rent';
      // Handle backward compatibility + new 'purpose' field
      query.$or = [
        { purpose: type },
        { adType: isRent ? 'rental' : 'sale' },
        // If purpose/adType missing, assume sale for 'sale' query
        ...(type === 'sale' ? [{ purpose: { $exists: false }, adType: { $exists: false } }] : [])
      ];
    }

    const listings = await Listing.find(query).sort({ createdAt: -1 }).limit(8).lean();
    return JSON.parse(JSON.stringify(listings));
  } catch (error) {
    console.error(`Failed to fetch ${type} listings:`, error);
    return [];
  }
}

import JsonLd from '@/components/seo/JsonLd';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const title = locale === 'ar'
    ? 'Cayn.ma | أفضل سوق لبيع وشراء السيارات في المغرب'
    : 'Cayn.ma | Le meilleur site de vente et location de voitures au Maroc';

  const description = locale === 'ar'
    ? 'بيع وكراء السيارات في المغرب بسهولة. آلاف الإعلانات لسيارات مستعملة وجديدة. تواصل مباشر مع البائعين بدون وسيط. انشر إعلانك مجاناً اليوم.'
    : 'Achetez et louez des voitures au Maroc facilement. Milliers d\'annonces de voitures neuves et d\'occasion. Contact direct sans intermédiaire. Publiez votre annonce gratuitement.';

  return {
    title: {
      absolute: title // Override template
    },
    description: description.substring(0, 160),
    alternates: {
      canonical: `https://cayn.ma/${locale}`,
      languages: {
        'ar': 'https://cayn.ma/ar',
        'fr': 'https://cayn.ma/fr',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://cayn.ma/${locale}`,
      siteName: 'Cayn.ma',
      images: [
        {
          url: 'https://cayn.ma/og-image.jpg', // Ensure this exists or use a dynamic one
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://cayn.ma/twitter-image.jpg'], // Ensure this exists
    },
  };
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Hero' });
  const tHome = await getTranslations({ locale, namespace: 'Home' });
  const tCommon = await getTranslations({ locale, namespace: 'Common' });
  const tCategories = await getTranslations({ locale, namespace: 'Categories' });
  const tTrust = await getTranslations({ locale, namespace: 'Trust' });

  // Parallel data fetching for tabs
  const [saleListings, rentListings, allListings] = await Promise.all([
    getListingsByType('sale'),
    getListingsByType('rent'),
    getListingsByType('all')
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "Cayn.ma",
        "url": "https://cayn.ma",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `https://cayn.ma/${locale}/cars?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "Cayn.ma",
        "url": "https://cayn.ma",
        "logo": "https://cayn.ma/logo.png",
        "sameAs": [
          "https://facebook.com/caynma",
          "https://instagram.com/caynma"
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={jsonLd} />
      {/* ========== HERO SECTION ========== */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-yellow-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t('title')}
          </h1>

          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Enhanced Search Bar - Now targets /cars */}
          <form action={`/${locale}/cars`} method="GET" className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl mx-auto">
            <div className="flex items-center flex-1 px-3">
              <Search className="text-gray-400 h-5 w-5 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder={t('searchPlaceholder')}
                className="w-full px-3 py-3 text-gray-900 focus:outline-none bg-transparent"
              />
            </div>

            <div className="relative border-t sm:border-t-0 sm:border-l border-gray-200 px-3">
              <select
                name="city"
                className="appearance-none w-full sm:w-40 py-3 text-gray-700 focus:outline-none bg-transparent cursor-pointer pr-8"
              >
                <option value="">{t('allCities')}</option>
                {CITIES.map(city => (
                  <option key={city.slug} value={city.slug}>
                    {getCityName(city, locale)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <Button className="rounded-xl px-8 py-3 font-semibold text-base shrink-0">
              {tCommon('search')}
            </Button>
          </form>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <BadgeCheck className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">{t('freeAds')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <MessageCircle className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">{t('directContact')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Banknote className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">{t('noCommission')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== QUICK CATEGORIES ========== */}
      <section className="py-10 bg-gray-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_CATEGORIES.map(cat => (
              <Link
                key={cat.key}
                href={cat.href}
                className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
                aria-label={tCategories(cat.key as any)}
              >
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-100 transition-colors">
                  <cat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-center">
                  {tCategories(cat.key as any)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BODY TYPES ========== */}
      <BodyTypeSection />

      {/* ========== BRANDS ========== */}
      <BrandSection />

      {/* ========== RECENT LISTINGS ========== */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {tHome('latestListings')}
          </h2>
        </div>

        <LatestListingsTabs
          saleListings={saleListings}
          rentListings={rentListings}
          allListings={allListings}
        />
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {locale === 'ar' ? 'أفضل وكالات كراء السيارات في مراكش' : 'Top Agences de location à Marrakech'}
          </h2>
          <Link href="/rent-agencies/marrakech" className="text-blue-600 hover:underline font-medium">
            {tHome('viewAll')}
          </Link>
        </div>

        {/* We need to fetch agencies here or render a client component that fetches them. 
            For simplicity in this server component, we'll fetch direct DB. 
            But to avoid imports conflict if I add imports at top, I will use a Client Component or just duplicate the fetch logic briefly or assuming we can add imports. 
            I'll add a simple client component wrapper or just plain map if I can fetch data here.
            Wait, I need to add imports for RentAgency model to this file to fetch.
        */}
        <TopAgenciesTeaser />
      </section>

      {/* ========== SEO CITY LINKS ========== */}
      <section className="py-12 bg-gray-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {tHome('carsByCity')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CITIES.map(city => (
              <Link
                key={city.slug}
                href={`/cars/cities/${city.slug}`}
                className="px-4 py-3 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-center hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {tHome('carsInCity')} {getCityName(city, locale)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TRUST SECTION ========== */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center">
          {tTrust('title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center p-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">{tTrust('noMiddleman')}</h3>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">{tTrust('directContact')}</h3>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">{tTrust('reportSystem')}</h3>
          </div>
        </div>
      </section>
    </div>
  );
}

