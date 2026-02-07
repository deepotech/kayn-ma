'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { useAuth } from '@/components/auth/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const router = useRouter();
    const locale = useLocale();
    const { user, loading } = useAuth();

    useEffect(() => {
        // Wait for auth to resolve
        if (!loading) {
            if (!user) {
                // Redirect to login with locale
                router.replace(`/${locale}/login`);
            } else {
                setIsReady(true);
            }
        }
    }, [user, loading, router, locale]);

    // Show loading state while checking auth
    if (loading || !isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // User data for sidebar - user is guaranteed not null after isReady check
    const userData = user ? {
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        avatar: user.photoURL || undefined,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
    } : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
            {/* Sidebar */}
            <Sidebar
                user={userData}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
