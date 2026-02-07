import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Contact' });
    return {
        title: `${t('title')} | Cayn.ma`,
        description: t('subtitle'),
    };
}

export default function ContactPage() {
    const t = useTranslations('Contact');

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                        {t('title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="md:col-span-1 space-y-6">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                            {t('info.title')}
                        </h2>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{t('info.email')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">contact@cayn.ma</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 rounded-xl text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{t('info.phone')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">+212 600 000 000</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">{t('info.address')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Casablanca, Maroc</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-zinc-800">
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('form.name')}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder=""
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('form.email')}
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder=""
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('form.subject')}
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700"
                                    placeholder=""
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('form.message')}
                                </label>
                                <textarea
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:border-zinc-700 min-h-[150px]"
                                    placeholder=""
                                ></textarea>
                            </div>

                            <Button className="w-full gap-2">
                                <Send className="h-4 w-4" />
                                {t('form.send')}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
