'use client';

import { useTranslations } from 'next-intl';
import { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form';
import { FileText, Sparkles, CheckCircle2 } from 'lucide-react';

interface CarDescriptionStepProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    errors: FieldErrors<any>;
}

export default function CarDescriptionStep({ register, watch, errors }: CarDescriptionStepProps) {
    const t = useTranslations('PostAd');
    const descriptionValue: string = watch('description') || '';

    const labelClass = 'block text-sm font-bold mb-2 text-gray-800 dark:text-gray-200';

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    {t('step6')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    الوصف التفصيلي يساعد المشتري على الاطمئنان وتسريع عملية البيع
                </p>
            </div>

            {/* Description Textarea */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>{t('description')} *</label>
                    <span className="text-xs font-bold text-gray-400">
                        {t('charCount', { count: descriptionValue.length })}
                    </span>
                </div>

                <textarea
                    rows={6}
                    {...register('description', { required: true, minLength: 20 })}
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full rounded-2xl border border-gray-300 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed"
                />

                {errors.description && (
                    <p className="text-red-500 text-xs mt-1">أدخل وصفاً كافياً (لا يقل عن 20 حرفاً)</p>
                )}
            </div>

            {/* Description Guidance Cards */}
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    ما الذي يفضل ذكره في وصف السيارة؟
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-start gap-2 bg-white/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-amber-100/50 dark:border-zinc-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block">حالة المحرك والميكانيك</span>
                            <span className="text-gray-500 dark:text-gray-400">سلسلة الصيانة، الزيت، العجلات</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 bg-white/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-amber-100/50 dark:border-zinc-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block">حالة الصباغة والمبيعات</span>
                            <span className="text-gray-500 dark:text-gray-400">صباغة الدار أو رتوشات جزئية</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 bg-white/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-amber-100/50 dark:border-zinc-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block">الوثائق والأوراق</span>
                            <span className="text-gray-500 dark:text-gray-400">الضريبة (Vignette)، الفحص التقني (Visite)</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 bg-white/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-amber-100/50 dark:border-zinc-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block">سبب البيع وشروط التواصل</span>
                            <span className="text-gray-500 dark:text-gray-400">أوقات الاتصال المتاحة</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
