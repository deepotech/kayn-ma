import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/db';
import JsonLd from '@/components/seo/JsonLd';
import SellOrRentLanding from '@/components/sell-car/SellOrRentLanding';

interface PageProps {
    params: {
        locale: string;
    };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
    const isRtl = locale === 'ar';
    const title = isRtl
        ? 'بيع أو كراء سيارتك في المغرب بسهولة | Cayn.ma'
        : 'Vendez ou louez votre voiture au Maroc | Cayn.ma';

    const description = isRtl
        ? 'بع أو اعرض سيارتك للكراء في المغرب عبر Cayn.ma. أضف الصور والمواصفات والسعر وتواصل مباشرة مع المشترين أو المهتمين بالكراء.'
        : 'Vendez ou louez votre voiture au Maroc avec Cayn.ma. Ajoutez les photos, les détails et le prix, puis contactez directement les personnes intéressées.';

    const canonicalUrl = `https://www.cayn.ma/${locale}/sell-car`;

    return {
        title: {
            absolute: title,
        },
        description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'ar-MA': 'https://www.cayn.ma/ar/sell-car',
                'fr-MA': 'https://www.cayn.ma/fr/sell-car',
                'x-default': 'https://www.cayn.ma/ar/sell-car',
            },
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Cayn.ma',
            locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
            type: 'website',
            images: [
                {
                    url: 'https://www.cayn.ma/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://www.cayn.ma/twitter-image.jpg'],
        },
    };
}

export default async function SellCarPage({ params: { locale } }: PageProps) {
    const safeLocale = locale === 'fr' ? 'fr' : 'ar';
    const isRtl = safeLocale === 'ar';

    // Fetch live showcase listings
    let saleListings: any[] = [];
    let rentListings: any[] = [];

    try {
        const [rawSale, rawRent] = await Promise.all([
            prisma.listing.findMany({
                where: {
                    status: 'approved',
                    visibility: 'public',
                    OR: [{ purpose: 'sale' }, { adType: 'sale' }],
                },
                orderBy: { createdAt: 'desc' },
                take: 4,
            }),
            prisma.listing.findMany({
                where: {
                    status: 'approved',
                    visibility: 'public',
                    OR: [{ purpose: 'rent' }, { adType: 'rental' }],
                },
                orderBy: { createdAt: 'desc' },
                take: 4,
            }),
        ]);

        saleListings = JSON.parse(JSON.stringify(rawSale));
        rentListings = JSON.parse(JSON.stringify(rawRent));
    } catch (error) {
        console.error('Error fetching showcase listings for sell-car page:', error);
    }

    const title = isRtl
        ? 'بيع أو كراء سيارتك في المغرب بسهولة | Cayn.ma'
        : 'Vendez ou louez votre voiture au Maroc | Cayn.ma';

    const description = isRtl
        ? 'بع أو اعرض سيارتك للكراء في المغرب عبر Cayn.ma. أضف الصور والمواصفات والسعر وتواصل مباشرة مع المشترين أو المهتمين بالكراء.'
        : 'Vendez ou louez votre voiture au Maroc avec Cayn.ma. Ajoutez les photos, les détails et le prix, puis contactez directement les personnes intéressées.';

    // FAQ items for JSON-LD schema matching visible text
    const faqSchemaItems = [
        {
            q: isRtl
                ? 'هل نشر إعلان بيع سيارة مجاني على Cayn.ma؟'
                : 'La publication d’une annonce de vente est-elle gratuite sur Cayn.ma ?',
            a: isRtl
                ? 'نعم، نشر إعلانات بيع السيارات للأفراد مجاني بالكامل على منصة Cayn.ma، ويمكنك إضافة التفاصيل والصور والتواصل مباشرة مع المشترين.'
                : 'Oui, la publication d’annonces de vente de voitures pour les particuliers est totalement gratuite sur Cayn.ma. Vous pouvez ajouter photos, détails et être contacté directement.',
        },
        {
            q: isRtl
                ? 'ما هي المعلومات المطلوبة لنشر إعلان بيع السيارة؟'
                : 'Quelles sont les informations requises pour publier une annonce de vente ?',
            a: isRtl
                ? 'تحتاج إلى تحديد ماركة السيارة، الموديل، سنة الصنع، نوع ناقل الحركة والوقود، المسافة المقطوعة، المدينة، السعر المطلوب، مع إضافة صور واضحة ورقم هاتف متاح.'
                : 'Vous devez renseigner la marque, le modèle, l’année de mise en circulation, le carburant, la boîte de vitesses, le kilométrage, la ville, le prix souhaité ainsi que des photos claires et votre numéro de contact.',
        },
        {
            q: isRtl
                ? 'كيف يتواصل معي المشترون المهتمون؟'
                : 'Comment les acheteurs intéressés me contactent-ils ?',
            a: isRtl
                ? 'يتواصل معك المشترون مباشرة عبر الاتصال الهاتفي أو عبر رسائل الواتساب على الرقم الذي تحدده أثناء نشر الإعلان، دون أي وساطة.'
                : 'Les acheteurs vous contactent directement par téléphone ou via WhatsApp sur le numéro renseigné dans votre annonce, sans intermédiaire.',
        },
        {
            q: isRtl
                ? 'كم يستغرق ظهور الإعلان بعد النشر؟'
                : 'Combien de temps faut-il pour que mon annonce soit visible ?',
            a: isRtl
                ? 'يتم تدقيق الإعلان ومراجعته وفق معايير الجودة والسلامة للتأكد من صحة الصور والبيانات، ويظهر للعموم مباشرة بعد المراجعة.'
                : 'Votre annonce est vérifiée conformément à nos standards de qualité et de sécurité, puis mise en ligne directement après validation.',
        },
        {
            q: isRtl
                ? 'هل يمكن للأفراد ووكالات الكراء نشر إعلانات الكراء على Cayn.ma؟'
                : 'Les particuliers et les agences peuvent-ils publier des annonces de location ?',
            a: isRtl
                ? 'نعم، تدعم منصة Cayn.ma نشر إعلانات كراء السيارات للأفراد والوكالات، مع إمكانية تحديد السعر باليوم أو الأسبوع أو الشهر.'
                : 'Oui, Cayn.ma permet aux particuliers comme aux agences professionnelles de publier leurs voitures à la location avec des tarifs par jour, semaine ou mois.',
        },
        {
            q: isRtl
                ? 'كيف أحدد تسعير كراء سيارتي على المنصة؟'
                : 'Comment fixer le tarif de location de mon véhicule ?',
            a: isRtl
                ? 'يمكنك اختيار فترة التسعير المناسبة (سعر يومي، أسبوعي، أو شهري) بما يتوافق مع العرض والطلب وحالة السيارة في مدينتك.'
                : 'Vous pouvez choisir la période tarifaire (prix par jour, par semaine ou par mois) selon l’état de votre véhicule et les prix pratiqués dans votre région.',
        },
        {
            q: isRtl
                ? 'كيف يتم التنسيق وتأكيد حجز كراء السيارة؟'
                : 'Comment s’organise la réservation et la remise du véhicule ?',
            a: isRtl
                ? 'يتواصل معك المستأجر مباشرة عبر الهاتف أو الواتساب للاتفاق على التواريخ والأسعار وشروط الاستلام والضمان، مما يمنحك مرونة كاملة في التنسيق.'
                : 'Le locataire vous contacte directement par téléphone ou WhatsApp pour convenir des dates, des modalités de caution et de remise des clés en toute transparence.',
        },
        {
            q: isRtl
                ? 'ما هي المدن المغربية التي يمكنني عرض سيارتي للكراء فيها؟'
                : 'Dans quelles villes marocaines puis-je proposer ma voiture à la location ?',
            a: isRtl
                ? 'يمكنك عرض سيارتك في أي مدينة مغربية كـ الدار البيضاء، مراكش، الرباط، طنجة، أكادير، فاس وغيرها مع ظهور إعلانك للباحثين عن الكراء في منطقتك.'
                : 'Vous pouvez proposer votre véhicule dans toutes les villes du Maroc (Casablanca, Marrakech, Rabat, Tanger, Agadir, Fès, etc.).',
        },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': `https://www.cayn.ma/${safeLocale}/sell-car#webpage`,
                url: `https://www.cayn.ma/${safeLocale}/sell-car`,
                name: title,
                description,
                inLanguage: safeLocale === 'ar' ? 'ar-MA' : 'fr-MA',
                isPartOf: {
                    '@type': 'WebSite',
                    name: 'Cayn.ma',
                    url: 'https://www.cayn.ma',
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Cayn.ma',
                        item: `https://www.cayn.ma/${safeLocale}`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: isRtl ? 'بيع أو كراء سيارة' : 'Vendre ou louer une voiture',
                        item: `https://www.cayn.ma/${safeLocale}/sell-car`,
                    },
                ],
            },
            {
                '@type': 'FAQPage',
                mainEntity: faqSchemaItems.map((item) => ({
                    '@type': 'Question',
                    name: item.q,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.a,
                    },
                })),
            },
        ],
    };

    return (
        <main className="flex flex-col min-h-screen">
            <JsonLd data={jsonLd} />
            <SellOrRentLanding
                locale={safeLocale}
                saleListings={saleListings}
                rentListings={rentListings}
            />
        </main>
    );
}
