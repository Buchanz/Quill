function notFound(req, res) {
  res.status(404).json({ error: 'The requested endpoint was not found.' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'That username is already taken.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Something went wrong on the server.' });
}

module.exports = {
  errorHandler,
  notFound,
};
