import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'server', 'data.sqlite');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_hash TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'pro',
    status TEXT NOT NULL DEFAULT 'active',
    email TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER NOT NULL,
    email TEXT,
    telegram_chat_id TEXT,
    last_signal TEXT,
    last_sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(api_key_id) REFERENCES api_keys(id)
  );
`);

export const getKeyByHash = (hash) =>
  db.prepare('SELECT * FROM api_keys WHERE key_hash = ?').get(hash);

export const insertKey = (record) =>
  db.prepare(`
    INSERT INTO api_keys (key_hash, plan, status, email, stripe_customer_id, stripe_subscription_id)
    VALUES (@key_hash, @plan, @status, @email, @stripe_customer_id, @stripe_subscription_id)
  `).run(record);

export const updateKeySubscription = (stripe_customer_id, stripe_subscription_id, status = 'active') =>
  db.prepare(`
    UPDATE api_keys
    SET stripe_subscription_id = ?, status = ?
    WHERE stripe_customer_id = ?
  `).run(stripe_subscription_id, status, stripe_customer_id);

export const addAlert = ({ api_key_id, email, telegram_chat_id }) =>
  db.prepare(`
    INSERT INTO alerts (api_key_id, email, telegram_chat_id)
    VALUES (?, ?, ?)
  `).run(api_key_id, email, telegram_chat_id);

export const listAlerts = () =>
  db.prepare(`
    SELECT alerts.*, api_keys.email as key_email
    FROM alerts
    JOIN api_keys ON api_keys.id = alerts.api_key_id
  `).all();

export const updateAlertSignal = (id, signal) =>
  db.prepare(`
    UPDATE alerts
    SET last_signal = ?, last_sent_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(signal, id);
