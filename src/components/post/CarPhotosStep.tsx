'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Upload, Star, Trash2, ArrowLeft, ArrowRight, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CarPhotosStepProps {
    images: File[];
    imagePreviews: string[];
    onAddImages: (files: File[]) => void;
    onRemoveImage: (index: number) => void;
    onSetMainImage: (index: number) => void;
    onMoveImage: (fromIndex: number, toIndex: number) => void;
}

const PHOTO_TIPS = [
    { key: 'tipFront', labelAr: 'صورة أمامية كاملة', labelFr: 'Vue de face complète' },
    { key: 'tipRear', labelAr: 'صورة خلفية كاملة', labelFr: 'Vue arrière complète' },
    { key: 'tipSides', labelAr: 'صورة جانبية من الجانبين', labelFr: 'Profils latéraux' },
    { key: 'tipInterior', labelAr: 'المقصورة والمقاعد', labelFr: 'Habitacle & Sièges' },
    { key: 'tipDashboard', labelAr: 'لوحة القيادة والمعدادات', labelFr: 'Tableau de bord' },
    { key: 'tipWheels', labelAr: 'العجلات والإطارات', labelFr: 'Jantes & Pneus' },
];

export default function CarPhotosStep({
    images,
    imagePreviews,
    onAddImages,
    onRemoveImage,
    onSetMainImage,
    onMoveImage,
}: CarPhotosStepProps) {
    const t = useTranslations('PostAd');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddImages(Array.from(e.target.files));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onAddImages(Array.from(e.dataTransfer.files));
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header & Main Dropzone */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Camera className="w-5 h-5 text-blue-600" />
                            {t('uploadImages')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('maxImages')} • {t('firstImageCover')}
                        </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold">
                        {imagePreviews.length} / 10
                    </span>
                </div>

                {/* Drag and Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-zinc-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-2xl p-8 text-center transition-all cursor-pointer group"
                >
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="photo-upload-input"
                    />
                    <label htmlFor="photo-upload-input" className="cursor-pointer block w-full h-full">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                            {t('dragDrop')}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            PNG, JPG, WEBP (حتى 10MB للصورة)
                        </p>
                        <Button type="button" variant="outline" className="gap-2 pointer-events-none">
                            <Camera className="w-4 h-4" />
                            {t('browse')}
                        </Button>
                    </label>
                </div>
            </div>

            {/* Images Grid */}
            {imagePreviews.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span>الصور المحددة</span>
                        <span className="text-xs font-normal text-gray-500">(اسحب أو رتب الصور لجعل الصورة الأولى هي الغلاف الرئيسي)</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => {
                            const isMain = index === 0;

                            return (
                                <div
                                    key={index}
                                    className={`relative group rounded-xl overflow-hidden border-2 bg-zinc-900 transition-all ${
                                        isMain
                                            ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md'
                                            : 'border-gray-200 dark:border-zinc-700 hover:border-gray-400'
                                    }`}
                                >
                                    <div className="relative aspect-[4/3] w-full">
                                        <Image
                                            src={preview}
                                            alt={`Car Photo ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />

                                        {/* Main Cover Badge */}
                                        {isMain && (
                                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                                                <Star className="w-3 h-3 fill-white" />
                                                {t('mainCover')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="p-2 bg-gray-900/90 backdrop-blur-sm flex items-center justify-between text-white text-xs">
                                        <div className="flex items-center gap-1">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => onMoveImage(index, index - 1)}
                                                    className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                                    title={t('moveUp')}
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {index < imagePreviews.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => onMoveImage(index, index + 1)}
                                                    className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                                    title={t('moveDown')}
                                                >
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {!isMain && (
                                                <button
                                                    type="button"
                                                    onClick={() => onSetMainImage(index)}
                                                    className="p-1 hover:bg-amber-600/50 text-amber-300 rounded transition-colors text-[10px] font-medium"
                                                    title={t('setMain')}
                                                >
                                                    {t('setMain')}
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemoveImage(index)}
                                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                                            title={t('deleteImage')}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Photo Guidance Tips */}
            <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    {t('photoTipsTitle')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-blue-800 dark:text-blue-200">
                    {PHOTO_TIPS.map((tip) => (
                        <div key={tip.key} className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-blue-100/50 dark:border-zinc-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{t(tip.key as any)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
