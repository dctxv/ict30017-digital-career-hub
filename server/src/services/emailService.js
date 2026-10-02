/**
 * Email service — sends transactional emails via nodemailer.
 * Falls back gracefully when SMTP is not configured so the app still runs
 * in development without an email provider.
 */
import nodemailer from 'nodemailer';

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST) {
    // No SMTP configured — log to console in dev, skip silently otherwise.
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? '587', 10),
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: {
      // Allow self-signed / chain certs in dev environments (e.g. corporate proxies).
      // Gmail's own cert is valid; this only matters when a local proxy intercepts TLS.
      rejectUnauthorized: false,
    },
  });
}

async function send({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[emailService] SMTP not configured — skipping email to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

export async function sendVerificationEmail(to, token) {
  const url = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/verify-email?token=${token}`;
  await send({
    to,
    subject: 'Verify your Digital Career Hub email',
    html: `<p>Click the link below to verify your email address. It expires in 24 hours.</p>
           <p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const url = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/reset-password?token=${token}`;
  await send({
    to,
    subject: 'Reset your Digital Career Hub password',
    html: `<p>Click the link below to reset your password. It expires in 1 hour.</p>
           <p><a href="${url}">${url}</a></p>
           <p>If you did not request this, ignore this email.</p>`,
  });
}

export async function sendOtpEmail(to, otp) {
  await send({
    to,
    subject: 'Your Digital Career Hub login code',
    html: `<p>Your one-time login code is: <strong>${otp}</strong></p>
           <p>It expires in 10 minutes. Do not share it with anyone.</p>`,
  });
}
