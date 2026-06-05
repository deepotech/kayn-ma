export interface CityMeta {
    nameEn: string;
    nameAr: string;
    focus: 'business' | 'tourism' | 'administration' | 'industrial' | 'culture' | 'agriculture' | 'regional_trade';
    airportEn: string;
    airportAr: string;
    highlights: string[];
}

export const CITY_METADATA: Record<string, CityMeta> = {
    casablanca: {
        nameEn: 'Casablanca',
        nameAr: 'الدار البيضاء',
        focus: 'business',
        airportEn: 'Mohammed V International Airport (CMN)',
        airportAr: 'مطار محمد الخامس الدولي',
        highlights: ['Sidi Maarouf', 'Maarif', 'Ain Sebaa', 'La Corniche', 'Anfa']
    },
    rabat: {
        nameEn: 'Rabat',
        nameAr: 'الرباط',
        focus: 'administration',
        airportEn: 'Rabat-Salé Airport (RBA)',
        airportAr: 'مطار الرباط سلا',
        highlights: ['Hay Riad', 'Agdal', 'Hassan Tower', 'Oudayas']
    },
    marrakech: {
        nameEn: 'Marrakech',
        nameAr: 'مراكش',
        focus: 'tourism',
        airportEn: 'Marrakech Menara Airport (RAK)',
        airportAr: 'مطار مراكش المنارة الدولي',
        highlights: ['Jemaa el-Fnaa', 'Gueliz', 'Hivernage', 'Medina', 'Palmeraire']
    },
    tanger: {
        nameEn: 'Tangier',
        nameAr: 'طنجة',
        focus: 'industrial',
        airportEn: 'Tangier Ibn Battouta Airport (TNG)',
        airportAr: 'مطار طنجة ابن بطوطة',
        highlights: ['Tanger Med Port', 'Malabata', 'Marsham', 'Iberia', 'Boukhalef']
    },
    agadir: {
        nameEn: 'Agadir',
        nameAr: 'أكادير',
        focus: 'tourism',
        airportEn: 'Agadir-Al Massira Airport (AGA)',
        airportAr: 'مطار أكادير المسيرة',
        highlights: ['Marina', 'Talborjt', 'Founty', 'Souss-Massa']
    },
    fes: {
        nameEn: 'Fes',
        nameAr: 'فاس',
        focus: 'culture',
        airportEn: 'Fes-Saïss Airport (FEZ)',
        airportAr: 'مطار فاس سايس',
        highlights: ['Fes el-Bali', 'Widad', 'Route de Sefrou', 'Ville Nouvelle']
    },
    meknes: {
        nameEn: 'Meknes',
        nameAr: 'مكناس',
        focus: 'agriculture',
        airportEn: 'Bassatine Airport (Military/Local)',
        airportAr: 'مطار البساتين',
        highlights: ['Hamria', 'El Hedim Square', 'Plaza Lalla Aouda', 'Route de Fes']
    },
    oujda: {
        nameEn: 'Oujda',
        nameAr: 'وجدة',
        focus: 'regional_trade',
        airportEn: 'Oujda Angads Airport (OUD)',
        airportAr: 'مطار وجدة أنجاد',
        highlights: ['Lazaret', 'Al Qods', 'Medina', 'Route de Berkane']
    },
    'kelaat-sraghna': {
        nameEn: 'Kelaat Sraghna',
        nameAr: 'قلعة السراغنة',
        focus: 'agriculture',
        airportEn: 'Marrakech Menara Airport (Nearest, 75km)',
        airportAr: 'مطار مراكش المنارة الدولي (الأقرب، 75 كلم)',
        highlights: ['Boulevard Mohammed V', 'El Nakhla', 'El Jibs', 'Weekly Souk Sebt']
    }
};
