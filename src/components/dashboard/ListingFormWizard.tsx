'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { createListing, updateListing } from '@/lib/dashboard-api';
import { useAuth } from '@/components/auth/AuthContext';
import { CITIES, getCityName } from '@/constants/cities';
import { carCatalog, getBrandName, getModelName } from '@/constants/car-brands-models';
import { BODY_TYPES } from '@/constants/data';

interface ListingFormWizardProps {
    mode?: 'create' | 'edit';
    listingId?: string;
    initialData?: any;
}

const STEPS = [
    { id: 1, labelFr: 'Type', labelAr: 'النوع' },
    { id: 2, labelFr: 'Véhicule', labelAr: 'السيارة' },
    { id: 3, labelFr: 'Prix', labelAr: 'السعر' },
    { id: 4, labelFr: 'Photos', labelAr: 'الصور' },
    { id: 5, labelFr: 'Publier', labelAr: 'نشر' },
];

const DEFAULT_FORM_DATA = {
    purpose: 'sale',
    city: '',
    brand: '',
    model: '',
    bodyType: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuel: 'Diesel',
    transmission: 'Manual',
    price: 0,
    description: '',
    images: [] as Array<{ url: string; publicId?: string }>,
    phone: '',
};

export default function ListingFormWizard({ mode = 'create', listingId, initialData }: ListingFormWizardProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const router = useRouter();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

    // Filtered models based on selected brand
    const [availableModels, setAvailableModels] = useState<any[]>([]);

    // Initialize form with existing data in edit mode
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setFormData({
                purpose: initialData.purpose || 'sale',
                city: typeof initialData.city === 'object' ? initialData.city.slug : initialData.city || '',
                brand: typeof initialData.brand === 'object' ? initialData.brand.slug : initialData.brand || '',
                model: typeof initialData.carModel === 'object' ? initialData.carModel.slug : initialData.carModel || '',
                bodyType: typeof initialData.bodyType === 'object' ? initialData.bodyType.slug : initialData.bodyType || '',
                year: initialData.year || new Date().getFullYear(),
                mileage: initialData.mileage || 0,
                fuel: initialData.fuelType || 'Diesel',
                transmission: initialData.transmission || 'Manual',
                price: initialData.price || 0,
                description: initialData.description || '',
                images: initialData.images || [],
                phone: initialData.phone || '',
            });
        }
    }, [mode, initialData]);

    // Update available models when brand changes
    useEffect(() => {
        if (formData.brand) {
            const selectedBrand = carCatalog.find(b => b.slug === formData.brand);
            setAvailableModels(selectedBrand ? selectedBrand.models : []);
        } else {
            setAvailableModels([]);
        }
    }, [formData.brand]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Reset model if brand changes
        if (name === 'brand') {
            setFormData(prev => ({ ...prev, [name]: value, model: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setError(null);
        if (!user?.uid) {
            setError(isRtl ? 'يجب تسجيل الدخول' : 'Vous devez être connecté');
            return;
        }

        setSubmitting(true);
        console.log('[Wizard] Submitting form data:', formData);

        try {
            // Find objects to get correct labels
            const cityObj = CITIES.find(c => c.slug === formData.city);
            const brandObj = carCatalog.find(b => b.slug === formData.brand);
            const modelObj = brandObj?.models.find(m => m.slug === formData.model);
            const bodyTypeObj = BODY_TYPES.find(b => b.id === formData.bodyType);

            // Construct title
            const title = `${brandObj ? getBrandName(brandObj, locale) : formData.brand} ${modelObj ? getModelName(modelObj, locale) : formData.model} ${formData.year}`;

            // Ensure images are formatted correctly (backend expects objects with url)
            // Assuming ImageUploader returns { url: string, ... }[] or we map strings to objects
            const formattedImages = formData.images.map((img: any) => {
                if (typeof img === 'string') return { url: img, publicId: img.split('/').pop() };
                return img; // Already object
            });

            // Create payload matching the Mongoose schema requirements
            const payload = {
                ...formData,
                title,
                fuelType: formData.fuel,
                images: formattedImages,

                // Construct required objects
                city: {
                    slug: formData.city,
                    label: cityObj ? cityObj.name.fr : formData.city
                },
                brand: {
                    slug: formData.brand,
                    label: brandObj ? brandObj.fr : formData.brand
                },
                carModel: {
                    slug: formData.model,
                    label: modelObj ? modelObj.fr : formData.model
                },
                bodyType: {
                    slug: formData.bodyType || 'sedan',
                    label: bodyTypeObj ? bodyTypeObj.fr : 'Berline'
                },
                // Force numeric conversion here too, just in case
                price: Number(formData.price),
                year: Number(formData.year),
                mileage: Number(formData.mileage),
            };

            if (mode === 'edit' && listingId) {
                await updateListing(listingId, user.uid, payload);
            } else {
                await createListing(user.uid, payload);
            }

            // Redirect will happen, but we can visual success?
            router.push('/dashboard/listings');
        } catch (err: any) {
            console.error('[Wizard Error]', err);
            setError(err.message || (isRtl ? 'فشلت العملية' : 'Échec de l\'opération'));
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'نوع الإعلان' : 'Type d\'annonce'}</label>
                <div className="flex gap-4">
                    {['sale', 'rent'].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, purpose: type })}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${formData.purpose === type
                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
                                }`}
                        >
                            {type === 'sale' ? (isRtl ? 'بيع' : 'Vente') : (isRtl ? 'كراء' : 'Location')}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'المدينة' : 'Ville'}</label>
                <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                >
                    <option value="">{isRtl ? 'اختر المدينة' : 'Choisir la ville'}</option>
                    {CITIES.map(city => (
                        <option key={city.slug} value={city.slug}>
                            {getCityName(city, locale)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'رقم الهاتف' : 'Numéro de téléphone'}</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="06XXXXXXXX"
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'العلامة التجارية' : 'Marque'}</label>
                <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                >
                    <option value="">{isRtl ? 'اختر العلامة التجارية' : 'Choisir la marque'}</option>
                    {carCatalog.map(brand => (
                        <option key={brand.slug} value={brand.slug}>
                            {getBrandName(brand, locale)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'الموديل' : 'Modèle'}</label>
                <select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    disabled={!formData.brand}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-50"
                >
                    <option value="">{isRtl ? 'اختر الموديل' : 'Choisir le modèle'}</option>
                    {availableModels.map(model => (
                        <option key={model.slug} value={model.slug}>
                            {getModelName(model, locale)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'نوع الهيكل' : 'Type de carrosserie'}</label>
                <select
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                >
                    <option value="">{isRtl ? 'اختر نوع الهيكل' : 'Choisir le type'}</option>
                    {BODY_TYPES.map(type => (
                        <option key={type.id} value={type.id}>
                            {isRtl ? type.ar : type.fr}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'السنة' : 'Année'}</label>
                <input
                    type="number" name="year" value={formData.year} onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'المسافة (كلم)' : 'Kilométrage (km)'}</label>
                <input
                    type="number" name="mileage" value={formData.mileage} onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'الوقود' : 'Carburant'}</label>
                <select name="fuel" value={formData.fuel} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Essence</option>
                    <option value="Hybrid">Hybride</option>
                    <option value="Electric">Électrique</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'علبة السرعة' : 'Boîte de vitesses'}</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                    <option value="Manual">{isRtl ? 'يدوي' : 'Manuelle'}</option>
                    <option value="Automatic">{isRtl ? 'أوتوماتيك' : 'Automatique'}</option>
                </select>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'السعر (درهم)' : 'Prix (MAD)'}</label>
                <input
                    type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0"
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-lg font-bold"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">{isRtl ? 'وصف الإعلان' : 'Description'}</label>
                <textarea
                    name="description" value={formData.description} onChange={handleChange} rows={5}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    placeholder={isRtl ? 'اكتب وصفاً مفصلاً لسيارتك...' : 'Décrivez votre véhicule en détail...'}
                />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <ImageUploader
                images={formData.images}
                onImagesChange={(imgs) => setFormData({ ...formData, images: imgs })}
                locale={locale}
            />
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-700">
                <h3 className="font-bold text-lg mb-4 text-blue-600">{formData.brand} {formData.model} {formData.year}</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <span>{isRtl ? 'السعر:' : 'Prix:'} <strong>{formData.price.toLocaleString()} MAD</strong></span>
                    <span>{isRtl ? 'المدينة:' : 'Ville:'} <strong>{formData.city}</strong></span>
                    <span>{isRtl ? 'الوقود:' : 'Carburant:'} <strong>{formData.fuel}</strong></span>
                    <span>{isRtl ? 'ناقل الحركة:' : 'Boîte:'} <strong>{formData.transmission}</strong></span>
                    <span>{isRtl ? 'المسافة:' : 'Km:'} <strong>{formData.mileage.toLocaleString()} km</strong></span>
                    <span>{isRtl ? 'الهاتف:' : 'Tél:'} <strong>{formData.phone}</strong></span>
                </div>
                {formData.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                        <p className="text-sm line-clamp-3 italic text-gray-500">{formData.description}</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-200">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <p className="text-xs text-center text-gray-500">
                {isRtl ? 'بالضغط على نشر، فإنك توافق على شروط الاستخدام.' : 'En publiant, vous acceptez nos conditions d\'utilisation.'}
            </p>
        </div>
    );

    // --- Render ---

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Steps Indicator */}
            <div className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 p-4">
                <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-gray-400">
                    {STEPS.map((step) => (
                        <div key={step.id} className={`flex flex-col sm:flex-row items-center gap-2 ${currentStep >= step.id ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= step.id
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-300 bg-white dark:bg-zinc-900'
                                }`}>
                                {step.id}
                            </div>
                            <span className="hidden sm:inline">{isRtl ? step.labelAr : step.labelFr}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mode Badge */}
            {mode === 'edit' && (
                <div className="px-6 pt-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                        {isRtl ? 'وضع التعديل' : 'Mode édition'}
                    </span>
                </div>
            )}

            {/* Form Content */}
            <div className="p-6 min-h-[400px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                {currentStep === 5 && renderStep5()}
            </div>

            {/* Controls */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 flex justify-between">
                <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1 || submitting}
                    className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                    {isRtl ? 'السابق' : 'Précédent'}
                </button>

                {currentStep < 5 ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        <span>{isRtl ? 'التالي' : 'Suivant'}</span>
                        <ChevronNext className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-70 transition-colors"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span>{mode === 'edit'
                            ? (isRtl ? 'حفظ التغييرات' : 'Enregistrer')
                            : (isRtl ? 'نشر الإعلان' : 'Publier')
                        }</span>
                    </button>
                )}
            </div>
        </div>
    );
}

function ChevronNext({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>;
}
