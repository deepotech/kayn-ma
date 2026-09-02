'use client';

import { useTranslations } from 'next-intl';
import { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Sliders, Gauge, GaugeCircle, Users, Layers } from 'lucide-react';

interface CarSpecsStepProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    errors: FieldErrors<any>;
}

export default function CarSpecsStep({ register, watch, errors }: CarSpecsStepProps) {
    const t = useTranslations('PostAd');

    const labelClass = 'block text-sm font-bold mb-2 text-gray-800 dark:text-gray-200';
    const inputClass =
        'w-full rounded-xl border border-gray-300 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm';

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-600" />
                    {t('step3')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    أدخل الكيلومترات والمواصفات الفنية للسيارة
                </p>
            </div>

            {/* Mileage */}
            <div>
                <label className={labelClass}>
                    <span className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-blue-600" />
                        {t('mileage')} *
                    </span>
                </label>
                <div className="relative">
                    <input
                        type="number"
                        {...register('mileage', { required: true, min: 0, max: 2000000 })}
                        placeholder={t('mileagePlaceholder')}
                        className={inputClass}
                    />
                    <span className="absolute end-4 top-3 text-xs font-bold text-gray-400">KM</span>
                </div>
                {errors.mileage && (
                    <p className="text-red-500 text-xs mt-1">أدخل الكيلومترات الصحيحة (من 0 إلى 2,000,000)</p>
                )}
            </div>

            {/* Fiscal Horsepower (Puissance Fiscale) */}
            <div>
                <label className={labelClass}>
                    <span className="flex items-center gap-2">
                        <GaugeCircle className="w-4 h-4 text-indigo-600" />
                        {t('fiscalPower')} (اختياري)
                    </span>
                </label>
                <select {...register('fiscalPower')} className={inputClass}>
                    <option value="">اختر الخيل الجبائي</option>
                    <option value="4">4 CV</option>
                    <option value="5">5 CV</option>
                    <option value="6">6 CV</option>
                    <option value="7">7 CV</option>
                    <option value="8">8 CV</option>
                    <option value="9">9 CV</option>
                    <option value="10">10 CV</option>
                    <option value="11">11 CV</option>
                    <option value="12">12 CV</option>
                    <option value="13+">13 CV وأكثر</option>
                </select>
            </div>

            {/* Doors & Seats Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doors */}
                <div>
                    <label className={labelClass}>
                        <span className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-green-600" />
                            {t('doors')} (اختياري)
                        </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['3', '5', 'autre'].map((d) => {
                            const isSelected = watch('doors') === d;
                            return (
                                <label
                                    key={d}
                                    className={`p-2.5 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        value={d}
                                        {...register('doors')}
                                        className="sr-only"
                                    />
                                    {d === 'autre' ? 'أخرى' : `${d} أبواب`}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Seats */}
                <div>
                    <label className={labelClass}>
                        <span className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-600" />
                            {t('seats')} (اختياري)
                        </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['2', '5', '7+'].map((s) => {
                            const isSelected = watch('seats') === s;
                            return (
                                <label
                                    key={s}
                                    className={`p-2.5 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        value={s}
                                        {...register('seats')}
                                        className="sr-only"
                                    />
                                    {`${s} مقاعد`}
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
