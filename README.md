# US Visa Bot 🤖

An automated bot that monitors and reschedules US visa interview appointments to get you an earlier date.

## Features

- 🔄 Continuously monitors available appointment slots
- 📅 Automatically books earlier dates when found
- 🎯 Configurable target and minimum date constraints
- 🚨 Exits successfully when target date is reached
- 📊 Detailed logging with timestamps
- 🔐 Secure authentication with environment variables
- 🧪 **Dry-run mode** — test the bot without actually booking
- 💳 **Payment watch** — monitors the payment page for slot availability
- 🔔 **Notifications** — macOS alerts + optional email via SMTP
- 🔁 **Session recovery** — auto re-login on session expiry with debug HTML dumps

## How It Works

The bot logs into your account on https://ais.usvisa-info.com/ and checks for available appointment dates every few seconds. When it finds a date earlier than your current booking (and within your specified constraints), it automatically reschedules your appointment.

## Prerequisites

- Node.js 16+ 
- A valid US visa interview appointment
- Access to https://ais.usvisa-info.com/

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/us-visa-bot.git
cd us-visa-bot
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

### Required Variables (both commands)

| Variable | Description | How to Find |
|----------|-------------|-------------|
| `EMAIL` | Your login email | Your credentials for ais.usvisa-info.com |
| `PASSWORD` | Your login password | Your credentials for ais.usvisa-info.com |
| `COUNTRY_CODE` | Your country code | Found in URL: `https://ais.usvisa-info.com/en-{COUNTRY_CODE}/` <br>Examples: `cl` (Chile), `br` (Brazil), `fr` (France) |
| `SCHEDULE_ID` | Your appointment schedule ID | Found in URL when rescheduling: <br>`https://ais.usvisa-info.com/en-{COUNTRY_CODE}/niv/schedule/{SCHEDULE_ID}/continue_actions` |

### Bot-only Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FACILITY_ID` | Your consulate facility ID (found in network calls when selecting dates) | — |
| `REFRESH_DELAY` | Seconds between checks | `3` |

### Payment Watch / Notification Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PAYMENT_CHECK_DELAY` | Seconds between payment page checks | `600` (10 min) |
| `NOTIFY_EMAIL` | Email to receive slot notifications | — |
| `SMTP_HOST` | SMTP server hostname | — |
| `SMTP_PORT` | SMTP server port | — |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password (e.g. Gmail app password) | — |
| `SMTP_FROM` | Sender email address | — |

> SMTP variables are optional — if any are missing, email notifications are skipped silently.

## Usage

The CLI has two subcommands: `bot` and `payment-watch`.

### `bot` — Reschedule appointments

Monitors available dates and automatically books earlier ones.

```bash
node src/index.js bot -c <current_date> [options]
```

| Flag | Long Form | Required | Description |
|------|-----------|----------|-------------|
| `-c` | `--current` | ✅ | Your current booked interview date (YYYY-MM-DD) |
| `-t` | `--target` | ❌ | Target date to stop at — exits successfully when reached |
| `-m` | `--min` | ❌ | Minimum acceptable date — skips dates before this |
| | `--dry-run` | ❌ | Log what would be booked without actually booking |

### `payment-watch` — Monitor slot availability

Polls the visa payment page and sends notifications when appointment slots appear.

```bash
node src/index.js payment-watch [options]
```

| Flag | Long Form | Required | Description |
|------|-----------|----------|-------------|
| `-d` | `--delay` | ❌ | Seconds between checks (default: `PAYMENT_CHECK_DELAY` or 600) |

### Examples

```bash
# Basic usage - reschedule to any earlier date
node src/index.js bot -c 2025-08-15

# With target and minimum date constraints
node src/index.js bot -c 2025-08-15 -t 2025-06-01 -m 2025-04-01

# Dry run - see what would be booked without actually booking
node src/index.js bot -c 2025-08-15 --dry-run

# Monitor the payment page for slot availability
node src/index.js payment-watch

# Payment watch with custom delay (check every 5 minutes)
node src/index.js payment-watch --delay 300
```

## How It Behaves

### `bot`

1. **Log in** to your account using provided credentials
2. **Check** for available dates every few seconds
3. **Compare** found dates against your constraints:
   - Must be earlier than current date (`-c`)
   - Must be after minimum date (`-m`) if specified
   - Will exit successfully if target date (`-t`) is reached
4. **Book** the appointment automatically (or log it in `--dry-run` mode)
5. **Continue** monitoring until target is reached or manually stopped
6. **Recover** automatically on session expiry (up to 3 re-login attempts, then 1h cooldown)

### `payment-watch`

1. **Log in** and poll the visa payment page on a loop
2. **Detect** when the "no available appointments" message disappears
3. **Notify** you via macOS notification + sound, and optionally email

## Notifications

When `payment-watch` detects available slots, it sends:

- **macOS notification** with system sound (Glass)
- **Email** via SMTP (optional — configure `SMTP_*` and `NOTIFY_EMAIL` env vars)

To test your notification setup:

```bash
node test-notify.js
```

## Safety Features

- ✅ **Read-only until booking** — only books when better dates are found
- ✅ **Dry-run mode** — test the full flow without actually booking
- ✅ **Respects constraints** — won't book outside your specified date range
- ✅ **Graceful exit** — stops automatically when target is reached
- ✅ **Session recovery** — auto re-login on session expiry (3 retries, then 1h cooldown)
- ✅ **Debug dumps** — saves HTML responses to `debug/` on session errors for troubleshooting
- ✅ **Secure credentials** — uses environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.

## Disclaimer

This bot is for educational purposes. Use responsibly and in accordance with the terms of service of the visa appointment system. The authors are not responsible for any misuse or consequences.
