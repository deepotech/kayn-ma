import Link from 'next/link';
// import dbConnect from '@/lib/db';
// import RentAgency from '@/models/RentAgency';
import AgencyCard from '@/components/rent-agencies/AgencyCard'; // Switch to updated card
import { getAgenciesByCity } from '@/lib/rent-agencies/getAgenciesByCity';

async function getTopAgencies() {
    // Fetch from SSOT loader
    // Get all agencies
    const agencies = await getAgenciesByCity('marrakech');
    // Because loader already sorts by Quality (Rating -> Reviews -> Photos),
    // we just take the top 4.
    return agencies.slice(0, 4);
}

export default async function TopAgenciesTeaser() {
    const agencies = await getTopAgencies();

    if (agencies.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agencies.map((agency: any) => (
                <AgencyCard key={agency._id} agency={agency} />
            ))}
        </div>
    );
}
