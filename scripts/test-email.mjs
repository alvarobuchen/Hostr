// Quick SMTP check — run:  node scripts/test-email.mjs
// Loads .env.local, verifies the connection, and sends one test email
// to CONTACT_NOTIFY_TO so you can confirm it lands in your inbox.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import nodemailer from 'nodemailer';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env.local parser (KEY="value")
const env = {};
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m && !line.trim().startsWith('#')) env[m[1]] = m[2];
}

const to = env.CONTACT_NOTIFY_TO || env.OWNER_EMAIL || env.EMAIL_USER;

if (!env.EMAIL_PASSWORD || env.EMAIL_PASSWORD.includes('PASTE_YOUR')) {
  console.error('\n✗ EMAIL_PASSWORD is still the placeholder. Paste your Gmail App Password into .env.local first.\n');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: parseInt(env.EMAIL_PORT || '465', 10),
  secure: env.EMAIL_SECURE === 'true',
  auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
});

try {
  console.log(`\nConnecting to ${env.EMAIL_HOST}:${env.EMAIL_PORT} as ${env.EMAIL_USER} …`);
  await transporter.verify();
  console.log('✓ SMTP auth OK');

  const info = await transporter.sendMail({
    from: env.EMAIL_FROM || env.EMAIL_USER,
    to,
    subject: 'Cenit — test email ✅',
    text: 'If you can read this in your inbox, contact-form notifications are working.',
  });
  console.log(`✓ Test email sent to ${to}  (id: ${info.messageId})`);
  console.log('\nCheck that inbox (and Spam, just in case). You are done.\n');
} catch (err) {
  console.error('\n✗ Failed:', err.message);
  console.error('Common causes: wrong App Password, spaces left in it, or 2-Step Verification not enabled.\n');
  process.exit(1);
}
