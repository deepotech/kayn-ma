'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useTransition } from 'react';

export default function RetryButton({ label }: { label: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRetry = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <button
            onClick={handleRetry}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm shadow-sm"
        >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
            {label}
        </button>
    );
}
