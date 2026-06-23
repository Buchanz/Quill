const crypto = require('node:crypto');
const db = require('../config/database');
const scryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const profileColors = ['#9b75e8', '#4f7ddf', '#2f9c95', '#65a95b', '#d5a72e', '#d97745', '#c95665'];
function normalizeUsername(username) { return String(username || '').trim().toLowerCase(); }
function normalizeEmail(email) { const value = String(email || '').trim().toLowerCase(); return value || null; }
function hashPassword(password) { const salt = crypto.randomBytes(16).toString('hex'); const hash = crypto.scryptSync(password, salt, 64, scryptOptions).toString('hex'); return salt + ':' + hash; }
function verifyPassword(password, storedHash) { const [salt, originalHash] = storedHash.split(':'); const testHash = crypto.scryptSync(password, salt, 64, scryptOptions); const originalBuffer = Buffer.from(originalHash, 'hex'); return originalBuffer.length === testHash.length && crypto.timingSafeEqual(originalBuffer, testHash); }
function publicUser(user) { return { id: user.id, username: user.username, email: user.email || null, profileColor: user.profile_color || profileColors[0], status: user.status || 'Away', theme: user.theme || 'dark', createdAt: user.created_at }; }
function createUser({ username, email, password }) { const nextId = db.prepare("SELECT seq + 1 AS id FROM sqlite_sequence WHERE name = 'users'").get()?.id || 1; const color = profileColors[(nextId - 1) % profileColors.length]; const result = db.prepare('INSERT INTO users (username, email, password_hash, profile_color) VALUES (?, ?, ?, ?)').run(normalizeUsername(username), normalizeEmail(email), hashPassword(password), color); return findUserById(result.lastInsertRowid); }
function findUserByUsername(username) { return db.prepare('SELECT * FROM users WHERE username = ?').get(normalizeUsername(username)); }
function findUserByEmail(email) { return db.prepare('SELECT * FROM users WHERE email = ?').get(normalizeEmail(email)); }
function findUserById(id) { return db.prepare('SELECT * FROM users WHERE id = ?').get(id); }
function isProfileColorAvailable(userId, color) {
  return !db.prepare(`
    WITH shared_notes AS (
      SELECT id AS note_id FROM notes WHERE user_id = ?
      UNION SELECT note_id FROM note_collaborators WHERE user_id = ?
    ), participants AS (
      SELECT notes.id AS note_id, notes.user_id FROM notes JOIN shared_notes ON shared_notes.note_id = notes.id
      UNION ALL SELECT note_collaborators.note_id, note_collaborators.user_id FROM note_collaborators JOIN shared_notes ON shared_notes.note_id = note_collaborators.note_id
    )
    SELECT 1 FROM participants JOIN users ON users.id = participants.user_id
    WHERE participants.user_id != ? AND users.profile_color = ? LIMIT 1
  `).get(userId, userId, userId, color);
}
function searchPublicUsers(query, excludeId, limit = 8) {
  const normalizedQuery = normalizeUsername(query);
  if (!normalizedQuery) return [];
  return db.prepare(`
    SELECT username
    FROM users
    WHERE id != ? AND substr(username, 1, length(?)) = ?
    ORDER BY CASE WHEN username = ? THEN 0 ELSE 1 END, username
    LIMIT ?
  `).all(excludeId, normalizedQuery, normalizedQuery, normalizedQuery, limit);
}
function updateProfile(id, { username, email, profileColor, status, theme }) { db.prepare('UPDATE users SET username = ?, email = ?, profile_color = ?, status = ?, theme = ? WHERE id = ?').run(normalizeUsername(username), normalizeEmail(email), profileColor, status, theme, id); return findUserById(id); }
module.exports = { createUser, findUserByEmail, findUserById, findUserByUsername, isProfileColorAvailable, normalizeEmail, normalizeUsername, publicUser, searchPublicUsers, updateProfile, verifyPassword };
