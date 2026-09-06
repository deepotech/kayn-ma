'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Building2, Phone, MessageCircle, Mail, MapPin, Globe, Check, Loader2, AlertCircle, ShieldCheck, Car } from 'lucide-react';
import { CITIES } from '@/constants/data';
import { useAuth } from '@/components/auth/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export default function RegisterAgencyPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [managerName, setManagerName] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('marrakech');
    const [address, setAddress] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [approximateVehicles, setApproximateVehicles] = useState('5-15');
    const [logo, setLogo] = useState('');
    const [coverPhoto, setCoverPhoto] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!name || !phone || !city || !address) {
            setError(isRtl ? 'يرجى ملء الحقول الإجبارية (الاسم، المدينة، العنوان، الهاتف)' : 'Veuillez renseigner tous les champs obligatoires');
            return;
        }

        setSubmitting(true);

        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/agency/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    managerName,
                    phone,
                    whatsapp: whatsapp || phone,
                    email: email || user.email,
                    city,
                    address,
                    website,
                    description,
                    approximateVehicles,
                    logo,
                    coverPhoto
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Redirect to agency dashboard
            router.push(`/${locale}/dashboard/agency`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error creating agency');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* Header Card */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/30">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        {isRtl ? 'تسجيل وكالة كراء جديدة' : 'Enregistrer une agence de location'}
                    </h1>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        {isRtl
                            ? 'انضم إلى شبكة Cayn.ma، أضف أسطول سياراتك وأسعارك واستقبل اتصالات وحجوزات الزبائن مباشرة.'
                            : 'Rejoignez le réseau Cayn.ma et commencez à publier votre flotte de véhicules.'}
                    </p>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'اسم الوكالة *' : 'Nom de l’agence *'}
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Auto Rent..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'اسم المسؤول / المسير' : 'Nom du responsable'}
                            </label>
                            <input
                                type="text"
                                placeholder={isRtl ? 'الاسم الكامل' : 'Nom et prénom'}
                                value={managerName}
                                onChange={(e) => setManagerName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* City & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'المدينة *' : 'Ville *'}
                            </label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                            >
                                {CITIES.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {isRtl ? c.ar : c.fr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'العنوان الفعلي *' : 'Adresse physique *'}
                            </label>
                            <input
                                type="text"
                                required
                                placeholder={isRtl ? 'شارع، حي، رقم المحل...' : 'Rue, quartier, n°...'}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Contacts: Phone, WhatsApp, Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'رقم الهاتف *' : 'Téléphone *'}
                            </label>
                            <input
                                type="tel"
                                required
                                placeholder="0612345678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'WhatsApp' : 'WhatsApp'}
                            </label>
                            <input
                                type="tel"
                                placeholder="0612345678"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'البريد الإلكتروني' : 'Email'}
                            </label>
                            <input
                                type="email"
                                placeholder="agence@mail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Approximate fleet size & Google Maps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'عدد السيارات التقريبي' : 'Nombre approx. de voitures'}
                            </label>
                            <select
                                value={approximateVehicles}
                                onChange={(e) => setApproximateVehicles(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                            >
                                <option value="1-5">1 - 5 {isRtl ? 'سيارات' : 'voitures'}</option>
                                <option value="5-15">5 - 15 {isRtl ? 'سيارة' : 'voitures'}</option>
                                <option value="15-30">15 - 30 {isRtl ? 'سيارة' : 'voitures'}</option>
                                <option value="30+">30+ {isRtl ? 'سيارة' : 'voitures'}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {isRtl ? 'رابط Google Maps أو الموقع' : 'Lien Google Maps ou site'}
                            </label>
                            <input
                                type="url"
                                placeholder="https://..."
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {isRtl ? 'وصف الوكالة' : 'Description de l’activité'}
                        </label>
                        <textarea
                            rows={3}
                            placeholder={isRtl ? 'اكتب نبذة عن وكالتك وساعات العمل وأسعارك التفضيلية...' : 'Présentation de votre agence...'}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none resize-none"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting || authLoading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{isRtl ? 'جاري التسجيل...' : 'Création en cours...'}</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    <span>{isRtl ? 'تأكيد تسجيل الوكالة والبدء بإضافة السيارات' : 'Créer l’agence et ajouter des voitures'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
    );
}
