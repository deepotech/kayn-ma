'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
    Car,
    DollarSign,
    Image as ImageIcon,
    Settings,
    Upload,
    X,
    Check,
    Loader2,
    AlertCircle,
    ArrowLeft,
    ArrowRight
} from 'lucide-react';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, YEARS, BODY_TYPES } from '@/constants/data';
import { AgencyVehicleNormalized } from '@/lib/rent-agencies/normalize';

interface AgencyVehicleFormProps {
    initialData?: AgencyVehicleNormalized;
    isEditing?: boolean;
}

const CATEGORIES = [
    { id: 'economy', ar: 'اقتصادية', fr: 'Économique' },
    { id: 'compact', ar: 'مدمجة', fr: 'Compacte' },
    { id: 'midsize', ar: 'متوسطة', fr: 'Intermédiaire' },
    { id: 'suv', ar: 'رباعية الدفع (SUV)', fr: 'SUV / 4x4' },
    { id: 'luxury', ar: 'فاخرة', fr: 'Luxe / Prestige' },
    { id: 'commercial', ar: 'نفعية / تجارية', fr: 'Utilitaire' },
];

export default function AgencyVehicleForm({ initialData, isEditing = false }: AgencyVehicleFormProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'basics' | 'photos' | 'pricing' | 'status'>('basics');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [brand, setBrand] = useState(initialData?.brand || 'Dacia');
    const [customBrand, setCustomBrand] = useState('');
    const [model, setModel] = useState(initialData?.model || 'Logan');
    const [customModel, setCustomModel] = useState('');
    const [year, setYear] = useState<number>(initialData?.year || new Date().getFullYear());
    const [category, setCategory] = useState(initialData?.category || 'economy');
    const [bodyType, setBodyType] = useState(initialData?.bodyType || 'sedan');
    const [transmission, setTransmission] = useState(initialData?.transmission || 'Manual');
    const [fuel, setFuel] = useState(initialData?.fuel || 'Diesel');
    const [seats, setSeats] = useState<number>(initialData?.seats || 5);
    const [doors, setDoors] = useState<number>(initialData?.doors || 4);
    const [luggage, setLuggage] = useState<number>(initialData?.luggage || 2);
    const [color, setColor] = useState(initialData?.color || '');
    const [description, setDescription] = useState(initialData?.description || '');

    // Pricing
    const [dailyPrice, setDailyPrice] = useState<string>(initialData?.dailyPrice ? String(initialData.dailyPrice) : '');
    const [weeklyPrice, setWeeklyPrice] = useState<string>(initialData?.weeklyPrice ? String(initialData.weeklyPrice) : '');
    const [monthlyPrice, setMonthlyPrice] = useState<string>(initialData?.monthlyPrice ? String(initialData.monthlyPrice) : '');
    const [securityDeposit, setSecurityDeposit] = useState<string>(initialData?.securityDeposit ? String(initialData.securityDeposit) : '');
    const [minRentalDays, setMinRentalDays] = useState<number>(initialData?.minRentalDays || 1);
    const [mileagePerDay, setMileagePerDay] = useState<string>(initialData?.mileagePerDay ? String(initialData.mileagePerDay) : '');
    const [extraMileagePrice, setExtraMileagePrice] = useState<string>(initialData?.extraMileagePrice ? String(initialData.extraMileagePrice) : '');
    const [deliveryFee, setDeliveryFee] = useState<string>(initialData?.deliveryFee ? String(initialData.deliveryFee) : '');
    const [airportDeliveryFee, setAirportDeliveryFee] = useState<string>(initialData?.airportDeliveryFee ? String(initialData.airportDeliveryFee) : '');
    const [priceNotes, setPriceNotes] = useState(initialData?.priceNotes || '');

    // Status
    const [status, setStatus] = useState(initialData?.status || 'AVAILABLE');

    // Images
    const [images, setImages] = useState<{ url: string; publicId?: string }[]>(
        initialData?.images || []
    );
    const [uploadingImage, setUploadingImage] = useState(false);

    // Current brand's predefined models
    const selectedBrandObj = BRANDS.find(b => b.name.toLowerCase() === brand.toLowerCase() || b.id.toLowerCase() === brand.toLowerCase());
    const availableModels = selectedBrandObj ? selectedBrandObj.models : [];

    // Compress client image before upload
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 900;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = (height * MAX_WIDTH) / width;
                        width = MAX_WIDTH;
                    }
                    if (height > MAX_HEIGHT) {
                        width = (width * MAX_HEIGHT) / height;
                        height = MAX_HEIGHT;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.82));
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        // Limit to 8
        const remaining = 8 - images.length;
        if (remaining <= 0) return;
        // Validate file types and size (max 10MB each)
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        for (const file of toUpload) {
            if (!validTypes.includes(file.type.toLowerCase())) {
                setError(isRtl ? 'نوع الملف غير مدعوم. يرجى اختيار صور JPG أو PNG أو WEBP.' : 'Format non supporté. Veuillez choisir des images JPG, PNG ou WEBP.');
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError(isRtl ? 'حجم الصورة كبير جداً. الحد الأقصى هو 10 ميغابايت لكل صورة.' : 'Image trop volumineuse. Limite de 10 Mo par image.');
                e.target.value = '';
                return;
            }
        }

        setUploadingImage(true);
        setError(null);

        try {
            const compressed = await Promise.all(toUpload.map(compressImage));
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: compressed })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to upload image');
            }

            if (data.images) {
                setImages(prev => [...prev, ...data.images]);
            }
        } catch (err: any) {
            setError(err.message || 'Image upload failed');
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const setMainImage = (idx: number) => {
        if (idx === 0) return;
        setImages(prev => {
            const arr = [...prev];
            const [selected] = arr.splice(idx, 1);
            arr.unshift(selected);
            return arr;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const effectiveBrand = brand === 'other' ? customBrand : brand;
        const effectiveModel = model === 'other' ? customModel : model;

        if (!effectiveBrand || !effectiveModel) {
            setActiveTab('basics');
            setError(isRtl ? 'الماركة والموديل مطلوبان.' : 'La marque et le modèle sont requis.');
            return;
        }

        if (!dailyPrice || parseFloat(dailyPrice) <= 0) {
            setActiveTab('pricing');
            setError(isRtl ? 'السعر اليومي إجباري ويجب أن يكون رقماً موجباً.' : 'Le prix journalier est obligatoire.');
            return;
        }

        setSubmitting(true);

        const payload = {
            brand: effectiveBrand,
            model: effectiveModel,
            year: Number(year),
            category,
            bodyType,
            transmission,
            fuel,
            seats: Number(seats),
            doors: Number(doors),
            luggage: Number(luggage),
            color: color || null,
            description: description || null,
            images,
            dailyPrice: parseFloat(dailyPrice),
            weeklyPrice: weeklyPrice ? parseFloat(weeklyPrice) : null,
            monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
            securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
            minRentalDays: Number(minRentalDays),
            mileagePerDay: mileagePerDay ? parseInt(mileagePerDay, 10) : null,
            extraMileagePrice: extraMileagePrice ? parseFloat(extraMileagePrice) : null,
            deliveryFee: deliveryFee ? parseFloat(deliveryFee) : null,
            airportDeliveryFee: airportDeliveryFee ? parseFloat(airportDeliveryFee) : null,
            priceNotes: priceNotes || null,
            status
        };

        try {
            const url = isEditing && initialData
                ? `/api/agency/vehicles/${initialData.id}`
                : '/api/agency/vehicles';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to save vehicle');
            }

            router.push(`/${locale}/dashboard/agency`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error saving vehicle');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab('basics')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'basics'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Car className="w-4 h-4" />
                    <span>{isRtl ? '1. البيانات الأساسية' : '1. Infos générales'}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('photos')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'photos'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    <span>{isRtl ? '2. الصور والمعرض' : '2. Photos'}</span>
                    {images.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full px-2 py-0.5 font-bold">
                            {images.length}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('pricing')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'pricing'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <DollarSign className="w-4 h-4" />
                    <span>{isRtl ? '3. الأسعار وشروط الكراء' : '3. Tarifs et conditions'}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('status')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                        activeTab === 'status'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    <span>{isRtl ? '4. حالة التوفر' : '4. Disponibilité'}</span>
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Tab Contents */}
            <div className="p-6 md:p-8">
                {/* TAB 1: BASICS */}
                {activeTab === 'basics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Brand */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'الماركة *' : 'Marque *'}
                                </label>
                                <select
                                    value={brand}
                                    onChange={(e) => {
                                        setBrand(e.target.value);
                                        const bObj = BRANDS.find(b => b.name.toLowerCase() === e.target.value.toLowerCase() || b.id === e.target.value);
                                        if (bObj && bObj.models.length > 0) {
                                            setModel(bObj.models[0]);
                                        }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {BRANDS.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                    <option value="other">{isRtl ? 'ماركة أخرى' : 'Autre marque'}</option>
                                </select>
                                {brand === 'other' && (
                                    <input
                                        type="text"
                                        placeholder={isRtl ? 'اكتب اسم الماركة' : 'Nom de la marque'}
                                        value={customBrand}
                                        onChange={(e) => setCustomBrand(e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                    />
                                )}
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'الموديل *' : 'Modèle *'}
                                </label>
                                {brand !== 'other' && availableModels.length > 0 ? (
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {availableModels.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                        <option value="other">{isRtl ? 'موديل آخر' : 'Autre modèle'}</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder={isRtl ? 'مثال: Logan, Clio, Golf' : 'Ex: Logan, Clio, Golf'}
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                                {model === 'other' && (
                                    <input
                                        type="text"
                                        placeholder={isRtl ? 'اكتب اسم الموديل' : 'Nom du modèle'}
                                        value={customModel}
                                        onChange={(e) => setCustomModel(e.target.value)}
                                        className="mt-2 w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                    />
                                )}
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'سنة الصنع *' : 'Année *'}
                                </label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Category & BodyType & Transmission */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'الفئة' : 'Catégorie'}
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {isRtl ? c.ar : c.fr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'نوع الهيكل' : 'Carrosserie'}
                                </label>
                                <select
                                    value={bodyType}
                                    onChange={(e) => setBodyType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                >
                                    {BODY_TYPES.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {isRtl ? b.ar : b.fr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'ناقل الحركة *' : 'Boîte de vitesses *'}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {TRANSMISSIONS.map(tr => (
                                        <button
                                            key={tr}
                                            type="button"
                                            onClick={() => setTransmission(tr)}
                                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors ${
                                                transmission === tr
                                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    : 'border-slate-200 dark:border-zinc-700 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {tr === 'Manual' ? (isRtl ? 'يدوي' : 'Manuel') : (isRtl ? 'أوتوماتيك' : 'Automatique')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Fuel, Seats, Doors, Luggage */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'الوقود' : 'Carburant'}
                                </label>
                                <select
                                    value={fuel}
                                    onChange={(e) => setFuel(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                >
                                    {FUEL_TYPES.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'المقاعد' : 'Places'}
                                </label>
                                <input
                                    type="number"
                                    min={2}
                                    max={9}
                                    value={seats}
                                    onChange={(e) => setSeats(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'الأبواب' : 'Portes'}
                                </label>
                                <input
                                    type="number"
                                    min={2}
                                    max={6}
                                    value={doors}
                                    onChange={(e) => setDoors(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'عدد الحقائب' : 'Bagages'}
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={luggage}
                                    onChange={(e) => setLuggage(Number(e.target.value))}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Color & Description */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'اللون (اختياري)' : 'Couleur (optionnel)'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={isRtl ? 'أبيض، أسود، رمادي...' : 'Blanc, Noir, Gris...'}
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'وصف مختصر أو مميزات خاصة' : 'Description du véhicule'}
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder={isRtl ? 'حالة ممتازة، مكيف هواء، شاشة لمس، بلوتوث...' : 'Très bon état, climatisation, écran tactile, bluetooth...'}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: PHOTOS */}
                {activeTab === 'photos' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                                {isRtl ? 'صور السيارة' : 'Photos du véhicule'}
                            </h4>
                            <p className="text-xs text-slate-500">
                                {isRtl
                                    ? 'يمكنك رفع حتى 8 صور واضحة. الصورة الأولى ستكون الصورة الرئيسية للسيارة في القوائم والبطاقات.'
                                    : 'Ajoutez jusqu’à 8 photos de bonne qualité. La première sera la photo principale.'}
                            </p>
                        </div>

                        {/* Upload dropzone */}
                        <label className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-zinc-800/20 transition-all">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                disabled={uploadingImage || images.length >= 8}
                                className="hidden"
                            />
                            {uploadingImage ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                    <span className="text-xs text-slate-500">{isRtl ? 'جاري ضغط ورفع الصور...' : 'Téléchargement...'}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {isRtl ? 'اضغط لرفع الصور من جهازك' : 'Cliquez pour sélectionner des photos'}
                                    </p>
                                    <span className="text-xs text-slate-400">JPG, PNG, WEBP (Max 8)</span>
                                </div>
                            )}
                        </label>

                        {/* Images preview grid */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 group bg-slate-100 dark:bg-zinc-800">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                                        {/* Main photo badge */}
                                        {idx === 0 ? (
                                            <span className="absolute top-2 start-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                                {isRtl ? 'الرئيسية' : 'Principale'}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setMainImage(idx)}
                                                className="absolute top-2 start-2 bg-black/60 hover:bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {isRtl ? 'تعيين كرئيسية' : 'Définir principale'}
                                            </button>
                                        )}

                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 end-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: PRICING */}
                {activeTab === 'pricing' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                                {isRtl ? 'أسعار الكراء والمصادقة' : 'Tarification et cautions'}
                            </h4>
                            <p className="text-xs text-slate-500">
                                {isRtl
                                    ? 'حدد السعر اليومي (إجباري). الأسعار الأسبوعية والشهرية اختيارية وتعطي حافزاً للزبون للكراء لفترات أطول.'
                                    : 'Renseignez le prix journalier (obligatoire). Les tarifs hebdo/mensuel sont recommandés.'}
                            </p>
                        </div>

                        {/* Main Prices */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'السعر اليومي (درهم / يوم) *' : 'Prix journalier (DH / jour) *'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={50}
                                        required
                                        placeholder="300"
                                        value={dailyPrice}
                                        onChange={(e) => setDailyPrice(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 text-lg font-black text-blue-600 dark:text-blue-400 outline-none"
                                    />
                                    <span className="absolute end-3 top-3.5 text-xs font-bold text-slate-400">MAD</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'السعر الأسبوعي (درهم / يوم)' : 'Prix hebdo (DH / jour)'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={50}
                                        placeholder="280"
                                        value={weeklyPrice}
                                        onChange={(e) => setWeeklyPrice(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none"
                                    />
                                    <span className="absolute end-3 top-3.5 text-xs font-bold text-slate-400">MAD</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'السعر الشهري (درهم / يوم)' : 'Prix mensuel (DH / jour)'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={50}
                                        placeholder="250"
                                        value={monthlyPrice}
                                        onChange={(e) => setMonthlyPrice(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none"
                                    />
                                    <span className="absolute end-3 top-3.5 text-xs font-bold text-slate-400">MAD</span>
                                </div>
                            </div>
                        </div>

                        {/* Security Deposit & Min Days */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'مبلغ التأمين / الضمان (درهم)' : 'Caution / Cautionnement (DH)'}
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="5000"
                                    value={securityDeposit}
                                    onChange={(e) => setSecurityDeposit(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'الحد الأدنى لعدد أيام الكراء' : 'Durée min. de location (jours)'}
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={minRentalDays}
                                    onChange={(e) => setMinRentalDays(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'كيلومترات مشمولة يومياً (كم)' : 'Kilométrage inclus / jour'}
                                </label>
                                <input
                                    type="number"
                                    min={50}
                                    placeholder={isRtl ? 'مثال: 250 أو اتركه فارغاً' : 'Ex: 250 km'}
                                    value={mileagePerDay}
                                    onChange={(e) => setMileagePerDay(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Extra km and Deliveries */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'سعر الكيلومتر الإضافي (درهم)' : 'Prix km supplémentaire (DH)'}
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min={0}
                                    placeholder="2.0"
                                    value={extraMileagePrice}
                                    onChange={(e) => setExtraMileagePrice(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'رسوم التوصيل داخل المدينة (درهم)' : 'Frais de livraison en ville'}
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder={isRtl ? '0 = مجاني' : '0 = gratuit'}
                                    value={deliveryFee}
                                    onChange={(e) => setDeliveryFee(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {isRtl ? 'رسوم التوصيل للمطار (درهم)' : 'Frais livraison aéroport'}
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="100"
                                    value={airportDeliveryFee}
                                    onChange={(e) => setAirportDeliveryFee(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Price notes */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'ملاحظات أو شروط خاصة بالسعر' : 'Conditions tarifaires particulières'}
                            </label>
                            <input
                                type="text"
                                placeholder={isRtl ? 'مثال: خصم 10% عند الحجز لأكثر من 15 يوماً' : 'Ex: Réduction de 10% pour plus de 15 jours'}
                                value={priceNotes}
                                onChange={(e) => setPriceNotes(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* TAB 4: STATUS */}
                {activeTab === 'status' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                                {isRtl ? 'حالة توفر السيارة للعملاء' : 'Disponibilité du véhicule'}
                            </h4>
                            <p className="text-xs text-slate-500">
                                {isRtl
                                    ? 'يمكنك تغيير الحالة في أي وقت من لوحة التحكم بنقرة واحدة عند حجز السيارة أو رجوعها.'
                                    : 'Vous pouvez modifier ce statut à tout moment en un clic.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                                status === 'AVAILABLE'
                                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                            }`}>
                                <input
                                    type="radio"
                                    name="status"
                                    value="AVAILABLE"
                                    checked={status === 'AVAILABLE'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                                        {isRtl ? 'متاحة للكراء (AVAILABLE)' : 'Disponible à la location'}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {isRtl ? 'السيارة جاهزة وتظهر للعملاء في صفحة الوكالة.' : 'La voiture apparaît comme disponible aux clients.'}
                                    </div>
                                </div>
                            </label>

                            <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                                status === 'RENTED'
                                    ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                            }`}>
                                <input
                                    type="radio"
                                    name="status"
                                    value="RENTED"
                                    checked={status === 'RENTED'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-bold text-sm text-amber-700 dark:text-amber-400">
                                        {isRtl ? 'محجوزة حالياً (RENTED)' : 'Actuellement louée'}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {isRtl ? 'تظهر مع شارة محجوزة لتفادي إزعاجك باتصالات غير متوفرة.' : 'Indiquée comme louée pour éviter les appels inutiles.'}
                                    </div>
                                </div>
                            </label>

                            <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                                status === 'MAINTENANCE'
                                    ? 'border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                            }`}>
                                <input
                                    type="radio"
                                    name="status"
                                    value="MAINTENANCE"
                                    checked={status === 'MAINTENANCE'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                        {isRtl ? 'تحت الصيانة (MAINTENANCE)' : 'En entretien / Maintenance'}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {isRtl ? 'غير متوفرة مؤقتاً بسبب الفحص أو الإصلاح.' : 'Temporairement indisponible.'}
                                    </div>
                                </div>
                            </label>

                            <label className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                                status === 'HIDDEN'
                                    ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200'
                                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                            }`}>
                                <input
                                    type="radio"
                                    name="status"
                                    value="HIDDEN"
                                    checked={status === 'HIDDEN'}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-bold text-sm text-red-600 dark:text-red-400">
                                        {isRtl ? 'مخفية (HIDDEN)' : 'Masquée / Non publiée'}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {isRtl ? 'لا تظهر نهائياً للعامة ولا يتم فهرستها في محركات البحث.' : 'Invisible pour le public et exclue des moteurs.'}
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Navigation & Submit */}
            <div className="p-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => {
                        if (activeTab === 'status') setActiveTab('pricing');
                        else if (activeTab === 'pricing') setActiveTab('photos');
                        else if (activeTab === 'photos') setActiveTab('basics');
                        else router.push(`/${locale}/dashboard/agency`);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                    {activeTab === 'basics' ? (isRtl ? 'إلغاء' : 'Annuler') : (isRtl ? 'السابق' : 'Précédent')}
                </button>

                <div className="flex items-center gap-3">
                    {activeTab !== 'status' && (
                        <button
                            type="button"
                            onClick={() => {
                                if (activeTab === 'basics') setActiveTab('photos');
                                else if (activeTab === 'photos') setActiveTab('pricing');
                                else if (activeTab === 'pricing') setActiveTab('status');
                            }}
                            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-white text-sm font-bold transition-colors"
                        >
                            {isRtl ? 'التالي' : 'Suivant'}
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{isRtl ? 'جاري الحفظ...' : 'Enregistrement...'}</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                <span>{isEditing ? (isRtl ? 'حفظ التعديلات' : 'Enregistrer') : (isRtl ? 'نشر السيارة' : 'Publier')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
