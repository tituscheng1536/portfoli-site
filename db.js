const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '');
}

// Appended as newline-delimited JSON so concurrent requests can't corrupt
// each other's writes the way a read-modify-write to a single JSON array would.
function appendLead(lead) {
  ensureStore();
  fs.appendFileSync(LEADS_FILE, JSON.stringify(lead) + '\n');
}

function readLeads() {
  ensureStore();
  return fs
    .readFileSync(LEADS_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

module.exports = { appendLead, readLeads };
