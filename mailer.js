const RESEND_API_URL = 'https://api.resend.com/emails';

// Uses Resend's HTTP API (not SMTP) because Render's free tier blocks
// outbound traffic on SMTP ports 25/465/587.
async function sendNotification(lead) {
  const { RESEND_API_KEY, NOTIFY_EMAIL } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) return;

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev',
      to: NOTIFY_EMAIL,
      subject: `New Portfoli lead: ${lead.email}`,
      text: JSON.stringify(lead, null, 2),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error ${res.status}: ${await res.text()}`);
  }
}

module.exports = { sendNotification };
