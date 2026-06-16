const { createSession, deleteExpiredSessions, deleteSession } = require('../models/sessionModel');
const { createUser, findUserByUsername, publicUser, verifyPassword } = require('../models/userModel');
const { validateCredentials } = require('../utils/validation');

function sendAuthResponse(res, user) {
  const session = createSession(user.id);
  return res.status(200).json({
    user: publicUser(user),
    token: session.token,
    expiresAt: session.expiresAt,
  });
}

function register(req, res, next) {
  try {
    const { errors, username, password } = validateCredentials(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });

    const user = createUser({ username, password });
    return sendAuthResponse(res, user);
  } catch (err) {
    return next(err);
  }
}

function login(req, res, next) {
  try {
    deleteExpiredSessions();
    const { errors, username, password } = validateCredentials(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });

    const user = findUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    return sendAuthResponse(res, user);
  } catch (err) {
    return next(err);
  }
}

function logout(req, res) {
  deleteSession(req.authToken);
  return res.status(204).send();
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  login,
  logout,
  me,
  register,
};
