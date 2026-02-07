import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Terms' });
    return {
        title: `${t('title')} | Cayn.ma`,
        description: t('introduction.content').substring(0, 150) + '...',
    };
}

export default function TermsPage() {
    const t = useTranslations('Terms');

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
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('introduction.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('introduction.content')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('acceptance.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('acceptance.content')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('userResponsibilities.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('userResponsibilities.content')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('prohibitedContent.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('prohibitedContent.content')}
                    </p>
                </section>

                <section className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                        {t('contactUs')}
                    </p>
                </section>
            </div>
        </div>
    );
}
