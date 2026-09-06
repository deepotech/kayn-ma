'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Building2, Phone, MessageCircle, Mail, MapPin, Globe, Clock, Check, Loader2, AlertCircle, Upload } from 'lucide-react';

interface AgencyProfileEditorProps {
    agency: any;
    onUpdate?: () => void;
}

export default function AgencyProfileEditor({ agency, onUpdate }: AgencyProfileEditorProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [name, setName] = useState(agency?.name || '');
    const [phone, setPhone] = useState(agency?.phone || '');
    const [whatsapp, setWhatsapp] = useState(agency?.whatsapp || '');
    const [email, setEmail] = useState(agency?.email || '');
    const [address, setAddress] = useState(agency?.address || '');
    const [website, setWebsite] = useState(agency?.website || '');
    const [description, setDescription] = useState(agency?.description || '');
    const [logo, setLogo] = useState(agency?.logo || '');
    const [coverPhoto, setCoverPhoto] = useState(agency?.coverPhoto || '');

    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await fetch('/api/agency/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    whatsapp,
                    email,
                    address,
                    website,
                    description,
                    logo,
                    coverPhoto
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update agency');
            }

            setSuccessMessage(
                isRtl ? 'تم تحديث بيانات الوكالة بنجاح!' : 'Informations de l’agence mises à jour !'
            );
            onUpdate?.();
        } catch (err: any) {
            setError(err.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
            <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {isRtl ? 'معلومات وبيانات الوكالة' : 'Informations de l’agence'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                    {isRtl
                        ? 'قم بتحديث بيانات التواصل وصورة الغلاف والشعار لتظهر للعملاء بشكل احترافي.'
                        : 'Mettez à jour vos coordonnées et visuels pour les clients.'}
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'اسم الوكالة *' : 'Nom de l’agence *'}
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'المدينة' : 'Ville'}
                    </label>
                    <input
                        type="text"
                        disabled
                        value={agency?.city || agency?.citySlug || ''}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800/50 text-sm font-semibold text-slate-400 capitalize cursor-not-allowed"
                    />
                </div>
            </div>

            {/* Contacts: Phone, WhatsApp, Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'رقم الهاتف *' : 'Téléphone *'}
                    </label>
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'رقم WhatsApp' : 'WhatsApp'}
                    </label>
                    <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Address & Google Maps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'العنوان الفعلي *' : 'Adresse physique *'}
                    </label>
                    <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'الموقع الإلكتروني أو خرائط Google' : 'Site web ou lien Google Maps'}
                    </label>
                    <input
                        type="url"
                        placeholder="https://..."
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {isRtl ? 'نبذة عن الوكالة وخدماتها' : 'Description de l’agence'}
                </label>
                <textarea
                    rows={3}
                    placeholder={isRtl ? 'أفضل خدمات كراء السيارات في المدينة، توصيل مجاني للمطار، أسطول حديث...' : 'Services de location de voitures, livraison aéroport...'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Cover & Logo URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'رابط صورة الغلاف' : 'Image de couverture (URL)'}
                    </label>
                    <input
                        type="url"
                        placeholder="https://..."
                        value={coverPhoto}
                        onChange={(e) => setCoverPhoto(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'رابط الشعار (Logo)' : 'Logo (URL)'}
                    </label>
                    <input
                        type="url"
                        placeholder="https://..."
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isRtl ? 'حفظ التغييرات' : 'Enregistrer'}</span>
                </button>
            </div>
        </form>
    );
}
