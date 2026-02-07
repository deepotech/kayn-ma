import { getRelatedAgencies } from '@/lib/agencies';
import { NormalizedAgency } from '@/lib/rent-agencies/normalize';
import AgencyCard from './AgencyCard';
import { getTranslations } from 'next-intl/server';

interface Props {
    currentAgency: NormalizedAgency;
    locale: string;
}

export default async function RelatedAgencies({ currentAgency, locale }: Props) {
    const t = await getTranslations({ locale, namespace: 'RentAgencies.Listing' });
    const related = await getRelatedAgencies(currentAgency, 8);

    if (related.length === 0) return null;

    return (
        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                {t('relatedAgencies') || (locale === 'ar' ? 'وكالات مشابهة' : 'Agences similaires')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((agency) => (
                    <AgencyCard key={agency._id} agency={agency} />
                ))}
            </div>
        </div>
    );
}
