CREATE TABLE IF NOT EXISTS signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  postcode TEXT NOT NULL,
  phone TEXT,
  resident TEXT NOT NULL DEFAULT 'yes',
  whatsapp INTEGER NOT NULL DEFAULT 0,
  consent_timestamp TEXT NOT NULL,
  consent_ip TEXT NOT NULL,
  confirmed INTEGER NOT NULL DEFAULT 0,
  confirm_token TEXT NOT NULL,
  delete_token TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_signatures_email ON signatures(email);
CREATE INDEX IF NOT EXISTS idx_signatures_confirmed ON signatures(confirmed);
CREATE INDEX IF NOT EXISTS idx_signatures_postcode ON signatures(postcode);
