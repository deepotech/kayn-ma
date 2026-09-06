import { getRelatedAgencies } from '@/lib/agencies';
import { NormalizedAgency } from '@/lib/rent-agencies/normalize';
import RelatedAgenciesCarousel from './RelatedAgenciesCarousel';
import { getTranslations } from 'next-intl/server';

interface Props {
    currentAgency: NormalizedAgency;
    locale: string;
}

export default async function RelatedAgencies({ currentAgency, locale }: Props) {
    const t = await getTranslations({ locale, namespace: 'RentAgencies' });
    const related = await getRelatedAgencies(currentAgency, 8);

    if (related.length === 0) return null;

    const title = t('Fleet.relatedAgenciesTitle') || (locale === 'ar' ? 'وكالات كراء سيارات مشابهة' : 'Agences de location similaires');
    const subtitle = t('Fleet.relatedAgenciesSubtitle') || (locale === 'ar' ? 'وكالات أخرى موثوقة في نفس المدينة' : "D'autres agences de confiance dans la même ville");

    return (
        <RelatedAgenciesCarousel
            agencies={related}
            title={title}
            subtitle={subtitle}
        />
    );
}
