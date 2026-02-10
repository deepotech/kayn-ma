import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAgenciesByCity, filterAgenciesByIntent } from '@/lib/rent-agencies/getAgenciesByCity';
import { getIntent, getAllIntents } from '@/lib/rent-agencies/seo-intents';
import AgencyList from '@/components/rent-agencies/AgencyList';
import IntentLinks from '@/components/rent-agencies/IntentLinks';
import Link from 'next/link';

interface Props {
    params: {
        city: string;
        intent: string;
        locale: string;
    };
}

// 1. Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const intentConfig = getIntent(params.intent);
    if (!intentConfig) return { title: 'Not Found' };

    const cityName = params.city.charAt(0).toUpperCase() + params.city.slice(1);

    // Choose template based on locale
    const template = params.locale === 'ar' ? intentConfig.params.ar : intentConfig.params.fr;
    const title = `${template.replace('{city}', cityName)} | Cayn.ma`;

    // Description logic
    const descTemplate = params.locale === 'ar'
        ? `أفضل عروض ${template.replace('{city}', cityName)}. قارن بين الوكالات، أسعار شفافة، حجز مباشر بدون عمولة.`
        : `Les meilleures offres de ${template.replace('{city}', cityName)}. Comparez les agences, prix transparents, réservation directe sans commission.`;

    return {
        title: title,
        description: descTemplate,
        openGraph: {
            title: title,
            description: descTemplate,
            type: 'website',
        }
    };
}

export default async function IntentPage({ params }: Props) {
    const intentConfig = getIntent(params.intent);

    // Validate Intent & City (For now only Marrakech supported heavily, but code works generic)
    if (!intentConfig || params.city.toLowerCase() !== 'marrakech') {
        notFound();
    }

    const t = await getTranslations({ locale: params.locale, namespace: 'RentAgencies' });
    const cityName = params.city.charAt(0).toUpperCase() + params.city.slice(1);

    // 2. Data Fetching & Filtering
    const allAgencies = await getAgenciesByCity(params.city);
    const filteredAgencies = filterAgenciesByIntent(allAgencies, intentConfig, params.city);

    // 3. Dynamic Content
    const titleText = params.locale === 'ar'
        ? intentConfig.params.ar.replace('{city}', cityName)
        : intentConfig.params.fr.replace('{city}', cityName);

    const descriptionText = params.locale === 'ar'
        ? intentConfig.description.ar.replace('{city}', cityName)
        : intentConfig.description.fr.replace('{city}', cityName);

    // 4. JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: titleText,
        description: descriptionText,
        about: {
            '@type': 'Place',
            name: `${cityName} City`
        },
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: filteredAgencies.slice(0, 10).map((agency, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://www.cayn.ma/${params.locale}/rent-agencies/${params.city}/${agency.slug}`,
                name: agency.name
            }))
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-8 text-sm text-slate-500 flex items-center flex-wrap gap-1">
                    <Link href={`/${params.locale}/`} className="hover:text-blue-600">{t('Listing.home') || 'Home'}</Link> /
                    <Link href={`/${params.locale}/rent-agencies`} className="hover:text-blue-600">{t('Listing.breadcrumb')}</Link> /
                    <Link href={`/${params.locale}/rent-agencies/${params.city}`} className="hover:text-blue-600 mx-1 capitalize">{params.city}</Link> /
                    <span className="text-slate-900 font-medium">{titleText}</span>
                </div>

                {/* Hero Section / Intro */}
                <div className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                        {titleText}
                    </h1>
                    <div className="prose dark:prose-invert max-w-3xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        <p>{descriptionText}</p>
                        <p>
                            {params.locale === 'ar'
                                ? `اكتشف قائمة مختارة من ${filteredAgencies.length} وكالة توفر لك أفضل الخدمات والأسعار.`
                                : `Découvrez une sélection de ${filteredAgencies.length} agences offrant les meilleurs services et tarifs.`
                            }
                        </p>
                    </div>
                </div>

                {/* Listings */}
                <AgencyList
                    initialAgencies={filteredAgencies}
                    cityName={cityName}
                />

                {/* Internal Linking */}
                <div className="mt-20 pt-10 border-t border-slate-200 dark:border-zinc-800">
                    <IntentLinks currentIntent={params.intent} city={params.city} locale={params.locale} />
                </div>
            </div>
        </div>
    );
}
