const crypto = require('node:crypto');
const db = require('../config/database');

const scryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64, scryptOptions).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(':');
  const testHash = crypto.scryptSync(password, salt, 64, scryptOptions);
  const originalBuffer = Buffer.from(originalHash, 'hex');
  return originalBuffer.length === testHash.length && crypto.timingSafeEqual(originalBuffer, testHash);
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
  };
}

function createUser({ username, password }) {
  const normalizedUsername = normalizeUsername(username);
  const passwordHash = hashPassword(password);

  const result = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(normalizedUsername, passwordHash);

  return findUserById(result.lastInsertRowid);
}

function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(normalizeUsername(username));
}

function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

module.exports = {
  createUser,
  findUserById,
  findUserByUsername,
  normalizeUsername,
  publicUser,
  verifyPassword,
};
