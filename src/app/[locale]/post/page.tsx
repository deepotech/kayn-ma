'use client';

import { useTranslations, useLocale } from 'next-intl';
import { getCityDisplayName } from '@/lib/cityUtils';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { FUEL_TYPES, TRANSMISSIONS, YEARS, BODY_TYPES } from '@/constants/data';
import { CITIES } from '@/constants/cities';
import { carCatalog } from '@/constants/car-brands-models';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from '@/navigation';
import { cn, dataURLtoFile } from '@/lib/utils';
import { Check, ChevronRight, ChevronLeft, Upload, X, Car, FileText, Image as ImageIcon, Eye, Sparkles, Rocket, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import CitySelect from '@/components/ui/CitySelect';

type FormData = {
    purpose: 'sale' | 'rent';
    condition: 'new' | 'used';
    sellerType: 'individual' | 'agency';
    agencyName: string;
    title: string;
    city: string;
    cityCustom?: string;
    price: number;
    pricePeriod?: 'day' | 'week' | 'month';
    phone: string;
    whatsapp: string;
    brand: string;
    brandCustom?: string;
    model: string;
    modelCustom?: string;
    bodyType: string; // [NEW] Added Body Type
    year: number;
    fuelType: string;
    transmission: string;
    mileage: number;
    description: string;
    website: string; // Honeypot field
};

const STEPS = [
    { id: 1, key: 'step1', icon: FileText },
    { id: 2, key: 'step2', icon: Car },
    { id: 3, key: 'step3', icon: ImageIcon },
    { id: 4, key: 'step4', icon: Eye },
];

const ENCOURAGEMENT_MESSAGES = [
    "إعلانك غادي يوصل لآلاف الناس 🚀",
    "مزيان! كمّل هاد الخطوات البسيطة ✨",
    "الصور الجيدة = مبيعات أسرع 📸",
    "باقي غير شوية! 🎉"
];

const DRAFT_KEY = 'cayn_post_draft';

export default function PostAdPage() {
    const t = useTranslations('PostAd');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [draftRestored, setDraftRestored] = useState(false);
    const [isSubmitReady, setIsSubmitReady] = useState(false);

    const { register, handleSubmit, watch, formState: { errors }, trigger, setValue } = useForm<FormData>({
        defaultValues: {
            purpose: 'sale',
            condition: 'used',
            sellerType: 'individual',
            agencyName: '',
            pricePeriod: 'day', // Default for rental
            year: new Date().getFullYear(),
            fuelType: 'Diesel',
            transmission: 'Manual',
            website: '', // Honeypot
        }
    });

    const selectedBrand = watch('brand');
    const selectedModel = watch('model');
    const bodyTypeValue = watch('bodyType');

    // Get available models based on selected brand
    const brandData = carCatalog.find(b => b.slug === selectedBrand);
    const availableModels = brandData ? brandData.models : [];

    const formData = watch();

    // Reset model when brand changes
    useEffect(() => {
        if (selectedBrand && selectedBrand !== 'other') {
            // Only reset if the current model doesn't belong to the new brand
            const modelExists = availableModels.some(m => m.slug === formData.model);
            if (!modelExists) {
                setValue('model', '');
            }
        }
    }, [selectedBrand, availableModels, setValue, formData.model]);

    // Restore draft from localStorage
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft && !draftRestored) {
            try {
                const draft = JSON.parse(savedDraft);
                Object.keys(draft.formData || {}).forEach((key) => {
                    setValue(key as keyof FormData, draft.formData[key]);
                });
                if (draft.step) setCurrentStep(draft.step);

                // Restore images from previews
                if (draft.imagePreviews && Array.isArray(draft.imagePreviews) && draft.imagePreviews.length > 0) {
                    setImagePreviews(draft.imagePreviews);

                    // Convert base64 previews back to Files
                    const restoredFiles = draft.imagePreviews.map((preview: string, index: number) => {
                        return dataURLtoFile(preview, `restored-image-${index}.jpg`);
                    });
                    setImages(restoredFiles);
                }

                setDraftRestored(true);
            } catch (e) {
                console.error('Error restoring draft:', e);
            }
        }
    }, [setValue, draftRestored]);


    // Auto-save draft to localStorage
    useEffect(() => {
        const draft = {
            formData,
            step: currentStep,
            imagePreviews,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, [formData, currentStep, imagePreviews]);

    // Safety delay for submit button when entering Step 4
    useEffect(() => {
        if (currentStep === 4) {
            setIsSubmitReady(false);
            const timer = setTimeout(() => setIsSubmitReady(true), 1000); // 1 second safety delay
            return () => clearTimeout(timer);
        } else {
            setIsSubmitReady(false);
        }
    }, [currentStep]);

    // Clear draft on successful submission
    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
    };

    // Compress image before upload
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 900;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = height * (MAX_WIDTH / width);
                        width = MAX_WIDTH;
                    }
                    if (height > MAX_HEIGHT) {
                        width = width * (MAX_HEIGHT / height);
                        height = MAX_HEIGHT;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    const base64 = canvas.toDataURL('image/jpeg', 0.8);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Image handling
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remainingSlots = 8 - images.length;
        const filesToAdd = files.slice(0, remainingSlots);

        filesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });

        setImages(prev => [...prev, ...filesToAdd]);
    }, [images.length]);

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Step navigation
    const nextStep = async () => {
        let fieldsToValidate: (keyof FormData)[] = [];

        if (currentStep === 1) {
            fieldsToValidate = ['title', 'city', 'price', 'phone'];
            if (formData.city === 'other') fieldsToValidate.push('cityCustom');
        } else if (currentStep === 2) {
            fieldsToValidate = ['brand', 'model', 'bodyType', 'year', 'fuelType', 'transmission'];
            if (formData.brand === 'other') fieldsToValidate.push('brandCustom');
            if (formData.model === 'other') fieldsToValidate.push('modelCustom');
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            // Check auth before step 4
            if (currentStep === 3 && !user) {
                setShowAuthModal(true);
                return;
            }
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const onSubmit = async (data: FormData) => {
        // Check auth before submit
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        setIsSubmitting(true);
        setIsUploading(true);

        try {
            // Upload images first
            let uploadedImages: { url: string; publicId: string }[] = [];

            if (images.length > 0) {
                const compressedImages = await Promise.all(
                    images.map(img => compressImage(img))
                );

                const uploadResponse = await axios.post('/api/upload', {
                    images: compressedImages
                });

                if (uploadResponse.data.success) {
                    uploadedImages = uploadResponse.data.images;
                }
            }

            setIsUploading(false);

            // Create listing
            await axios.post('/api/listings', {
                ...data,
                // Override/Add missing payload parts
                adType: data.purpose === 'rent' ? 'rental' : 'sale',
                pricePeriod: data.purpose === 'rent' ? (data.pricePeriod || 'day') : null,
                brand: data.brand === 'other' ? (data.brandCustom || 'Other') : data.brand,
                carModel: data.model === 'other' ? (data.modelCustom || 'Other') : data.model,
                brandCustom: data.brand === 'other' ? data.brandCustom : undefined,
                modelCustom: data.model === 'other' ? data.modelCustom : undefined,
                images: uploadedImages,
                userId: user.uid,
                currency: 'MAD'
            });

            clearDraft();
            // Move to success step
            setCurrentStep(5);
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Error creating listing');
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    const inputClass = "w-full rounded-lg border border-gray-300 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
    const labelClass = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";

    const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 px-4">
                <div className="container mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
                        <p className="text-blue-600 font-medium flex items-center justify-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            {ENCOURAGEMENT_MESSAGES[currentStep - 1]}
                        </p>
                    </div>

                    {/* Immediate Publish Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8 flex items-center gap-3 text-blue-700 dark:text-blue-300">
                        <Rocket className="h-5 w-5 shrink-0" />
                        <p className="font-medium text-sm">
                            {locale === 'ar'
                                ? "سيظهر إعلانك مباشرة بعد النشر ✅"
                                : "Votre annonce apparaîtra immédiatement après publication ✅"}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        {/* Percentage */}
                        <div className="text-center mb-3">
                            <span className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-sm font-semibold">
                                {Math.round(progressPercentage)}% {t('almostDone')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-zinc-700 -z-10">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>

                            {STEPS.map((step) => (
                                <div key={step.id} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep > step.id
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.id
                                            ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                                            : 'bg-gray-200 dark:bg-zinc-700 text-gray-500'
                                        }`}>
                                        {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                                        }`}>
                                        {t(step.key as any)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Card */}
                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 md:p-8">

                        {/* Honeypot */}
                        <input
                            {...register('website')}
                            type="text"
                            name="website"
                            autoComplete="off"
                            tabIndex={-1}
                            style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                        />

                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    {t('step1')}
                                    <span className="ml-auto text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        {tCommon('required')}
                                    </span>
                                </h2>

                                {/* Purpose (Sale vs Rent) */}
                                <div>
                                    <label className={labelClass}>{t('adType')}</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${formData.purpose === 'sale' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'}`}>
                                            <input type="radio" value="sale" {...register('purpose')} className="sr-only" />
                                            <span className="font-semibold">{t('sale')}</span>
                                        </label>
                                        <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${formData.purpose === 'rent' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'}`}>
                                            <input type="radio" value="rent" {...register('purpose')} className="sr-only" />
                                            <span className="font-semibold">{t('rental')}</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className={labelClass}>حالة السيارة / État</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${formData.condition === 'used' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'}`}>
                                            <input type="radio" value="used" {...register('condition')} className="sr-only" />
                                            <span className="font-semibold">مستعملة / Occasion</span>
                                        </label>
                                        <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${formData.condition === 'new' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'}`}>
                                            <input type="radio" value="new" {...register('condition')} className="sr-only" />
                                            <span className="font-semibold">جديدة / Neuve</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Seller Type */}
                                <div>
                                    <label className={labelClass}>البائع / Vendeur</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${formData.sellerType === 'individual' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'}`}>
                                            <input type="radio" value="individual" {...register('sellerType')} className="sr-only" />
                                            <span className="font-semibold">فرد / Particulier</span>
                                        </label>
                                        <label className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${formData.sellerType === 'agency' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-purple-300'}`}>
                                            <input type="radio" value="agency" {...register('sellerType')} className="sr-only" />
                                            <span className="font-semibold">وكالة / Agence</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Agency Name */}
                                {formData.sellerType === 'agency' && (
                                    <div>
                                        <label className={labelClass}>اسم الوكالة / Nom de l'agence</label>
                                        <input
                                            {...register('agencyName')}
                                            type="text"
                                            className={inputClass}
                                            placeholder="مثال: Auto Premium Maroc"
                                        />
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label className={labelClass}>{t('adTitle')} *</label>
                                    <input
                                        {...register('title', { required: true })}
                                        type="text"
                                        className={inputClass}
                                        placeholder={t('adTitlePlaceholder')}
                                    />
                                    {errors.title && <span className="text-red-500 text-sm mt-1 block">هذا الحقل مطلوب</span>}
                                </div>

                                {/* City */}
                                <div>
                                    <label className={labelClass}>{t('city')} *</label>
                                    <CitySelect
                                        value={watch('city')}
                                        onChange={(slug) => setValue('city', slug, { shouldValidate: true })}
                                        placeholder={t('selectCity')}
                                        error={errors.city ? tCommon('required') : undefined}
                                    />
                                    <input
                                        type="hidden"
                                        {...register('city', { required: true })}
                                    />
                                </div>

                                {/* Custom City */}
                                {watch('city') === 'other' && (
                                    <div>
                                        <label className={labelClass}>{locale === 'ar' ? 'اسم المدينة' : 'Nom de la ville'} *</label>
                                        <input
                                            {...register('cityCustom', { required: true })}
                                            type="text"
                                            className={inputClass}
                                            placeholder={locale === 'ar' ? 'أدخل اسم مدينتك' : 'Entrez le nom de votre ville'}
                                        />
                                        {errors.cityCustom && <span className="text-red-500 text-sm mt-1 block">هذا الحقل مطلوب</span>}
                                    </div>
                                )}

                                {/* Price Period (Rent) */}
                                {formData.purpose === 'rent' && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className={labelClass}>{t('pricePeriod')} *</label>
                                        <div className="flex gap-2">
                                            {['day', 'week', 'month'].map((p) => (
                                                <label key={p} className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all text-center text-sm ${formData.pricePeriod === p ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 font-semibold text-blue-700 dark:text-blue-300' : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400'}`}>
                                                    <input type="radio" value={p} {...register('pricePeriod')} className="sr-only" />
                                                    {p === 'day' ? t('perDay') : p === 'week' ? t('perWeek') : t('perMonth')}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price */}
                                <div>
                                    <label className={labelClass}>
                                        {formData.purpose === 'rent'
                                            ? (formData.pricePeriod === 'week' ? t('priceWeek') : formData.pricePeriod === 'month' ? t('priceMonth') : t('priceDay'))
                                            : t('price')
                                        } *
                                    </label>
                                    <input
                                        {...register('price', { required: true, min: 100 })}
                                        type="number"
                                        className={inputClass}
                                        placeholder={t('pricePlaceholder')}
                                    />
                                    {errors.price && <span className="text-red-500 text-sm mt-1 block">أدخل سعر صحيح</span>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className={labelClass}>{t('phone')} *</label>
                                    <input
                                        {...register('phone', { required: true, pattern: /^0[67]\d{8}$/ })}
                                        type="tel"
                                        className={inputClass}
                                        placeholder={t('phonePlaceholder')}
                                    />
                                    {errors.phone && <span className="text-red-500 text-sm mt-1 block">أدخل رقم هاتف مغربي صحيح</span>}
                                </div>

                                {/* WhatsApp */}
                                <div>
                                    <label className={labelClass}>{t('whatsappOptional')}</label>
                                    <input
                                        {...register('whatsapp')}
                                        type="tel"
                                        className={inputClass}
                                        placeholder={t('phonePlaceholder')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Car Details */}
                        {currentStep === 2 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Car className="h-5 w-5 text-blue-600" />
                                    {t('step2')}
                                    <span className="ml-auto text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        {tCommon('required')}
                                    </span>
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Brand */}
                                    <div className={selectedBrand === 'other' ? "col-span-1" : "col-span-1"}>
                                        <label className={labelClass}>{t('brand')} *</label>
                                        <select {...register('brand', { required: true })} className={inputClass}>
                                            <option value="">{t('selectBrand')}</option>
                                            {carCatalog.map(b => (
                                                <option key={b.slug} value={b.slug}>{locale === 'ar' ? b.ar : b.fr}</option>
                                            ))}
                                            <option value="other">{locale === 'ar' ? 'أخرى' : 'Autre'}</option>
                                        </select>
                                        {errors.brand && <span className="text-red-500 text-sm mt-1 block">المرجو اختيار الماركة</span>}
                                    </div>

                                    {/* Model */}
                                    <div className={selectedModel === 'other' ? "col-span-1" : "col-span-1"}>
                                        <label className={labelClass}>{t('model')} *</label>
                                        <select
                                            {...register('model', { required: true })}
                                            className={inputClass}
                                            disabled={!selectedBrand || selectedBrand === 'other'}
                                        >
                                            <option value="">{t('select')}</option>
                                            {availableModels.map(m => (
                                                <option key={m.slug} value={m.slug}>{locale === 'ar' ? m.ar : m.fr}</option>
                                            ))}
                                            <option value="other">{locale === 'ar' ? 'أخرى' : 'Autre'}</option>
                                        </select>
                                        {errors.model && <span className="text-red-500 text-sm mt-1 block">المرجو اختيار الموديل</span>}
                                    </div>
                                </div>

                                {/* Custom Brand Input */}
                                {selectedBrand === 'other' && (
                                    <div>
                                        <label className={labelClass}>{locale === 'ar' ? 'اسم الماركة' : 'Nom de la marque'} *</label>
                                        <input
                                            {...register('brandCustom', { required: true })}
                                            type="text"
                                            className={inputClass}
                                            placeholder={locale === 'ar' ? 'أدخل اسم الماركة' : 'Entrez le nom de la marque'}
                                        />
                                        {errors.brandCustom && <span className="text-red-500 text-sm mt-1 block">هذا الحقل مطلوب</span>}
                                    </div>
                                )}

                                {/* Custom Model Input */}
                                {(selectedBrand === 'other' || selectedModel === 'other') && (
                                    <div>
                                        <label className={labelClass}>{locale === 'ar' ? 'اسم الموديل' : 'Nom du modèle'} *</label>
                                        <input
                                            {...register('modelCustom', { required: true })}
                                            type="text"
                                            className={inputClass}
                                            placeholder={locale === 'ar' ? 'أدخل اسم الموديل' : 'Entrez le nom du modèle'}
                                        />
                                        {errors.modelCustom && <span className="text-red-500 text-sm mt-1 block">هذا الحقل مطلوب</span>}
                                    </div>
                                )}

                                {/* Body Type [NEW] */}
                                <div>
                                    <label className={labelClass}>{locale === 'ar' ? 'شكل السيارة' : 'Carrosserie'} *</label>
                                    <select {...register('bodyType', { required: true })} className={inputClass}>
                                        <option value="">{t('select')}</option>
                                        {BODY_TYPES.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {locale === 'ar' ? b.ar : b.fr}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.bodyType && <span className="text-red-500 text-sm mt-1 block">المرجو اختيار شكل السيارة</span>}
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    {/* Year */}
                                    <div>
                                        <label className={labelClass}>{t('year')} *</label>
                                        <select {...register('year', { required: true })} className={inputClass}>
                                            {YEARS.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                        {errors.year && <span className="text-red-500 text-sm mt-1 block">المرجو اختيار السنة</span>}
                                    </div>

                                    {/* Mileage */}
                                    <div>
                                        <label className={labelClass}>{t('mileage')}</label>
                                        <input
                                            {...register('mileage')}
                                            type="number"
                                            className={inputClass}
                                            placeholder={t('mileagePlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Fuel */}
                                    <div>
                                        <label className={labelClass}>{t('fuel')} *</label>
                                        <select {...register('fuelType', { required: true })} className={inputClass}>
                                            {FUEL_TYPES.map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                        {errors.fuelType && <span className="text-red-500 text-sm mt-1 block">المرجو اختيار نوع الوقود</span>}
                                    </div>

                                    {/* Transmission */}
                                    <div>
                                        <label className={labelClass}>{t('transmission')} *</label>
                                        <select {...register('transmission', { required: true })} className={inputClass}>
                                            {TRANSMISSIONS.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        {errors.transmission && <span className="text-red-500 text-sm mt-1 block">المرجو اختيار ناقل الحركة</span>}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>{t('description')}</label>
                                    <textarea
                                        {...register('description')}
                                        rows={4}
                                        className={inputClass}
                                        placeholder={t('descriptionPlaceholder')}
                                    />
                                    {/* Phone Warning in Description */}
                                    {formData.description && /\b0[567][0-9]{8}\b/.test(formData.description.replace(/\s/g, '')) && (
                                        <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-lg text-sm flex gap-2 items-start animate-in fade-in slide-in-from-top-2">
                                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                            <p>
                                                {locale === 'ar'
                                                    ? "⚠️ المرجو عدم كتابة رقم الهاتف في الوصف. سيظهر رقمك تلقائياً في زر الاتصال."
                                                    : "⚠️ Veuillez ne pas écrire votre numéro dans la description. Il apparaîtra automatiquement via le bouton d'appel."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Images */}
                        {currentStep === 3 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-blue-600" />
                                    {t('step3')}
                                    <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {images.length}/8
                                    </span>
                                </h2>

                                {/* Upload Area */}
                                <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">

                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <ul className="hidden">
                                            <li><input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageUpload} /></li>
                                        </ul>
                                        <div className="cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
                                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('dragDrop')}</p>
                                            <p className="text-gray-500 my-2">{t('or')}</p>
                                            <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                                {t('browse')}
                                            </span>
                                        </div>
                                    </label>
                                    <p className="text-sm text-gray-500 mt-4">{t('maxImages')} • {t('firstImageCover')}</p>
                                </div>

                                {/* Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                {index === 0 && (
                                                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Cover</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Min images warning */}
                                {images.length > 0 && images.length < 3 && (
                                    <p className="text-amber-600 text-sm text-center">
                                        ⚠️ أضف على الأقل 3 صور لجذب المزيد من المشترين
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 4: Preview */}
                        {currentStep === 4 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-blue-600" />
                                    {t('preview')}
                                </h2>

                                <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-6 space-y-4">
                                    {/* Preview Image */}
                                    {imagePreviews.length > 0 && (
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                                            <img src={imagePreviews[0]} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-bold">{formData.title || 'عنوان الإعلان'}</h3>
                                        <p className="text-3xl font-bold text-blue-600">{formData.price?.toLocaleString()} DH</p>
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full">{formData.brand === 'other' ? formData.brandCustom : formData.brand} {formData.model === 'other' ? formData.modelCustom : formData.model}</span>
                                            <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full">{formData.year}</span>
                                            <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full">{formData.fuelType}</span>
                                            <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full">{formData.transmission}</span>
                                            {formData.bodyType && <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full">{formData.bodyType}</span>}
                                            {formData.mileage && <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full">{formData.mileage?.toLocaleString()} km</span>}
                                        </div>
                                        {formData.description && (
                                            <p className="text-gray-600 dark:text-gray-400">{formData.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium">
                                        <Rocket className="h-5 w-5" />
                                        {t('almostDone')}
                                    </div>
                                    <p className="text-green-600 dark:text-green-500 text-sm mt-1">{t('encouragement')}</p>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Success  */}
                        {currentStep === 5 && (
                            <div className="text-center py-10 animate-in fade-in zoom-in">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="h-10 w-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t('successTitle')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                                    {t('successMessage')}
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={() => router.push('/search')}>
                                        {t('viewAds')}
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        setCurrentStep(1);
                                        setImages([]);
                                        setImagePreviews([]);
                                    }}>
                                        {t('postAnother')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {currentStep < 5 && (
                            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-700">
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={isSubmitting}
                                        className="gap-2"
                                    >
                                        <ChevronRight className="h-4 w-4 rotate-180" />
                                        {t('back')}
                                    </Button>
                                )}

                                {currentStep < 4 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 gap-2"
                                    >
                                        {t('next')}
                                        <ChevronLeft className="h-4 w-4 rotate-180" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || isUploading || !isSubmitReady}
                                        className={`flex-1 gap-2 ${isSubmitting || !isSubmitReady ? 'opacity-70' : ''}`}
                                    >
                                        {isSubmitting || isUploading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                {isUploading ? t('uploading') : t('publishing')}
                                            </>
                                        ) : (
                                            <>
                                                {t('publish')}
                                                <Rocket className="h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}
