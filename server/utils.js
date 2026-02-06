import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const hashKey = (key) =>
  crypto.createHash('sha256').update(key).digest('hex');

export const generateKey = () =>
  `ici_${crypto.randomBytes(24).toString('hex')}`;

export const loadIndex = () => {
  const filePath = path.join(process.cwd(), 'index.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

export const signalFromScore = (score) => {
  if (score >= 70) return 'Green';
  if (score >= 45) return 'Yellow';
  return 'Red';
};

export const whatChanged = (payload) => {
  const positive = payload.drivers?.positive?.[0];
  const negative = payload.drivers?.negative?.[0];
  const posTitle = typeof positive === 'string' ? positive : positive?.title;
  const negTitle = typeof negative === 'string' ? negative : negative?.title;

  let biggest = null;
  if (Array.isArray(payload.categories) && payload.categories.length) {
    biggest = payload.categories.reduce((acc, item) => {
      const current = Math.abs(item.change || 0);
      return current > Math.abs(acc.change || 0) ? item : acc;
    }, payload.categories[0]);
  }

  return {
    topPositive: posTitle || null,
    topNegative: negTitle || null,
    biggestMove: biggest
      ? `${biggest.name} ${(biggest.change || 0) >= 0 ? '+' : ''}${(biggest.change || 0).toFixed(1)}`
      : null
  };
};
