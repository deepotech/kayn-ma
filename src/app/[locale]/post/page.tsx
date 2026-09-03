'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from '@/navigation';
import { dataURLtoFile } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Check, Rocket, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

import CarPublishProgress from '@/components/post/CarPublishProgress';
import CarPhotosStep from '@/components/post/CarPhotosStep';
import CarBasicInfoStep from '@/components/post/CarBasicInfoStep';
import CarSpecsStep from '@/components/post/CarSpecsStep';
import CarFeaturesStep from '@/components/post/CarFeaturesStep';
import CarPriceLocationStep from '@/components/post/CarPriceLocationStep';
import CarDescriptionStep from '@/components/post/CarDescriptionStep';
import CarPreviewStep from '@/components/post/CarPreviewStep';

export type PostFormData = {
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
    bodyType: string;
    year: number;
    fuelType: string;
    transmission: string;
    mileage: number;
    fiscalPower?: string;
    doors?: string;
    seats?: string;
    features: string[];
    description: string;
    website: string; // Honeypot field
};

const DRAFT_KEY = 'cayn_post_draft_v2';
const TOTAL_STEPS = 7;

export default function PostAdPage() {
    const t = useTranslations('PostAd');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const router = useRouter();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [draftRestored, setDraftRestored] = useState(false);
    const [stepError, setStepError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        trigger,
        setValue,
    } = useForm<PostFormData>({
        defaultValues: {
            purpose: 'sale',
            condition: 'used',
            sellerType: 'individual',
            agencyName: '',
            pricePeriod: 'day',
            year: new Date().getFullYear(),
            fuelType: 'Diesel',
            transmission: 'Manual',
            bodyType: 'sedan',
            mileage: 100000,
            features: [],
            website: '',
        },
    });

    const formData = watch();

    // Restore draft from localStorage
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft && !draftRestored) {
            try {
                const draft = JSON.parse(savedDraft);
                if (draft.formData) {
                    Object.keys(draft.formData).forEach((key) => {
                        setValue(key as keyof PostFormData, draft.formData[key]);
                    });
                }
                if (draft.step && draft.step <= TOTAL_STEPS) {
                    setCurrentStep(draft.step);
                }

                if (draft.imagePreviews && Array.isArray(draft.imagePreviews) && draft.imagePreviews.length > 0) {
                    setImagePreviews(draft.imagePreviews);
                    const restoredFiles = draft.imagePreviews.map((preview: string, idx: number) =>
                        dataURLtoFile(preview, `restored-image-${idx}.jpg`)
                    );
                    setImages(restoredFiles);
                }
                setDraftRestored(true);
            } catch (e) {
                console.error('Error restoring draft:', e);
            }
        }
    }, [setValue, draftRestored]);

    // Auto-save draft to localStorage (safeguarded against quota limits)
    useEffect(() => {
        try {
            const draft = {
                formData,
                step: currentStep,
                imagePreviews: imagePreviews.slice(0, 5), // Save top 5 preview URLs to prevent quota overflow
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch (e) {
            console.warn('Draft localStorage quota exceeded, skipping heavy image preview cache:', e);
        }
    }, [formData, currentStep, imagePreviews]);

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

                    const base64 = canvas.toDataURL('image/jpeg', 0.85);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Image handlers
    const handleAddImages = useCallback(
        (files: File[]) => {
            const remainingSlots = 10 - images.length;
            const filesToAdd = files.slice(0, remainingSlots);

            filesToAdd.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreviews((prev) => [...prev, e.target?.result as string]);
                };
                reader.readAsDataURL(file);
            });

            setImages((prev) => [...prev, ...filesToAdd]);
            setStepError(null);
        },
        [images.length]
    );

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSetMainImage = (index: number) => {
        if (index === 0) return;
        setImages((prev) => {
            const newArr = [...prev];
            const [moved] = newArr.splice(index, 1);
            newArr.unshift(moved);
            return newArr;
        });
        setImagePreviews((prev) => {
            const newArr = [...prev];
            const [moved] = newArr.splice(index, 1);
            newArr.unshift(moved);
            return newArr;
        });
    };

    const handleMoveImage = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= images.length) return;
        setImages((prev) => {
            const newArr = [...prev];
            const temp = newArr[fromIndex];
            newArr[fromIndex] = newArr[toIndex];
            newArr[toIndex] = temp;
            return newArr;
        });
        setImagePreviews((prev) => {
            const newArr = [...prev];
            const temp = newArr[fromIndex];
            newArr[fromIndex] = newArr[toIndex];
            newArr[toIndex] = temp;
            return newArr;
        });
    };

    // Step validation & Navigation
    const nextStep = async () => {
        setStepError(null);

        // Step 1: Photos validation
        if (currentStep === 1) {
            if (imagePreviews.length === 0) {
                setStepError('يرجى إضافة صورة واحدة على الأقل لسيارتك للانتقال للخطوة التالية');
                return;
            }
        }

        // Step 2: Basic Info validation
        if (currentStep === 2) {
            const fields: (keyof PostFormData)[] = ['brand', 'model', 'bodyType', 'year', 'fuelType', 'transmission'];
            if (formData.sellerType === 'agency') fields.push('agencyName');
            if (formData.brand === 'other') fields.push('brandCustom');
            if (formData.model === 'other') fields.push('modelCustom');

            const isValid = await trigger(fields);
            if (!isValid) {
                setStepError('يرجى ملء جميع الحقول المطلوبة لبناء تفاصيل السيارة');
                return;
            }
        }

        // Step 3: Specs validation
        if (currentStep === 3) {
            const isValid = await trigger(['mileage']);
            if (!isValid) {
                setStepError('يرجى إدخال عدد الكيلومترات الصحيح');
                return;
            }
        }

        // Step 5: Price & Location validation
        if (currentStep === 5) {
            const isValid = await trigger(['price', 'city', 'phone']);
            if (!isValid) {
                setStepError('يرجى التأكد من السعر، اختيار المدينة، ورقم الهاتف الصحيح');
                return;
            }
        }

        // Step 6: Description validation
        if (currentStep === 6) {
            const isValid = await trigger(['description']);
            if (!isValid) {
                setStepError('يرجى كتابة وصف لا يقل عن 20 حرفاً');
                return;
            }
        }

        // Require Auth before preview / publish step
        if (currentStep === 6 && !user) {
            setShowAuthModal(true);
            return;
        }

        setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = () => {
        setStepError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onSubmit = async (data: PostFormData) => {
        if (!user) {
            console.log('[PostAd] No currentUser found. Prompting sign in.');
            setShowAuthModal(true);
            return;
        }

        console.log(`[PostAd] Current user verified on client: ${user.uid}`);
        setIsSubmitting(true);
        setIsUploading(true);
        setStepError(null);

        try {
            // Upload images first if any new files present
            let uploadedImages: { url: string; publicId: string }[] = [];

            if (images.length > 0) {
                const compressedImages = await Promise.all(images.map((img) => compressImage(img)));

                const uploadResponse = await axios.post('/api/upload', {
                    images: compressedImages,
                });

                if (uploadResponse.data.success) {
                    uploadedImages = uploadResponse.data.images;
                }
            }

            setIsUploading(false);

            // Construct payload WITHOUT userId (Identity is strictly extracted from verified Firebase Token on server)
            const payload = {
                ...data,
                price: Number(data.price),
                year: Number(data.year),
                mileage: Number(data.mileage || 0),
                adType: data.purpose === 'rent' ? 'rental' : 'sale',
                pricePeriod: data.purpose === 'rent' ? data.pricePeriod || 'day' : null,
                brand: data.brand === 'other' ? data.brandCustom || 'Other' : data.brand,
                carModel: data.model === 'other' ? data.modelCustom || 'Other' : data.model,
                brandCustom: data.brand === 'other' ? data.brandCustom : undefined,
                modelCustom: data.model === 'other' ? data.modelCustom : undefined,
                images: uploadedImages,
                currency: 'MAD',
            };

            const token = await user.getIdToken();
            console.log('[PostAd] Sending POST /api/listings with Authorization Bearer header');

            await axios.post('/api/listings', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            clearDraft();
            setCurrentStep(8); // Success step
        } catch (error: any) {
            console.error('Submission error:', error);
            setStepError(error.response?.data?.error || 'حدث خطأ أثناء النشر. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-8 px-4 sm:px-6">
            <div className="container mx-auto max-w-3xl">
                {/* Progress Header Bar */}
                {currentStep <= TOTAL_STEPS && (
                    <CarPublishProgress
                        currentStep={currentStep}
                        totalSteps={TOTAL_STEPS}
                        onStepClick={(step) => {
                            if (step < currentStep) {
                                setCurrentStep(step);
                            }
                        }}
                    />
                )}

                {/* Step Validation Error Alert */}
                {stepError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm font-medium animate-in fade-in">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{stepError}</span>
                    </div>
                )}

                {/* Form Container */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Step 1: Photos */}
                    {currentStep === 1 && (
                        <CarPhotosStep
                            images={images}
                            imagePreviews={imagePreviews}
                            onAddImages={handleAddImages}
                            onRemoveImage={handleRemoveImage}
                            onSetMainImage={handleSetMainImage}
                            onMoveImage={handleMoveImage}
                        />
                    )}

                    {/* Step 2: Vehicle Basic Info */}
                    {currentStep === 2 && (
                        <CarBasicInfoStep
                            register={register}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                        />
                    )}

                    {/* Step 3: Specs */}
                    {currentStep === 3 && (
                        <CarSpecsStep register={register} watch={watch} errors={errors} />
                    )}

                    {/* Step 4: Features & Condition */}
                    {currentStep === 4 && (
                        <CarFeaturesStep register={register} watch={watch} setValue={setValue} />
                    )}

                    {/* Step 5: Price & Location */}
                    {currentStep === 5 && (
                        <CarPriceLocationStep
                            register={register}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                        />
                    )}

                    {/* Step 6: Description */}
                    {currentStep === 6 && (
                        <CarDescriptionStep register={register} watch={watch} errors={errors} />
                    )}

                    {/* Step 7: Preview & Publish */}
                    {currentStep === 7 && (
                        <CarPreviewStep
                            formData={formData}
                            imagePreviews={imagePreviews}
                            onGoToStep={(step) => setCurrentStep(step)}
                            isSubmitting={isSubmitting}
                            isUploading={isUploading}
                        />
                    )}

                    {/* Step 8: Success State */}
                    {currentStep === 8 && (
                        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                                <Check className="w-10 h-10" />
                            </div>

                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">
                                {t('successTitle')}
                            </h2>

                            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                                {t('successMessage')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    type="button"
                                    onClick={() => router.push('/search')}
                                    className="gap-2"
                                >
                                    {t('viewAds')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setCurrentStep(1);
                                        setImages([]);
                                        setImagePreviews([]);
                                    }}
                                >
                                    {t('postAnother')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons Bar */}
                    {currentStep <= TOTAL_STEPS && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                            {currentStep > 1 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={isSubmitting}
                                    className="gap-2"
                                >
                                    {isRtl ? (
                                        <>
                                            <ChevronRight className="w-4 h-4" />
                                            {t('back')}
                                        </>
                                    ) : (
                                        <>
                                            <ChevronLeft className="w-4 h-4" />
                                            {t('back')}
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <div />
                            )}

                            {currentStep < TOTAL_STEPS ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="gap-2 px-6"
                                >
                                    {isRtl ? (
                                        <>
                                            {t('next')}
                                            <ChevronLeft className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            {t('next')}
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isUploading}
                                    className="gap-2 px-8 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg shadow-green-600/20"
                                >
                                    {isSubmitting || isUploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {isUploading ? t('uploading') : t('publishing')}
                                        </>
                                    ) : (
                                        <>
                                            {t('publishNow')}
                                            <Rocket className="w-5 h-5" />
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </form>
            </div>

            {/* Auth Modal */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
}
