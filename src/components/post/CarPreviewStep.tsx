'use client';

import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Eye, Edit2, MapPin, Gauge, Fuel, Calendar, Layers, Phone, Tag, Check, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { carCatalog } from '@/constants/car-brands-models';
import { FUEL_TYPES, TRANSMISSIONS, BODY_TYPES } from '@/constants/data';
import { EQUIPMENT_GROUPS } from './CarFeaturesStep';

interface CarPreviewStepProps {
    formData: any;
    imagePreviews: string[];
    onGoToStep: (step: number) => void;
    isSubmitting: boolean;
    isUploading: boolean;
}

export default function CarPreviewStep({
    formData,
    imagePreviews,
    onGoToStep,
    isSubmitting,
    isUploading,
}: CarPreviewStepProps) {
    const t = useTranslations('PostAd');
    const locale = useLocale();

    // Brand and Model labels
    const brandData = carCatalog.find((b) => b.slug === formData.brand);
    const brandName = brandData ? (locale === 'ar' ? brandData.ar : brandData.fr) : formData.brand;
    const brandLabel = formData.brand === 'other' ? formData.brandCustom : brandName;
    
    const modelData = brandData?.models.find((m) => m.slug === formData.model);
    const modelName = modelData ? (locale === 'ar' ? modelData.ar : modelData.fr) : formData.model;
    const modelLabel = formData.model === 'other' ? formData.modelCustom : modelName;

    // Fuel & Transmission labels
    const fuelLabel = formData.fuelType === 'Diesel' ? (locale === 'ar' ? 'ديزل' : 'Diesel') : formData.fuelType === 'Petrol' ? (locale === 'ar' ? 'بنزين' : 'Essence') : formData.fuelType;
    const transLabel = formData.transmission === 'Manual' ? t('manual') : formData.transmission === 'Automatic' ? t('automatic') : formData.transmission;

    const bodyObj = BODY_TYPES.find((bt) => bt.id === formData.bodyType);
    const bodyLabel = bodyObj ? (locale === 'ar' ? bodyObj.ar : bodyObj.fr) : formData.bodyType;

    // Price formatted
    const formattedPrice = formData.price ? Number(formData.price).toLocaleString() : '0';

    // Features labels map
    const selectedFeatures: string[] = formData.features || [];
    const allFeatureItems = EQUIPMENT_GROUPS.flatMap((g) => g.items);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    {t('step7')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    راجع كافة التفاصيل قبل الضغط على زر النشر النهائي
                </p>
            </div>

            {/* Main Preview Card */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-lg">
                {/* Main Cover & Thumbnails */}
                <div className="relative bg-zinc-950 aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
                    {imagePreviews[0] ? (
                        <Image
                            src={imagePreviews[0]}
                            alt="Listing main preview"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            لا توجد صور
                        </div>
                    )}

                    <div className="absolute top-4 start-4 bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md">
                        {formData.purpose === 'rent' ? '🔑 للكراء' : '🚗 للبيع'}
                    </div>

                    <button
                        type="button"
                        onClick={() => onGoToStep(1)}
                        className="absolute bottom-4 end-4 bg-zinc-900/80 hover:bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-1.5 shadow-md transition-colors"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        {t('editSection')} الصور ({imagePreviews.length})
                    </button>
                </div>

                {/* Listing Details Body */}
                <div className="p-6 space-y-6">
                    {/* Title & Price Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-zinc-800">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                                <span>{brandLabel}</span>
                                <span>•</span>
                                <span>{modelLabel}</span>
                                <span>•</span>
                                <span>{formData.year}</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                                {formData.title || `${brandLabel} ${modelLabel} ${formData.year}`}
                            </h2>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <MapPin className="w-3.5 h-3.5 text-red-500" />
                                <span>{formData.city}</span>
                            </div>
                        </div>

                        <div className="text-start sm:text-end bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">الثمن المطلوب</span>
                            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                                {formattedPrice} DH
                            </span>
                            {formData.purpose === 'rent' && formData.pricePeriod && (
                                <span className="text-xs text-gray-500 block mt-0.5">
                                    / {formData.pricePeriod === 'week' ? 'أسبوع' : formData.pricePeriod === 'month' ? 'شهر' : 'يوم'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Specs Grid Badges */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">المواصفات الرئيسية</h4>
                            <button
                                type="button"
                                onClick={() => onGoToStep(2)}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <Edit2 className="w-3 h-3" />
                                {t('editSection')}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl flex items-center gap-2.5">
                                <Gauge className="w-4 h-4 text-blue-600" />
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-normal">الكيلومترات</span>
                                    <span>{Number(formData.mileage || 0).toLocaleString()} km</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl flex items-center gap-2.5">
                                <Fuel className="w-4 h-4 text-green-600" />
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-normal">الوقود</span>
                                    <span>{fuelLabel}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl flex items-center gap-2.5">
                                <Layers className="w-4 h-4 text-purple-600" />
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-normal">ناقل الحركة</span>
                                    <span>{transLabel}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl flex items-center gap-2.5">
                                <Calendar className="w-4 h-4 text-amber-600" />
                                <div>
                                    <span className="text-[10px] text-gray-400 block font-normal">الهيكل</span>
                                    <span>{bodyLabel || 'غير محدد'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    {selectedFeatures.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">التجهيزات المختارة</h4>
                                <button
                                    type="button"
                                    onClick={() => onGoToStep(4)}
                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    {t('editSection')}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                {selectedFeatures.map((featId) => {
                                    const featItem = allFeatureItems.find((i) => i.id === featId);
                                    if (!featItem) return null;

                                    return (
                                        <span
                                            key={featId}
                                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/40"
                                        >
                                            <Check className="w-3 h-3 text-blue-600" />
                                            {locale === 'ar' ? featItem.ar : featItem.fr}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Description Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">الوصف</h4>
                            <button
                                type="button"
                                onClick={() => onGoToStep(6)}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                                <Edit2 className="w-3 h-3" />
                                {t('editSection')}
                            </button>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
                            {formData.description || 'لا يوجد وصف'}
                        </p>
                    </div>

                    {/* Phone Contact Badge */}
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-600 text-white rounded-xl">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">رقم التواصل</span>
                                <span className="text-base font-bold text-gray-900 dark:text-white dir-ltr">
                                    {formData.phone}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onGoToStep(5)}
                            className="text-xs font-bold text-green-700 dark:text-green-400 hover:underline"
                        >
                            {t('editSection')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
