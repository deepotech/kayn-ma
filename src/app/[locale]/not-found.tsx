import { Link } from '@/navigation';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('Errors.notFound');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-6xl font-bold text-blue-600 mb-4">{t('title')}</h1>
            <h2 className="text-2xl font-bold mb-6">{t('heading')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                {t('message')}
            </p>
            <Link href="/">
                <Button>
                    {t('button')}
                </Button>
            </Link>
        </div>
    );
}
