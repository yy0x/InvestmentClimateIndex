import 'dotenv/config';
import { listAlerts, updateAlertSignal } from './db.js';
import { loadIndex, signalFromScore, whatChanged } from './utils.js';

const sendTelegram = async (chatId, message) => {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
};

const sendEmail = async (to, subject, html) => {
  if (!process.env.MAILER_URL) return;
  await fetch(process.env.MAILER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
};

const main = async () => {
  const payload = loadIndex();
  if (!payload) return;
  const signal = signalFromScore(payload.score || 0);
  const changes = whatChanged(payload);
  const alerts = listAlerts();

  for (const alert of alerts) {
    if (alert.last_signal === signal) continue;
    const message = `ICI.ndex Daily Signal: ${signal}\nTop positive: ${changes.topPositive || '--'}\nTop negative: ${changes.topNegative || '--'}\nBiggest move: ${changes.biggestMove || '--'}`;
    if (alert.telegram_chat_id) await sendTelegram(alert.telegram_chat_id, message);
    if (alert.email) await sendEmail(alert.email, `ICI.ndex Signal: ${signal}`, `<p>${message.replace(/\n/g, '<br>')}</p>`);
    updateAlertSignal(alert.id, signal);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
