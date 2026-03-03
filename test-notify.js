import dotenv from 'dotenv';
import { getConfig } from './src/lib/config.js';
import { notify } from './src/lib/notifier.js';

dotenv.config();
const config = getConfig();

const paymentUrl = `https://ais.usvisa-info.com/en-${config.countryCode}/niv/schedule/${config.scheduleId}/payment`;

console.log('Simulating: slots just became available...\n');

await notify(
  'US VISA PAYMENT SLOTS AVAILABLE!',
  `Appointment slots are now available on the payment page.\n\nGo pay now: ${paymentUrl}`,
  config
);

console.log('\nDone! Check for:');
console.log('  - macOS notification banner');
console.log('  - Glass sound');
console.log('  - Email in your inbox');
