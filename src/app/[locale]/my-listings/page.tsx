import { redirect } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function MyListingsPage() {
    const locale = useLocale();
    redirect(`/${locale}/dashboard/listings`);
}
