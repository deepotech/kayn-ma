// Removed invalid import
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

interface SeoContentProps {
    filters: {
        brand?: string;
        city?: string;
        bodyType?: string;
        purpose?: string;
    };
    locale: string;
}

export default async function SeoContent({ filters, locale }: SeoContentProps) {
    // If no specific filters, minimal content
    if (!filters.brand && !filters.city && !filters.bodyType) return null;

    const t = await getTranslations('SeoContent');

    // Construct dynamic keywords
    const brandName = filters.brand ? (filters.brand.charAt(0).toUpperCase() + filters.brand.slice(1)) : '';
    const cityName = filters.city ? (filters.city.charAt(0).toUpperCase() + filters.city.slice(1)) : '';
    const bodyTypeName = filters.bodyType ? filters.bodyType.toUpperCase() : '';

    // Basic Text Generation (Simple template)
    // In a real app, use complex logic or AI generated content stored in DB
    const title = locale === 'ar'
        ? `أفضل عروض ${brandName} ${bodyTypeName} في ${cityName || 'المغرب'}`
        : `Meilleures offres ${brandName} ${bodyTypeName} à ${cityName || 'Maroc'}`;

    const description = locale === 'ar'
        ? `هل تبحث عن سيارة ${brandName} ${filters.bodyType ? `من نوع ${bodyTypeName}` : ''}؟ في موقع كاين.ما نوفر لك أفضل العروض في ${cityName || 'جميع مدن المغرب'}. تصفح مئات الإعلانات للبيع والكراء بأسعار تنافسية. تواصل مباشرة مع البائعين بدون وسطاء.`
        : `Vous cherchez une voiture ${brandName} ${filters.bodyType ? `de type ${bodyTypeName}` : ''}? Sur Cayn.ma, nous vous proposons les meilleures offres à ${cityName || 'partout au Maroc'}. Parcourez des centaines d'annonces de vente et de location à des prix compétitifs. Contactez directement les vendeurs sans intermédiaires.`;

    // FAQ Schema
    const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": locale === 'ar' ? `كيف أشتري سيارة ${brandName} عبر كاين.ما؟` : `Comment acheter une ${brandName} sur Cayn.ma?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'ar'
                        ? "تصفح الإعلانات الموجودة في هذه الصفحة، اختر السيارة التي تناسبك، وتواصل مباشرة مع البائع عبر الهاتف أو الواتساب الموجود في تفاصيل الإعلان."
                        : "Parcourez les annonces sur cette page, choisissez la voiture qui vous convient et contactez directement le vendeur par téléphone ou WhatsApp disponible dans les détails de l'annonce."
                }
            },
            {
                "@type": "Question",
                "name": locale === 'ar' ? "هل الإعلانات موثوقة؟" : "Les annonces sont-elles fiables?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'ar'
                        ? "نحن نقوم بمراجعة الإعلانات بشكل دوري، ولكن ننصح دائماً بمعاينة السيارة والفحص التقني قبل الدفع. لا ترسل أموالاً قبل رؤية السيارة."
                        : "Nous vérifions régulièrement les annonces, mais nous recommandons toujours d'inspecter la voiture et de faire un contrôle technique avant de payer. N'envoyez jamais d'argent avant de voir le véhicule."
                }
            },
            {
                "@type": "Question",
                "name": locale === 'ar' ? `هل توجد سيارات ${brandName} للكراء؟` : `Y a-t-il des ${brandName} à louer?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": locale === 'ar'
                        ? "نعم، يمكنك استخدام فلتر 'كراء' لتصفح السيارات المتاحة للإيجار اليومي أو الشهري."
                        : "Oui, vous pouvez utiliser le filtre 'Location' pour parcourir les voitures disponibles à la location journalière ou mensuelle."
                }
            }
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 mt-8 border-t border-gray-100 dark:border-zinc-800">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
            />

            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {description}
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Internal Linking Checks (Simple) */}
                    {!filters.city && (
                        <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg">
                            <h3 className="font-bold text-sm mb-2">{locale === 'ar' ? 'مدن رائجة' : 'Villes Populaires'}</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-blue-600">
                                <span className="cursor-pointer hover:underline">Casablanca</span>
                                <span className="cursor-pointer hover:underline">Rabat</span>
                                <span className="cursor-pointer hover:underline">Marrakech</span>
                                <span className="cursor-pointer hover:underline">Tanger</span>
                            </div>
                        </div>
                    )}

                    {!filters.bodyType && (
                        <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg">
                            <h3 className="font-bold text-sm mb-2">{locale === 'ar' ? 'أنواع السيارات' : 'Types de Carrosserie'}</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-blue-600">
                                <span className="cursor-pointer hover:underline">SUV</span>
                                <span className="cursor-pointer hover:underline">Sedan</span>
                                <span className="cursor-pointer hover:underline">Citadine</span>
                                <span className="cursor-pointer hover:underline">Luxe</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
