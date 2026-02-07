'use client';

import { Menu, Bell } from 'lucide-react';
import { useLocale } from 'next-intl';

interface TopbarProps {
    onMenuClick: () => void;
    title?: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    return (
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 lg:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                {title && (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                        {title}
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900"></span>
                </button>
                {/* Additional top bar items like lang switcher could go here */}
            </div>
        </header>
    );
}
