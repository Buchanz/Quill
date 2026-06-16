const db = require('../config/database');

function serializeNote(note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  };
}

function getNotesByUser(userId) {
  return db
    .prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC, id DESC')
    .all(userId)
    .map(serializeNote);
}

function getNoteById(userId, noteId) {
  const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(noteId, userId);
  return note ? serializeNote(note) : null;
}

function createNote(userId, { title, content }) {
  const result = db
    .prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)')
    .run(userId, title, content);

  return getNoteById(userId, result.lastInsertRowid);
}

function updateNote(userId, noteId, { title, content }) {
  const result = db
    .prepare(
      `UPDATE notes
       SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
    )
    .run(title, content, noteId, userId);

  return result.changes ? getNoteById(userId, noteId) : null;
}

function deleteNote(userId, noteId) {
  const result = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(noteId, userId);
  return result.changes > 0;
}

module.exports = {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByUser,
  updateNote,
};
