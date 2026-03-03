import * as cheerio from 'cheerio';
import { VisaHttpClient } from '../lib/client.js';
import { getConfig } from '../lib/config.js';
import { notify } from '../lib/notifier.js';
import { log, sleep, isSocketHangupError } from '../lib/utils.js';

const COOLDOWN = 3600; // 1 hour in seconds

export async function paymentWatchCommand(options) {
  const config = getConfig();
  const delay = options.delay ? Number(options.delay) : config.paymentCheckDelay;
  const client = new VisaHttpClient(config.countryCode, config.email, config.password);
  const paymentUrl = `https://ais.usvisa-info.com/en-${config.countryCode}/niv/schedule/${config.scheduleId}/payment`;

  log(`Starting payment-watch (checking every ${delay}s)`);
  log(`Payment page: ${paymentUrl}`);

  let sessionHeaders = null;
  let previousState = 'no-slots';

  while (true) {
    try {
      // Login if needed
      if (!sessionHeaders) {
        sessionHeaders = await client.login();
        log('Login successful');
      }

      // Fetch payment page
      const html = await client.fetchPaymentPage(sessionHeaders, config.scheduleId);

      // Detect session expiry — redirected to sign-in page
      if (html.includes('id="sign_in"') || html.includes('action="/en-')) {
        log('Session expired, re-logging in...');
        sessionHeaders = await client.login();
        log('Re-login successful');
        continue;
      }

      // Parse page content
      const $ = cheerio.load(html);
      const mainText = $('#main').text();
      const noSlots = mainText.includes('There are no available appointments at this time');

      if (noSlots) {
        log('No payment slots available');
        previousState = 'no-slots';
      } else if (previousState === 'no-slots') {
        // Slots just appeared!
        log('SLOTS AVAILABLE! Payment page is accessible!');
        previousState = 'slots-available';

        const subject = 'US Visa Payment Slots Available!';
        const body = `Appointment slots are now available on the payment page.\n\nGo pay now: ${paymentUrl}`;
        await notify(subject, body, config);
      } else {
        log('Slots still available');
      }

      await sleep(delay);
    } catch (err) {
      if (isSocketHangupError(err)) {
        log(`Network error: ${err.message}. Cooling down ${COOLDOWN}s...`);
        await sleep(COOLDOWN);
      } else {
        log(`Error: ${err.message}. Re-logging in...`);
        sessionHeaders = null;
      }
    }
  }
}
