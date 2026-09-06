'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from '@/navigation';
import { Link } from '@/navigation';
import { IListingBase } from '@/models/Listing';
import ListingCard from '@/components/listings/ListingCard';
import { carCatalog } from '@/constants/car-brands-models';
import { CITIES } from '@/constants/cities';
import {
    Car,
    Key,
    ShieldCheck,
    Clock,
    MapPin,
    Sliders,
    ChevronDown,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    PhoneCall,
    Calendar,
    HelpCircle,
    Compass,
    Building2,
} from 'lucide-react';

interface SellOrRentLandingProps {
    locale: 'ar' | 'fr';
    saleListings: IListingBase[];
    rentListings: IListingBase[];
}

export default function SellOrRentLanding({
    locale,
    saleListings = [],
    rentListings = [],
}: SellOrRentLandingProps) {
    const isRtl = locale === 'ar';
    const router = useRouter();

    const [mode, setMode] = useState<'sale' | 'rent'>('sale');
    const [activeShowcaseTab, setActiveShowcaseTab] = useState<'sale' | 'rent'>('sale');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    // Quick form state
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [pricePeriod, setPricePeriod] = useState<'day' | 'week' | 'month'>('day');

    // Available models based on selected brand
    const availableModels = useMemo(() => {
        if (!selectedBrand) return [];
        const brand = carCatalog.find((b) => b.slug === selectedBrand);
        return brand ? brand.models : [];
    }, [selectedBrand]);

    // Years list (current year down to 1995)
    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const list: number[] = [];
        for (let y = currentYear; y >= 1995; y--) {
            list.push(y);
        }
        return list;
    }, [currentYear]);

    // Switch mode
    const handleModeSwitch = (newMode: 'sale' | 'rent') => {
        setMode(newMode);
        setActiveShowcaseTab(newMode);
    };

    // Quick form submit -> redirects to /post with query parameters
    const handleQuickFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        params.set('purpose', mode);
        params.set('adType', mode === 'rent' ? 'rental' : 'sale');
        if (selectedBrand) params.set('brand', selectedBrand);
        if (selectedModel) params.set('model', selectedModel);
        if (selectedCity) params.set('city', selectedCity);
        if (selectedYear) params.set('year', selectedYear);
        if (price) params.set('price', price);
        if (mode === 'rent' && pricePeriod) {
            params.set('pricePeriod', pricePeriod);
        }

        router.push(`/post?${params.toString()}`);
    };

    // FAQ items corresponding to mode and matching JSON-LD exactly
    const faqs = useMemo(() => {
        if (mode === 'sale') {
            return isRtl
                ? [
                      {
                          q: 'هل نشر إعلان بيع سيارة مجاني على Cayn.ma؟',
                          a: 'نعم، نشر إعلانات بيع السيارات للأفراد مجاني بالكامل على منصة Cayn.ma، ويمكنك إضافة التفاصيل والصور والتواصل مباشرة مع المشترين.',
                      },
                      {
                          q: 'ما هي المعلومات المطلوبة لنشر إعلان بيع السيارة؟',
                          a: 'تحتاج إلى تحديد ماركة السيارة، الموديل، سنة الصنع، نوع ناقل الحركة والوقود، المسافة المقطوعة، المدينة، السعر المطلوب، مع إضافة صور واضحة ورقم هاتف متاح.',
                      },
                      {
                          q: 'كيف يتواصل معي المشترون المهتمون؟',
                          a: 'يتواصل معك المشترون مباشرة عبر الاتصال الهاتفي أو عبر رسائل الواتساب على الرقم الذي تحدده أثناء نشر الإعلان، دون أي وساطة.',
                      },
                      {
                          q: 'كم يستغرق ظهور الإعلان بعد النشر؟',
                          a: 'يتم تدقيق الإعلان ومراجعته وفق معايير الجودة والسلامة للتأكد من صحة الصور والبيانات، ويظهر للعموم مباشرة بعد المراجعة.',
                      },
                  ]
                : [
                      {
                          q: 'La publication d’une annonce de vente est-elle gratuite sur Cayn.ma ?',
                          a: 'Oui, la publication d’annonces de vente de voitures pour les particuliers est totalement gratuite sur Cayn.ma. Vous pouvez ajouter photos, détails et être contacté directement.',
                      },
                      {
                          q: 'Quelles sont les informations requises pour publier une annonce de vente ?',
                          a: 'Vous devez renseigner la marque, le modèle, l’année de mise en circulation, le carburant, la boîte de vitesses, le kilométrage, la ville, le prix souhaité ainsi que des photos claires et votre numéro de contact.',
                      },
                      {
                          q: 'Comment les acheteurs intéressés me contactent-ils ?',
                          a: 'Les acheteurs vous contactent directement par téléphone ou via WhatsApp sur le numéro renseigné dans votre annonce, sans intermédiaire.',
                      },
                      {
                          q: 'Combien de temps faut-il pour que mon annonce soit visible ?',
                          a: 'Votre annonce est vérifiée conformément à nos standards de qualité et de sécurité, puis mise en ligne directement après validation.',
                      },
                  ];
        } else {
            return isRtl
                ? [
                      {
                          q: 'هل يمكن للأفراد ووكالات الكراء نشر إعلانات الكراء على Cayn.ma؟',
                          a: 'نعم، تدعم منصة Cayn.ma نشر إعلانات كراء السيارات للأفراد والوكالات، مع إمكانية تحديد السعر باليوم أو الأسبوع أو الشهر.',
                      },
                      {
                          q: 'كيف أحدد تسعير كراء سيارتي على المنصة؟',
                          a: 'يمكنك اختيار فترة التسعير المناسبة (سعر يومي، أسبوعي، أو شهري) بما يتوافق مع العرض والطلب وحالة السيارة في مدينتك.',
                      },
                      {
                          q: 'كيف يتم التنسيق وتأكيد حجز كراء السيارة؟',
                          a: 'يتواصل معك المستأجر مباشرة عبر الهاتف أو الواتساب للاتفاق على التواريخ والأسعار وشروط الاستلام والضمان، مما يمنحك مرونة كاملة في التنسيق.',
                      },
                      {
                          q: 'ما هي المدن المغربية التي يمكنني عرض سيارتي للكراء فيها؟',
                          a: 'يمكنك عرض سيارتك في أي مدينة مغربية كـ الدار البيضاء، مراكش، الرباط، طنجة، أكادير، فاس وغيرها مع ظهور إعلانك للباحثين عن الكراء في منطقتك.',
                      },
                  ]
                : [
                      {
                          q: 'Les particuliers et les agences peuvent-ils publier des annonces de location ?',
                          a: 'Oui, Cayn.ma permet aux particuliers comme aux agences professionnelles de publier leurs voitures à la location avec des tarifs par jour, semaine ou mois.',
                      },
                      {
                          q: 'Comment fixer le tarif de location de mon véhicule ?',
                          a: 'Vous pouvez choisir la période tarifaire (prix par jour, par semaine ou par mois) selon l’état de votre véhicule et les prix pratiqués dans votre région.',
                      },
                      {
                          q: 'Comment s’organise la réservation et la remise du véhicule ?',
                          a: 'Le locataire vous contacte directement par téléphone ou WhatsApp pour convenir des dates, des modalités de caution et de remise des clés en toute transparence.',
                      },
                      {
                          q: 'Dans quelles villes marocaines puis-je proposer ma voiture à la location ?',
                          a: 'Vous pouvez proposer votre véhicule dans toutes les villes du Maroc (Casablanca, Marrakech, Rabat, Tanger, Agadir, Fès, etc.).',
                      },
                  ];
        }
    }, [mode, isRtl]);

    // Features copy based on mode
    const features = useMemo(() => {
        if (mode === 'sale') {
            return [
                {
                    icon: Clock,
                    title: isRtl ? 'نشر سهل في دقائق' : 'Publication facile en quelques minutes',
                    desc: isRtl
                        ? 'خطوات واضحة وسريعة لنشر مواصفات سيارتك وإضافة صورها دون تعقيد.'
                        : 'Un parcours fluide pour renseigner les détails de votre véhicule et ajouter vos photos.',
                },
                {
                    icon: PhoneCall,
                    title: isRtl ? 'تواصل مباشر بدون وسيط' : 'Contact direct sans intermédiaire',
                    desc: isRtl
                        ? 'استقبل اتصالات ورسائل واتساب من مشترين جادين وتفاوض معهم مباشرة.'
                        : 'Recevez des appels et messages WhatsApp directement d’acheteurs intéressés.',
                },
                {
                    icon: MapPin,
                    title: isRtl ? 'تغطية واسعة لجميع المدن' : 'Visibilité dans tout le Maroc',
                    desc: isRtl
                        ? 'إعلانك يظهر لآلاف المهتمين في كازا، الرباط، مراكش، طنجة وباقي المدن.'
                        : 'Votre annonce est visible par des acheteurs à Casablanca, Rabat, Marrakech, Tanger, etc.',
                },
                {
                    icon: Sliders,
                    title: isRtl ? 'تحكم كامل في إعلانك' : 'Contrôle total de votre annonce',
                    desc: isRtl
                        ? 'يمكنك تعديل السعر، تحديث الصور، أو حذف الإعلان بعد إتمام البيع بكل سهولة.'
                        : 'Modifiez votre prix, actualisez les photos ou retirez votre annonce en un clic.',
                },
            ];
        } else {
            return [
                {
                    icon: Calendar,
                    title: isRtl ? 'عرض سيارتك للكراء والوصول إلى المهتمين' : 'Visibilité auprès des locataires',
                    desc: isRtl
                        ? 'اعرض سيارتك للكراء لأيام أو أسابيع أو أشهر وتواصل مباشرة مع الراغبين في الاستئجار.'
                        : 'Présentez votre véhicule à la location pour des durées flexibles et recevez des demandes directes.',
                },
                {
                    icon: Sliders,
                    title: isRtl ? 'تسعير مرن حسب المدة' : 'Tarification sur mesure',
                    desc: isRtl
                        ? 'حدد السعر المناسب باليوم، بالأسبوع، أو بالشهر مع حرية كاملة في تحديد الشروط.'
                        : 'Définissez votre tarif à la journée, à la semaine ou au mois selon vos préférences.',
                },
                {
                    icon: Building2,
                    title: isRtl ? 'للأفراد ووكالات الكراء' : 'Particuliers et Professionnels',
                    desc: isRtl
                        ? 'سواء كنت مالكاً فرداً أو وكالة مرخصة، توفر لك المنصة وصولاً سهلاً للمستأجرين.'
                        : 'Une visibilité idéale que vous soyez propriétaire particulier ou gérant d’agence.',
                },
                {
                    icon: ShieldCheck,
                    title: isRtl ? 'تنسيق مباشر ومريح' : 'Gestion directe et transparente',
                    desc: isRtl
                        ? 'اتفاق مباشر وواضح على شروط التسليم والضمان دون عمولات خفية.'
                        : 'Échangez directement sur les conditions de remise et les modalités de location.',
                },
            ];
        }
    }, [mode, isRtl]);

    // Steps copy based on mode
    const steps = useMemo(() => {
        if (mode === 'sale') {
            return [
                {
                    num: '01',
                    title: isRtl ? 'أدخل تفاصيل السيارة' : 'Renseignez votre véhicule',
                    desc: isRtl
                        ? 'حدد الماركة والموديل وسنة الصنع ونوع الوقود والمسافة المقطوعة.'
                        : 'Indiquez la marque, le modèle, l’année, le carburant et le kilométrage.',
                },
                {
                    num: '02',
                    title: isRtl ? 'أضف صوراً واضحة' : 'Ajoutez des photos de qualité',
                    desc: isRtl
                        ? 'الصور الواقعية للسيارة من الداخل والخارج تزيد من فرص التواصل السريع.'
                        : 'Des prises de vue nettes de l’intérieur et de l’extérieur attirent plus d’acheteurs.',
                },
                {
                    num: '03',
                    title: isRtl ? 'حدد السعر والمدينة' : 'Fixez le prix et la ville',
                    desc: isRtl
                        ? 'اختر السعر المطلوب والمدينة المناسبة وأرقام التواصل المباشرة.'
                        : 'Définissez votre prix souhaité, votre ville et vos coordonnées téléphoniques.',
                },
                {
                    num: '04',
                    title: isRtl ? 'انشر واستقبل الاتصالات' : 'Publiez et recevez les contacts',
                    desc: isRtl
                        ? 'يُنشر إعلانك ويتواصل معك المشترون مباشرة عبر الهاتف أو الواتساب.'
                        : 'Votre annonce est diffusée et les acheteurs vous joignent directement.',
                },
            ];
        } else {
            return [
                {
                    num: '01',
                    title: isRtl ? 'حدد مواصفات السيارة' : 'Décrivez la voiture',
                    desc: isRtl
                        ? 'اختر الماركة والموديل وسنة الصنع والمواصفات المتاحة للمستأجر.'
                        : 'Sélectionnez la marque, le modèle, l’année et les équipements disponibles.',
                },
                {
                    num: '02',
                    title: isRtl ? 'حدد فترات وأسعار الكراء' : 'Précisez les tarifs de location',
                    desc: isRtl
                        ? 'اختر السعر باليوم، بالأسبوع، أو بالشهر مع توضيح شروط الاستخدام.'
                        : 'Indiquez le prix par jour, semaine ou mois et les modalités pratiques.',
                },
                {
                    num: '03',
                    title: isRtl ? 'أضف الصور وموقع التسليم' : 'Ajoutez photos et lieu',
                    desc: isRtl
                        ? 'صور واضحة للمركبة والمدينة التي تتوفر فيها السيارة للتسليم.'
                        : 'Des visuels attractifs et la ville où le véhicule peut être récupéré.',
                },
                {
                    num: '04',
                    title: isRtl ? 'استقبل طلبات المستأجرين' : 'Recevez les demandes',
                    desc: isRtl
                        ? 'تواصل مباشرة مع المهتمين ونسق المواعيد وشروط الكراء بكل سهولة.'
                        : 'Échangez avec les locataires et planifiez les créneaux en direct.',
                },
            ];
        }
    }, [mode, isRtl]);

    // Top cities for internal linking
    const topCities = useMemo(() => {
        const prioritySlugs = ['casablanca', 'rabat', 'marrakech', 'tanger', 'agadir', 'fes', 'meknes', 'oujda'];
        return CITIES.filter((c) => prioritySlugs.includes(c.slug));
    }, []);

    // Top brands for internal linking
    const topBrands = useMemo(() => {
        const prioritySlugs = ['dacia', 'renault', 'volkswagen', 'peugeot', 'hyundai', 'toyota', 'mercedes-benz', 'bmw'];
        return carCatalog.filter((b) => prioritySlugs.includes(b.slug));
    }, []);

    const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 selection:bg-blue-600 selection:text-white">
            {/* ============================================================ */}
            {/* 1. HERO SECTION WITH MODE TOGGLE & QUICK FORM */}
            {/* ============================================================ */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 border-b border-gray-100 dark:border-zinc-800 pt-10 pb-16 lg:pt-14 lg:pb-24">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Mode Switcher Pills */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex p-1.5 rounded-2xl bg-gray-200/80 dark:bg-zinc-800 shadow-inner border border-gray-300/60 dark:border-zinc-700/80">
                            <button
                                type="button"
                                onClick={() => handleModeSwitch('sale')}
                                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${
                                    mode === 'sale'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white'
                                }`}
                            >
                                <Car className="w-5 h-5" />
                                <span>{isRtl ? '🚗 بيع سيارتي' : '🚗 Vendre ma voiture'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeSwitch('rent')}
                                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 ${
                                    mode === 'rent'
                                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-white'
                                }`}
                            >
                                <Key className="w-5 h-5" />
                                <span>{isRtl ? '🔑 كراء سيارتي' : '🔑 Louer ma voiture'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Left/Right Hero Copy */}
                        <div className="lg:col-span-6 space-y-6 text-center lg:text-start">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                {mode === 'sale'
                                    ? isRtl
                                        ? 'بيع سيارتك في المغرب بسهولة'
                                        : 'Vente automobile simple au Maroc'
                                    : isRtl
                                    ? 'كراء سيارتك للأفراد والوكالات في المغرب'
                                    : 'Location de voiture pour particuliers et agences'}
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.2]">
                                {isRtl ? (
                                    <>
                                        بيع أو كراء سيارتك في المغرب بسهولة مع{' '}
                                        <span className="text-blue-600">Cayn.ma</span>
                                    </>
                                ) : (
                                    <>
                                        Vendez ou louez votre voiture au Maroc avec{' '}
                                        <span className="text-blue-600">Cayn.ma</span>
                                    </>
                                )}
                            </h1>

                            <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                                {mode === 'sale'
                                    ? isRtl
                                        ? 'نشر إعلان بيع سيارة والتواصل المباشر مع المشترين'
                                        : 'Publiez votre annonce de vente et échangez directement avec les acheteurs'
                                    : isRtl
                                    ? 'عرض سيارتك للكراء والتواصل المباشر مع المهتمين'
                                    : 'Proposez votre véhicule à la location et échangez directement avec les locataires'}
                            </h2>

                            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                {mode === 'sale'
                                    ? isRtl
                                        ? 'انشر إعلان سيارتك في خطوات سهلة، وأضف صورها وتفاصيلها ليتواصل معك المشترون مباشرة عبر الهاتف أو الواتساب في مختلف المدن المغربية.'
                                        : 'Déposez votre annonce de vente en quelques minutes avec photos et caractéristiques, et échangez directement avec les acheteurs intéressés partout au Maroc.'
                                    : isRtl
                                    ? 'سواء كنت فرداً أو وكالة كراء سيارات، اعرض مركبتك للكراء بأسعار يومية أو أسبوعية أو شهرية وتواصل مباشرة مع الباحثين عن كراء السيارات في منطقتك.'
                                    : 'Que vous soyez particulier ou agence de location, proposez votre véhicule à la location (par jour, semaine ou mois) et échangez directement avec les personnes intéressées.'}
                            </p>

                            {/* Trust bullets */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-start max-w-md mx-auto lg:mx-0">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                    <span>{isRtl ? 'نشر إعلانات سريع وسهل' : 'Publication rapide et intuitive'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                    <span>{isRtl ? 'اتصال مباشر بدون عمولات خفية' : 'Contact direct sans frais cachés'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                    <span>{isRtl ? 'ظهور في جميع المدن المغربية' : 'Présence dans toutes les villes'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                    <span>{isRtl ? 'تحكم كامل من لوحة حسابك' : 'Gestion complète depuis votre compte'}</span>
                                </div>
                            </div>

                            {/* Direct Action Link */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Link
                                    href={`/post?purpose=${mode}&adType=${mode === 'rent' ? 'rental' : 'sale'}`}
                                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all text-base ${
                                        mode === 'sale'
                                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                                            : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                                    }`}
                                >
                                    <span>
                                        {mode === 'sale'
                                            ? isRtl
                                                ? 'نشر إعلان بيع سيارة الآن'
                                                : 'Publier une annonce de vente'
                                            : isRtl
                                            ? 'نشر إعلان كراء سيارة الآن'
                                            : 'Publier une annonce de location'}
                                    </span>
                                    <ArrowIcon className="w-5 h-5" />
                                </Link>

                                <Link
                                    href={`/cars?purpose=${mode}`}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 text-sm transition-all"
                                >
                                    <span>
                                        {mode === 'sale'
                                            ? isRtl
                                                ? 'تصفح سيارات البيع'
                                                : 'Explorer les voitures en vente'
                                            : isRtl
                                            ? 'تصفح سيارات الكراء'
                                            : 'Explorer les voitures en location'}
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Right/Hero Quick Pre-fill Form Card */}
                        <div className="lg:col-span-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200/70 dark:border-zinc-800 relative">
                                <div className="flex items-center justify-between pb-5 mb-5 border-b border-gray-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2.5 rounded-xl ${
                                                mode === 'sale'
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                                    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600'
                                            }`}
                                        >
                                            {mode === 'sale' ? <Car className="w-6 h-6" /> : <Key className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                                {mode === 'sale'
                                                    ? isRtl
                                                        ? 'بدء نشر إعلان بيع'
                                                        : 'Démarrer une annonce de vente'
                                                    : isRtl
                                                    ? 'بدء نشر إعلان كراء'
                                                    : 'Démarrer une annonce de location'}
                                            </h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {isRtl
                                                    ? 'حدد بيانات سيارتك الأولية للمتابعة'
                                                    : 'Renseignez les premières informations pour continuer'}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            mode === 'sale'
                                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                        }`}
                                    >
                                        {mode === 'sale' ? (isRtl ? 'بيع' : 'Vente') : isRtl ? 'كراء' : 'Location'}
                                    </span>
                                </div>

                                <form onSubmit={handleQuickFormSubmit} className="space-y-4">
                                    {/* Brand & Model Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                {isRtl ? 'الماركة' : 'Marque'}
                                            </label>
                                            <select
                                                value={selectedBrand}
                                                onChange={(e) => {
                                                    setSelectedBrand(e.target.value);
                                                    setSelectedModel('');
                                                }}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">{isRtl ? '-- اختر الماركة --' : '-- Choisir la marque --'}</option>
                                                {carCatalog.map((b) => (
                                                    <option key={b.slug} value={b.slug}>
                                                        {isRtl ? b.ar : b.fr}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                {isRtl ? 'الموديل' : 'Modèle'}
                                            </label>
                                            <select
                                                value={selectedModel}
                                                onChange={(e) => setSelectedModel(e.target.value)}
                                                disabled={!selectedBrand}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="">{isRtl ? '-- اختر الموديل --' : '-- Choisir le modèle --'}</option>
                                                {availableModels.map((m) => (
                                                    <option key={m.slug} value={m.slug}>
                                                        {isRtl ? m.ar : m.fr}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* City & Year Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                {isRtl ? 'المدينة' : 'Ville'}
                                            </label>
                                            <select
                                                value={selectedCity}
                                                onChange={(e) => setSelectedCity(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">{isRtl ? '-- اختر المدينة --' : '-- Choisir la ville --'}</option>
                                                {CITIES.map((c) => (
                                                    <option key={c.slug} value={c.slug}>
                                                        {isRtl ? c.name.ar : c.name.fr}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                {isRtl ? 'سنة الصنع' : 'Année'}
                                            </label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">{isRtl ? '-- سنة الصنع --' : '-- Année --'}</option>
                                                {years.map((y) => (
                                                    <option key={y} value={y}>
                                                        {y}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Price & (if Rent) Price Period */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={mode === 'rent' ? '' : 'sm:col-span-2'}>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                {mode === 'sale'
                                                    ? isRtl
                                                        ? 'السعر المطلوب (درهم)'
                                                        : 'Prix demandé (MAD)'
                                                    : isRtl
                                                    ? 'سعر الكراء (درهم)'
                                                    : 'Tarif de location (MAD)'}
                                            </label>
                                            <input
                                                type="number"
                                                min={mode === 'sale' ? '1000' : '50'}
                                                step="50"
                                                placeholder={mode === 'sale' ? 'مثال: 95000' : 'مثال: 300'}
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>

                                        {mode === 'rent' && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {isRtl ? 'فترة التسعير' : 'Période de tarification'}
                                                </label>
                                                <select
                                                    value={pricePeriod}
                                                    onChange={(e) => setPricePeriod(e.target.value as any)}
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                                >
                                                    <option value="day">{isRtl ? 'باليوم (Par jour)' : 'Par jour'}</option>
                                                    <option value="week">{isRtl ? 'بالأسبوع (Par semaine)' : 'Par semaine'}</option>
                                                    <option value="month">{isRtl ? 'بالشهر (Par mois)' : 'Par mois'}</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit button */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            className={`w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-base ${
                                                mode === 'sale'
                                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                                                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                                            }`}
                                        >
                                            <span>
                                                {isRtl ? 'متابعة نشر الإعلان وإضافة الصور' : 'Continuer et ajouter les photos'}
                                            </span>
                                            <ArrowIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-normal pt-1">
                                        {isRtl
                                            ? '🔒 سيتم توجيهك إلى صفحة النشر الرسمية لإكمال الصور والوصف ورقم التواصل بكل أمان.'
                                            : '🔒 Vous serez redirigé vers le formulaire officiel pour ajouter vos photos et finaliser en toute sécurité.'}
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 2. VALUE PROPOSITIONS / FEATURES SECTION (DYNAMIC SALE VS RENT) */}
            {/* ============================================================ */}
            <section className="py-16 bg-gray-50/70 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                            {mode === 'sale'
                                ? isRtl
                                    ? 'لماذا تبيع سيارتك عبر Cayn.ma؟'
                                    : 'Pourquoi vendre votre voiture sur Cayn.ma ?'
                                : isRtl
                                ? 'لماذا تكرِي سيارتك عبر Cayn.ma؟'
                                : 'Pourquoi louer votre véhicule sur Cayn.ma ?'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                            {mode === 'sale'
                                ? isRtl
                                    ? 'مزايا عملية مصممة لتسهيل بيع سيارتك والتواصل المباشر مع المشترين.'
                                    : 'Des fonctionnalités conçues pour présenter votre véhicule et échanger simplement avec les acheteurs.'
                                : isRtl
                                ? 'منصة عملية لمالكي السيارات والوكالات لعرض المركبات والتواصل السلس مع المستأجرين.'
                                : 'Une plateforme pratique pour présenter vos véhicules et échanger simplement avec les locataires.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feat, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-zinc-800/90 p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-700/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                            >
                                <div>
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                                            mode === 'sale'
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                        }`}
                                    >
                                        <feat.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                        {feat.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {feat.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 3. HOW IT WORKS (4 STEPS - DYNAMIC SALE VS RENT) */}
            {/* ============================================================ */}
            <section className="py-16 bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {isRtl ? 'خطوات سهلة ومباشرة' : 'Un processus simple'}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                            {mode === 'sale'
                                ? isRtl
                                    ? 'كيف تبيع سيارتك في 4 خطوات؟'
                                    : 'Comment vendre votre voiture en 4 étapes ?'
                                : isRtl
                                ? 'كيف تعرض سيارتك للكراء في 4 خطوات؟'
                                : 'Comment louer votre voiture en 4 étapes ?'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="relative bg-gray-50/80 dark:bg-zinc-900/60 p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800 flex flex-col justify-between"
                            >
                                <div>
                                    <span
                                        className={`inline-block text-2xl font-black mb-3 ${
                                            mode === 'sale'
                                                ? 'text-blue-600/70 dark:text-blue-400/80'
                                                : 'text-amber-600/70 dark:text-amber-400/80'
                                        }`}
                                    >
                                        {step.num}
                                    </span>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            href={`/post?purpose=${mode}&adType=${mode === 'rent' ? 'rental' : 'sale'}`}
                            className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all text-sm sm:text-base ${
                                mode === 'sale'
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                            }`}
                        >
                            <span>
                                {mode === 'sale'
                                    ? isRtl
                                        ? 'ابدأ بنشر إعلان البيع الآن'
                                        : 'Commencer mon annonce de vente'
                                    : isRtl
                                    ? 'ابدأ بنشر إعلان الكراء الآن'
                                    : 'Commencer mon annonce de location'}
                            </span>
                            <ArrowIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 4. REAL LISTINGS SHOWCASE TABS (SALE VS RENT) */}
            {/* ============================================================ */}
            <section className="py-16 bg-gray-50/70 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                                {isRtl ? 'نماذج من أحدث الإعلانات على المنصة' : 'Dernières annonces sur la plateforme'}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {isRtl
                                    ? 'اطلع على أمثلة حقيقية للسيارات المعروضة للبيع والكراء'
                                    : 'Découvrez des exemples réels de voitures proposées à la vente et à la location'}
                            </p>
                        </div>

                        {/* Showcase Tabs */}
                        <div className="inline-flex p-1 rounded-xl bg-gray-200 dark:bg-zinc-800 border border-gray-300/50 dark:border-zinc-700">
                            <button
                                type="button"
                                onClick={() => setActiveShowcaseTab('sale')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                                    activeShowcaseTab === 'sale'
                                        ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                                }`}
                            >
                                <Car className="w-4 h-4" />
                                <span>{isRtl ? 'سيارات للبيع' : 'À vendre'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveShowcaseTab('rent')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                                    activeShowcaseTab === 'rent'
                                        ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                                }`}
                            >
                                <Key className="w-4 h-4" />
                                <span>{isRtl ? 'سيارات للكراء' : 'À louer'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    {activeShowcaseTab === 'sale' ? (
                        saleListings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {saleListings.map((listing) => (
                                    <ListingCard key={listing._id} listing={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-10 text-center border border-gray-200 dark:border-zinc-700">
                                <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                                    {isRtl ? 'كن أول من ينشر إعلان بيع سيارة!' : 'Soyez le premier à publier une annonce de vente !'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                                    {isRtl
                                        ? 'انشر سيارتك الآن لتصل إلى المشترين المهتمين في مدينتك وباقي مدن المغرب.'
                                        : 'Publiez votre véhicule dès maintenant pour toucher les acheteurs dans votre région.'}
                                </p>
                            </div>
                        )
                    ) : rentListings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {rentListings.map((listing) => (
                                <ListingCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-10 text-center border border-gray-200 dark:border-zinc-700">
                            <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                                {isRtl ? 'كن أول من يعرض سيارة للكراء!' : 'Soyez le premier à proposer une voiture en location !'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                                {isRtl
                                    ? 'اعرض سيارتك للكراء اليومي أو الأسبوعي أو الشهري وابدأ باستقبال الحجوزات.'
                                    : 'Proposez votre véhicule à la journée, semaine ou mois et recevez vos premières demandes.'}
                            </p>
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <Link
                            href={`/cars?purpose=${activeShowcaseTab}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            <span>
                                {activeShowcaseTab === 'sale'
                                    ? isRtl
                                        ? 'مشاهدة جميع السيارات المعروضة للبيع'
                                        : 'Voir toutes les annonces de vente'
                                    : isRtl
                                    ? 'مشاهدة جميع السيارات المعروضة للكراء'
                                    : 'Voir toutes les annonces de location'}
                            </span>
                            <ArrowIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 5. VISIBLE FAQ SECTION (ACCORDION - DYNAMIC PER MODE) */}
            {/* ============================================================ */}
            <section className="py-16 bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 mb-2">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                            <span>{isRtl ? 'الأسئلة الشائعة' : 'Questions fréquentes'}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                            {mode === 'sale'
                                ? isRtl
                                    ? 'أسئلة شائعة حول بيع السيارات في Cayn.ma'
                                    : 'FAQ sur la vente de voitures sur Cayn.ma'
                                : isRtl
                                ? 'أسئلة شائعة حول كراء السيارات في Cayn.ma'
                                : 'FAQ sur la location de voitures sur Cayn.ma'}
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div
                                    key={idx}
                                    className="border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-zinc-900/40 transition-colors"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full p-5 text-start flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronDown
                                            className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180 text-blue-600' : ''
                                            }`}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100/80 dark:border-zinc-800/80 pt-3">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ============================================================ */}
            {/* 6. INTERNAL SEO LINKS & EXPLORATION SECTION */}
            {/* ============================================================ */}
            <section className="py-16 bg-gray-50/70 dark:bg-zinc-900/40">
                <div className="container mx-auto px-4 max-w-6xl space-y-12">
                    {/* Top Cities */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isRtl ? 'إعلانات السيارات حسب المدن المغربية' : 'Voitures par ville au Maroc'}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {topCities.map((city) => (
                                <Link
                                    key={city.slug}
                                    href={`/cars/city/${city.slug}`}
                                    className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                >
                                    {isRtl ? `سيارات في ${city.name.ar}` : `Voitures à ${city.name.fr}`}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Top Brands */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Compass className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {isRtl ? 'إعلانات السيارات حسب أشهر الماركات' : 'Voitures par marques populaires'}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {topBrands.map((brand) => (
                                <Link
                                    key={brand.slug}
                                    href={`/cars?brand=${brand.slug}`}
                                    className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                >
                                    {isRtl ? `سيارات ${brand.ar}` : `Voitures ${brand.fr}`}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick navigation hubs */}
                    <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm">
                        <Link
                            href="/post?purpose=sale&adType=sale"
                            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors font-bold"
                        >
                            {isRtl ? '🚗 نشر إعلان بيع سيارة' : '🚗 Publier une annonce de vente'}
                        </Link>
                        <Link
                            href="/post?purpose=rent&adType=rental"
                            className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors font-bold"
                        >
                            {isRtl ? '🔑 نشر إعلان كراء سيارة' : '🔑 Publier une annonce de location'}
                        </Link>
                        <Link
                            href="/cars?purpose=sale"
                            className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors font-medium"
                        >
                            {isRtl ? 'سيارات مستعملة للبيع' : 'Voitures d’occasion à vendre'}
                        </Link>
                        <Link
                            href="/cars?purpose=rent"
                            className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-amber-600 transition-colors font-medium"
                        >
                            {isRtl ? 'سيارات للكراء في المغرب' : 'Voitures de location au Maroc'}
                        </Link>
                        <Link
                            href="/rent-agencies/marrakech"
                            className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors font-medium"
                        >
                            {isRtl ? 'وكالات كراء السيارات' : 'Agences de location'}
                        </Link>
                        <Link
                            href="/dashboard/my-ads"
                            className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors font-medium"
                        >
                            {isRtl ? 'إدارة إعلاناتي' : 'Gérer mes annonces'}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
