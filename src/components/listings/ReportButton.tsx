'use client';

import { useState } from 'react';
import { Flag, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthContext';

interface ReportButtonProps {
    listingId: string;
    locale: string;
    children?: React.ReactNode;
}

const REPORT_REASONS = [
    { value: 'scam', labelFr: 'Arnaque', labelAr: 'احتيال' },
    { value: 'duplicate', labelFr: 'Doublon', labelAr: 'إعلان مكرر' },
    { value: 'wrong_info', labelFr: 'Informations incorrectes', labelAr: 'معلومات خاطئة' },
    { value: 'spam', labelFr: 'Spam', labelAr: 'سبام' },
    { value: 'illegal', labelFr: 'Contenu illégal', labelAr: 'محتوى غير قانوني' },
    { value: 'other', labelFr: 'Autre', labelAr: 'آخر' },
] as const;

export default function ReportButton({ listingId, locale, children }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { user } = useAuth();

    const isArabic = locale === 'ar';

    const handleSubmit = async () => {
        if (!selectedReason) {
            setError(isArabic ? 'اختر سببا للتبليغ' : 'Veuillez sélectionner une raison');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Add auth token if user is logged in
            if (user) {
                const token = await user.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    listingId,
                    reason: selectedReason,
                    message: message.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit report');
            }

            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(false);
                setSelectedReason('');
                setMessage('');
            }, 2000);
        } catch (err) {
            const message = err instanceof Error ? err.message : null;
            setError(message || (isArabic ? 'فشل إرسال التبليغ' : 'Échec de l\'envoi du signalement'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {children ? (
                <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                    {children}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                    aria-label={isArabic ? 'تبليغ عن الإعلان' : 'Signaler l\'annonce'}
                >
                    <Flag className="h-4 w-4" />
                    <span>{isArabic ? 'تبليغ' : 'Signaler'}</span>
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-xl font-bold mb-4">
                            {isArabic ? 'تبليغ عن الإعلان' : 'Signaler cette annonce'}
                        </h3>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="text-green-500 text-5xl mb-4">✓</div>
                                <p className="text-lg font-semibold">
                                    {isArabic ? 'تم إرسال التبليغ بنجاح' : 'Signalement envoyé avec succès'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                    {isArabic
                                        ? 'اختر السبب الذي يدفعك للتبليغ عن هذا الإعلان'
                                        : 'Sélectionnez la raison pour laquelle vous signalez cette annonce'}
                                </p>

                                <div className="space-y-2 mb-4">
                                    {REPORT_REASONS.map((reason) => (
                                        <label
                                            key={reason.value}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedReason === reason.value
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                : 'border-gray-200 dark:border-zinc-700 hover:border-red-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="reason"
                                                value={reason.value}
                                                checked={selectedReason === reason.value}
                                                onChange={(e) => setSelectedReason(e.target.value)}
                                                className="text-red-500"
                                            />
                                            <span className="font-medium">
                                                {isArabic ? reason.labelAr : reason.labelFr}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        {isArabic ? 'تفاصيل إضافية (اختياري)' : 'Détails supplémentaires (optionnel)'}
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        maxLength={500}
                                        rows={3}
                                        className="w-full p-3 border rounded-lg resize-none dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder={isArabic ? 'أضف تفاصيل...' : 'Ajoutez des détails...'}
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm mb-4">{error}</p>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1"
                                    >
                                        {isArabic ? 'إلغاء' : 'Annuler'}
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !selectedReason}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            isArabic ? 'إرسال التبليغ' : 'Envoyer le signalement'
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
