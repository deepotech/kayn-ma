'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('Errors.general');

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('heading')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error.message || t('message')}
            </p>
            <Button onClick={() => reset()}>
                {t('button')}
            </Button>
        </div>
    );
}
