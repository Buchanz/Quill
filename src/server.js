const express = require('express');
const path = require('node:path');
const authController = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const requireAuth = require('./middleware/auth');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const publicDir = path.join(__dirname, '..', 'public');

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.get('/api/users', requireAuth, authController.users);
app.use('/api/notes', noteRoutes);

app.use('/api', notFound);
app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.use(errorHandler);

app.listen(PORT, HOST, () => {
  console.log('Quill is running at http://localhost:' + PORT);
});
