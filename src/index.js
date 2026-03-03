#!/usr/bin/env node

import { program } from 'commander';
import { botCommand } from './commands/bot.js';
import { paymentWatchCommand } from './commands/payment-watch.js';

program
  .name('us-visa-bot')
  .description('Automated US visa appointment rescheduling bot')
  .version('0.0.1');

program
  .command('bot')
  .description('Monitor and reschedule visa appointments')
  .requiredOption('-c, --current <date>', 'current booked date')
  .option('-t, --target <date>', 'target date to stop at')
  .option('-m, --min <date>', 'minimum date acceptable')
  .option('--dry-run', 'only log what would be booked without actually booking')
  .action(botCommand);

program
  .command('payment-watch')
  .description('Monitor the payment page for available appointment slots')
  .option('-d, --delay <seconds>', 'seconds between checks (default: PAYMENT_CHECK_DELAY or 600)')
  .action(paymentWatchCommand);

program.parse();
