'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface ListingContactButtonsProps {
    phoneNumber: string;
    whatsappUrl: string;
    listingId: string;
}

export default function ListingContactButtons({ phoneNumber, whatsappUrl, listingId }: ListingContactButtonsProps) {
    const t = useTranslations('ListingPage');

    const handleTrack = (type: 'call' | 'whatsapp') => {
        try {
            fetch(`/api/listings/${listingId}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <a
                href={`tel:${phoneNumber}`}
                className="w-full"
                onClick={() => handleTrack('call')}
            >
                <Button className="w-full gap-2 h-12 text-base">
                    <Phone className="h-5 w-5" />
                    {t('callSeller')}
                </Button>
            </a>
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                onClick={() => handleTrack('whatsapp')}
            >
                <MessageCircle className="h-5 w-5" />
                {t('whatsappSeller')}
            </a>
        </div>
    );
}
