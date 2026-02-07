import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Privacy' });
    return {
        title: `${t('title')} | Cayn.ma`,
        description: t('introduction').substring(0, 150) + '...',
    };
}

export default function PrivacyPage() {
    const t = useTranslations('Privacy');

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {t('title')}
            </h1>
            <p className="text-gray-500 mb-8">
                {t('lastUpdated', { date: new Date().toLocaleDateString() })}
            </p>

            <div className="space-y-8 text-gray-700 dark:text-gray-300">
                <section>
                    <p className="leading-relaxed text-lg">
                        {t('introduction')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('collection.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('collection.content')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('usage.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('usage.content')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('cookies.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('cookies.content')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('rights.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('rights.content')}
                    </p>
                </section>
            </div>
        </div>
    );
}
