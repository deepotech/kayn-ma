export type IntentSlug = 'best' | 'airport' | 'cheap' | 'luxury' | 'no-deposit' | '24h' | 'most-reviewed';

export interface SeoIntent {
    slug: IntentSlug;
    params: {
        ar: string; // Template: "كراء سيارات {city} مطار"
        fr: string; // Template: "Location voiture {city} aéroport"
    };
    filter: {
        nearAirport?: boolean;
        priceLevel?: 'cheap' | 'luxury';
        noDeposit?: boolean;
        duration?: boolean;
        minRating?: number;
        open24h?: boolean;
        minReviews?: number;
    };
    description: {
        ar: string;
        fr: string;
    };
}

export const RENT_INTENTS: Record<string, SeoIntent> = {
    best: {
        slug: 'best',
        params: {
            ar: 'أفضل وكالات كراء السيارات في {city} | أسعار رخيصة وتقييمات حقيقية',
            fr: 'Meilleures agences de location de voitures à {city} | Avis Vérifiés'
        },
        filter: { minRating: 4.0 },
        description: {
            ar: 'اكتشف أفضل وكالات كراء السيارات في {city} بناءً على تقييمات الزبائن الحقيقية. خدمة ممتازة، سيارات نظيفة، وتعامل احترافي.',
            fr: 'Découvrez les meilleures agences de location à {city} basées sur de vrais avis clients. Service excellent et véhicules de qualité.'
        }
    },
    airport: {
        slug: 'airport',
        params: {
            ar: 'كراء سيارات {city} مطار | تسليم فوري وبدون انتظار',
            fr: 'Location voiture {city} aéroport | Livraison immédiate'
        },
        filter: { nearAirport: true },
        description: {
            ar: 'استلم سيارتك مباشرة عند الوصول إلى مطار {city}. وكالات موثوقة تقدم خدمة التسليم في المطار مجاناً أو برسوم رمزية.',
            fr: 'Récupérez votre voiture dès votre arrivée à l\'aéroport de {city}. Agences fiables proposant la livraison à l\'aéroport.'
        }
    },
    cheap: {
        slug: 'cheap',
        params: {
            ar: 'أرخص كراء سيارات في {city} | سيارات اقتصادية ابتداءً من 200 درهم',
            fr: 'Location voiture pas cher {city} | Économique dès 200 DH'
        },
        filter: { priceLevel: 'cheap' },
        description: {
            ar: 'أفضل عروض كراء السيارات الاقتصادية في {city}. قارن الأسعار واحصل على أرخص سيارة لقضاء حاجاتك اليومية.',
            fr: 'Les meilleures offres de location de voitures économiques à {city}. Comparez les prix et trouvez le véhicule le moins cher.'
        }
    },
    luxury: {
        slug: 'luxury',
        params: {
            ar: 'كراء سيارات فاخرة {city} | رنج روفر، مرسيدس، وأكثر',
            fr: 'Location voiture luxe {city} | Range Rover, Mercedes & plus'
        },
        filter: { priceLevel: 'luxury' },
        description: {
            ar: 'قد سيارة أحلامك في {city}. سيارات فخمة، رباعية الدفع، ورياضية للمناسبات الخاصة ورجال الأعمال.',
            fr: 'Conduisez la voiture de vos rêves à {city}. Voitures de luxe, 4x4 et sportives pour occasions spéciales.'
        }
    },
    'no-deposit': {
        slug: 'no-deposit',
        params: {
            ar: 'كراء سيارات {city} بدون شيك ضمان',
            fr: 'Location voiture sans caution {city} | Sans chèque'
        },
        filter: { noDeposit: true },
        description: {
            ar: 'ابحث عن وكالات كراء السيارات في {city} التي تقبل الدفع نقداً أو ببطاقة بنكية بدون الحاجة لتقديم شيك ضمان.',
            fr: 'Trouvez des agences à {city} acceptant le paiement en espèces ou par carte sans chèque de caution.'
        }
    },
    '24h': {
        slug: '24h',
        params: {
            ar: 'كراء سيارات {city} 24/24 | وكالات مفتوحة الآن',
            fr: 'Location voiture {city} 24h/24 | Agences ouvertes maintenant'
        },
        filter: { open24h: true },
        description: {
            ar: 'هل تبحث عن سيارة في وقت متأخر؟ هذه الوكالات في {city} مفتوحة على مدار 24 ساعة لخدمتك في أي وقت.',
            fr: 'Besoin d\'une voiture tard le soir ? Ces agences à {city} sont ouvertes 24h/24 pour vous servir.'
        }
    },
    'most-reviewed': {
        slug: 'most-reviewed',
        params: {
            ar: 'أشهر وكالات كراء السيارات في {city} | الأكثر طلباً',
            fr: 'Agences de location les plus populaires à {city}'
        },
        filter: { minReviews: 50 },
        description: {
            ar: 'قائمة بأكثر وكالات كراء السيارات شعبية في {city} مع مئات التقييمات من الزبائن. اختر وكالة مجربة وموثوقة.',
            fr: 'Liste des agences de location les plus populaires à {city} avec des centaines d\'avis clients.'
        }
    }
};

export function getIntent(slug: string): SeoIntent | undefined {
    return RENT_INTENTS[slug];
}

export function getAllIntents(): SeoIntent[] {
    return Object.values(RENT_INTENTS);
}
