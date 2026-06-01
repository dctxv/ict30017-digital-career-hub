/**
 * Module: emailService
 * Responsibility: Send transactional emails via Nodemailer.
 *
 * Provider support (configure via environment variables):
 *   SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS  → any SMTP server
 *   (Works with Gmail SMTP, Outlook, SendGrid SMTP relay, Mailgun SMTP,
 *    Resend SMTP, Amazon SES SMTP, Mailtrap for testing, etc.)
 *
 * Development fallback:
 *   If no SMTP credentials are set, tokens are logged to the console only.
 *   This lets the app run locally without an email account.
 *
 * Security:
 *   - SMTP credentials read from environment only — never hardcoded
 *   - Emails sent via TLS (secure: true for port 465, STARTTLS for 587)
 *   - No user-supplied content rendered as HTML without sanitisation
 *   - No email address is ever logged in production
 */

import nodemailer from 'nodemailer';

const isProduction = process.env.NODE_ENV === 'production';

// ── Transport factory ─────────────────────────────────────────────
function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    if (isProduction) {
      throw new Error(
        'Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.'
      );
    }
    // Development: return null — callers fall back to console logging
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,          // true for 465 (SSL), false for 587 (STARTTLS)
    auth: { user, pass },
    tls: {
      rejectUnauthorized: isProduction, // strict cert check in prod, relaxed in dev
    },
  });
}

const APP_NAME     = process.env.APP_NAME     || 'Digital Career Hub';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';
const FROM_ADDRESS = process.env.SMTP_FROM    || `"${APP_NAME}" <noreply@digitalcareerhub.app>`;

// ── Internal send helper ──────────────────────────────────────────
async function sendMail({ to, subject, html, text }) {
  const transport = createTransport();

  if (!transport) {
    // Dev-only fallback: print to console so developers can test without SMTP
    console.log(`\n[email] ─────── DEV EMAIL (not sent) ──────`);
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${text}`);
    console.log(`[email] ───────────────────────────────────\n`);
    return;
  }

  await transport.sendMail({
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    text, // plain-text fallback for email clients that don't render HTML
  });
}

// ── Email templates ───────────────────────────────────────────────

/**
 * Send a verification email after registration.
 * @param {string} toEmail  - Recipient email (normalised to lowercase)
 * @param {string} rawToken - The plain-text token to embed in the link
 */
export async function sendVerificationEmail(toEmail, rawToken) {
  const link = `${APP_BASE_URL}/verify-email?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(toEmail)}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <!-- Header -->
        <tr><td style="background:#1a7f5a;padding:28px 40px">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">${APP_NAME}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px">
          <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px">Verify your email address</h2>
          <p style="margin:0 0 20px;color:#444;line-height:1.6">
            Thanks for signing up! Click the button below to verify your email address
            and activate your account. The link expires in <strong>24 hours</strong>.
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="border-radius:6px;background:#1a7f5a">
              <a href="${link}"
                 style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px">
                Verify my email
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#888;font-size:13px;line-height:1.6">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${link}" style="color:#1a7f5a;word-break:break-all">${link}</a>
          </p>
          <p style="margin:16px 0 0;color:#888;font-size:13px">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #eee">
          <p style="margin:0;color:#aaa;font-size:12px">
            © ${new Date().getFullYear()} ${APP_NAME}. This is an automated message — please do not reply.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `
Verify your email — ${APP_NAME}

Click the link below to verify your email address and activate your account.
The link expires in 24 hours.

${link}

If you didn't create an account, ignore this email.
`.trim();

  await sendMail({ to: toEmail, subject: `Verify your email — ${APP_NAME}`, html, text });

  if (!isProduction) {
    console.log(`[email] Verification link for ${toEmail}:\n  ${link}`);
  }
}

/**
 * Send a password-reset email.
 * @param {string} toEmail  - Recipient email
 * @param {string} rawToken - The plain-text token to embed in the link
 */
export async function sendPasswordResetEmail(toEmail, rawToken) {
  const link = `${APP_BASE_URL}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(toEmail)}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr><td style="background:#1a7f5a;padding:28px 40px">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">${APP_NAME}</h1>
        </td></tr>
        <tr><td style="padding:36px 40px">
          <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px">Reset your password</h2>
          <p style="margin:0 0 20px;color:#444;line-height:1.6">
            We received a request to reset the password for your account.
            Click the button below to choose a new password. The link expires in <strong>30 minutes</strong>.
          </p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="border-radius:6px;background:#1a7f5a">
              <a href="${link}"
                 style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px">
                Reset my password
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#888;font-size:13px;line-height:1.6">
            If the button doesn't work, copy and paste this link:<br>
            <a href="${link}" style="color:#1a7f5a;word-break:break-all">${link}</a>
          </p>
          <p style="margin:16px 0 0;color:#888;font-size:13px">
            If you didn't request this, you can safely ignore this email.
            Your password will not change.
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #eee">
          <p style="margin:0;color:#aaa;font-size:12px">
            © ${new Date().getFullYear()} ${APP_NAME}. This is an automated message — please do not reply.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `
Reset your password — ${APP_NAME}

Click the link below to reset your password. It expires in 30 minutes.

${link}

If you didn't request a password reset, ignore this email.
`.trim();

  await sendMail({ to: toEmail, subject: `Reset your password — ${APP_NAME}`, html, text });

  if (!isProduction) {
    console.log(`[email] Password reset link for ${toEmail}:\n  ${link}`);
  }
}
