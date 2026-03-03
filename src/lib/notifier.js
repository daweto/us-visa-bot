import { exec } from 'child_process';
import nodemailer from 'nodemailer';
import { log } from './utils.js';

export async function notify(subject, body, config) {
  const results = await Promise.allSettled([
    macosNotification(subject, body),
    playSound(),
    sendEmail(subject, body, config),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      log(`Notification error: ${result.reason.message}`);
    }
  }
}

function macosNotification(title, body) {
  return new Promise((resolve, reject) => {
    const escaped = (s) => s.replace(/"/g, '\\"');
    const cmd = `osascript -e 'display notification "${escaped(body)}" with title "${escaped(title)}" sound name "Glass"'`;
    exec(cmd, (err) => (err ? reject(err) : resolve()));
  });
}

function playSound() {
  return new Promise((resolve, reject) => {
    exec('afplay /System/Library/Sounds/Glass.aiff', (err) => (err ? reject(err) : resolve()));
  });
}

async function sendEmail(subject, body, config) {
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass || !config.notifyEmail) {
    log('SMTP not configured, skipping email notification');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  await transporter.sendMail({
    from: config.smtpFrom || config.smtpUser,
    to: config.notifyEmail,
    subject,
    text: body,
  });

  log('Email notification sent');
}
