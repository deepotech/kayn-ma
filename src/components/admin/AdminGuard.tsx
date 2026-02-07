'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { verifyAdminRole } from '@/app/actions/admin';
import { useRouter } from '@/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (loading) return;

        if (!user || !user.email) {
            console.log('[AdminGuard] No user, redirecting to login');
            // router.push('/login?redirect=/admin');
            // For now, let's just go home to avoid loops if login is broken
            router.push('/');
            return;
        }

        const checkRole = async () => {
            try {
                console.log('[AdminGuard] Checking role for:', user.email);
                const { isAdmin } = await verifyAdminRole(user.email!);

                if (isAdmin) {
                    setIsVerified(true);
                } else {
                    console.log('[AdminGuard] Not admin, redirecting home');
                    router.push('/');
                }
            } catch (error) {
                console.error('[AdminGuard] Check failed:', error);
                router.push('/');
            } finally {
                setIsChecking(false);
            }
        };

        checkRole();
    }, [user, loading, router]);

    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Checking authorization...</p>
            </div>
        );
    }

    if (!isVerified) return null;

    return <>{children}</>;
}
