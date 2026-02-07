'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
    LayoutDashboard,
    Car,
    Building2,
    Users,
    Flag,
    Settings,
    LogOut,
    X,
    Shield
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const locale = useLocale();
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const isRtl = locale === 'ar';

    const menuItems = [
        {
            icon: LayoutDashboard,
            labelAr: 'لوحة التحكم',
            labelFr: 'Tableau de bord',
            href: `/${locale}/admin`
        },
        {
            icon: Car,
            labelAr: 'إدارة الإعلانات',
            labelFr: 'Gestion Annonces',
            href: `/${locale}/admin/listings`
        },
        {
            icon: Users,
            labelAr: 'إدارة المستخدمين',
            labelFr: 'Gestion Utilisateurs',
            href: `/${locale}/admin/users`
        },
        {
            icon: Flag,
            labelAr: 'البلاغات',
            labelFr: 'Signalements',
            href: `/${locale}/admin/reports`
        },
        {
            icon: Building2,
            labelAr: 'الوكالات',
            labelFr: 'Agences',
            href: `/${locale}/admin/agencies`
        },
        {
            icon: Settings,
            labelAr: 'الإعدادات',
            labelFr: 'Paramètres',
            href: `/${locale}/admin/settings`
        },
    ];

    const isActive = (path: string) => {
        if (path === `/${locale}/admin` && pathname === `/${locale}/admin`) return true;
        if (path !== `/${locale}/admin` && pathname.startsWith(path)) return true;
        return false;
    };

    const handleLogout = async () => {
        await signOut();
        window.location.href = `/${locale}`;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 bottom-0 z-50 w-72 bg-zinc-900 border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex lg:flex-col
                ${isRtl ? 'right-0 border-l lg:border-l' : 'left-0 border-r lg:border-r'} 
                ${isOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}
            `}>
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800">
                    <Link href={`/${locale}/admin`} className="flex items-center gap-2">
                        <div className="p-2 bg-red-600 rounded-lg">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-lg">Admin</span>
                            <span className="text-zinc-500 text-sm block">Kayn.ma</span>
                        </div>
                    </Link>
                    <button onClick={onClose} className="lg:hidden p-1 text-zinc-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-zinc-500'}`} />
                                <span>{isRtl ? item.labelAr : item.labelFr}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Logout */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">Admin</p>
                            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>{isRtl ? 'تسجيل الخروج' : 'Se déconnecter'}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
