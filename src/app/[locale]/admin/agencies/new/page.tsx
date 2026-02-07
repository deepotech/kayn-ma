

import AgencyForm from '@/components/admin/AgencyForm';
import { requireAdminAccess } from '@/lib/admin-access';

export default async function NewAgencyPage({ params: { locale } }: { params: { locale: string } }) {
    await requireAdminAccess();
    return (
        <div className="p-6">
            <AgencyForm locale={locale} />
        </div>
    );
}
