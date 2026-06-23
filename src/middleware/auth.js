const { findSessionWithUser } = require('../models/sessionModel');
const { publicUser } = require('../models/userModel');
function getBearerToken(header) { if (!header || !header.startsWith('Bearer ')) return null; return header.slice('Bearer '.length).trim(); }
function requireAuth(req, res, next) { const session = findSessionWithUser(getBearerToken(req.get('Authorization'))); if (!session) return res.status(401).json({ error: 'You must be logged in to access this resource.' }); req.authToken = session.token; req.user = publicUser(session); return next(); }
module.exports = requireAuth;
