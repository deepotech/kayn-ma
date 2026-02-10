import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { MapPin, Phone, Globe, Star, AlertCircle, PhoneCall, Clock, Navigation } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAgencyBySlug, getAgenciesByIntent } from '@/lib/agencies';
import { buildAgencyHref, getLocalizedCityName, generateBreadcrumbSchema } from '@/lib/rent-agencies/utils';
import IntentLinks from '@/components/rent-agencies/IntentLinks';
import { getIntent } from '@/lib/rent-agencies/seo-intents';
import AgencyList from '@/components/rent-agencies/AgencyList';
import RelatedAgencies from '@/components/rent-agencies/RelatedAgencies';

interface Props {
    params: {
        city: string;
        slug: string;
        locale: string;
    };
    searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { city, slug, locale } = params;

    // 1. Check if it's an Intent Page
    const intent = getIntent(slug);
    if (intent) {
        const cityName = getLocalizedCityName(city, locale);
        const titleTemplate = locale === 'ar' ? intent.params.ar : intent.params.fr;
        const descriptionTemplate = locale === 'ar' ? intent.description.ar : intent.description.fr;

        const title = titleTemplate.replace('{city}', cityName);
        const description = descriptionTemplate.replace('{city}', cityName);

        return {
            title: `${title} | Kayn.ma`,
            description,
            alternates: {
                canonical: `https://kayn.ma/${locale}/rent-agencies/${city}/${slug}`,
                languages: {
                    'ar': `https://kayn.ma/ar/rent-agencies/${city}/${slug}`,
                    'fr': `https://kayn.ma/fr/rent-agencies/${city}/${slug}`,
                }
            },
            openGraph: {
                title,
                description,
                type: 'website',
                url: `https://kayn.ma/${locale}/rent-agencies/${city}/${slug}`,
                siteName: 'Kayn.ma',
                locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
            }
        };
    }

    // 2. Check if it's an Agency Page
    const agency = await getAgencyBySlug(city, slug);

    if (!agency) return { title: 'Agency Not Found' };

    const cityName = getLocalizedCityName(agency.city, locale);

    const ratingText = agency.rating ? `⭐ ${agency.rating.toFixed(1)}/5` : '';
    const reviewsText = locale === 'ar' ? '(تقييمات حقيقية)' : '(Real reviews)';
    const titleBase = locale === 'ar'
        ? `${agency.name} – وكالة كراء سيارات في ${cityName} ${ratingText} ${reviewsText}`
        : `${agency.name} – Car rental agency in ${cityName} ${ratingText} ${reviewsText}`;

    const description = locale === 'ar'
        ? `اكتشف ${agency.name} في ${cityName}. ${agency.rating ? `تقييم: ${agency.rating}/5.` : ''} العنوان، الهاتف، وساعات العمل. احجز سيارتك الآن.`
        : `Discover ${agency.name} in ${cityName}. ${agency.rating ? `Rated ${agency.rating}/5.` : ''} Address, phone, and opening hours. Book your car now.`;

    return {
        title: titleBase,
        description,
        alternates: {
            canonical: `https://kayn.ma/${locale}/rent-agencies/${agency.citySlug}/${agency.slug}`,
            languages: {
                'ar': `https://kayn.ma/ar/rent-agencies/${agency.citySlug}/${agency.slug}`,
                'fr': `https://kayn.ma/fr/rent-agencies/${agency.citySlug}/${agency.slug}`,
            }
        },
        openGraph: {
            title: titleBase,
            description,
            images: agency.photos.length > 0 ? [{ url: agency.photos[0] }] : [],
            type: 'profile',
            url: `https://kayn.ma/${locale}/rent-agencies/${agency.citySlug}/${agency.slug}`,
            siteName: 'Kayn.ma',
            locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
        }
    };
}

// Simple time ago helper
function timeAgo(dateString: string | null, locale: string) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return locale === 'ar' ? 'الآن' : 'just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return locale === 'ar' ? `قبل ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return locale === 'ar' ? `قبل ${diffInHours} ساعة` : `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return locale === 'ar' ? `قبل ${diffInDays} يوم` : `${diffInDays}d ago`;

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return locale === 'ar' ? `قبل ${diffInMonths} شهر` : `${diffInMonths}mo ago`;

        const diffInYears = Math.floor(diffInDays / 365);
        return locale === 'ar' ? `قبل ${diffInYears} سنة` : `${diffInYears}y ago`;
    } catch (e) {
        return '';
    }
}

// Format opening hours string
function formatOpeningHours(hours: string, locale: string): { text: string; dir: 'ltr' | 'rtl' } {
    if (!hours) return { text: '', dir: 'ltr' };

    // Handle "24 hours" text if it exists in data
    if (hours.includes('24 ساعة') || hours.includes('24 hours')) {
        return {
            text: locale === 'ar' ? 'مفتوح 24 ساعة' : 'Open 24h',
            dir: locale === 'ar' ? 'rtl' : 'ltr'
        };
    }

    let formatted = hours;

    // Clean up "to"
    if (locale === 'ar') {
        formatted = formatted.replace(/\s*to\s*/gi, ' - ');
        formatted = formatted.replace(/am/gi, 'ص').replace(/pm/gi, 'م');
        // Standardize LTR for time ranges to keep numbers in "Start - End" visual order
        return { text: formatted, dir: 'ltr' };
    } else {
        formatted = formatted.replace(/\s*to\s*/gi, ' - ');
        formatted = formatted.replace(/ص/g, ' AM').replace(/م/g, ' PM');
        return { text: formatted, dir: 'ltr' };
    }
}

export default async function Page({ params }: Props) {
    const { slug, locale } = params;
    const city = params.city.toLowerCase();

    // ==========================================
    // CASE 1: Intent Landing Page (e.g. /marrakech/airport)
    // ==========================================
    const intent = getIntent(slug);

    if (intent) {
        const t = await getTranslations({ locale, namespace: 'RentAgencies.Listing' });
        const agencies = await getAgenciesByIntent(city, intent);
        const cityName = getLocalizedCityName(city, locale);

        const titleTemplate = locale === 'ar' ? intent.params.ar : intent.params.fr;
        const descriptionTemplate = locale === 'ar' ? intent.description.ar : intent.description.fr;
        const title = titleTemplate.replace('{city}', cityName);
        const description = descriptionTemplate.replace('{city}', cityName);

        // JSON-LD for CollectionPage
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: title,
            description: description,
            mainEntity: {
                '@type': 'ItemList',
                itemListElement: agencies.slice(0, 20).map((agency, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: `https://kayn.ma${buildAgencyHref(locale, agency.citySlug, agency.slug)}`,
                    name: agency.name
                }))
            }
        };

        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />

                {/* JSON-LD: BreadcrumbList */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateBreadcrumbSchema([
                            { name: 'Home', url: `/${locale}` },
                            { name: t('breadcrumb'), url: `/${locale}/rent-agencies` },
                            { name: cityName, url: `/${locale}/rent-agencies/${city}` },
                            { name: title, url: `/${locale}/rent-agencies/${city}/${slug}` }
                        ]))
                    }}
                />

                {/* Breadcrumb & Header */}
                <div className="mb-8">
                    <div className="text-sm text-slate-500 mb-2">
                        <Link href={`/${locale}/rent-agencies`} className="hover:text-blue-600">{t('breadcrumb')}</Link> /
                        <Link href={`/${locale}/rent-agencies/${city}`} className="hover:text-blue-600 mx-1 capitalize">{cityName}</Link> /
                        <span className="text-slate-900 font-medium ms-1">{title}</span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize mb-3">
                        {title}
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 max-w-4xl text-lg leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* List View */}
                <AgencyList
                    initialAgencies={agencies}
                    cityName={cityName}
                />

                {/* Internal Linking */}
                <div className="mt-20 pt-10 border-t border-slate-200 dark:border-zinc-800">
                    <IntentLinks currentIntent={slug} city={city} locale={locale} />
                </div>
            </div>
        );
    }

    // ==========================================
    // CASE 2: Agency Detail Page
    // ==========================================
    const agency = await getAgencyBySlug(city, slug);

    if (!agency) {
        notFound();
    }

    const t = await getTranslations({ locale, namespace: 'RentAgencies' });

    // Structured Data (LocalBusiness / AutoRental)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AutoRental',
        name: agency.name,
        image: agency.photos,
        '@id': `https://kayn.ma${buildAgencyHref(locale, city, agency.slug)}`,
        url: `https://kayn.ma${buildAgencyHref(locale, city, agency.slug)}`,
        telephone: agency.phone,
        address: {
            '@type': 'PostalAddress',
            streetAddress: agency.address,
            addressLocality: agency.city,
            addressCountry: 'MA'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: agency.location.lat,
            longitude: agency.location.lng
        },
        openingHoursSpecification: agency.openingHours.map(oh => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: oh.day,
            opens: oh.hours.split('-')[0]?.trim(),
            closes: oh.hours.split('-')[1]?.trim()
        })),
        aggregateRating: agency.rating ? {
            '@type': 'AggregateRating',
            ratingValue: agency.rating,
            reviewCount: agency.reviewsCount
        } : undefined,
    };

    const mapsLinkDirections = `https://www.google.com/maps/dir/?api=1&destination=${agency.location.lat},${agency.location.lng}`;
    const mapsLinkSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.name + ' ' + agency.city)}`;

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* JSON-LD: BreadcrumbList */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateBreadcrumbSchema([
                        { name: 'Home', url: `/${locale}` },
                        { name: t('Listing.breadcrumb'), url: `/${locale}/rent-agencies` },
                        { name: city, url: `/${locale}/rent-agencies/${city}` },
                        { name: agency.name, url: buildAgencyHref(locale, city, agency.slug) }
                    ]))
                }}
            />

            {/* Breadcrumb */}
            <div className="mb-6 text-sm text-slate-500 flex items-center flex-wrap gap-1">
                <Link href={`/${locale}/rent-agencies`} className="hover:text-blue-600">{t('Listing.breadcrumb')}</Link> /
                <Link href={`/${locale}/rent-agencies/${city}`} className="hover:text-blue-600 mx-1 capitalize">{city}</Link> /
                <span className="text-slate-900 ms-1 font-medium truncate max-w-[200px]">{agency.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden mb-8 shadow-sm">
                        {/* Cover/Header */}
                        <div className="h-56 md:h-80 bg-slate-100 dark:bg-zinc-800 relative">
                            {agency.photos && agency.photos.length > 0 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={agency.photos[0]}
                                    alt={agency.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300 dark:text-zinc-700 bg-slate-50 dark:bg-zinc-800">
                                    <span className="text-6xl font-bold opacity-20">{agency.name.charAt(0)}</span>
                                </div>
                            )}

                            <div className="absolute top-4 right-4 flex gap-2">
                                {agency.isMixedService && (
                                    <div className="bg-amber-100 dark:bg-amber-900/90 text-amber-800 dark:text-amber-200 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-700 uppercase tracking-wide">
                                        {t('Card.mixedServices')}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">{agency.name}</h1>
                                    <div className="flex items-center flex-wrap gap-4 text-sm font-medium">
                                        {agency.rating ? (
                                            <div className="flex items-center text-slate-900 dark:text-white">
                                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 me-1.5" />
                                                <span className="text-base">{agency.rating.toFixed(1)}</span>
                                                <span className="text-slate-400 mx-1.5">•</span>
                                                <span className="text-slate-500 underline decoration-slate-300 dark:decoration-zinc-700 underline-offset-4">{agency.reviewsCount} {t('Detail.reviews')}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-500">{t('Detail.noReviews')}</span>
                                        )}
                                        <span className="hidden md:inline text-slate-300 dark:text-zinc-700">|</span>
                                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                                            <MapPin className="w-4 h-4 me-1.5" />
                                            <span className="capitalize">{agency.citySlug}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    {agency.phone && (
                                        <a
                                            href={`tel:${agency.phone}`}
                                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                                        >
                                            <PhoneCall className="w-4 h-4" />
                                            <span className="hidden md:inline">{t('Detail.callNow')}</span>
                                        </a>
                                    )}
                                    <a
                                        href={mapsLinkDirections}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        <span className="hidden md:inline">{t('Detail.directions') || 'Directions'}</span>
                                        <span className="md:hidden">Map</span>
                                    </a>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-zinc-800 my-8" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center text-lg">
                                        <MapPin className="w-5 h-5 me-2 text-slate-400" /> {t('Detail.address')}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-lg text-base">
                                        {agency.address}
                                    </p>

                                    {agency.website && (
                                        <div className="mt-5">
                                            <a
                                                href={agency.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <Globe className="w-4 h-4 me-2" /> {t('Detail.visitWebsite')}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center text-lg">
                                        <Clock className="w-5 h-5 me-2 text-slate-400" /> {t('Detail.openingHours')}
                                    </h3>
                                    {agency.openingHours && agency.openingHours.length > 0 ? (
                                        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg p-4 text-sm space-y-3">
                                            {agency.openingHours.map((oh: any, i: number) => {
                                                const { text, dir } = formatOpeningHours(oh.hours, locale);
                                                return (
                                                    <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-700 last:border-0 last:pb-0 last:border-0 border-dashed">
                                                        <span className="text-slate-500 font-medium">{oh.day}</span>
                                                        <span className="font-semibold text-slate-900 dark:text-slate-300" dir={dir}>
                                                            {text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-sm italic border border-dashed border-slate-200 dark:border-zinc-700 p-4 rounded-lg">
                                            {t('Detail.hoursUnknown') || 'Working hours not available'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    {agency.reviews && agency.reviews.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden mb-8 shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/20">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 me-2" />
                                    {t('Detail.customerReviews')}
                                </h3>
                                <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-200 dark:border-zinc-700">
                                    {agency.reviews.length}
                                </span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {agency.reviews.map((review: any) => {
                                    const reviewText = (locale === 'ar' && review.textTranslated) ? review.textTranslated : (review.text);
                                    const dateDisplay = review.publishedAtDate ? timeAgo(review.publishedAtDate, locale) : review.publishedAtText;

                                    if (!reviewText && !review.rating) return null;

                                    return (
                                        <div key={review.reviewId} className="p-6 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                                                        {review.reviewerPhotoUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={review.reviewerPhotoUrl} alt={review.reviewerName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="font-bold text-slate-500 uppercase">{review.reviewerName?.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white text-sm">{review.reviewerName || 'Anonymous'}</div>
                                                        <div className="flex text-yellow-400 text-xs mt-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < (review.rating || 0) ? 'fill-current' : 'text-slate-200 dark:text-zinc-700'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-400 whitespace-nowrap ms-2">
                                                    {dateDisplay}
                                                </div>
                                            </div>
                                            {reviewText && (
                                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line mt-2 ps-13">
                                                    {reviewText}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-5 flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 me-3 shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                            <p className="font-bold mb-1">{t('Detail.disclaimer')}</p>
                            <p className="leading-relaxed opacity-90">
                                {t('Detail.disclaimerText')}
                            </p>
                        </div>
                    </div>

                    {/* Related Agencies Section */}
                    <RelatedAgencies key={agency._id} currentAgency={agency} locale={locale} />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        {/* Map Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                <MapPin className="w-4 h-4 me-2 text-slate-400" /> {t('Detail.location')}
                            </h3>
                            <div className="aspect-square bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative border border-slate-200 dark:border-zinc-700">
                                <a
                                    href={mapsLinkSearch}
                                    target="_blank"
                                    rel="noopener noreferrer hover:opacity-90"
                                    className="block w-full h-full relative group"
                                >
                                    {/* Use static google maps image if key available, or iframe */}
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        title="map"
                                        src={`https://maps.google.com/maps?q=${agency.location.lat},${agency.location.lng}&z=15&output=embed`}
                                        className="w-full h-full grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-white text-black px-3 py-1.5 rounded-md font-bold text-xs shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                                            {t('Detail.viewMap')}
                                        </span>
                                    </div>
                                </a>
                            </div>
                            <div className="mt-4">
                                <a
                                    href={mapsLinkSearch}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity font-medium text-sm shadow-sm"
                                >
                                    <Navigation className="w-4 h-4 me-2" />
                                    {t('Detail.getDirections')}
                                </a>
                            </div>
                        </div>

                        {/* Categories/Tags */}
                        {agency.categories.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">{t('Detail.services')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {agency.categories.map((cat: string, i: number) => (
                                        <span key={i} className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Internal Linking */}
            <div className="mt-12 pt-10 border-t border-slate-200 dark:border-zinc-800">
                <IntentLinks currentIntent="detail" city={agency.city} locale={locale} />
            </div>
        </div>
    );
}
