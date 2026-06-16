function validateCredentials(body) {
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const errors = [];

  if (username.length < 3 || username.length > 32) {
    errors.push('Username must be between 3 and 32 characters.');
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, periods, and hyphens.');
  }

  if (password.length < 6 || password.length > 100) {
    errors.push('Password must be between 6 and 100 characters.');
  }

  return { errors, username, password };
}

function validateNote(body) {
  const title = String(body.title || '').trim();
  const content = String(body.content || '').trim();
  const errors = [];

  if (title.length < 1 || title.length > 120) {
    errors.push('Title is required and must be 120 characters or fewer.');
  }

  if (content.length < 1 || content.length > 5000) {
    errors.push('Content is required and must be 5000 characters or fewer.');
  }

  return { errors, title, content };
}

function parseId(id) {
  const parsedId = Number(id);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
}

module.exports = {
  parseId,
  validateCredentials,
  validateNote,
};
