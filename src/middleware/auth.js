const { findSessionWithUser } = require('../models/sessionModel');
const { publicUser } = require('../models/userModel');

function getBearerToken(header) {
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req.get('Authorization'));
  const session = findSessionWithUser(token);

  if (!session) {
    return res.status(401).json({ error: 'You must be logged in to access this resource.' });
  }

  req.authToken = token;
  req.user = publicUser(session);
  return next();
}

module.exports = requireAuth;
