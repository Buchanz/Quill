const db = require('../config/database');
const { findUserByUsername, publicUser } = require('./userModel');

function serializeNote(note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    ownerId: note.user_id,
    access: note.access || 'owner',
    collaboratorCount: Number(note.collaborator_count || 0),
    ownerUsername: note.owner_username,
    ownerColor: note.owner_color || '#9b75e8',
    ownerStatus: note.owner_status || 'Away',
    createdAt: note.created_at,
    updatedAt: note.updated_at
  };
}

function getNotesByUser(userId) {
  return db.prepare(`
    SELECT notes.*,
      CASE WHEN notes.user_id = ? THEN 'owner' ELSE 'editor' END AS access,
      COUNT(DISTINCT all_collaborators.user_id) AS collaborator_count,
      owner.username AS owner_username,
      owner.profile_color AS owner_color,
      owner.status AS owner_status
    FROM notes
    JOIN users owner ON owner.id = notes.user_id
    LEFT JOIN note_collaborators membership ON membership.note_id = notes.id AND membership.user_id = ?
    LEFT JOIN note_collaborators all_collaborators ON all_collaborators.note_id = notes.id
    WHERE notes.user_id = ? OR membership.user_id IS NOT NULL
    GROUP BY notes.id
    ORDER BY notes.updated_at DESC, notes.id DESC
  `).all(userId, userId, userId).map(serializeNote);
}

function getNoteById(userId, noteId) {
  const note = db.prepare(`
    SELECT notes.*,
      CASE WHEN notes.user_id = ? THEN 'owner' ELSE 'editor' END AS access,
      (SELECT COUNT(*) FROM note_collaborators counts WHERE counts.note_id = notes.id) AS collaborator_count,
      owner.username AS owner_username,
      owner.profile_color AS owner_color,
      owner.status AS owner_status
    FROM notes
    JOIN users owner ON owner.id = notes.user_id
    LEFT JOIN note_collaborators membership ON membership.note_id = notes.id AND membership.user_id = ?
    WHERE notes.id = ? AND (notes.user_id = ? OR membership.user_id IS NOT NULL)
  `).get(userId, userId, noteId, userId);
  return note ? serializeNote(note) : null;
}

function createNote(userId, { title, content }) {
  const result = db.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)').run(userId, title, content);
  return getNoteById(userId, result.lastInsertRowid);
}

function updateNote(userId, noteId, { title, content }) {
  const allowed = getNoteById(userId, noteId);
  if (!allowed) return null;
  db.prepare('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, content, noteId);
  return getNoteById(userId, noteId);
}

function deleteNote(userId, noteId) {
  return db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(noteId, userId).changes > 0;
}

function getCollaborators(userId, noteId) {
  const accessible = getNoteById(userId, noteId);
  if (!accessible) return null;
  return db.prepare(`
    SELECT users.*, CASE WHEN users.id = notes.user_id THEN 'owner' ELSE 'editor' END AS role
    FROM notes
    JOIN users ON users.id = notes.user_id
    WHERE notes.id = ?
    UNION ALL
    SELECT users.*, 'editor' AS role
    FROM users
    JOIN note_collaborators ON note_collaborators.user_id = users.id
    WHERE note_collaborators.note_id = ?
    ORDER BY role DESC, username
  `).all(noteId, noteId).map((user) => ({ ...publicUser(user), role: user.role }));
}

function shareNote(ownerId, noteId, username) {
  const owned = db.prepare('SELECT user_id FROM notes WHERE id = ? AND user_id = ?').get(noteId, ownerId);
  if (!owned) return { error: 'Only the owner can share this item.', status: 403 };
  const user = findUserByUsername(username);
  if (!user) return { error: 'No registered user has that username.', status: 404 };
  if (user.id === ownerId) return { error: 'You already own this item.', status: 400 };
  db.prepare('INSERT OR IGNORE INTO note_collaborators (note_id, user_id) VALUES (?, ?)').run(noteId, user.id);
  return { user: publicUser(user) };
}

module.exports = {
  createNote,
  deleteNote,
  getCollaborators,
  getNoteById,
  getNotesByUser,
  shareNote,
  updateNote
};
