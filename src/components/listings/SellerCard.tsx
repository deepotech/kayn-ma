'use client';

import { useTranslations } from 'next-intl';
import { User, Building2, CheckCircle, Calendar } from 'lucide-react';

import FollowButton from '@/components/follow/FollowButton';

interface SellerCardProps {
    sellerName?: string;
    sellerType?: 'individual' | 'agency';
    memberSince?: string | number;
    isVerified?: boolean;
    sellerId?: string;
}

export default function SellerCard({
    sellerName = 'Vendeur',
    sellerType = 'individual',
    memberSince,
    isVerified = true,
    sellerId
}: SellerCardProps) {
    const t = useTranslations('ListingPage');

    const memberYear = memberSince
        ? new Date(memberSince).getFullYear()
        : new Date().getFullYear();

    const SellerIcon = sellerType === 'agency' ? Building2 : User;

    return (
        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('seller')}
            </h3>

            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${sellerType === 'agency'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                    <SellerIcon className="h-6 w-6" />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                            {sellerName}
                        </p>
                        {sellerId && (
                            <FollowButton sellerId={sellerId} sellerName={sellerName} />
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sellerType === 'agency'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                            {t(sellerType)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {t('memberSince')} {memberYear}
                        </span>
                    </div>
                </div>
            </div>

            {/* Trust Badges */}
            {isVerified && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>{t('verifiedPhone')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
