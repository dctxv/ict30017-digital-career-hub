/**
 * Email service — sends transactional emails via nodemailer.
 *
 * Three modes, decided by the environment (see emailMode()):
 *
 *   smtp     SMTP_HOST is set. Mail is sent.
 *   console  EMAIL_TRANSPORT=console outside production. Nothing is sent; each
 *            message is printed to the server log, so the verification and
 *            login-code flows can be exercised locally without a mail account.
 *   off      Neither. Nothing can reach the user's inbox.
 *
 * The auth routes read emailChecksEnabled() to decide whether email
 * verification and the emailed login code apply. With no way to deliver a
 * code, requiring one would lock every user out, which is what happened when
 * the two-step login first shipped to a deployment with no SMTP configured.
 */
import nodemailer from 'nodemailer';

export function emailMode() {
  if (process.env.SMTP_HOST) return 'smtp';
  if (process.env.EMAIL_TRANSPORT === 'console' && process.env.NODE_ENV !== 'production') {
    return 'console';
  }
  return 'off';
}

/**
 * Whether email verification at signup and the emailed login code are in force.
 * True whenever a message can actually reach the user (or the developer's log).
 */
export function emailChecksEnabled() {
  return emailMode() !== 'off';
}

/**
 * Where links in emails point. CLIENT_ORIGIN is the documented name; CLIENT_URL
 * is what the OAuth routes read, so either is honoured. On Vercel the client and
 * server share the production domain, which is the right default there.
 */
export function clientOrigin() {
  const configured = process.env.CLIENT_ORIGIN || process.env.CLIENT_URL;
  if (configured) return configured.replace(/\/+$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:5173';
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? '587', 10),
    secure: SMTP_PORT === '465',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/**
 * Sends one message. Throws when SMTP is configured and the send fails, so a
 * caller that needs the message to arrive (the login code) can say so.
 */
async function send({ to, subject, text, html }) {
  const mode = emailMode();

  if (mode === 'console') {
    console.log(`[email] (console transport) to=${to} subject="${subject}"\n${text}\n`);
    return;
  }

  if (mode === 'off') {
    console.log(`[email] Not sent, no SMTP configured: to=${to} subject="${subject}"`);
    return;
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

export async function sendVerificationEmail(to, fullName, verifyUrl) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';
  await send({
    to,
    subject: 'Verify your Digital Career Hub email',
    text: `${greeting}\n\nOpen this link to verify your email address. It expires in 24 hours.\n\n${verifyUrl}\n`,
    html: `<p>${escapeHtml(greeting)}</p>
           <p>Open the link below to verify your email address. It expires in 24 hours.</p>
           <p><a href="${escapeHtml(verifyUrl)}">${escapeHtml(verifyUrl)}</a></p>`,
  });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  await send({
    to,
    subject: 'Reset your Digital Career Hub password',
    text: `Open this link to reset your password. It expires in 30 minutes.\n\n${resetUrl}\n\nIf you did not request this, ignore this email.\n`,
    html: `<p>Open the link below to reset your password. It expires in 30 minutes.</p>
           <p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p>
           <p>If you did not request this, ignore this email.</p>`,
  });
}

export async function sendOtpEmail(to, otp) {
  await send({
    to,
    subject: 'Your Digital Career Hub login code',
    text: `Your one-time login code is: ${otp}\n\nIt expires in 10 minutes. Do not share it with anyone.\n`,
    html: `<p>Your one-time login code is: <strong>${escapeHtml(otp)}</strong></p>
           <p>It expires in 10 minutes. Do not share it with anyone.</p>`,
  });
}
