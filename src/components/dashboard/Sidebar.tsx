'use client';

import { Link, usePathname } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LayoutDashboard, Car, Heart, Settings, LogOut, PlusCircle, X, UserPlus } from 'lucide-react';
import { User } from '@/lib/dashboard-types';

interface SidebarProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
    const locale = useLocale();
    const pathname = usePathname();
    const t = useTranslations('Dashboard');

    const isRtl = locale === 'ar';

    const menuItems = [
        { icon: LayoutDashboard, labelAr: 'لوحة التحكم', labelFr: 'Tableau de bord', href: '/dashboard' },
        { icon: Car, labelAr: 'إعلاناتي', labelFr: 'Mes Annonces', href: '/dashboard/listings' },
        { icon: Heart, labelAr: 'المفضلة', labelFr: 'Favoris', href: '/dashboard/favorites' },
        { icon: UserPlus, labelAr: 'المتابعون', labelFr: 'Abonnements', href: '/dashboard/following' },
        { icon: Settings, labelAr: 'الإعدادات', labelFr: 'Paramètres', href: '/dashboard/settings' },
    ];

    const isActive = (path: string) => {
        // usePathname from navigation returns path WITHOUT locale
        // So we compare directly
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 bottom-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-l border-gray-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex lg:flex-col
                ${isRtl ? 'right-0 border-l-gray-200 dark:border-l-zinc-800 lg:border-l' : 'left-0 border-r-gray-200 dark:border-r-zinc-800 lg:border-r'} 
                ${isOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}
            `}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-zinc-800">
                    <Link href="/" className="font-extrabold text-2xl tracking-tighter">
                        <span className="text-gray-900 dark:text-white">Kayn</span>
                        <span className="text-blue-600">.ma</span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* New Listing CTA */}
                <div className="p-4">
                    <Link
                        href="/dashboard/listings/new"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/20 active:scale-95"
                    >
                        <PlusCircle className="h-5 w-5" />
                        <span>{isRtl ? 'إضافة إعلان' : 'Déposer une annonce'}</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${active
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                                <span>{isRtl ? item.labelAr : item.labelFr}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-lg">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <span>👤</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button className="flex items-center gap-3 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-sm font-medium">
                        <LogOut className="h-5 w-5" />
                        <span>{isRtl ? 'تسجيل الخروج' : 'Se déconnecter'}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
