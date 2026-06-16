const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const testDb = path.join(os.tmpdir(), `notes-app-${Date.now()}-${Math.random()}.sqlite`);
process.env.DATABASE_PATH = testDb;

const noteModel = require('../src/models/noteModel');
const { createUser, findUserByUsername, verifyPassword } = require('../src/models/userModel');
const { createSession, findSessionWithUser } = require('../src/models/sessionModel');
const { validateCredentials, validateNote } = require('../src/utils/validation');

let user;

describe('Note-Taking App data layer', () => {
  it('validates credentials and note input', () => {
    assert.equal(validateCredentials({ username: 'ab', password: '123' }).errors.length, 2);
    assert.equal(validateCredentials({ username: 'Student_1', password: 'secret123' }).errors.length, 0);
    assert.equal(validateNote({ title: '', content: '' }).errors.length, 2);
    assert.equal(validateNote({ title: 'Class', content: 'REST API notes' }).errors.length, 0);
  });

  it('creates users with hashed passwords', () => {
    user = createUser({ username: 'Student_1', password: 'secret123' });
    const storedUser = findUserByUsername('student_1');

    assert.equal(user.username, 'student_1');
    assert.notEqual(storedUser.password_hash, 'secret123');
    assert.equal(verifyPassword('secret123', storedUser.password_hash), true);
    assert.equal(verifyPassword('wrong-password', storedUser.password_hash), false);
  });

  it('creates and reads sessions', () => {
    const session = createSession(user.id);
    const savedSession = findSessionWithUser(session.token);

    assert.equal(savedSession.username, user.username);
    assert.equal(savedSession.id, user.id);
  });

  it('creates, lists, updates, and deletes notes by user', () => {
    const note = noteModel.createNote(user.id, {
      title: 'Midterm Plan',
      content: 'Finish the Express project.',
    });

    assert.equal(note.title, 'Midterm Plan');
    assert.equal(noteModel.getNotesByUser(user.id).length, 1);

    const updated = noteModel.updateNote(user.id, note.id, {
      title: 'Updated Plan',
      content: 'Add validation and README.',
    });

    assert.equal(updated.content, 'Add validation and README.');
    assert.equal(noteModel.deleteNote(user.id, note.id), true);
    assert.equal(noteModel.getNotesByUser(user.id).length, 0);
  });

  it('prevents one user from reading another user note', () => {
    const owner = createUser({ username: 'owner', password: 'secret123' });
    const other = createUser({ username: 'other', password: 'secret123' });
    const privateNote = noteModel.createNote(owner.id, {
      title: 'Private',
      content: 'Only the owner can read this.',
    });

    assert.equal(noteModel.getNoteById(other.id, privateNote.id), null);
  });
});

process.on('exit', () => {
  fs.rmSync(testDb, { force: true });
});
