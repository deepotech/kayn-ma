import { getTranslations } from 'next-intl/server';
import ListingCard from '@/components/listings/ListingCard';
import SearchFilters from '@/components/search/SearchFilters';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus, ChevronRight, ChevronLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { getListingsPaginated, SearchParams } from '@/lib/listings';
import prisma from '@/lib/db';
import { CITIES } from '@/constants/cities';

export const dynamic = 'force-dynamic';

const TOP_CITIES = ['casablanca', 'marrakech', 'agadir', 'tanger', 'rabat'];
const TOP_BRANDS = [
    { slug: 'volkswagen', ar: 'فولكس فاجن', fr: 'Volkswagen' },
    { slug: 'hyundai', ar: 'هيونداي', fr: 'Hyundai' },
    { slug: 'ford', ar: 'فورد', fr: 'Ford' },
    { slug: 'dacia', ar: 'داسيا', fr: 'Dacia' },
    { slug: 'bmw', ar: 'بي إم دبليو', fr: 'BMW' },
];

import { notFound, redirect } from 'next/navigation';

export async function generateMetadata({ params: { locale }, searchParams }: { params: { locale: string }; searchParams?: any }) {
    const rawPageStr = searchParams?.page;
    let page = 1;
    if (rawPageStr !== undefined) {
        const parsed = parseInt(rawPageStr as string, 10);
        if (isNaN(parsed) || parsed < 1) {
            page = 1;
        } else {
            page = parsed;
        }
    }

    const title = locale === 'ar'
        ? `سيارات مستعملة للبيع في المغرب | Cayn.ma`
        : `Voitures d'occasion à vendre au Maroc | Cayn.ma`;

    const description = locale === 'ar'
        ? `تصفح سيارات مستعملة للبيع في المغرب، حسب المدينة أو الماركة أو نوع السيارة، وتواصل مباشرة مع البائعين على Cayn.ma.`
        : `Découvrez des voitures d'occasion à vendre au Maroc, filtrées par ville, marque et type de véhicule, et contactez directement les vendeurs.`;

    const canonicalUrl = page > 1
        ? `https://www.cayn.ma/${locale}/cars?page=${page}`
        : `https://www.cayn.ma/${locale}/cars`;

    const alternateAr = page > 1
        ? `https://www.cayn.ma/ar/cars?page=${page}`
        : `https://www.cayn.ma/ar/cars`;

    const alternateFr = page > 1
        ? `https://www.cayn.ma/fr/cars?page=${page}`
        : `https://www.cayn.ma/fr/cars`;

    return {
        title: {
            absolute: title,
        },
        description: description.substring(0, 160),
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'ar-MA': alternateAr,
                'fr-MA': alternateFr,
                'x-default': alternateAr,
            }
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: 'website',
            locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
        }
    };
}

export default async function CarsPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string };
    searchParams: SearchParams & { page?: string };
}) {
    const rawPageStr = searchParams?.page;
    let page = 1;
    if (rawPageStr !== undefined) {
        const parsed = parseInt(rawPageStr as string, 10);
        if (isNaN(parsed) || parsed < 1) {
            redirect(`/${locale}/cars`);
        }
        page = parsed;
    }
    const pageSize = 12;

    // 1. Fetch Paginated Listings
    const { listings, total, totalPages } = await getListingsPaginated(searchParams, {
        page,
        limit: pageSize
    });

    if (page > totalPages && totalPages > 0) {
        notFound();
    }

    // 2. Fetch real counts for top cities dynamically
    const cityCountsPromise = prisma.listing.groupBy({
        by: ['cityId'],
        where: { status: 'approved', visibility: 'public' },
        _count: true,
    });

    // 3. Fetch real counts for top brands dynamically
    const brandCountsPromise = prisma.listing.groupBy({
        by: ['brandSlug'],
        where: { status: 'approved', visibility: 'public' },
        _count: true,
    });

    const [cityGroups, brandGroups] = await Promise.all([cityCountsPromise, brandCountsPromise]);

    const citiesData = await prisma.city.findMany({
        where: { slug: { in: TOP_CITIES } },
        select: { id: true, slug: true, name: true }
    });

    const citySlugToCount = new Map<string, number>();
    cityGroups.forEach(cg => {
        const matched = citiesData.find(c => c.id === cg.cityId);
        if (matched) {
            citySlugToCount.set(matched.slug.toLowerCase(), cg._count);
        }
    });

    const brandSlugToCount = new Map<string, number>();
    brandGroups.forEach(bg => {
        if (bg.brandSlug) {
            brandSlugToCount.set(bg.brandSlug.toLowerCase(), bg._count);
        }
    });

    const isAr = locale === 'ar';
    const h1Title = isAr ? 'سيارات مستعملة للبيع في المغرب' : 'Voitures d\'occasion à vendre au Maroc';

    const introText = isAr
        ? 'مرحباً بك في سوق السيارات المستعملة على Cayn.ma. نوفر لك منصة متخصصة للبحث عن سيارات مستعملة للبيع في مختلف مدن المغرب مع تفاصيل وصور حقيقية لكل إعلان. يمكنك مقارنة الأسعار والمواصفات والتواصل مباشرة مع المعلن عبر الهاتف أو الواتساب، مع الحرص الدائم على معاينة وفحص السيارة تقنياً وقانونياً قبل إتمام الشراء.'
        : 'Bienvenue sur Cayn.ma, votre plateforme de référence pour l\'achat et la vente de voitures d\'occasion au Maroc. Parcourez des annonces avec photos et spécifications détaillées. Comparez les offres à Casablanca, Marrakech, Agadir, Tanger, Rabat et dans tout le Royaume, et contactez directement les annonceurs.';

    const faqs = isAr ? [
        {
            q: 'كيف أتواصل مع صاحب إعلان سيارة مستعملة معروضة للبيع؟',
            a: 'يمكنك التواصل مباشرة مع المعلن من خلال رقم الهاتف أو زر الواتساب المتوفر في صفحة كل إعلان للتفاوض وتحديد موعد لمعاينة السيارة.'
        },
        {
            q: 'ما هي الوثائق الأساسية المطلوبة عند شراء سيارة مستعملة في المغرب؟',
            a: 'تشمل الوثائق الأساسية: البطاقة الرمادية الأصلية (Carte Grise)، شهادة الفحص التقني سارية المفعول (Visite Technique)، عقد البيع المصادق عليه (Contrat de vente légalisé)، وشهادة أداء الضريبة السنوية (Vignette).'
        },
        {
            q: 'ما هي أهم المدن المغربية التي تتوفر بها عروض سيارات مستعملة؟',
            a: 'تتوفر العروض في معظم المدن الكبرى بالمغرب، وتتصدر القائمة مدن الدار البيضاء، مراكش، أكادير، طنجة، والرباط.'
        },
        {
            q: 'كيف أتأكد من سلامة السيارة قبل إتمام الشراء؟',
            a: 'ننصح دائماً بفحص السيارة في ضوء النهار، وإجراء فحص ميكانيكي شامل لدى متخصص، والتأكد من مطابقة رقم الهيكل (Numéro de châssis) مع البيانات المسجلة في البطاقة الرمادية.'
        }
    ] : [
        {
            q: 'Comment contacter le vendeur d\'une voiture d\'occasion ?',
            a: 'Vous pouvez contacter directement le propriétaire via le numéro de téléphone ou le bouton WhatsApp affiché sur chaque annonce pour négocier et fixer un rendez-vous.'
        },
        {
            q: 'Quels sont les documents indispensables pour acheter une voiture d\'occasion au Maroc ?',
            a: 'Les documents clés comprennent la Carte Grise originale, le certificat de visite technique en cours de validité, le contrat de vente légalisé et la quittance de la taxe annuelle (Vignette).'
        },
        {
            q: 'Quelles sont les villes avec le plus d\'offres de voitures d\'occasion ?',
            a: 'Les offres sont réparties sur tout le Royaume, avec une forte concentration à Casablanca, Marrakech, Agadir, Tanger et Rabat.'
        },
        {
            q: 'Comment vérifier l\'état du véhicule avant de conclure l\'achat ?',
            a: 'Il est vivement conseillé d\'inspecter le véhicule en plein jour, de réaliser un diagnostic mécanique auprès d\'un professionnel et de vérifier la concordance du numéro de châssis avec la carte grise.'
        }
    ];

    const breadcrumbs = [
        { label: isAr ? 'الرئيسية' : 'Accueil', href: `/${locale}` },
        { label: isAr ? 'سيارات مستعملة' : 'Voitures d\'occasion', href: `/${locale}/cars` }
    ];

    // Structured Data JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: h1Title,
        description: introText,
        url: `https://www.cayn.ma/${locale}/cars${page > 1 ? `?page=${page}` : ''}`,
        numberOfItems: total,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: listings.length,
            itemListElement: listings.map((l: any, index: number) => ({
                '@type': 'ListItem',
                position: (page - 1) * pageSize + index + 1,
                name: l.title || `${l.brandLabel || ''} ${l.carModelLabel || ''} ${l.year || ''}`.trim(),
                url: `https://www.cayn.ma/${locale}/cars/${l.id}`
            }))
        },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.label,
                item: `https://cayn.ma${crumb.href}`
            }))
        }
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a
            }
        }))
    };

    // Helper for pagination links
    const getPageUrl = (targetPage: number) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([k, v]) => {
            if (k !== 'page' && typeof v === 'string') {
                params.set(k, v);
            }
        });
        if (targetPage > 1) {
            params.set('page', String(targetPage));
        }
        const q = params.toString();
        return `/${locale}/cars${q ? `?${q}` : ''}`;
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            <div className="container mx-auto py-6 px-4">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <ol className="flex items-center gap-2 flex-wrap">
                        {breadcrumbs.map((crumb, idx) => (
                            <li key={crumb.href} className="flex items-center gap-2">
                                {idx > 0 && <span>/</span>}
                                {idx === breadcrumbs.length - 1 ? (
                                    <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
                                ) : (
                                    <Link href={crumb.href} className="hover:text-blue-600 transition-colors">{crumb.label}</Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Header & Strategic Intro */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
                        {h1Title}
                        <span className="text-blue-600 dark:text-blue-400 font-normal text-lg sm:text-xl ms-3">
                            ({total} {isAr ? 'إعلان' : 'annonces'})
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-4xl leading-relaxed">
                        {introText}
                    </p>
                </div>

                {/* Main Content Layout: Sidebar + Listings Grid */}
                <div className="flex flex-col md:flex-row gap-8">
                    <SearchFilters totalResults={total} />

                    <div className="flex-1">
                        {listings.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {listings.map((listing: any) => (
                                        <ListingCard key={listing.id || listing._id} listing={listing} />
                                    ))}
                                </div>

                                {/* Crawlable Server-Side Pagination */}
                                {totalPages > 1 && (
                                    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                                        {page > 1 && (
                                            <Link
                                                href={getPageUrl(page - 1)}
                                                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                                            >
                                                {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                                                {isAr ? 'السابق' : 'Précédent'}
                                            </Link>
                                        )}

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                            const isCurrent = p === page;
                                            return (
                                                <Link
                                                    key={p}
                                                    href={getPageUrl(p)}
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                                                        isCurrent
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                                    }`}
                                                    aria-current={isCurrent ? 'page' : undefined}
                                                >
                                                    {p}
                                                </Link>
                                            );
                                        })}

                                        {page < totalPages && (
                                            <Link
                                                href={getPageUrl(page + 1)}
                                                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-1 transition-colors"
                                            >
                                                {isAr ? 'التالي' : 'Suivant'}
                                                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </Link>
                                        )}
                                    </nav>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                                <span className="text-5xl mb-4">🚗</span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {isAr ? 'لا توجد إعلانات مطابقة لمعايير البحث' : 'Aucune annonce trouvée'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                    {isAr ? 'جرّب تغيير خيارات التصفية أو كن أول من ينشر إعلانه هنا' : 'Essayez de modifier vos filtres ou publiez votre annonce'}
                                </p>
                                <Link href="/post">
                                    <Button className="gap-2">
                                        <Plus className="h-5 w-5" />
                                        {isAr ? 'أضف إعلانك مجاناً' : 'Publier une annonce'}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Browse by City (Qualified Hubs with real DB counts) */}
                <section className="mt-16 bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {isAr ? 'سيارات مستعملة للبيع حسب المدينة' : 'Voitures d\'occasion par ville'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {isAr ? 'اختر المدينة لاستعراض الإعلانات المتوفرة محلياً والتواصل مع البائعين في منطقتك:' : 'Sélectionnez une ville pour consulter les annonces locales :'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                        {TOP_CITIES.map((citySlug) => {
                            const c = CITIES.find(item => item.slug === citySlug);
                            const cityName = c ? (isAr ? c.name.ar : c.name.fr) : citySlug;
                            const count = citySlugToCount.get(citySlug) || 0;
                            return (
                                <Link
                                    key={citySlug}
                                    href={`/${locale}/cars/city/${citySlug}`}
                                    className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-zinc-800 transition-all text-center group"
                                >
                                    <span className="block font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {cityName}
                                    </span>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {count} {isAr ? 'سيارة' : 'voitures'}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Section: Browse by Brand (Qualified Hubs with real DB counts) */}
                <section className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {isAr ? 'أشهر ماركات السيارات المستعملة في المغرب' : 'Marques les plus populaires au Maroc'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {isAr ? 'تصفح الإعلانات حسب الشركة المصنعة لمقارنة الموديلات والأسعار:' : 'Parcourez les offres par marque pour comparer les modèles et prix :'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                        {TOP_BRANDS.map((brand) => {
                            const brandName = isAr ? brand.ar : brand.fr;
                            const count = brandSlugToCount.get(brand.slug) || 0;
                            return (
                                <Link
                                    key={brand.slug}
                                    href={`/${locale}/cars/brand/${brand.slug}`}
                                    className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/50 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-zinc-800 transition-all text-center group"
                                >
                                    <span className="block font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {brandName}
                                    </span>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {count} {isAr ? 'إعلان' : 'annonces'}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Section: Buyer Guide (Practical Advice for Moroccan buyers) */}
                <section className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {isAr ? 'دليل المشتري: نصائح فحص وشراء سيارة مستعملة في المغرب' : 'Guide de l\'acheteur : Conseils pour acheter un véhicule d\'occasion'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck className="w-6 h-6 text-blue-600" />
                                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                    {isAr ? 'الفحص الميكانيكي والهيكل' : 'Contrôle mécanique et châssis'}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {isAr
                                    ? 'افحص السيارة في وضح النهار للتأكد من عدم وجود صدمات خفية أو صدأ. تأكد من عمل المحرك، علبة التروس، ونظام التعليق، واطلب فحصاً لدى ميكانيكي موثوق.'
                                    : 'Examinez la carrosserie en plein jour. Contrôlez le moteur, la boîte de vitesses et demandez un diagnostic chez un mécanicien de confiance.'}
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-3">
                                <FileText className="w-6 h-6 text-emerald-600" />
                                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                    {isAr ? 'سلامة الوثائق القانونية' : 'Vérification des papiers'}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {isAr
                                    ? 'راجع البطاقة الرمادية وتأكد من هوية البائع ومطابقة رقم الإطار الحديدي (Châssis). تحقق من سريان الفحص التقني وأداء ضريبة السيارات السنوية (Vignette).'
                                    : 'Vérifiez la carte grise, l\'identité du vendeur et la conformité du numéro de châssis. Assurez-vous que la vignette et la visite technique sont à jour.'}
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                                    {isAr ? 'عقد البيع والمصادقة' : 'Contrat de vente et légalisation'}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {isAr
                                    ? 'قم بتحرير عقد البيع القانوني والمصادقة عليه في المقاطعة بحضور الطرفين، وسدد الثمن بطريقة آمنة وموثقة تضمن حقوق الطرفين.'
                                    : 'Établissez le contrat de vente légalisé en présence des deux parties et optez pour un mode de règlement sécurisé et tracé.'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section: Visible FAQs (strictly identical to FAQPage schema) */}
                <section className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {isAr ? 'الأسئلة الشائعة حول شراء سيارة مستعملة في المغرب' : 'Questions fréquentes sur l\'achat d\'une voiture d\'occasion au Maroc'}
                    </h2>
                    <div className="space-y-4 max-w-4xl">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="p-5 rounded-xl bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                                    {faq.q}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
