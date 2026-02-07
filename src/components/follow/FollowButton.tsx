'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface FollowButtonProps {
    sellerId: string;
    sellerName: string;
    className?: string;
}

export default function FollowButton({ sellerId, sellerName, className = '' }: FollowButtonProps) {
    const { user, loading: authLoading } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('Follow');

    // Check initial follow status
    useEffect(() => {
        if (!user || user.uid === sellerId) {
            setIsLoading(false);
            return;
        }

        async function checkStatus() {
            try {
                const token = await user?.getIdToken();
                const res = await fetch(`/api/follow/${sellerId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setIsFollowing(data.isFollowing);
                }
            } catch (error) {
                console.error('Failed to check follow status:', error);
            } finally {
                setIsLoading(false);
            }
        }

        checkStatus();
    }, [user, sellerId]);

    const handleFollowToggle = async () => {
        if (!user) {
            router.push(`/${locale}/login?redirect=/${locale}/cars/${window.location.pathname.split('/').pop()}`); // Simple redirect logic
            return;
        }

        // Optimistic update
        const previousState = isFollowing;
        setIsFollowing(!previousState);
        setIsPending(true);

        try {
            const token = await user.getIdToken();
            const method = previousState ? 'DELETE' : 'POST';

            const res = await fetch(`/api/follow/${sellerId}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                // Revert on failure
                setIsFollowing(previousState);
                if (res.status === 400) {
                    // Could handle specific errors like "Cannot follow self"
                }
            }
        } catch (error) {
            console.error('Follow action failed:', error);
            setIsFollowing(previousState);
        } finally {
            setIsPending(false);
        }
    };

    // Don't show button if:
    // 1. Auth loading
    const isSelf = user && user.uid === sellerId;

    if (authLoading) {
        return (
            <div className={`h-9 w-24 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse ${className}`} />
        );
    }

    // For debugging/verification: Show button even for self but disabled
    if (isSelf) {
        return (
            <button
                disabled
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-400 cursor-not-allowed ${className}`}
            >
                <UserCheck className="h-4 w-4" />
                <span>{t('following')} (You)</span>
            </button>
        );
    }

    if (isLoading) {
        return (
            <div className={`h-9 w-24 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse ${className}`} />
        );
    }

    return (
        <button
            onClick={handleFollowToggle}
            disabled={isPending}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                }
                ${isPending ? 'opacity-70 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
                <UserCheck className="h-4 w-4" />
            ) : (
                <UserPlus className="h-4 w-4" />
            )}
            <span>
                {isFollowing ? t('following') : t('follow')}
            </span>
        </button>
    );
}
