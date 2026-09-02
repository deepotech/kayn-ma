'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Camera, Car, Sliders, CheckSquare, Tag, FileText, Eye } from 'lucide-react';

interface CarPublishProgressProps {
    currentStep: number;
    totalSteps: number;
    onStepClick?: (step: number) => void;
}

export const WIZARD_STEPS = [
    { id: 1, key: 'step1', icon: Camera },
    { id: 2, key: 'step2', icon: Car },
    { id: 3, key: 'step3', icon: Sliders },
    { id: 4, key: 'step4', icon: CheckSquare },
    { id: 5, key: 'step5', icon: Tag },
    { id: 6, key: 'step6', icon: FileText },
    { id: 7, key: 'step7', icon: Eye },
];

export default function CarPublishProgress({
    currentStep,
    totalSteps = 7,
    onStepClick,
}: CarPublishProgressProps) {
    const t = useTranslations('PostAd');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const percentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
            {/* Header Title & Progress Count */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                        {t('title')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {t(`step${currentStep}` as any)}
                    </p>
                </div>
                <div className="text-end">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                        {t('progressLabel', { current: currentStep, total: totalSteps })}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
                <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Desktop Step Dots Navigation */}
            <div className="hidden md:flex items-center justify-between relative">
                {WIZARD_STEPS.map((step) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    const isClickable = onStepClick && (isCompleted || isCurrent);

                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => isClickable && onStepClick(step.id)}
                            disabled={!isClickable}
                            className={`flex flex-col items-center gap-1.5 transition-all text-center group ${
                                isClickable ? 'cursor-pointer' : 'cursor-default'
                            }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                    isCurrent
                                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-md scale-110'
                                        : isCompleted
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                            </div>
                            <span
                                className={`text-xs font-medium max-w-[80px] line-clamp-1 transition-colors ${
                                    isCurrent
                                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                                        : isCompleted
                                        ? 'text-gray-700 dark:text-gray-300'
                                        : 'text-gray-400 dark:text-gray-600'
                                }`}
                            >
                                {t(step.key as any)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
