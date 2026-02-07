'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from '@/navigation';
import { Button } from '@/components/ui/Button';
import { Chrome, Mail, Eye, EyeOff, Loader2, Car } from 'lucide-react';
import { Link } from '@/navigation';
import { verifyAdminRole } from '@/app/actions/admin';

import { useSearchParams } from 'next/navigation'; // Correct import for App Router

export default function LoginPage() {
    const t = useTranslations('Auth');
    const tCommon = useTranslations('Common');
    const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/';

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already logged in and session is synced
    // Redirect logic moved to handleLogin
    // useEffect(() => {
    //     if (user && !loading) {
    //         router.push(redirectPath);
    //     }
    // }, [user, loading, router, redirectPath]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isLogin) {
                await signInWithEmail(email, password);
                // Check if admin
                const { isAdmin } = await verifyAdminRole(email);
                if (isAdmin) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                await signUpWithEmail(email, password);
                router.push('/');
            }
        } catch (err: any) {
            console.error(err);
            // Firebase error messages handling
            if (err.code === 'auth/user-not-found') {
                setError(t('errorUserNotFound'));
            } else if (err.code === 'auth/wrong-password') {
                setError(t('errorWrongPassword'));
            } else if (err.code === 'auth/email-already-in-use') {
                setError(t('errorEmailInUse'));
            } else if (err.code === 'auth/weak-password') {
                setError(t('errorWeakPassword'));
            } else if (err.code === 'auth/invalid-email') {
                setError(t('errorInvalidEmail'));
            } else {
                setError(err.message || t('errorGeneric'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsSubmitting(true);
        try {
            const result = await signInWithGoogle();
            if (result?.user?.email) {
                const { isAdmin } = await verifyAdminRole(result.user.email);
                if (isAdmin) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                router.push('/');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || t('errorGeneric'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <Car className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">Cayn.ma</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isLogin ? t('loginTitle') : t('signupTitle')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {isLogin ? t('loginSubtitle') : t('signupSubtitle')}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-zinc-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                        <Chrome className="h-5 w-5 text-blue-500" />
                        <span>{t('continueWithGoogle')}</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                        <span className="text-gray-400 text-sm">{t('or')}</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                {t('email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 py-3 pl-10 pr-4 bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder={t('emailPlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                {t('password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-600 py-3 px-4 pr-10 bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div className="text-right">
                                <button type="button" className="text-sm text-blue-600 hover:underline">
                                    {t('forgotPassword')}
                                </button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-3 text-base"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                isLogin ? t('loginButton') : t('signupButton')
                            )}
                        </Button>
                    </form>

                    {/* Toggle */}
                    <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
                        {isLogin ? t('noAccount') : t('hasAccount')}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="ml-2 text-blue-600 font-semibold hover:underline"
                        >
                            {isLogin ? t('signupLink') : t('loginLink')}
                        </button>
                    </p>
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                        ← {t('backToHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
