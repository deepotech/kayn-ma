import { CityGuide } from './types';

// Casablanca
import { casablancaRent } from './casablanca/rent';
import { casablancaCars } from './casablanca/cars';

// Rabat
import { rabatRent } from './rabat/rent';
import { rabatCars } from './rabat/cars';

// Marrakech
import { marrakechRent } from './marrakech/rent';
import { marrakechCars } from './marrakech/cars';

// Tangier (Tanger)
import { tangerRent } from './tanger/rent';
import { tangerCars } from './tanger/cars';

// Agadir
import { agadirRent } from './agadir/rent';
import { agadirCars } from './agadir/cars';

// Fes
import { fesRent } from './fes/rent';
import { fesCars } from './fes/cars';

// Meknes
import { meknesRent } from './meknes/rent';
import { meknesCars } from './meknes/cars';

// Oujda
import { oujdaRent } from './oujda/rent';
import { oujdaCars } from './oujda/cars';

// Kelaat Sraghna
import { kelaatSraghnaRent } from './kelaat-sraghna/rent';
import { kelaatSraghnaCars } from './kelaat-sraghna/cars';

// Beni Mellal
import { beniMellalRent } from './beni-mellal/rent';
import { beniMellalCars } from './beni-mellal/cars';

// Tetouan
import { tetouanRent } from './tetouan/rent';
import { tetouanCars } from './tetouan/cars';

// Kenitra
import { kenitaRent } from './kenitra/rent';
import { kenitaraCars } from './kenitra/cars';

// Safi
import { safiRent } from './safi/rent';
import { safiCars } from './safi/cars';

const RENT_GUIDES: Record<string, CityGuide> = {
    casablanca: casablancaRent,
    rabat: rabatRent,
    marrakech: marrakechRent,
    tanger: tangerRent,
    agadir: agadirRent,
    fes: fesRent,
    meknes: meknesRent,
    oujda: oujdaRent,
    'kelaat-sraghna': kelaatSraghnaRent,
    'beni-mellal': beniMellalRent,
    'tetouan': tetouanRent,
    'kenitra': kenitaRent,
    'safi': safiRent
};

const CAR_GUIDES: Record<string, CityGuide> = {
    casablanca: casablancaCars,
    rabat: rabatCars,
    marrakech: marrakechCars,
    tanger: tangerCars,
    agadir: agadirCars,
    fes: fesCars,
    meknes: meknesCars,
    oujda: oujdaCars,
    'kelaat-sraghna': kelaatSraghnaCars,
    'beni-mellal': beniMellalCars,
    'tetouan': tetouanCars,
    'kenitra': kenitaraCars,
    'safi': safiCars
};

export function getCityRentGuide(citySlug: string): CityGuide | null {
    const normalized = citySlug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return RENT_GUIDES[normalized] || null;
}

export function getCityCarGuide(citySlug: string): CityGuide | null {
    const normalized = citySlug.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return CAR_GUIDES[normalized] || null;
}
