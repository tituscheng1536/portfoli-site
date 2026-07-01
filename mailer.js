const nodemailer = require('nodemailer');

let transporter;
let transporterInitialized = false;

function getTransporter() {
  if (transporterInitialized) return transporter;
  transporterInitialized = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

// No-op unless SMTP_* and NOTIFY_EMAIL are configured in .env.
async function sendNotification(lead) {
  const t = getTransporter();
  if (!t || !process.env.NOTIFY_EMAIL) return;

  await t.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL,
    subject: `New Portfoli lead: ${lead.email}`,
    text: JSON.stringify(lead, null, 2),
  });
}

module.exports = { sendNotification };
