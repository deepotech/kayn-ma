'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/components/auth/AuthContext';
import { Save, User as UserIcon, Globe, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user, loading } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
    });
    const [saving, setSaving] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Initialize form data from auth user
    if (user && !initialized) {
        setFormData({
            name: user.displayName || '',
            phone: '',
            city: '',
        });
        setInitialized(true);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // TODO: Implement profile update API
            await new Promise(resolve => setTimeout(resolve, 500));
            alert(isRtl ? 'تم الحفظ!' : 'Enregistré !');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center py-20 text-gray-500">{isRtl ? 'يرجى تسجيل الدخول' : 'Veuillez vous connecter'}</div>;
    }

    return (
        <div className="max-w-3xl space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRtl ? 'إعدادات الحساب' : 'Paramètres du compte'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-6 space-y-6">

                {/* Profile Section */}
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold mb-4 border-b border-gray-100 pb-2">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                        {isRtl ? 'الملف الشخصي' : 'Profil'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">{isRtl ? 'الاسم الكامل' : 'Nom complet'}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
                            <input
                                type="email"
                                value={user.email || ''}
                                disabled
                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 opacity-70"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{isRtl ? 'الهاتف' : 'Téléphone'}</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="06XXXXXXXX"
                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">{isRtl ? 'المدينة' : 'Ville'}</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences Section (Placeholder) */}
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold mb-4 border-b border-gray-100 pb-2">
                        <Globe className="h-5 w-5 text-purple-600" />
                        {isRtl ? 'التفضيلات' : 'Préférences'}
                    </h3>
                    <p className="text-sm text-gray-500">{isRtl ? 'قريبا...' : 'Bientôt disponible...'}</p>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 transition"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {saving ? '...' : (isRtl ? 'حفظ التغييرات' : 'Enregistrer')}
                    </button>
                </div>

            </form>
        </div>
    );
}
