const crypto = require('node:crypto');
const db = require('../config/database');
const SESSION_DAYS = 7;
function createSession(userId) { const token = crypto.randomBytes(32).toString('hex'); const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString(); db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt); return { token, expiresAt }; }
function findSessionWithUser(token) { if (!token) return null; return db.prepare(`SELECT sessions.token, sessions.expires_at, users.id, users.username, users.email, users.created_at FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ? AND sessions.expires_at > datetime('now')`).get(token); }
function deleteSession(token) { if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token); }
function deleteExpiredSessions() { db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run(); }
module.exports = { createSession, deleteExpiredSessions, deleteSession, findSessionWithUser };
