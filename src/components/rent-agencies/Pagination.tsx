'use client';

import { usePathname, useRouter } from '@/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
    total: number;
    page: number;
    limit: number;
    onPageChange?: (page: number) => void;
}

export default function Pagination({ total, page, limit, onPageChange }: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) return null;

    const goToPage = (newPage: number) => {
        if (onPageChange) {
            onPageChange(newPage);
        } else {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', newPage.toString());
            router.push(`${pathname}?${params.toString()}`);
        }
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-8 py-4">
            <button
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5 rtl:hidden" />
                <ChevronRight className="w-5 h-5 ltr:hidden" />
            </button>

            <div className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                <span className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                    {page}
                </span>
                <span>/</span>
                <span className="px-3 py-1">
                    {totalPages}
                </span>
            </div>

            <button
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5 rtl:hidden" />
                <ChevronLeft className="w-5 h-5 ltr:hidden" />
            </button>
        </div>
    );
}
