const state = {
  mode: 'login',
  token: localStorage.getItem('notesToken'),
  user: null,
  notes: [],
};

const authPanel = document.querySelector('#authPanel');
const notesPanel = document.querySelector('#notesPanel');
const authForm = document.querySelector('#authForm');
const authMessage = document.querySelector('#authMessage');
const loginMode = document.querySelector('#loginMode');
const registerMode = document.querySelector('#registerMode');
const authSubmit = document.querySelector('#authSubmit');
const logoutButton = document.querySelector('#logoutButton');
const welcomeTitle = document.querySelector('#welcomeTitle');
const noteForm = document.querySelector('#noteForm');
const noteId = document.querySelector('#noteId');
const noteTitle = document.querySelector('#noteTitle');
const noteContent = document.querySelector('#noteContent');
const noteMessage = document.querySelector('#noteMessage');
const notesList = document.querySelector('#notesList');
const cancelEditButton = document.querySelector('#cancelEditButton');
const saveNoteButton = document.querySelector('#saveNoteButton');

function setAuthMode(mode) {
  state.mode = mode;
  loginMode.classList.toggle('active', mode === 'login');
  registerMode.classList.toggle('active', mode === 'register');
  authSubmit.textContent = mode === 'login' ? 'Log in' : 'Create account';
  authMessage.textContent = '';
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(path, { ...options, headers });
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function showApp(isAuthenticated) {
  authPanel.classList.toggle('hidden', isAuthenticated);
  notesPanel.classList.toggle('hidden', !isAuthenticated);
}

function resetNoteForm() {
  noteId.value = '';
  noteTitle.value = '';
  noteContent.value = '';
  saveNoteButton.textContent = 'Save note';
  noteMessage.textContent = '';
}

function renderNotes() {
  if (!state.notes.length) {
    notesList.innerHTML = '<div class="empty-state">No notes yet. Create your first note on the left.</div>';
    return;
  }

  notesList.innerHTML = state.notes
    .map(
      (note) => `
        <article class="note-card">
          <h2>${escapeHtml(note.title)}</h2>
          <span class="note-meta">Updated ${formatDate(note.updatedAt)}</span>
          <p>${escapeHtml(note.content)}</p>
          <div class="note-actions">
            <button class="secondary-action" data-edit="${note.id}" type="button">Edit</button>
            <button class="danger-action" data-delete="${note.id}" type="button">Delete</button>
          </div>
        </article>
      `
    )
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

async function loadNotes() {
  const data = await api('/api/notes');
  state.notes = data.notes;
  renderNotes();
}

function saveSession({ token, user }) {
  state.token = token;
  state.user = user;
  localStorage.setItem('notesToken', token);
  welcomeTitle.textContent = `${user.username}'s Notes`;
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authMessage.textContent = '';

  const formData = new FormData(authForm);
  const payload = {
    username: formData.get('username'),
    password: formData.get('password'),
  };

  try {
    const data = await api(`/api/auth/${state.mode}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    saveSession(data);
    showApp(true);
    await loadNotes();
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

noteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  noteMessage.textContent = '';

  const id = noteId.value;
  const payload = {
    title: noteTitle.value,
    content: noteContent.value,
  };

  try {
    await api(id ? `/api/notes/${id}` : '/api/notes', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    resetNoteForm();
    await loadNotes();
  } catch (err) {
    noteMessage.textContent = err.message;
  }
});

notesList.addEventListener('click', async (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const note = state.notes.find((item) => item.id === Number(editId));
    if (!note) return;
    noteId.value = note.id;
    noteTitle.value = note.title;
    noteContent.value = note.content;
    saveNoteButton.textContent = 'Update note';
    noteTitle.focus();
  }

  if (deleteId && confirm('Delete this note?')) {
    await api(`/api/notes/${deleteId}`, { method: 'DELETE' });
    await loadNotes();
    resetNoteForm();
  }
});

logoutButton.addEventListener('click', async () => {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    // The local session should still be cleared if the server token expired.
  }

  localStorage.removeItem('notesToken');
  state.token = null;
  state.user = null;
  state.notes = [];
  resetNoteForm();
  showApp(false);
});

cancelEditButton.addEventListener('click', resetNoteForm);
loginMode.addEventListener('click', () => setAuthMode('login'));
registerMode.addEventListener('click', () => setAuthMode('register'));

async function boot() {
  if (!state.token) {
    showApp(false);
    return;
  }

  try {
    const data = await api('/api/auth/me');
    state.user = data.user;
    welcomeTitle.textContent = `${data.user.username}'s Notes`;
    showApp(true);
    await loadNotes();
  } catch (err) {
    localStorage.removeItem('notesToken');
    state.token = null;
    showApp(false);
  }
}

boot();
