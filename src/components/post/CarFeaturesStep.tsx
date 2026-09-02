'use client';

import { useTranslations, useLocale } from 'next-intl';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { CheckSquare, ShieldCheck, Cpu, Wind, Navigation } from 'lucide-react';

interface CarFeaturesStepProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
}

export const EQUIPMENT_GROUPS = [
    {
        id: 'comfort',
        titleKey: 'comfortGroup',
        icon: Wind,
        items: [
            { id: 'climatisation', ar: 'مكيف هواء (Clim)', fr: 'Climatisation' },
            { id: 'clim_auto', ar: 'مكيف أوتوماتيكي', fr: 'Climatisation automatique' },
            { id: 'vitres_elec', ar: 'زجاج كهربائي', fr: 'Vitres électriques' },
            { id: 'cuir', ar: 'مقاعد من الجلد', fr: 'Sièges en cuir' },
            { id: 'retros_elec', ar: 'مرآة جانبية كهربائية', fr: 'Rétroviseurs électriques' },
            { id: 'centralise', ar: 'قفل مركزي عن بعد', fr: 'Fermeture centralisée' },
        ],
    },
    {
        id: 'safety',
        titleKey: 'safetyGroup',
        icon: ShieldCheck,
        items: [
            { id: 'abs', ar: 'نظام الفرامل ABS', fr: 'ABS' },
            { id: 'esp', ar: 'نظام الثبات ESP', fr: 'ESP' },
            { id: 'airbags', ar: 'وسائد هوائية Airbags', fr: 'Airbags' },
            { id: 'camera_recul', ar: 'كاميرا خلفية', fr: 'Caméra de recul' },
            { id: 'radars_recul', ar: 'حساسات الركن (Radars de recul)', fr: 'Capteurs de stationnement' },
            { id: 'regulateur', ar: 'محدد ومثبت السرعة', fr: 'Régulateur / Limiteur de vitesse' },
        ],
    },
    {
        id: 'tech',
        titleKey: 'techGroup',
        icon: Cpu,
        items: [
            { id: 'ecran_tactile', ar: 'شاشة لمسية', fr: 'Écran tactile' },
            { id: 'bluetooth', ar: 'بلوتوث (Bluetooth)', fr: 'Bluetooth' },
            { id: 'gps', ar: 'نظام الملاحة GPS', fr: 'GPS' },
            { id: 'carplay', ar: 'Apple CarPlay / Android Auto', fr: 'CarPlay / Android Auto' },
            { id: 'volant_multi', ar: 'مقود متعدد الوظائف', fr: 'Volant multifonction' },
            { id: 'usb', ar: 'منفذ USB / AUX', fr: 'Port USB' },
        ],
    },
    {
        id: 'driving',
        titleKey: 'drivingGroup',
        icon: Navigation,
        items: [
            { id: 'jantes_alu', ar: 'عجلات ألومنيوم (Jantes Alu)', fr: 'Jantes aluminium' },
            { id: 'toit_ouvrant', ar: 'سقف بانورامي / مفتوح', fr: 'Toit panoramique / ouvrant' },
            { id: 'led', ar: 'أضواء LED / Xenon', fr: 'Phares LED / Xénon' },
            { id: 'ordinateur_bord', ar: 'حاسوب الرحلات (Ord de bord)', fr: 'Ordinateur de bord' },
            { id: 'start_stop', ar: 'نظام Start & Stop', fr: 'Système Start & Stop' },
            { id: 'keyless', ar: 'تشغيل بدون مفتاح (Keyless)', fr: 'Démarrage sans clé' },
        ],
    },
];

export default function CarFeaturesStep({ register, watch, setValue }: CarFeaturesStepProps) {
    const t = useTranslations('PostAd');
    const locale = useLocale();

    const selectedFeatures: string[] = watch('features') || [];

    const toggleFeature = (featureId: string) => {
        if (selectedFeatures.includes(featureId)) {
            setValue(
                'features',
                selectedFeatures.filter((f) => f !== featureId)
            );
        } else {
            setValue('features', [...selectedFeatures, featureId]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                    {t('step4')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    حدد التجهيزات والخيارات المتوفرة في سيارتك
                </p>
            </div>

            {/* Equipment Groups */}
            <div className="space-y-6">
                {EQUIPMENT_GROUPS.map((group) => {
                    const Icon = group.icon;

                    return (
                        <div
                            key={group.id}
                            className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800"
                        >
                            <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                    <Icon className="w-4 h-4" />
                                </div>
                                {t(group.titleKey as any)}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {group.items.map((item) => {
                                    const isChecked = selectedFeatures.includes(item.id);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleFeature(item.id)}
                                            className={`p-3 rounded-xl border text-start text-xs font-semibold flex items-center gap-2.5 transition-all ${
                                                isChecked
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm'
                                                    : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                            }`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                                    isChecked
                                                        ? 'bg-blue-600 border-blue-600 text-white font-bold'
                                                        : 'border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                                }`}
                                            >
                                                {isChecked && '✓'}
                                            </div>
                                            <span>{locale === 'ar' ? item.ar : item.fr}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
