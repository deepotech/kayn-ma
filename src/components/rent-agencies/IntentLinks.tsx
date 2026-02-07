import Link from 'next/link';
import { getAllIntents } from '@/lib/rent-agencies/seo-intents';

interface Props {
    city: string;
    currentIntent: string;
    locale: string;
}

export default function IntentLinks({ city, currentIntent, locale }: Props) {
    const intents = getAllIntents();

    const cityMap: Record<string, string> = {
        marrakech: 'مراكش',
        casablanca: 'الدار البيضاء',
        rabat: 'الرباط',
        tanger: 'طنجة',
        agadir: 'أكادير',
        fes: 'فاس',
        meknes: 'مكناس',
        oujda: 'وجدة',
        kenitra: 'القنيطرة',
        tetouan: 'تطوان',
        essaouira: 'الصويرة',
        safi: 'آسفي',
        mohammedia: 'المحمدية',
        eljadida: 'الجديدة',
        beni_mellal: 'بني ملال',
        nador: 'الناظور',
        taza: 'تازة',
        settat: 'سطات',
        berrechid: 'برشيد',
        khemisset: 'الخميسات'
    };

    const cityName = (locale === 'ar' && cityMap[city.toLowerCase()])
        ? cityMap[city.toLowerCase()]
        : city.charAt(0).toUpperCase() + city.slice(1);

    const titleText = locale === 'ar'
        ? `مواضيع يبحث عنها الناس في ${cityName}`
        : `Sujets populaires à ${cityName}`;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-slate-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                {titleText}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {intents.filter(i => i.slug !== currentIntent).map((intent) => {
                    const title = (locale === 'ar' && intent.params.ar) ? intent.params.ar : intent.params.fr;
                    // Use translated city name in the title
                    const finalTitle = title.replace('{city}', cityName);

                    return (
                        <Link
                            key={intent.slug}
                            href={`/${locale}/rent-agencies/${city}/${intent.slug}`}
                            className="flex items-center p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                        >
                            <span className="font-medium">{finalTitle}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
