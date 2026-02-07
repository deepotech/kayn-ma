import dbConnect from '@/lib/db';
import RentAgency from '@/models/RentAgency';
import AgencyForm from '@/components/admin/AgencyForm';
import { notFound } from 'next/navigation';

import { requireAdminAccess } from '@/lib/admin-access';

async function getAgency(id: string) {
    await requireAdminAccess();
    await dbConnect();
    // Validate ID format? Mongoose findById throws if invalid hex?
    try {
        return await RentAgency.findById(id).lean();
    } catch {
        return null;
    }
}

export default async function EditAgencyPage({
    params: { locale, id }
}: {
    params: { locale: string; id: string }
}) {
    const agency = await getAgency(id);

    if (!agency) {
        notFound();
    }

    // Serialize generic object for client component
    const serializedAgency = JSON.parse(JSON.stringify(agency));

    return (
        <div className="p-6">
            <AgencyForm
                initialData={serializedAgency}
                isEdit={true}
                locale={locale}
            />
        </div>
    );
}
