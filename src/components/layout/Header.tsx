'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { Button } from '@/components/ui/Button';
import { Car, Menu, Plus, Search, User, X, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

export default function Header() {
    const t = useTranslations();
    const { user, loading: authLoading, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Prevent hydration mismatch by only rendering auth-dependent content after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const switchLocale = (newLocale: 'ar' | 'fr') => {
        router.replace(pathname, { locale: newLocale });
    };

    const handleSignOut = async () => {
        await signOut();
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <Car className="h-6 w-6" />
                    <span>Cayn.ma</span>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-6 mx-6">
                    <Link href="/rent-agencies" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200 transition-colors">
                        {t('Header.rentAgencies')}
                    </Link>
                </nav>

                {/* Desktop Search (Hidden on mobile) */}
                <form action={`/cars`} method="GET" className="hidden md:flex flex-1 max-w-md mx-8 relative">
                    <input
                        type="text"
                        name="q"
                        placeholder={t('Header.searchPlaceholder')}
                        className="w-full rounded-full border border-gray-300 py-2 px-4 pr-10 text-sm focus:border-blue-500 focus:outline-none dark:bg-zinc-900 dark:border-zinc-700"
                    />
                    <button type="submit" className="absolute right-3 top-2.5">
                        <Search className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors" />
                    </button>
                </form>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <button onClick={() => switchLocale('ar')} className="hover:text-blue-600">AR</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => switchLocale('fr')} className="hover:text-blue-600">FR</button>
                    </div>

                    {!mounted || authLoading ? (
                        // Skeleton placeholder during SSR/loading
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
                    ) : user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                    <User className="h-4 w-4" />
                                </div>
                                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                                <ChevronDown className="h-3 w-3" />
                            </button>

                            {/* User Dropdown */}
                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800 mb-1">
                                            <p className="text-xs text-gray-500">{t('Header.loggedInAs')}</p>
                                            <p className="text-sm font-semibold truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/my-listings"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                        >
                                            <Menu className="h-4 w-4 text-gray-400" />
                                            {t('Header.myListings')}
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t('Header.logout')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <User className="h-4 w-4" />
                                {t('Common.signIn')}
                            </Button>
                        </Link>
                    )}

                    <Link href="/post">
                        <Button className="gap-2 rounded-full px-6">
                            <Plus className="h-4 w-4" />
                            {t('Common.postAd')}
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2" onClick={toggleMenu}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {
                isMenuOpen && (
                    <div className="md:hidden border-t bg-white p-4 dark:bg-zinc-950">
                        <div className="flex flex-col gap-4">
                            <form action="/cars" method="GET" className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2">
                                <Search className="h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    name="q"
                                    placeholder={t('Header.searchPlaceholder')}
                                    className="bg-transparent text-sm focus:outline-none w-full"
                                />
                            </form>
                            <nav className="flex flex-col gap-2">
                                <Link href="/" onClick={toggleMenu} className="py-2 hover:text-blue-600 font-medium">
                                    {t('Common.home')}
                                </Link>
                                <Link href="/cars" onClick={toggleMenu} className="py-2 hover:text-blue-600 font-medium">
                                    {t('Common.cars')}
                                </Link>
                                <Link href="/rent-agencies" onClick={toggleMenu} className="py-2 hover:text-blue-600 font-medium">
                                    {t('Header.rentAgencies')}
                                </Link>
                            </nav>
                            <hr />

                            {mounted && user && (
                                <div className="flex items-center gap-3 py-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium truncate">{user.email}</p>
                                        <button onClick={handleSignOut} className="text-xs text-red-500 font-medium">{t('Header.logout')}</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500">{t('Header.language')}</span>
                                <div className="flex gap-4 font-medium">
                                    <button onClick={() => switchLocale('ar')}>العربية</button>
                                    <button onClick={() => switchLocale('fr')}>Français</button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                {mounted && !user && (
                                    <Link href="/login" onClick={toggleMenu}>
                                        <Button variant="outline" className="w-full justify-center">
                                            {t('Common.signIn')}
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/post" onClick={toggleMenu}>
                                    <Button className="w-full justify-center">
                                        {t('Common.postAd')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            }
        </header >
    );
}
