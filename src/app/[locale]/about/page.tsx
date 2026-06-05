import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'About' });
    return {
        title: `${t('title')} | Cayn.ma`,
        description: t('introduction').substring(0, 150) + '...',
    };
}

export default function AboutPage() {
    const t = useTranslations('About');

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {t('title')}
            </h1>

            <div className="space-y-8 text-gray-700 dark:text-gray-300">
                <section>
                    <p className="leading-relaxed text-lg">
                        {t('introduction')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('mission.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('mission.content')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('services.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('services.content')}
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                        {t('whyUs.title')}
                    </h2>
                    <p className="leading-relaxed">
                        {t('whyUs.content')}
                    </p>
                </section>
            </div>
        </div>
    );
}
