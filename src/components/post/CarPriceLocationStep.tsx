'use client';

import { useTranslations, useLocale } from 'next-intl';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import CitySelect from '@/components/ui/CitySelect';
import { Tag, MapPin, Phone, MessageCircle, DollarSign } from 'lucide-react';

interface CarPriceLocationStepProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    errors: FieldErrors<any>;
}

export default function CarPriceLocationStep({
    register,
    watch,
    setValue,
    errors,
}: CarPriceLocationStepProps) {
    const t = useTranslations('PostAd');
    const locale = useLocale();

    const purpose = watch('purpose');
    const pricePeriod = watch('pricePeriod');
    const priceValue = watch('price');

    const labelClass = 'block text-sm font-bold mb-2 text-gray-800 dark:text-gray-200';
    const inputClass =
        'w-full rounded-xl border border-gray-300 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm';

    const formattedPrice = priceValue && !isNaN(Number(priceValue)) ? Number(priceValue).toLocaleString() : '';

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-600" />
                    {t('step5')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    حدد الثمن المطلوب ومعلومات المدينة والتواصل
                </p>
            </div>

            {/* Price Section */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5 space-y-4">
                {purpose === 'rent' && (
                    <div>
                        <label className={labelClass}>{t('pricePeriod')} *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['day', 'week', 'month'] as const).map((period) => (
                                <label
                                    key={period}
                                    className={`p-3 rounded-xl border cursor-pointer text-center text-xs font-bold transition-all ${
                                        pricePeriod === period
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                            : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        value={period}
                                        {...register('pricePeriod')}
                                        className="sr-only"
                                    />
                                    {period === 'day'
                                        ? t('perDay')
                                        : period === 'week'
                                        ? t('perWeek')
                                        : t('perMonth')}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label className={labelClass}>
                        <span className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            {purpose === 'rent'
                                ? pricePeriod === 'week'
                                    ? t('priceWeek')
                                    : pricePeriod === 'month'
                                    ? t('priceMonth')
                                    : t('priceDay')
                                : t('price')}{' '}
                            *
                        </span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            {...register('price', {
                                required: true,
                                min: purpose === 'rent' ? 100 : 1000,
                                max: 500000000,
                            })}
                            placeholder={t('pricePlaceholder')}
                            className={`${inputClass} font-bold text-lg text-blue-600 dark:text-blue-400`}
                        />
                        <span className="absolute end-4 top-3 text-sm font-bold text-gray-500">DH</span>
                    </div>

                    {formattedPrice && (
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1.5 px-1">
                            💰 {formattedPrice} درهم مغربي (MAD)
                        </p>
                    )}

                    {errors.price && (
                        <p className="text-red-500 text-xs mt-1">
                            أدخل ثمن صحيح (ابتداءً من {purpose === 'rent' ? '100' : '1,000'} درهم)
                        </p>
                    )}
                </div>
            </div>

            {/* City Selection */}
            <div>
                <label className={labelClass}>
                    <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {t('city')} *
                    </span>
                </label>
                <CitySelect
                    value={watch('city')}
                    onChange={(val) => setValue('city', val)}
                    error={errors.city ? 'اختر المدينة' : undefined}
                />
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                    <label className={labelClass}>
                        <span className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-600" />
                            {t('phone')} *
                        </span>
                    </label>
                    <input
                        type="tel"
                        {...register('phone', {
                            required: true,
                            pattern: /^0[567]\d{8}$/,
                        })}
                        placeholder={t('phonePlaceholder')}
                        className={inputClass}
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">أدخل رقم هاتف مغربي صحيح (مثال: 0612345678)</p>
                    )}
                </div>

                {/* WhatsApp Optional */}
                <div>
                    <label className={labelClass}>
                        <span className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            {t('whatsappOptional')}
                        </span>
                    </label>
                    <input
                        type="tel"
                        {...register('whatsapp')}
                        placeholder="مثال: 0612345678"
                        className={inputClass}
                    />
                </div>
            </div>
        </div>
    );
}
