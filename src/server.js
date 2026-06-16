console.log('Starting server.js...');
const express = require('express');
console.log('Express loaded successfully');
const path = require('node:path');
console.log('Loading database...');
require('./config/database');
console.log('Database loaded successfully');

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Note-Taking App' });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api', notFound);
app.use(errorHandler);

if (require.main === module) {
  const server = app.listen(port, () => {
    console.log('Server started successfully');
    console.log(`Note-Taking App running at http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
  });

  server.on('error', (error) => {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  });
}

module.exports = app;
