const nodemailer = require('nodemailer');

const createTransporter = async () => {
  // Prefer explicit SMTP config via env.
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  // Fallback: let nodemailer try system sendmail if available.
  return nodemailer.createTransport({ sendmail: true, newline: 'unix', path: '/usr/sbin/sendmail' });
};

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  if (!to) throw new Error('Missing recipient email');
  if (!resetUrl) throw new Error('Missing resetUrl');

  const from = process.env.EMAIL_FROM || 'no-reply@prepai.local';
  const appName = process.env.APP_NAME || 'PrepAI';

  const subject = `${appName} password reset`;
  const text =
    `Hello${name ? ` ${name}` : ''},\n\n` +
    `We received a request to reset your password.\n` +
    `Reset link (valid for 1 hour):\n${resetUrl}\n\n` +
    `If you didn’t request this, you can ignore this email.\n`;

  const html =
    `<p>Hello${name ? ` ${name}` : ''},</p>` +
    `<p>We received a request to reset your password.</p>` +
    `<p><a href="${resetUrl}">Click here to reset your password</a> (valid for 1 hour)</p>` +
    `<p>If you didn’t request this, you can ignore this email.</p>`;

  const transporter = await createTransporter();

  // If SMTP isn't configured and sendmail isn't available on Windows,
  // this will throw and the controller will return devResetUrl.
  await transporter.sendMail({ from, to, subject, text, html });
}

module.exports = { sendPasswordResetEmail };

