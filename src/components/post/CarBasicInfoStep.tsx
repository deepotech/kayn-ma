'use client';

import { useTranslations, useLocale } from 'next-intl';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { carCatalog } from '@/constants/car-brands-models';
import { FUEL_TYPES, TRANSMISSIONS, YEARS, BODY_TYPES } from '@/constants/data';
import { Car, Building2, User } from 'lucide-react';

interface CarBasicInfoStepProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    errors: FieldErrors<any>;
}

export default function CarBasicInfoStep({
    register,
    watch,
    setValue,
    errors,
}: CarBasicInfoStepProps) {
    const t = useTranslations('PostAd');
    const locale = useLocale();

    const purpose = watch('purpose');
    const sellerType = watch('sellerType');
    const selectedBrand = watch('brand');
    const selectedModel = watch('model');

    // Get available models based on selected brand
    const brandData = carCatalog.find((b) => b.slug === selectedBrand);
    const availableModels = brandData ? brandData.models : [];

    const labelClass = 'block text-sm font-bold mb-2 text-gray-800 dark:text-gray-200';
    const inputClass =
        'w-full rounded-xl border border-gray-300 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm';

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    {t('step2')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    حدد تفاصيل السيارة ونوع الإعلان
                </p>
            </div>

            {/* Purpose: Sale or Rent */}
            <div>
                <label className={labelClass}>{t('adType')} *</label>
                <div className="grid grid-cols-2 gap-4">
                    <label
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 font-bold text-sm ${
                            purpose === 'sale'
                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <input
                            type="radio"
                            value="sale"
                            {...register('purpose')}
                            className="sr-only"
                        />
                        <span>🚗 {t('sale')}</span>
                    </label>
                    <label
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 font-bold text-sm ${
                            purpose === 'rent'
                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <input
                            type="radio"
                            value="rent"
                            {...register('purpose')}
                            className="sr-only"
                        />
                        <span>🔑 {t('rental')}</span>
                    </label>
                </div>
            </div>

            {/* Seller Type: Individual vs Agency */}
            <div>
                <label className={labelClass}>{t('sellerType')} *</label>
                <div className="grid grid-cols-2 gap-4">
                    <label
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 font-medium text-sm ${
                            sellerType === 'individual'
                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                                : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <input
                            type="radio"
                            value="individual"
                            {...register('sellerType')}
                            className="sr-only"
                        />
                        <User className="w-4 h-4" />
                        <span>{t('individual')}</span>
                    </label>

                    <label
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 font-medium text-sm ${
                            sellerType === 'agency'
                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                                : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <input
                            type="radio"
                            value="agency"
                            {...register('sellerType')}
                            className="sr-only"
                        />
                        <Building2 className="w-4 h-4" />
                        <span>{t('agency')}</span>
                    </label>
                </div>
            </div>

            {/* Agency Name if Agency */}
            {sellerType === 'agency' && (
                <div>
                    <label className={labelClass}>{t('agencyName')} *</label>
                    <input
                        type="text"
                        {...register('agencyName', { required: sellerType === 'agency' })}
                        placeholder={t('agencyNamePlaceholder')}
                        className={inputClass}
                    />
                    {errors.agencyName && (
                        <p className="text-red-500 text-xs mt-1">اسم الوكالة مطلوب</p>
                    )}
                </div>
            )}

            {/* Brand & Model Dependent Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                    <label className={labelClass}>{t('brand')} *</label>
                    <select
                        {...register('brand', { required: true })}
                        className={inputClass}
                        onChange={(e) => {
                            setValue('brand', e.target.value);
                            setValue('model', ''); // Reset model
                        }}
                    >
                        <option value="">{t('selectBrand')}</option>
                        {carCatalog.map((b) => (
                            <option key={b.slug} value={b.slug}>
                                {locale === 'ar' ? b.ar : b.fr}
                            </option>
                        ))}
                        <option value="other">ماركة أخرى (أخرى)</option>
                    </select>
                    {errors.brand && <p className="text-red-500 text-xs mt-1">اختر الماركة</p>}
                </div>

                {/* Model */}
                <div>
                    <label className={labelClass}>{t('model')} *</label>
                    <select
                        {...register('model', { required: true })}
                        disabled={!selectedBrand}
                        className={`${inputClass} ${!selectedBrand ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <option value="">{t('selectModel')}</option>
                        {availableModels.map((m) => (
                            <option key={m.slug} value={m.slug}>
                                {locale === 'ar' ? m.ar : m.fr}
                            </option>
                        ))}
                        {selectedBrand && <option value="other">موديل آخر (أخرى)</option>}
                    </select>
                    {errors.model && <p className="text-red-500 text-xs mt-1">اختر الموديل</p>}
                </div>
            </div>

            {/* Custom Brand / Model Input if "Other" selected */}
            {selectedBrand === 'other' && (
                <div>
                    <label className={labelClass}>اسم الماركة المخصصة *</label>
                    <input
                        type="text"
                        {...register('brandCustom', { required: true })}
                        placeholder="أدخل اسم الماركة"
                        className={inputClass}
                    />
                </div>
            )}

            {selectedModel === 'other' && (
                <div>
                    <label className={labelClass}>اسم الموديل المخصص *</label>
                    <input
                        type="text"
                        {...register('modelCustom', { required: true })}
                        placeholder="أدخل اسم الموديل"
                        className={inputClass}
                    />
                </div>
            )}

            {/* Year & Body Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Year */}
                <div>
                    <label className={labelClass}>{t('year')} *</label>
                    <select {...register('year', { required: true })} className={inputClass}>
                        {YEARS.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Body Type */}
                <div>
                    <label className={labelClass}>{t('bodyType')} *</label>
                    <select {...register('bodyType', { required: true })} className={inputClass}>
                        <option value="">{t('selectBodyType')}</option>
                        {BODY_TYPES.map((bt) => (
                            <option key={bt.id} value={bt.id}>
                                {locale === 'ar' ? bt.ar : bt.fr}
                            </option>
                        ))}
                    </select>
                    {errors.bodyType && <p className="text-red-500 text-xs mt-1">اختر نوع الهيكل</p>}
                </div>
            </div>

            {/* Fuel Type & Transmission */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fuel */}
                <div>
                    <label className={labelClass}>{t('fuel')} *</label>
                    <div className="grid grid-cols-2 gap-2">
                        {FUEL_TYPES.map((f) => {
                            const isSelected = watch('fuelType') === f;
                            return (
                                <label
                                    key={f}
                                    className={`p-2.5 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        value={f}
                                        {...register('fuelType')}
                                        className="sr-only"
                                    />
                                    {f === 'Diesel' ? 'ديزل (Diesel)' : f === 'Petrol' ? 'بنزين (Essence)' : f === 'Hybrid' ? 'هجين (Hybride)' : 'كهربائي (Électrique)'}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Transmission */}
                <div>
                    <label className={labelClass}>{t('transmission')} *</label>
                    <div className="grid grid-cols-2 gap-2">
                        {TRANSMISSIONS.map((tr) => {
                            const isSelected = watch('transmission') === tr;
                            return (
                                <label
                                    key={tr}
                                    className={`p-2.5 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        value={tr}
                                        {...register('transmission')}
                                        className="sr-only"
                                    />
                                    {tr === 'Manual' ? t('manual') : t('automatic')}
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
