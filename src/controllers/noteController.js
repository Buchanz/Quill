const noteModel = require('../models/noteModel');
const { parseId, validateNote } = require('../utils/validation');

function listNotes(req, res) {
  return res.json({ notes: noteModel.getNotesByUser(req.user.id) });
}

function getNote(req, res) {
  const noteId = parseId(req.params.id);
  if (!noteId) return res.status(400).json({ error: 'Note id must be a positive number.' });

  const note = noteModel.getNoteById(req.user.id, noteId);
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  return res.json({ note });
}

function createNote(req, res) {
  const { errors, title, content } = validateNote(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const note = noteModel.createNote(req.user.id, { title, content });
  return res.status(201).json({ note });
}

function updateNote(req, res) {
  const noteId = parseId(req.params.id);
  if (!noteId) return res.status(400).json({ error: 'Note id must be a positive number.' });

  const { errors, title, content } = validateNote(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const note = noteModel.updateNote(req.user.id, noteId, { title, content });
  if (!note) return res.status(404).json({ error: 'Note not found.' });

  return res.json({ note });
}

function deleteNote(req, res) {
  const noteId = parseId(req.params.id);
  if (!noteId) return res.status(400).json({ error: 'Note id must be a positive number.' });

  if (!noteModel.deleteNote(req.user.id, noteId)) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  return res.status(204).send();
}

module.exports = {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
};
