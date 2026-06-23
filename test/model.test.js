const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const testDb = path.join(os.tmpdir(), 'notes-app-' + Date.now() + '-' + Math.random() + '.sqlite');
process.env.DATABASE_PATH = testDb;
const noteModel = require('../src/models/noteModel');
const { createUser, findUserByUsername, isProfileColorAvailable, searchPublicUsers, verifyPassword } = require('../src/models/userModel');
const { createSession, findSessionWithUser } = require('../src/models/sessionModel');
const { validateCredentials, validateNote, validateRegistration } = require('../src/utils/validation');
let user;
describe('Quill data layer', () => {
  it('validates credentials and note input', () => {
    assert.equal(validateCredentials({ username: 'ab', password: '123' }).errors.length, 2);
    assert.equal(validateCredentials({ username: 'Student_1', password: 'secret123' }).errors.length, 0);
    assert.equal(validateCredentials({ username: 'Student_2', password: 'symbols!ok' }).errors.length, 0);
    assert.equal(validateCredentials({ username: 'Student_2', password: 'spaces not allowed' }).errors.includes('Password cannot contain spaces.'), true);
    assert.equal(validateRegistration({ username: 'Student_2', email: 'student@example.com', password: 'symbols!ok', confirmPassword: 'different' }).errors.includes('Passwords do not match.'), true);
    assert.equal(validateRegistration({ username: 'Student_2', email: 'student@example.com', password: 'symbols!ok', confirmPassword: 'symbols!ok' }).errors.length, 0);
    assert.equal(validateNote({ title: '', content: '' }).errors.length, 1);
    assert.equal(validateNote({ title: 'Blank', content: '' }).errors.length, 0);
  });
  it('creates users with hashed passwords', () => {
    user = createUser({ username: 'Student_1', password: 'secret123' });
    const storedUser = findUserByUsername('student_1');
    assert.equal(user.username, 'student_1');
    assert.notEqual(storedUser.password_hash, 'secret123');
    assert.equal(verifyPassword('secret123', storedUser.password_hash), true);
  });
  it('creates and reads sessions', () => {
    const session = createSession(user.id);
    assert.equal(findSessionWithUser(session.token).username, user.username);
  });
  it('searches public usernames without exposing the current user', () => {
    const alice = createUser({ username: 'alice_public', password: 'secret123' });
    const alina = createUser({ username: 'alina_public', password: 'secret123' });
    const results = searchPublicUsers('ali', alice.id);
    assert.deepEqual(results.map((result) => result.username), ['alina_public']);
    assert.deepEqual(Object.keys(results[0]), ['username']);
  });
  it('creates, updates, and deletes notes by user', () => {
    const note = noteModel.createNote(user.id, { title: 'Plan', content: '' });
    assert.equal(noteModel.getNotesByUser(user.id).length, 1);
    assert.equal(noteModel.updateNote(user.id, note.id, { title: 'Updated', content: 'Notes' }).content, 'Notes');
    assert.equal(noteModel.deleteNote(user.id, note.id), true);
  });
  it('prevents one user from reading another user note', () => {
    const owner = createUser({ username: 'owner', password: 'secret123' });
    const other = createUser({ username: 'other', password: 'secret123' });
    const note = noteModel.createNote(owner.id, { title: 'Private', content: 'Hidden' });
    assert.equal(noteModel.getNoteById(other.id, note.id), null);
  });
  it('shares notes by username with edit access', () => {
    const owner = createUser({ username: 'share_owner', password: 'secret123' });
    const collaborator = createUser({ username: 'share_editor', password: 'secret123' });
    const note = noteModel.createNote(owner.id, { title: 'Shared plan', content: 'Draft' });
    const result = noteModel.shareNote(owner.id, note.id, 'share_editor');
    assert.equal(result.user.username, 'share_editor');
    assert.equal(noteModel.getNotesByUser(collaborator.id)[0].access, 'editor');
    assert.equal(noteModel.getNotesByUser(owner.id)[0].collaboratorCount, 1);
    assert.equal(noteModel.getCollaborators(collaborator.id, note.id).length, 2);
    assert.equal(isProfileColorAvailable(collaborator.id, owner.profile_color), false);
    assert.equal(noteModel.updateNote(collaborator.id, note.id, { title: 'Edited', content: 'Updated' }).content, 'Updated');
    assert.equal(noteModel.deleteNote(collaborator.id, note.id), false);
  });
});
process.on('exit', () => fs.rmSync(testDb, { force: true }));
