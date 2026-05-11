import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getAgenciesByCity } from './src/lib/rent-agencies/getAgenciesByCity';
async function test() {
    const agencies = await getAgenciesByCity('marrakech');
    console.log(JSON.stringify(agencies[0], null, 2));
}
test();
