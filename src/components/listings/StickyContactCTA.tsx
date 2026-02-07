'use client';

import { useTranslations } from 'next-intl';
import { Phone, MessageCircle } from 'lucide-react';

interface StickyContactCTAProps {
    phoneNumber: string;
    whatsappUrl: string;
    listingId?: string;
}

export default function StickyContactCTA({ phoneNumber, whatsappUrl, listingId }: StickyContactCTAProps) {
    const t = useTranslations('ListingPage');

    const handleCallClick = () => {
        if (listingId) {
            fetch(`/api/listings/${listingId}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'call' })
            });
        }
    };

    const handleWhatsAppClick = () => {
        if (listingId) {
            fetch(`/api/listings/${listingId}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'whatsapp' })
            });
        }
    };

    return (
        <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            {/* Safety Warning */}
            <p className="text-xs text-center text-amber-600 dark:text-amber-400 mb-2 px-2">
                {t('safetyWarning')}
            </p>

            <div className="flex gap-3 max-w-lg mx-auto">
                <a
                    href={`tel:${phoneNumber}`}
                    onClick={handleCallClick}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    <Phone className="h-5 w-5" />
                    {t('callSeller')}
                </a>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="flex-[1.3] flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                >
                    <MessageCircle className="h-5 w-5" />
                    {t('whatsappSeller')}
                </a>
            </div>
        </div>
    );
}
