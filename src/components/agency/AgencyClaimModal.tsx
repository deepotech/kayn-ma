'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ShieldCheck, CheckCircle2, Clock, AlertCircle, Phone, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

interface AgencyClaimModalProps {
    agencyId: string;
    agencyName: string;
    agencyPhone?: string | null;
    verificationStatus?: string;
    isOwner?: boolean;
}

export default function AgencyClaimModal({
    agencyId,
    agencyName,
    agencyPhone,
    verificationStatus = 'UNVERIFIED',
    isOwner = false,
}: AgencyClaimModalProps) {
    const t = useTranslations('RentAgencies.Claim');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { user } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [phone, setPhone] = useState(agencyPhone || '');
    const [whatsapp, setWhatsapp] = useState(agencyPhone || '');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>(verificationStatus);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleOpen = () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        setIsOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const token = user ? await user.getIdToken() : null;
            const res = await fetch('/api/agency/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    agencyId,
                    phone,
                    whatsapp,
                    notes,
                    verificationMethod: 'phone'
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit claim');
            }

            setStatus('PENDING');
            setSuccessMessage(
                isRtl
                    ? 'تم إرسال طلب تأكيد الملكية بنجاح! سيقوم فريقنا بمراجعته والتواصل معك لتأكيد الوكالة.'
                    : 'Votre demande de revendication a été envoyée ! Notre équipe va la vérifier et vous contacter.'
            );
        } catch (err: any) {
            setError(err.message || 'Error submitting claim');
        } finally {
            setLoading(false);
        }
    };

    // If verified
    if (status === 'VERIFIED') {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isRtl ? 'وكالة موثقة' : 'Agence vérifiée'}</span>
            </div>
        );
    }

    // If pending
    if (status === 'PENDING') {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{isRtl ? 'طلب التوثيق قيد المراجعة' : 'Vérification en cours'}</span>
            </div>
        );
    }

    return (
        <>
            {/* Banner button */}
            <button
                type="button"
                onClick={handleOpen}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs md:text-sm font-semibold border border-blue-200 dark:border-blue-800 transition-colors shadow-sm"
            >
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isRtl ? 'هل أنت صاحب هذه الوكالة؟' : 'Êtes-vous le propriétaire ?'}</span>
            </button>

            {/* Claim Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-zinc-800 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 end-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {isRtl ? 'المطالبة بملكية الوكالة' : "Revendiquer l'agence"}
                                </h3>
                                <p className="text-xs text-slate-500 truncate max-w-xs">{agencyName}</p>
                            </div>
                        </div>

                        {successMessage ? (
                            <div className="text-center py-6">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-in zoom-in duration-300" />
                                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                                    {isRtl ? 'تم إرسال طلبك بنجاح' : 'Demande reçue avec succès'}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                    {successMessage}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm"
                                >
                                    {isRtl ? 'حسناً' : 'D’accord'}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {isRtl
                                        ? 'إذا كنت الممثل الرسمي أو صاحب هذه الوكالة، أدخل رقم هاتفك أو واتساب لنتمكن من تأكيد هويتك وتفعيل لوحة إدارة أسطولك.'
                                        : "Si vous êtes le propriétaire ou gérant, renseignez votre numéro pour valider la propriété et gérer votre flotte de voitures."}
                                </p>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        {isRtl ? 'رقم الهاتف للمعاينة *' : 'Numéro de téléphone *'}
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0612345678"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        {isRtl ? 'رقم الواتساب (للتواصل السريع)' : 'Numéro WhatsApp'}
                                    </label>
                                    <input
                                        type="tel"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="0612345678"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        {isRtl ? 'ملاحظات إضافية (اختياري)' : 'Remarques complémentaires'}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={isRtl ? 'مثال: أنا مدير الفرع في شارع...' : 'Exemple: Je suis le gérant du bureau...'}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-sm font-medium"
                                    >
                                        {isRtl ? 'إلغاء' : 'Annuler'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <span>{isRtl ? 'إرسال طلب التأكيد' : 'Envoyer la demande'}</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Auth Modal if user is not signed in */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
