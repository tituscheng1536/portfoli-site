require('dotenv').config();
const crypto = require('crypto');
const path = require('path');
const express = require('express');
const { appendLead, readLeads } = require('./db');
const { sendNotification } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landingpage', 'index.html'));
});

app.use(express.static(__dirname, { index: 'index.html' }));

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/leads', async (req, res) => {
  const { name, email, company, plan, message, website } = req.body || {};

  // Honeypot: real users never fill this hidden field. Pretend success so
  // bots don't learn to detect and route around the check.
  if (website) {
    return res.json({ ok: true });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'A valid email is required.' });
  }

  const lead = {
    id: crypto.randomUUID(),
    name: String(name || '').trim().slice(0, 200),
    email: String(email).trim().slice(0, 320),
    company: String(company || '').trim().slice(0, 200),
    plan: String(plan || 'General').trim().slice(0, 100),
    message: String(message || '').trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };

  try {
    appendLead(lead);
  } catch (err) {
    console.error('Failed to store lead:', err);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' });
  }

  sendNotification(lead).catch((err) => console.error('Failed to send notification email:', err));

  res.json({ ok: true });
});

app.get('/api/leads', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  res.json({ ok: true, leads: readLeads() });
});

app.listen(PORT, () => {
  console.log(`Portfoli server listening on http://localhost:${PORT}`);
});
