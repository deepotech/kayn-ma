'use client';

import { useLocale } from 'next-intl';
import { Menu, Bell, Search } from 'lucide-react';

interface AdminTopbarProps {
    onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
    const locale = useLocale();
    const isRtl = locale === 'ar';

    return (
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>

                <h1 className="text-lg font-bold text-white hidden sm:block">
                    {isRtl ? 'لوحة تحكم الإدارة' : 'Panneau d\'Administration'}
                </h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={isRtl ? 'بحث...' : 'Rechercher...'}
                        className="w-64 pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
            </div>
        </header>
    );
}
