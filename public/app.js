const META_PREFIX = '<!--QUILL_META:';
const META_SUFFIX = '-->';
const TOKEN_KEY = 'notesToken';
const THEME_KEY = 'quillTheme';
const DISPLAY_NAME_KEY = 'quillDisplayName';
const WEATHER_LOCATION_KEY = 'quillWeatherLocationEnabled';
const WEATHER_COORDS_KEY = 'quillWeatherCoordinates';
const WEATHER_CACHE_KEY = 'quillWeatherCache';
const LAST_OPENED_KEY = 'quillLastOpened';
const PROFILE_STATUS_KEY = 'quillProfileStatus';
const PROFILE_COLOR_KEY = 'quillProfileColor';
const PROFILE_THEME_KEY = 'quillProfileTheme';
const LAST_ACCENT_KEY = 'quillLastAccent';
const ARCHIVE_DAYS = 30;
const WEATHER_CACHE_TTL = 10 * 60 * 1000;
const ITEM_COLORS = ['#9b75e8', '#4f7ddf', '#2f9c95', '#65a95b', '#d5a72e', '#d97745', '#c95665'];

const state = {
  mode: 'login',
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  notes: [],
  activeId: null,
  draftCategory: null,
  view: 'all',
  mainSearch: '',
  draftColor: ITEM_COLORS[0],
  draftReminder: null,
  weather: { status: 'idle', text: 'Enable location in Settings for weather', items: [] },
  weatherLocationEnabled: false,
  saveTimer: null,
  sectionOpen: { projects: true, chats: true, quick: true, collaborations: true }
};

const authPanel = document.querySelector('#authPanel');
const notesPanel = document.querySelector('#notesPanel');
const authForm = document.querySelector('#authForm');
const authMessage = document.querySelector('#authMessage');
const loginMode = document.querySelector('#loginMode');
const registerMode = document.querySelector('#registerMode');
const authSubmit = document.querySelector('#authSubmit');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const confirmPasswordInput = document.querySelector('#confirmPassword');
const profileAvatar = document.querySelector('#profileAvatar');
const userDisplayName = document.querySelector('#userDisplayName');
const profileStatusButton = document.querySelector('#profileStatusButton');
const profileStatusText = document.querySelector('#profileStatusText');
const profileStatusMenu = document.querySelector('#profileStatusMenu');
const logoutButton = document.querySelector('#logoutButton');
const editorTopActions = document.querySelector('#editorTopActions');
const editorMenuButton = document.querySelector('#editorMenuButton');
const editorMenu = document.querySelector('#editorMenu');
const editorColorOptions = document.querySelector('.editor-color-options');
const navItems = document.querySelectorAll('.nav-item');
const notesList = document.querySelector('#notesList');
const emptyEditor = document.querySelector('#emptyEditor');
const homePanel = document.querySelector('#homePanel');
const homeDateNumber = document.querySelector('#homeDateNumber');
const homeDateMonth = document.querySelector('#homeDateMonth');
const homeDateWeekday = document.querySelector('#homeDateWeekday');
const homeWeather = document.querySelector('#homeWeather');
const homeCalendar = document.querySelector('#homeCalendar');
const homeRecentItems = document.querySelector('#homeRecentItems');
const homeSearch = document.querySelector('#homeSearch');
const homeSearchResults = document.querySelector('#homeSearchResults');
const mainListPanel = document.querySelector('#mainListPanel');
const mainListEyebrow = document.querySelector('#mainListEyebrow');
const mainListTitle = document.querySelector('#mainListTitle');
const mainListSearch = document.querySelector('#mainListSearch');
const mainListItems = document.querySelector('#mainListItems');
const settingsPanel = document.querySelector('#settingsPanel');
const editorPanel = document.querySelector('.editor-panel');
const themeButtons = document.querySelectorAll('[data-theme-option]');
const themeToggle = document.querySelector('.theme-toggle');
const profileColorButton = document.querySelector('#profileColorButton');
const profileColorPreview = document.querySelector('#profileColorPreview');
const profileColorMenu = document.querySelector('#profileColorMenu');
const weatherLocationToggle = document.querySelector('#weatherLocationToggle');
const settingsUsername = document.querySelector('#settingsUsername');
const settingsEmail = document.querySelector('#settingsEmail');
const settingsPassword = document.querySelector('#settingsPassword');
const saveUsernameButton = document.querySelector('#saveUsernameButton');
const savePasswordButton = document.querySelector('#savePasswordButton');
const settingsMessage = document.querySelector('#settingsMessage');
const accountSettingsDialog = document.querySelector('#accountSettingsDialog');
const accountDialogTitle = document.querySelector('#accountDialogTitle');
const settingFields = document.querySelectorAll('[data-setting-field]');
const openArchiveButton = document.querySelector('#openArchiveButton');
const archiveDialog = document.querySelector('#archiveDialog');
const closeArchiveButton = document.querySelector('#closeArchiveButton');
const archiveList = document.querySelector('#archiveList');
const collaborationDialog = document.querySelector('#collaborationDialog');
const collaborationInviteForm = document.querySelector('#collaborationInviteForm');
const closeCollaborationDialog = document.querySelector('#closeCollaborationDialog');
const collaborationItemSelect = document.querySelector('#collaborationItemSelect');
const collaborationUsername = document.querySelector('#collaborationUsername');
const collaborationMessage = document.querySelector('#collaborationMessage');
const reminderDialog = document.querySelector('#reminderDialog');
const reminderForm = document.querySelector('#reminderForm');
const reminderDateTime = document.querySelector('#reminderDateTime');
const reminderRepeat = document.querySelector('#reminderRepeat');
const reminderLead = document.querySelector('#reminderLead');
const removeReminderButton = document.querySelector('#removeReminderButton');
const deleteAccountButton = document.querySelector('#deleteAccountButton');
const noteEditor = document.querySelector('#noteEditor');
const noteTitle = document.querySelector('#noteTitle');
const editorTitleBullet = document.querySelector('#editorTitleBullet');
const noteCategory = document.querySelector('#noteCategory');
const noteContent = document.querySelector('#noteContent');
const reminderTag = document.querySelector('#reminderTag');
const reminderTagText = document.querySelector('#reminderTagText');
const projectTag = document.querySelector('#projectTag');
const projectMenu = document.querySelector('#projectMenu');
const shareTag = document.querySelector('#shareTag');
const shareTagText = document.querySelector('#shareTagText');
const shareMenu = document.querySelector('#shareMenu');
const shareForm = document.querySelector('#shareForm');
const shareUsername = document.querySelector('#shareUsername');
const shareSuggestions = document.querySelector('#shareSuggestions');
const shareMessage = document.querySelector('#shareMessage');
const sharePeople = document.querySelector('#sharePeople');
const collaboratorAvatars = document.querySelector('#collaboratorAvatars');
const saveNoteButton = document.querySelector('#saveNoteButton');
const deleteNoteButton = document.querySelector('#deleteNoteButton');
const saveStatus = document.querySelector('#saveStatus');
let shareSearchTimer = null;
let shareSearchRequest = 0;
const noteMeta = document.querySelector('#noteMeta');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function userPreferenceKey(key) {
  return key + ':' + (state.user?.id || 'anonymous');
}

function formatDate(value) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function noteTimestamp(note) {
  return note.updated_at || note.updatedAt || note.created_at || note.createdAt || new Date().toISOString();
}

function lastOpenedItems() {
  try {
    return JSON.parse(localStorage.getItem(userPreferenceKey(LAST_OPENED_KEY))) || {};
  } catch (err) {
    return {};
  }
}

function rememberOpened(note) {
  const history = lastOpenedItems();
  history[note.id] = Date.now();
  localStorage.setItem(userPreferenceKey(LAST_OPENED_KEY), JSON.stringify(history));
}

function mostRecentlyOpened(category) {
  const notes = notesForCategory(category);
  const history = lastOpenedItems();
  return notes.sort((a, b) => (history[b.id] || 0) - (history[a.id] || 0))[0] || null;
}

function weatherDescription(code) {
  if (code === 0) return 'Clear';
  if ([1, 2].includes(code)) return 'Partly cloudy';
  if (code === 3) return 'Cloudy';
  if ([45, 48].includes(code)) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorms';
  return 'Current conditions';
}

function weatherIcon(type) {
  const paths = {
    location: '<path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11z"/><circle cx="12" cy="10" r="2"/>',
    temperature: '<path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 8v8"/>',
    wind: '<path d="M3 8h11c3 0 3-4 0-4-1.2 0-2 .7-2.3 1.5"/><path d="M3 12h15c3 0 3 4 0 4-1.2 0-2-.7-2.3-1.5"/><path d="M3 16h7"/>',
    uv: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2"/>',
    sunrise: '<path d="M4 18h16M6 15a6 6 0 0 1 12 0M12 3v5M8 7l-2-2M16 7l2-2"/>',
    sunset: '<path d="M4 18h16M6 15a6 6 0 0 1 12 0M12 8V3M9 6l3 3 3-3"/>'
  };
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + paths[type] + '</svg>';
}

function categoryIcon(category) {
  const paths = {
    projects: '<path d="M3.5 7.5h6l1.8 2H20.5v9H3.5z"/>',
    chats: '<path d="M4 5.5h16v11H9l-5 3v-14z"/>',
    quick: '<path d="M4 4h11v16H4z"/><path d="M14 5l4-2 2 2-2 4-6 6-3 1 1-3z"/>',
    collaborations: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 19c.5-4 2.3-6 5.5-6s5 2 5.5 6"/><path d="M14 14c3.5-.7 5.8 1 6.3 4"/>'
  };
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (paths[category] || paths.quick) + '</svg>';
}

function renderMonthCalendar(today) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(today);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cells = [];
  for (let index = 0; index < firstWeekday; index += 1) cells.push('<span class="calendar-day is-empty"></span>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const currentClass = day === today.getDate() ? ' is-today' : '';
    cells.push('<span class="calendar-day' + currentClass + '">' + day + '</span>');
  }
  homeCalendar.innerHTML = '<div class="calendar-month">' + escapeHtml(monthLabel) + '</div>' +
    '<div class="calendar-grid">' + weekdays.map((day) => '<span class="calendar-weekday">' + day + '</span>').join('') + cells.join('') + '</div>';
}

function getWeatherPosition() {
  if (!state.weatherLocationEnabled) return Promise.reject(new Error('Location access is off.'));
  try {
    const cached = JSON.parse(localStorage.getItem(userPreferenceKey(WEATHER_COORDS_KEY)));
    if (Number.isFinite(cached?.latitude) && Number.isFinite(cached?.longitude)) return Promise.resolve(cached);
  } catch (err) {
    localStorage.removeItem(userPreferenceKey(WEATHER_COORDS_KEY));
  }
  if (!navigator.geolocation) return Promise.reject(new Error('Location is unavailable in this browser.'));
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { latitude: position.coords.latitude, longitude: position.coords.longitude, label: null };
        localStorage.setItem(userPreferenceKey(WEATHER_COORDS_KEY), JSON.stringify(location));
        resolve(location);
      },
      () => {
        state.weatherLocationEnabled = false;
        localStorage.setItem(userPreferenceKey(WEATHER_LOCATION_KEY), 'false');
        localStorage.removeItem(userPreferenceKey(WEATHER_COORDS_KEY));
        weatherLocationToggle.checked = false;
        resolve(null);
      },
      { enableHighAccuracy: false, maximumAge: 30 * 60 * 1000, timeout: 4000 }
    );
  });
}

async function reverseGeocodeCity(location) {
  if (location.label) return location.label;
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    localityLanguage: 'en'
  });
  try {
    const response = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?' + params);
    if (!response.ok) throw new Error('City lookup failed.');
    const data = await response.json();
    const city = data.city || data.locality || data.principalSubdivision || 'Current location';
    localStorage.setItem(userPreferenceKey(WEATHER_COORDS_KEY), JSON.stringify({ ...location, label: city }));
    return city;
  } catch (err) {
    return 'Current location';
  }
}

function formatWeatherTime(value) {
  const match = String(value || '').match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = match[2];
  return ((hour + 11) % 12 + 1) + ':' + minute + ' ' + (hour >= 12 ? 'PM' : 'AM');
}

function readWeatherCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(userPreferenceKey(WEATHER_CACHE_KEY)));
    return Array.isArray(cached?.items) && cached.items.length ? cached : null;
  } catch (err) {
    localStorage.removeItem(userPreferenceKey(WEATHER_CACHE_KEY));
    return null;
  }
}

function renderWeather() {
  if (!state.weather.items?.length) {
    homeWeather.innerHTML = '<span class="weather-line weather-message">' + escapeHtml(state.weather.text) + '</span>';
    return;
  }
  homeWeather.innerHTML = state.weather.items.map((item) =>
    '<span class="weather-line">' + weatherIcon(item.icon) + '<span><small>' + escapeHtml(item.label) + '</small><strong>' + escapeHtml(item.value) + '</strong></span></span>'
  ).join('');
}

async function loadWeather() {
  if (!state.weatherLocationEnabled) {
    state.weather = { status: 'disabled', text: 'Enable location in Settings for weather', items: [] };
    renderWeather();
    return;
  }
  if (state.weather.status === 'loading') return;
  const cached = readWeatherCache();
  if (cached && !state.weather.items?.length) {
    state.weather = { status: 'cached', text: cached.text, items: cached.items };
    renderWeather();
  }
  if (cached && Date.now() - cached.cachedAt < WEATHER_CACHE_TTL) return;
  state.weather = state.weather.items?.length
    ? { ...state.weather, status: 'loading' }
    : { status: 'loading', text: 'Loading weather…', items: [] };
  renderWeather();
  try {
    const location = await getWeatherPosition();
    if (!location) throw new Error('Location permission was not granted.');
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current: 'temperature_2m,weather_code,wind_speed_10m,uv_index',
      daily: 'sunrise,sunset',
      forecast_days: '1',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      timezone: 'auto'
    });
    const cityPromise = reverseGeocodeCity(location);
    const [response, city] = await Promise.all([
      fetch('https://api.open-meteo.com/v1/forecast?' + params),
      cityPromise
    ]);
    if (!response.ok) throw new Error('Weather request failed.');
    const data = await response.json();
    const current = data.current;
    if (!current || !Number.isFinite(current.temperature_2m)) throw new Error('Weather data is unavailable.');
    const sunrise = formatWeatherTime(data.daily?.sunrise?.[0]);
    const sunset = formatWeatherTime(data.daily?.sunset?.[0]);
    state.weather = {
      status: 'ready',
      text: city,
      items: [
        { icon: 'location', label: 'City', value: city },
        { icon: 'temperature', label: 'Temperature', value: Math.round(current.temperature_2m) + '°C · ' + weatherDescription(current.weather_code) },
        { icon: 'wind', label: 'Wind', value: Math.round(current.wind_speed_10m) + ' km/h' },
        Number.isFinite(current.uv_index) ? { icon: 'uv', label: 'UV index', value: current.uv_index.toFixed(1) } : null,
        sunrise ? { icon: 'sunrise', label: 'Sunrise', value: sunrise } : null,
        sunset ? { icon: 'sunset', label: 'Sunset', value: sunset } : null
      ].filter(Boolean)
    };
    localStorage.setItem(userPreferenceKey(WEATHER_CACHE_KEY), JSON.stringify({
      ...state.weather,
      cachedAt: Date.now()
    }));
  } catch (err) {
    if (state.weather.items?.length) {
      state.weather.status = 'ready';
    } else {
      state.weather = state.weatherLocationEnabled
        ? { status: 'error', text: 'Weather unavailable', items: [] }
        : { status: 'disabled', text: 'Enable location in Settings for weather', items: [] };
    }
  }
  renderWeather();
}

function setAuthMode(mode) {
  state.mode = mode;
  authForm.classList.toggle('is-register', mode === 'register');
  loginMode.classList.toggle('active', mode === 'login');
  registerMode.classList.toggle('active', mode === 'register');
  authSubmit.textContent = mode === 'login' ? 'Log in' : 'Create account';
  emailInput.required = mode === 'register';
  confirmPasswordInput.required = mode === 'register';
  passwordInput.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
  confirmPasswordInput.value = '';
  authMessage.textContent = '';
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (state.token) headers.Authorization = 'Bearer ' + state.token;
  const response = await fetch(path, { ...options, headers });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function showApp(isAuthenticated) {
  authPanel.classList.toggle('hidden', isAuthenticated);
  notesPanel.classList.toggle('hidden', !isAuthenticated);
  if (!isAuthenticated) applyTheme('light', { persist: false, sync: false });
}

function saveSession(data) {
  state.token = data.token;
  state.user = {
    ...data.user,
    profileColor: data.user.profileColor || data.user.profile_color || ITEM_COLORS[0],
    status: data.user.status || 'Away',
    theme: ['light', 'dark'].includes(data.user.theme) ? data.user.theme : 'dark'
  };
  const savedStatus = localStorage.getItem(userPreferenceKey(PROFILE_STATUS_KEY));
  const savedColor = localStorage.getItem(userPreferenceKey(PROFILE_COLOR_KEY)) || localStorage.getItem(LAST_ACCENT_KEY);
  const savedTheme = localStorage.getItem(userPreferenceKey(PROFILE_THEME_KEY));
  if (['Working', 'Away', 'Busy'].includes(savedStatus)) state.user.status = savedStatus;
  if (ITEM_COLORS.includes(savedColor)) state.user.profileColor = savedColor;
  if (['light', 'dark'].includes(savedTheme) && !data.user.theme) state.user.theme = savedTheme;
  state.weatherLocationEnabled = localStorage.getItem(userPreferenceKey(WEATHER_LOCATION_KEY)) === 'true';
  const cachedWeather = readWeatherCache();
  state.weather = cachedWeather
    ? { status: 'cached', text: cachedWeather.text, items: cachedWeather.items }
    : { status: 'idle', text: 'Enable location in Settings for weather', items: [] };
  weatherLocationToggle.checked = state.weatherLocationEnabled;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(DISPLAY_NAME_KEY, state.user.username || 'User');
  setDisplayedUsername(state.user.username || 'User');
  settingsEmail.value = state.user.email || '';
  profileAvatar.style.background = state.user.profileColor;
  setProfileColorPreview(state.user.profileColor);
  setDisplayedStatus(state.user.status);
  applyTheme(state.user.theme, { sync: false });
}

function setDisplayedUsername(username) {
  const cleanName = String(username || 'User').trim().slice(0, 32) || 'User';
  profileAvatar.textContent = cleanName.slice(0, 1).toUpperCase();
  userDisplayName.textContent = cleanName;
  homeSearch.placeholder = 'Search Workspace';
  if (settingsUsername) settingsUsername.value = cleanName;
}

function setDisplayedStatus(status) {
  const value = ['Working', 'Away', 'Busy'].includes(status) ? status : 'Away';
  profileStatusText.textContent = value;
  profileStatusButton.dataset.status = value;
  profileStatusButton.setAttribute('aria-label', 'Status: ' + value + '. Change status');
}

function setProfileColorPreview(color) {
  const value = ITEM_COLORS.includes(color) ? color : ITEM_COLORS[0];
  profileColorPreview.style.background = value;
  profileColorButton.dataset.color = value;
  applyAccentColor(value);
}

function applyAccentColor(color) {
  const value = ITEM_COLORS.includes(color) ? color : ITEM_COLORS[0];
  const accentNames = ['violet', 'blue', 'teal', 'green', 'yellow', 'orange', 'red'];
  document.body.dataset.accent = accentNames[ITEM_COLORS.indexOf(value)] || 'violet';
  const numeric = Number.parseInt(value.slice(1), 16);
  const channels = [numeric >> 16, (numeric >> 8) & 255, numeric & 255]
    .map((channel) => Math.round(channel + (255 - channel) * .32));
  const softer = '#' + channels.map((channel) => channel.toString(16).padStart(2, '0')).join('');
  [document.documentElement, document.body].forEach((element) => {
    element.style.setProperty('--accent-strong', value, 'important');
    element.style.setProperty('--accent', softer, 'important');
  });
}

function renderProfileColorMenu() {
  const activeColor = state.user?.profileColor || ITEM_COLORS[0];
  const names = ['Violet', 'Blue', 'Teal', 'Green', 'Yellow', 'Orange', 'Red'];
  profileColorMenu.innerHTML = ITEM_COLORS.map((color, index) =>
    '<button type="button" data-profile-color="' + color + '" aria-label="' + names[index] + '"><span style="--swatch:' + color + '"></span>' + names[index] + (color === activeColor ? '<i>Selected</i>' : '') + '</button>'
  ).join('');
}

function encodeMeta(meta) {
  return btoa(JSON.stringify(meta));
}

function decodeMeta(encoded) {
  try {
    return JSON.parse(atob(encoded));
  } catch (err) {
    return {};
  }
}

function parseNote(note) {
  const raw = String(note.content || '');
  if (!raw.startsWith(META_PREFIX)) return { category: 'quick', projectId: null, reminderAt: null, reminder: null, color: note.ownerColor || ITEM_COLORS[0], body: raw, archivedAt: null, archiveExpiresAt: null };
  const end = raw.indexOf(META_SUFFIX);
  if (end === -1) return { category: 'quick', projectId: null, reminderAt: null, reminder: null, color: note.ownerColor || ITEM_COLORS[0], body: raw, archivedAt: null, archiveExpiresAt: null };
  const meta = decodeMeta(raw.slice(META_PREFIX.length, end));
  const reminder = meta.reminder || (meta.reminderAt ? { kind: 'reminder', at: meta.reminderAt, repeat: 'none', leadMinutes: 0, channel: 'browser' } : null);
  return {
    category: ['quick', 'projects', 'chats'].includes(meta.category) ? meta.category : 'quick',
    projectId: meta.projectId || null,
    reminderAt: reminder?.at || meta.reminderAt || null,
    reminder,
    color: ITEM_COLORS.includes(meta.color) ? meta.color : (note.ownerColor || ITEM_COLORS[0]),
    archivedAt: meta.archivedAt || null,
    archiveExpiresAt: meta.archiveExpiresAt || null,
    body: raw.slice(end + META_SUFFIX.length).replace(/^\n/, '')
  };
}

function buildContent(body, category, extraMeta = {}) {
  return META_PREFIX + encodeMeta({ category, ...extraMeta }) + META_SUFFIX + '\n' + body;
}

function editableMeta(note = activeNote()) {
  if (!note) return {};
  const parsed = parseNote(note);
  return {
    projectId: parsed.projectId || null,
    reminderAt: parsed.reminderAt || null,
    reminder: parsed.reminder || null,
    color: parsed.color
  };
}

function isArchived(note) {
  return Boolean(parseNote(note).archivedAt);
}

function isArchiveExpired(note) {
  const archiveExpiresAt = parseNote(note).archiveExpiresAt;
  return Boolean(archiveExpiresAt && new Date(archiveExpiresAt).getTime() <= Date.now());
}

function activeNotes() {
  return state.notes.filter((note) => !isArchived(note));
}

function archivedNotes() {
  return state.notes
    .filter(isArchived)
    .sort((a, b) => new Date(noteTimestamp(b)) - new Date(noteTimestamp(a)));
}

function activeNote() {
  return state.notes.find((note) => note.id === state.activeId) || null;
}

function findNoteById(id) {
  return state.notes.find((note) => String(note.id) === String(id)) || null;
}

function filteredNotes() {
  return activeNotes()
    .filter((note) => {
      const parsed = parseNote(note);
      if (state.view !== 'all' && parsed.category !== state.view) return false;
      return true;
    })
    .sort((a, b) => new Date(noteTimestamp(b)) - new Date(noteTimestamp(a)));
}

function notesForCategory(category, query = '') {
  const normalizedQuery = query.trim().toLowerCase();
  return activeNotes()
    .filter((note) => {
      const parsed = parseNote(note);
      if (category === 'collaborations' && note.access !== 'editor') return false;
      if (category !== 'all' && category !== 'collaborations' && (parsed.category !== category || note.access === 'editor')) return false;
      return `${note.title} ${parsed.body}`.toLowerCase().includes(normalizedQuery);
    })
    .sort((a, b) => new Date(noteTimestamp(b)) - new Date(noteTimestamp(a)));
}

function updateViewLabels() {
  const editorOpen = Boolean(state.activeId || state.draftCategory);
  const listViews = ['projects', 'chats', 'quick', 'collaborations'];
  notesPanel.classList.toggle('section-view', listViews.includes(state.view) && !editorOpen);
  notesPanel.classList.toggle('settings-view', state.view === 'settings');
  navItems.forEach((button) => button.classList.toggle('active', button.dataset.view === state.view));
  homePanel.classList.toggle('hidden', state.view !== 'all' || editorOpen);
  settingsPanel.classList.toggle('hidden', state.view !== 'settings');
  mainListPanel.classList.toggle('hidden', !listViews.includes(state.view) || editorOpen);
  if (state.view === 'settings') {
    homePanel.classList.add('hidden');
    emptyEditor.classList.add('hidden');
    mainListPanel.classList.add('hidden');
    noteEditor.classList.add('hidden');
  } else if (listViews.includes(state.view) && !editorOpen) {
    homePanel.classList.add('hidden');
    emptyEditor.classList.add('hidden');
    noteEditor.classList.add('hidden');
    renderMainList();
  } else if (!editorOpen) {
    emptyEditor.classList.add('hidden');
    mainListPanel.classList.add('hidden');
    renderHome();
  }
}

function renderNotes() {
  updateViewLabels();
  const notes = activeNotes().sort((a, b) => new Date(noteTimestamp(b)) - new Date(noteTimestamp(a)));
  const groups = [
    { key: 'projects', title: 'Projects' },
    { key: 'chats', title: 'Chats' },
    { key: 'quick', title: 'Notes' },
    { key: 'collaborations', title: 'Collaborations' }
  ];
  notesList.innerHTML = groups.map((group) => {
    const groupNotes = notes.filter((note) => group.key === 'collaborations'
      ? note.access === 'editor'
      : note.access !== 'editor' && parseNote(note).category === group.key);
    const openClass = state.sectionOpen[group.key] ? ' is-open' : '';
    const body = groupNotes.length
      ? groupNotes.map(renderNoteCard).join('')
      : '';
    const secondaryClass = group.key === 'collaborations' ? ' is-secondary' : '';
    const groupIcon = group.key === 'collaborations' ? '<span class="group-icon">' + categoryIcon(group.key) + '</span>' : '';
    return '<section class="sidebar-group' + openClass + secondaryClass + '" data-section="' + group.key + '">' +
      '<div class="group-header"><button type="button" class="group-title" data-view-section="' + group.key + '">' + groupIcon + '<span>' + group.title + '</span></button>' +
      '<button type="button" class="group-toggle" data-toggle-section="' + group.key + '" aria-label="Toggle ' + group.title + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>' +
      '<div class="group-body">' + body + '</div>' +
      '</section>';
  }).join('');
}

function singularLabel(category) {
  return { projects: 'project', chats: 'chat', quick: 'note', collaborations: 'collaboration' }[category] || 'item';
}

function renderNoteCard(note) {
  return '<button type="button" class="note-card' +
    (note.id === state.activeId ? ' active' : '') +
    '" data-note-id="' + note.id + '">' +
    '<strong>' + escapeHtml(note.title || 'Untitled note') + '</strong>' +
    '</button>';
}

function renderMainList() {
  if (!['projects', 'chats', 'quick', 'collaborations'].includes(state.view)) return;
  const labels = {
    projects: ['Projects', 'Project workspace'],
    chats: ['Chats', 'Conversation notes'],
    quick: ['Notes', 'All notes'],
    collaborations: ['Collaborations', 'Shared with you']
  };
  const [title, eyebrow] = labels[state.view];
  mainListTitle.textContent = title;
  mainListEyebrow.textContent = eyebrow;
  if (state.view === 'collaborations') {
    renderCollaborationList();
    return;
  }
  const notes = notesForCategory(state.view, state.mainSearch);
  mainListItems.innerHTML = notes.length
    ? notes.map(renderMainListItem).join('') + (state.view === 'collaborations' ? '' : renderNewItemButton(state.view))
    : state.view === 'collaborations'
      ? '<p class="no-results">Nothing has been shared with you yet.</p>'
      : renderSectionTemplate(state.view);
}

function renderCollaborationList() {
  const incoming = notesForCategory('collaborations', state.mainSearch);
  const outgoing = activeNotes().filter((note) => note.access === 'owner' && note.collaboratorCount > 0 && `${note.title} ${parseNote(note).body}`.toLowerCase().includes(state.mainSearch.trim().toLowerCase()));
  const section = (title, notes, canAdd = false) => '<section class="collaboration-list-section"><header><h3>' + title + '</h3>' +
    (canAdd ? '<button type="button" class="collaboration-add" data-open-collaboration aria-label="Share an item"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>' : '') + '</header>' +
    '<div>' + (notes.length ? notes.map(renderMainListItem).join('') : '<p class="no-results">Nothing here yet.</p>') + '</div></section>';
  mainListItems.innerHTML = section('Shared with you', incoming) + section('Shared with others', outgoing, true);
}

function renderNewItemButton(category) {
  return '<button type="button" class="new-item-row" data-create="' + category + '"><span class="new-item-plus" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><span class="new-item-label">Start a new ' + singularLabel(category) + '</span><span aria-hidden="true"></span></button>';
}

function renderSectionTemplate(category) {
  const details = {
    projects: {
      title: 'Untitled project',
      body: 'Outline the goal, tasks, links, and next steps for a new project.'
    },
    chats: {
      title: 'New chat',
      body: 'Start a conversation note, recap, or question thread.'
    },
    quick: {
      title: 'Untitled note',
      body: 'Start typing a note, idea, checklist, or class summary.'
    }
  }[category];
  return '<div class="section-template" role="button" tabindex="0" data-create="' + category + '">' +
    '<div><strong>' + details.title + '</strong><p>' + details.body + '</p></div>' +
    '</div>';
}

function renderMainListItem(note) {
  const parsed = parseNote(note);
  const colorOptions = ITEM_COLORS.map((color) => '<button type="button" class="item-color' + (color === parsed.color ? ' is-active' : '') + '" style="--swatch:' + color + '" data-item-color="' + color + '" aria-label="Use this color"></button>').join('');
  const deleteOption = note.access === 'owner' ? '<button type="button" class="item-delete" data-item-delete>Delete</button>' : '';
  return '<article class="main-list-item" data-note-id="' + note.id + '" tabindex="0" role="button">' +
    '<span class="item-color-bullet" style="--item-color:' + parsed.color + '"></span>' +
    '<span class="main-item-copy"><strong>' + escapeHtml(note.title || 'Untitled note') + '</strong><time>' + escapeHtml(formatDate(noteTimestamp(note))) + '</time></span>' +
    '<button type="button" class="item-more" data-item-menu-toggle aria-label="Item options"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></button>' +
    '<div class="item-options hidden" data-item-options><div class="item-colors">' + colorOptions + '</div>' + deleteOption + '</div>' +
    '</article>';
}

function renderHome() {
  const today = new Date();
  homeDateNumber.textContent = new Intl.DateTimeFormat(undefined, { day: 'numeric' }).format(today);
  homeDateMonth.textContent = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(today);
  homeDateWeekday.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(today);
  renderMonthCalendar(today);
  renderWeather();
  if (state.weather.status !== 'loading') loadWeather();
  const recentItems = [
    { category: 'quick', label: 'Note' },
    { category: 'chats', label: 'Chat' },
    { category: 'projects', label: 'Project' }
  ].map((item) => {
    const note = mostRecentlyOpened(item.category);
    if (!note) {
      return '<button type="button" class="dashboard-card recent-home-item empty" data-create="' + item.category + '">' +
        '<span class="recent-card-copy"><small>' + item.label + '</small><span class="recent-title-row"><span class="recent-add"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span><strong>Create your first ' + singularLabel(item.category) + '</strong></span></span></button>';
    }
    const parsed = parseNote(note);
    return '<button type="button" class="dashboard-card recent-home-item" data-note-id="' + note.id + '">' +
      '<span class="recent-card-copy"><small>' + item.label + '</small><span class="recent-title-row"><span class="recent-color" style="--item-color:' + parsed.color + '"></span><strong>' + escapeHtml(note.title || 'Untitled note') + '</strong></span></span>' +
      '<span class="recent-edit-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20l4.2-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5.2 16z"/><path d="M13.8 7.4l3 3"/></svg></span></button>';
  }).join('');
  homeRecentItems.innerHTML = recentItems;
  renderHomeSearch();
}

function sectionLabel(category) {
  return { projects: 'Projects', chats: 'Chats', quick: 'Notes' }[category] || 'section';
}

function renderHomeSearch() {
  const query = (homeSearch.value || '').trim().toLowerCase();
  if (!query) {
    homeSearchResults.innerHTML = '';
    return;
  }
  const results = activeNotes()
    .filter((note) => {
      const parsed = parseNote(note);
      return `${note.title} ${parsed.body}`.toLowerCase().includes(query);
    })
    .slice(0, 5);
  homeSearchResults.innerHTML = results.length
    ? results.map(renderMainListItem).join('')
    : '<p class="no-results">No matching notes, chats, or projects.</p>';
}

function renderEditorTags(note = activeNote()) {
  if (!note) return;
  const parsed = parseNote(note);
  noteEditor.style.setProperty('--item-color', parsed.color);
  editorTitleBullet.style.backgroundColor = parsed.color;
  reminderTagText.textContent = parsed.reminderAt
    ? 'Reminder ' + new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(parsed.reminderAt))
    : 'Add reminder';
  const project = parsed.projectId ? state.notes.find((item) => item.id === Number(parsed.projectId)) : null;
  projectTag.title = project ? 'Project: ' + (project.title || 'Untitled project') : 'Add to project';
  projectTag.classList.toggle('is-linked', Boolean(project));
  projectTag.classList.toggle('hidden', parsed.category === 'projects');
  shareTag.classList.toggle('hidden', note.access === 'editor');
  shareTagText.textContent = 'Share';
}

function renderEditorColors() {
  const note = activeNote();
  const activeColor = note ? parseNote(note).color : state.draftColor;
  editorColorOptions.innerHTML = ITEM_COLORS.map((color) =>
    '<button type="button" class="editor-color-option' + (color === activeColor ? ' is-active' : '') +
    '" style="--swatch:' + color + '" data-editor-color="' + color + '" aria-label="Change item color"></button>'
  ).join('');
}

function draftLabels(category) {
  return {
    projects: { title: 'New project', body: 'Outline your project...' },
    chats: { title: 'New chat', body: 'Start the conversation...' },
    quick: { title: 'New note', body: 'Start typing your note...' }
  }[category] || { title: 'New note', body: 'Start typing...' };
}

function showEditorShell() {
  homePanel.classList.add('hidden');
  emptyEditor.classList.add('hidden');
  settingsPanel.classList.add('hidden');
  mainListPanel.classList.add('hidden');
  noteEditor.classList.remove('hidden');
  notesPanel.classList.remove('section-view');
  editorTopActions.classList.remove('hidden');
  editorMenu.classList.add('hidden');
  projectMenu.classList.add('hidden');
  shareMenu.classList.add('hidden');
}

function openDraft(category) {
  const labels = draftLabels(category);
  state.activeId = null;
  state.draftCategory = category;
  state.draftColor = state.user?.profileColor || ITEM_COLORS[0];
  state.draftReminder = null;
  state.view = category;
  noteTitle.value = '';
  noteTitle.placeholder = labels.title;
  noteCategory.value = category;
  noteContent.value = '';
  noteContent.placeholder = labels.body;
  noteEditor.style.setProperty('--item-color', state.draftColor);
  editorTitleBullet.style.backgroundColor = state.draftColor;
  noteEditor.classList.toggle('is-chat', category === 'chats');
  reminderTagText.textContent = 'Add reminder';
  projectTag.classList.toggle('hidden', category === 'projects');
  projectTag.classList.remove('is-linked');
  shareTag.classList.add('hidden');
  saveStatus.textContent = 'Draft';
  noteMeta.textContent = 'Not saved yet';
  showEditorShell();
  requestAnimationFrame(() => noteContent.focus());
}

function renderProjectMenu() {
  const projects = notesForCategory('projects');
  projectMenu.innerHTML = projects.length
    ? projects.map((project) => '<button type="button" data-project-id="' + project.id + '">' + escapeHtml(project.title || 'Untitled project') + '</button>').join('')
    : '<p>No projects yet</p>';
}

function renderCollaborators(collaborators) {
  const editors = collaborators.filter((user) => user.role !== 'owner');
  shareTagText.textContent = editors.length ? String(editors.length) : 'Share';
  sharePeople.innerHTML = collaborators.length
    ? collaborators.map((user) => '<div class="share-person"><span class="share-person-dot" style="--person-color:' + escapeHtml(user.profileColor) + '"></span><span>@' + escapeHtml(user.username) + '</span><small>' + escapeHtml(user.role === 'owner' ? 'Owner' : user.status) + '</small></div>').join('')
    : '<p>No collaborators yet.</p>';
  collaboratorAvatars.innerHTML = collaborators.map((user) => '<span class="collaborator-avatar" style="--person-color:' + escapeHtml(user.profileColor) + '" data-status-label="@' + escapeHtml(user.username) + ' · ' + escapeHtml(user.status) + '">' + escapeHtml(user.username.slice(0, 1).toUpperCase()) + '<i data-status="' + escapeHtml(user.status.toLowerCase()) + '"></i></span>').join('');
  collaboratorAvatars.classList.toggle('hidden', collaborators.length < 2);
}

async function loadCollaborators() {
  const note = activeNote();
  if (!note) return;
  const data = await api('/api/notes/' + note.id + '/collaborators');
  renderCollaborators(data.collaborators || []);
}

function renderUserSuggestions(users) {
  shareSuggestions.innerHTML = users.map((user) =>
    '<button type="button" data-share-username="' + escapeHtml(user.username) + '"><span class="suggestion-avatar">' +
    escapeHtml(user.username.slice(0, 1).toUpperCase()) + '</span><span>@' + escapeHtml(user.username) + '</span></button>'
  ).join('');
  shareSuggestions.classList.toggle('hidden', users.length === 0);
}

async function searchShareUsers(query) {
  const requestId = ++shareSearchRequest;
  const data = await api('/api/users?query=' + encodeURIComponent(query));
  if (requestId !== shareSearchRequest || shareUsername.value.trim() !== query) return;
  renderUserSuggestions(data.users || []);
}

function renderArchive() {
  const archived = archivedNotes();
  archiveList.innerHTML = archived.length
    ? archived.map((note) => {
      const parsed = parseNote(note);
      const expires = parsed.archiveExpiresAt ? new Date(parsed.archiveExpiresAt).getTime() : Date.now();
      const daysLeft = Math.max(0, Math.ceil((expires - Date.now()) / 86400000));
      return '<div class="archive-item">' +
        '<span><strong>' + escapeHtml(note.title || 'Untitled note') + '</strong><small>' + escapeHtml(singularLabel(parsed.category)) + ' · ' + daysLeft + ' days left</small></span>' +
        '<button type="button" class="secondary-action" data-restore="' + note.id + '">Restore</button>' +
        '<button type="button" class="danger-action" data-permanent-delete="' + note.id + '">Delete</button>' +
        '</div>';
    }).join('')
    : '<p class="settings-copy">Nothing is archived right now.</p>';
}

function puffOutCurrentView() {
  editorPanel.classList.add('is-puffing-out');
  return new Promise((resolve) => window.setTimeout(() => {
    editorPanel.classList.remove('is-puffing-out');
    resolve();
  }, 120));
}

function openNote(note, animate = true) {
  if (animate) {
    puffOutCurrentView().then(() => openNote(note, false));
    return;
  }
  const parsed = parseNote(note);
  rememberOpened(note);
  state.draftCategory = null;
  state.activeId = note.id;
  noteTitle.value = note.title || '';
  noteTitle.placeholder = draftLabels(parsed.category).title;
  noteCategory.value = parsed.category;
  noteContent.value = parsed.body;
  noteContent.placeholder = draftLabels(parsed.category).body;
  noteEditor.style.setProperty('--item-color', parsed.color);
  noteEditor.classList.toggle('is-chat', parsed.category === 'chats');
  renderEditorTags(note);
  showEditorShell();
  saveStatus.textContent = 'Saved';
  noteMeta.textContent = 'Updated ' + formatDate(noteTimestamp(note));
  renderNotes();
  loadCollaborators().catch(() => collaboratorAvatars.classList.add('hidden'));
  requestAnimationFrame(() => noteContent.focus());
}

function closeEditor() {
  state.activeId = null;
  state.draftCategory = null;
  noteEditor.classList.add('hidden');
  editorTopActions.classList.add('hidden');
  editorMenu.classList.add('hidden');
  projectMenu.classList.add('hidden');
  shareMenu.classList.add('hidden');
  collaboratorAvatars.classList.add('hidden');
  noteEditor.classList.remove('is-chat');
  if (state.view === 'settings') {
    settingsPanel.classList.remove('hidden');
    homePanel.classList.add('hidden');
    emptyEditor.classList.add('hidden');
  } else if (['projects', 'chats', 'quick', 'collaborations'].includes(state.view)) {
    mainListPanel.classList.remove('hidden');
    homePanel.classList.add('hidden');
    emptyEditor.classList.add('hidden');
    renderMainList();
  } else {
    homePanel.classList.remove('hidden');
    emptyEditor.classList.add('hidden');
    renderHome();
  }
  renderNotes();
}

async function navigateToView(view) {
  clearTimeout(state.saveTimer);
  if (state.activeId || state.draftCategory) await saveActiveNote();
  await puffOutCurrentView();
  if (['projects', 'chats', 'quick'].includes(view) && notesForCategory(view).length === 0) {
    openDraft(view);
    return;
  }
  state.view = view;
  closeEditor();
}

function scheduleSave() {
  clearTimeout(state.saveTimer);
  if (state.draftCategory && !noteTitle.value.trim() && !noteContent.value.trim()) {
    saveStatus.textContent = 'Draft';
    return;
  }
  saveStatus.textContent = 'Saving...';
  state.saveTimer = setTimeout(() => saveActiveNote().catch((err) => saveStatus.textContent = err.message), 550);
}

async function saveActiveNote() {
  const note = activeNote();
  if (!note && state.draftCategory) {
    if (!noteTitle.value.trim() && !noteContent.value.trim()) return;
    const category = state.draftCategory;
    const data = await api('/api/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: noteTitle.value.trim() || draftLabels(category).title,
        content: buildContent(noteContent.value, category, {
          color: state.draftColor,
          reminderAt: state.draftReminder?.at || null,
          reminder: state.draftReminder
        })
      })
    });
    state.notes.unshift(data.note);
    state.activeId = data.note.id;
    state.draftCategory = null;
    state.sectionOpen[category] = true;
    shareTag.classList.remove('hidden');
    renderEditorTags(data.note);
    saveStatus.textContent = 'Saved';
    noteMeta.textContent = 'Updated ' + formatDate(noteTimestamp(data.note));
    renderNotes();
    return;
  }
  if (!note) return;
  const title = noteTitle.value.trim() || draftLabels(noteCategory.value).title;
  const content = buildContent(noteContent.value, noteCategory.value, editableMeta(note));
  const data = await api('/api/notes/' + note.id, {
    method: 'PUT',
    body: JSON.stringify({ title, content })
  });
  const index = state.notes.findIndex((item) => item.id === note.id);
  state.notes[index] = data.note;
  saveStatus.textContent = 'Saved';
  noteMeta.textContent = 'Updated ' + formatDate(noteTimestamp(data.note));
  renderNotes();
}

async function createNote(categoryOverride) {
  const category = categoryOverride || (['projects', 'chats', 'quick'].includes(state.view) ? state.view : 'quick');
  openDraft(category);
}

async function archiveActiveNote() {
  const note = activeNote();
  if (!note && state.draftCategory) {
    closeEditor();
    return;
  }
  if (!note || !confirm('Move this item to the archive for 30 days?')) return;
  const parsed = parseNote(note);
  const archivedAt = new Date();
  const archiveExpiresAt = new Date(archivedAt.getTime() + ARCHIVE_DAYS * 86400000);
  const data = await api('/api/notes/' + note.id, {
    method: 'PUT',
    body: JSON.stringify({
      title: noteTitle.value.trim() || note.title || 'Untitled note',
      content: buildContent(noteContent.value, parsed.category, {
        projectId: parsed.projectId,
        reminderAt: parsed.reminderAt,
        reminder: parsed.reminder,
        color: parsed.color,
        archivedAt: archivedAt.toISOString(),
        archiveExpiresAt: archiveExpiresAt.toISOString()
      })
    })
  });
  const index = state.notes.findIndex((item) => item.id === note.id);
  state.notes[index] = data.note;
  closeEditor();
}

async function updateActiveMeta(extraMeta) {
  const note = activeNote();
  if (!note) return;
  const parsed = parseNote(note);
  const data = await api('/api/notes/' + note.id, {
    method: 'PUT',
    body: JSON.stringify({
      title: noteTitle.value.trim() || note.title || 'Untitled note',
      content: buildContent(noteContent.value, parsed.category, {
        projectId: parsed.projectId || null,
        reminderAt: parsed.reminderAt || null,
        reminder: parsed.reminder || null,
        color: parsed.color,
        ...extraMeta
      })
    })
  });
  const index = state.notes.findIndex((item) => item.id === note.id);
  state.notes[index] = data.note;
  renderEditorTags(data.note);
  renderNotes();
}

async function updateItemColor(noteId, color) {
  if (!ITEM_COLORS.includes(color)) return;
  const note = findNoteById(noteId);
  if (!note) return;
  const parsed = parseNote(note);
  const data = await api('/api/notes/' + note.id, {
    method: 'PUT',
    body: JSON.stringify({
      title: note.title || draftLabels(parsed.category).title,
      content: buildContent(parsed.body, parsed.category, { ...editableMeta(note), color })
    })
  });
  const index = state.notes.findIndex((item) => item.id === note.id);
  state.notes[index] = data.note;
  renderNotes();
}

async function archiveItemFromList(noteId) {
  const note = findNoteById(noteId);
  if (!note || note.access !== 'owner' || !confirm('Move this item to the archive for 30 days?')) return;
  const parsed = parseNote(note);
  const archivedAt = new Date();
  const data = await api('/api/notes/' + note.id, {
    method: 'PUT',
    body: JSON.stringify({
      title: note.title || draftLabels(parsed.category).title,
      content: buildContent(parsed.body, parsed.category, {
        ...editableMeta(note),
        archivedAt: archivedAt.toISOString(),
        archiveExpiresAt: new Date(archivedAt.getTime() + ARCHIVE_DAYS * 86400000).toISOString()
      })
    })
  });
  const index = state.notes.findIndex((item) => item.id === note.id);
  state.notes[index] = data.note;
  renderNotes();
}

async function copyActiveText() {
  const title = noteTitle.value.trim() || 'Untitled note';
  const text = title + '\n\n' + noteContent.value;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    noteContent.focus();
    noteContent.select();
    document.execCommand('copy');
  }
  editorMenu.classList.add('hidden');
}

function emailActiveNote() {
  const subject = encodeURIComponent(noteTitle.value.trim() || 'Untitled note');
  const body = encodeURIComponent(noteContent.value || '');
  window.location.assign('mailto:?subject=' + subject + '&body=' + body);
  editorMenu.classList.add('hidden');
}

function advanceReminderOccurrence(occurrence, repeat) {
  if (repeat === 'daily') occurrence.setDate(occurrence.getDate() + 1);
  else if (repeat === 'weekly') occurrence.setDate(occurrence.getDate() + 7);
  else if (repeat === 'monthly') occurrence.setMonth(occurrence.getMonth() + 1);
  else return false;
  return true;
}

function checkReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date();
  activeNotes().forEach((note) => {
    const parsed = parseNote(note);
    if (!parsed.reminder?.at || parsed.reminder.channel !== 'browser') return;
    const occurrence = new Date(parsed.reminder.at);
    if (!Number.isFinite(occurrence.getTime())) return;
    for (let guard = 0; guard < 10000; guard += 1) {
      const triggerAt = occurrence.getTime() - Number(parsed.reminder.leadMinutes || 0) * 60000;
      if (triggerAt > now.getTime()) return;
      const deliveryKey = 'quillReminderDelivered:' + state.user?.id + ':' + note.id + ':' + occurrence.toISOString() + ':' + parsed.reminder.leadMinutes;
      const delivered = localStorage.getItem(deliveryKey);
      if (!delivered && occurrence.getTime() >= now.getTime() - 24 * 60 * 60 * 1000) {
        const title = 'Reminder: ' + note.title;
        new Notification(title, { body: occurrence.toLocaleString(), tag: deliveryKey });
        localStorage.setItem(deliveryKey, new Date().toISOString());
        return;
      }
      if (!advanceReminderOccurrence(occurrence, parsed.reminder.repeat)) return;
    }
  });
}

async function loadNotes() {
  const data = await api('/api/notes');
  state.notes = data.notes;
  await purgeExpiredArchives();
  renderNotes();
  checkReminders();
  closeEditor();
}

async function purgeExpiredArchives() {
  const expired = state.notes.filter(isArchiveExpired);
  if (!expired.length) return;
  await Promise.all(expired.map((note) => api('/api/notes/' + note.id, { method: 'DELETE' }).catch(() => null)));
  const expiredIds = new Set(expired.map((note) => note.id));
  state.notes = state.notes.filter((note) => !expiredIds.has(note.id));
}

async function restoreArchivedNote(id) {
  const note = state.notes.find((item) => item.id === Number(id));
  if (!note) return;
  const parsed = parseNote(note);
  const data = await api('/api/notes/' + note.id, {
    method: 'PUT',
    body: JSON.stringify({ title: note.title || 'Untitled note', content: buildContent(parsed.body, parsed.category, editableMeta(note)) })
  });
  const index = state.notes.findIndex((item) => item.id === note.id);
  state.notes[index] = data.note;
  renderNotes();
}

async function permanentlyDeleteNote(id) {
  const note = state.notes.find((item) => item.id === Number(id));
  if (!note || !confirm('Permanently delete this archived item?')) return;
  await api('/api/notes/' + note.id, { method: 'DELETE' });
  state.notes = state.notes.filter((item) => item.id !== note.id);
  renderNotes();
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authMessage.textContent = '';
  const formData = new FormData(authForm);
  if (state.mode === 'register' && formData.get('password') !== formData.get('confirmPassword')) {
    authMessage.textContent = 'Passwords do not match.';
    confirmPasswordInput.focus();
    return;
  }
  try {
    const data = await api('/api/auth/' + state.mode, {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
      })
    });
    saveSession(data);
    showApp(true);
    await loadNotes();
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

loginMode.addEventListener('click', () => setAuthMode('login'));
registerMode.addEventListener('click', () => setAuthMode('register'));
if (saveNoteButton) saveNoteButton.addEventListener('click', () => saveActiveNote().catch((err) => saveStatus.textContent = err.message));
if (deleteNoteButton) deleteNoteButton.addEventListener('click', () => archiveActiveNote().catch((err) => alert(err.message)));

logoutButton.addEventListener('click', async () => {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    // Local logout still clears the expired token.
  }
  localStorage.removeItem(TOKEN_KEY);
  state.token = null;
  state.user = null;
  state.notes = [];
  closeEditor();
  showApp(false);
});

notesList.addEventListener('click', async (event) => {
  const createCategory = event.target.closest('[data-create]')?.dataset.create;
  if (createCategory) {
    createNote(createCategory).catch((err) => alert(err.message));
    return;
  }
  const toggleSection = event.target.closest('[data-toggle-section]')?.dataset.toggleSection;
  if (toggleSection) {
    state.sectionOpen[toggleSection] = !state.sectionOpen[toggleSection];
    renderNotes();
    return;
  }
  const viewSection = event.target.closest('[data-view-section]')?.dataset.viewSection;
  if (viewSection) {
    navigateToView(viewSection).catch((err) => alert(err.message));
    return;
  }
  const card = event.target.closest('[data-note-id]');
  if (!card) return;
  const note = state.notes.find((item) => item.id === Number(card.dataset.noteId));
  if (note) openNote(note);
});

navItems.forEach((button) => {
  button.addEventListener('click', () => navigateToView(button.dataset.view).catch((err) => alert(err.message)));
});

editorMenuButton.addEventListener('click', () => {
  renderEditorColors();
  editorMenu.classList.toggle('hidden');
  projectMenu.classList.add('hidden');
  shareMenu.classList.add('hidden');
});

editorMenu.addEventListener('click', (event) => {
  const color = event.target.closest('[data-editor-color]')?.dataset.editorColor;
  if (color && ITEM_COLORS.includes(color)) {
    event.preventDefault();
    if (activeNote()) {
      updateActiveMeta({ color }).then(renderEditorColors).catch((err) => alert(err.message));
    } else {
      state.draftColor = color;
      noteEditor.style.setProperty('--item-color', color);
      editorTitleBullet.style.backgroundColor = color;
      renderEditorColors();
    }
    return;
  }
  const action = event.target.closest('[data-editor-action]')?.dataset.editorAction;
  if (!action) return;
  event.preventDefault();
  editorMenu.classList.add('hidden');
  if (action === 'delete') {
    archiveActiveNote().catch((err) => alert(err.message));
    return;
  }
  if (action === 'copy') {
    copyActiveText().catch((err) => alert(err.message));
    return;
  }
  if (action === 'email') emailActiveNote();
});

function toLocalDateTimeValue(value) {
  const date = value ? new Date(value) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (!value) date.setHours(9, 0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function openReminderDialog() {
  const reminder = activeNote() ? parseNote(activeNote()).reminder : state.draftReminder;
  reminderDateTime.value = toLocalDateTimeValue(reminder?.at);
  reminderRepeat.value = reminder?.repeat || 'none';
  reminderLead.value = String(reminder?.leadMinutes || 0);
  removeReminderButton.classList.toggle('hidden', !reminder);
  reminderDialog.showModal();
}

reminderTag.addEventListener('click', openReminderDialog);

reminderForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const scheduled = new Date(reminderDateTime.value);
  if (!Number.isFinite(scheduled.getTime())) return;
  const reminder = {
    kind: 'reminder',
    at: scheduled.toISOString(),
    repeat: reminderRepeat.value,
    leadMinutes: Number(reminderLead.value),
    channel: 'browser'
  };
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (activeNote()) {
    await updateActiveMeta({ reminderAt: reminder.at, reminder });
  } else {
    state.draftReminder = reminder;
    reminderTagText.textContent = 'Reminder ' + new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(scheduled);
  }
  reminderDialog.close();
  checkReminders();
});

removeReminderButton.addEventListener('click', async () => {
  if (activeNote()) await updateActiveMeta({ reminderAt: null, reminder: null });
  else {
    state.draftReminder = null;
    reminderTagText.textContent = 'Add reminder';
  }
  reminderDialog.close();
});

projectTag.addEventListener('click', () => {
  if (noteCategory.value === 'projects') return;
  renderProjectMenu();
  projectMenu.classList.toggle('hidden');
  editorMenu.classList.add('hidden');
  shareMenu.classList.add('hidden');
});

projectMenu.addEventListener('click', (event) => {
  const projectId = event.target.closest('[data-project-id]')?.dataset.projectId;
  if (!projectId) return;
  updateActiveMeta({ projectId }).then(() => projectMenu.classList.add('hidden')).catch((err) => alert(err.message));
});

shareTag.addEventListener('click', () => {
  shareMenu.classList.toggle('hidden');
  editorMenu.classList.add('hidden');
  projectMenu.classList.add('hidden');
  shareMessage.textContent = '';
  shareSuggestions.classList.add('hidden');
  if (!shareMenu.classList.contains('hidden')) {
    loadCollaborators().then(() => shareUsername.focus()).catch((err) => shareMessage.textContent = err.message);
  }
});

shareUsername.addEventListener('input', () => {
  window.clearTimeout(shareSearchTimer);
  const query = shareUsername.value.trim().toLowerCase();
  shareMessage.textContent = '';
  if (query.length < 2) {
    shareSearchRequest += 1;
    renderUserSuggestions([]);
    return;
  }
  shareSearchTimer = window.setTimeout(() => {
    searchShareUsers(query).catch((err) => {
      renderUserSuggestions([]);
      shareMessage.textContent = err.message;
    });
  }, 180);
});

shareSuggestions.addEventListener('click', (event) => {
  const username = event.target.closest('[data-share-username]')?.dataset.shareUsername;
  if (!username) return;
  shareUsername.value = username;
  shareSuggestions.classList.add('hidden');
  shareMessage.textContent = '@' + username + ' selected.';
  shareUsername.focus();
});

shareForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const note = activeNote();
  if (!note) return;
  shareMessage.textContent = 'Adding...';
  try {
    await api('/api/notes/' + note.id + '/collaborators', {
      method: 'POST',
      body: JSON.stringify({ username: shareUsername.value })
    });
    shareUsername.value = '';
    shareSuggestions.classList.add('hidden');
    shareMessage.textContent = 'Access granted.';
    await loadCollaborators();
  } catch (err) {
    shareMessage.textContent = err.message;
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-item-menu-toggle]') && !event.target.closest('[data-item-options]')) {
    document.querySelectorAll('[data-item-options]').forEach((menu) => menu.classList.add('hidden'));
  }
  if (!editorMenu.contains(event.target) && !editorMenuButton.contains(event.target)) {
    editorMenu.classList.add('hidden');
  }
  if (!projectMenu.contains(event.target) && !projectTag.contains(event.target)) {
    projectMenu.classList.add('hidden');
  }
  if (!shareMenu.contains(event.target) && !shareTag.contains(event.target)) {
    shareMenu.classList.add('hidden');
    shareSuggestions.classList.add('hidden');
  }
  if (!profileStatusMenu.contains(event.target) && !profileStatusButton.contains(event.target)) {
    profileStatusMenu.classList.add('hidden');
    profileStatusButton.setAttribute('aria-expanded', 'false');
  }
  if (!profileColorMenu.contains(event.target) && !profileColorButton.contains(event.target)) {
    profileColorMenu.classList.add('hidden');
    profileColorButton.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  editorMenu.classList.add('hidden');
  projectMenu.classList.add('hidden');
  shareMenu.classList.add('hidden');
  shareSuggestions.classList.add('hidden');
  profileStatusMenu.classList.add('hidden');
  profileStatusButton.setAttribute('aria-expanded', 'false');
  profileColorMenu.classList.add('hidden');
  profileColorButton.setAttribute('aria-expanded', 'false');
});

mainListItems.addEventListener('click', (event) => {
  if (event.target.closest('[data-open-collaboration]')) {
    const owned = activeNotes().filter((note) => note.access === 'owner');
    collaborationItemSelect.innerHTML = owned.map((note) => '<option value="' + note.id + '">' + escapeHtml(note.title || draftLabels(parseNote(note).category).title) + ' · ' + singularLabel(parseNote(note).category) + '</option>').join('');
    collaborationMessage.textContent = owned.length ? '' : 'Create an item before inviting collaborators.';
    collaborationUsername.value = '';
    collaborationUsername.disabled = owned.length === 0;
    collaborationInviteForm.querySelector('[type="submit"]').disabled = owned.length === 0;
    collaborationDialog.showModal();
    return;
  }
  const createCategory = event.target.closest('[data-create]')?.dataset.create;
  if (createCategory) {
    createNote(createCategory).catch((err) => alert(err.message));
    return;
  }
  const menuToggle = event.target.closest('[data-item-menu-toggle]');
  if (menuToggle) {
    event.stopPropagation();
    const options = menuToggle.parentElement.querySelector('[data-item-options]');
    document.querySelectorAll('[data-item-options]').forEach((menu) => {
      if (menu !== options) menu.classList.add('hidden');
    });
    options.classList.toggle('hidden');
    return;
  }
  const color = event.target.closest('[data-item-color]')?.dataset.itemColor;
  if (color) {
    event.stopPropagation();
    const noteId = event.target.closest('[data-note-id]')?.dataset.noteId;
    updateItemColor(noteId, color).catch((err) => alert(err.message));
    return;
  }
  if (event.target.closest('[data-item-delete]')) {
    event.stopPropagation();
    const noteId = event.target.closest('[data-note-id]')?.dataset.noteId;
    archiveItemFromList(noteId).catch((err) => alert(err.message));
    return;
  }
  const card = event.target.closest('[data-note-id]');
  if (!card) return;
  const note = findNoteById(card.dataset.noteId);
  if (note) openNote(note);
});

mainListItems.addEventListener('keydown', (event) => {
  if (!['Enter', ' '].includes(event.key)) return;
  const createCategory = event.target.closest('[data-create]')?.dataset.create;
  if (createCategory) {
    event.preventDefault();
    createNote(createCategory).catch((err) => alert(err.message));
    return;
  }
  const noteId = event.target.closest('[data-note-id]')?.dataset.noteId;
  if (!noteId || event.target.closest('button')) return;
  event.preventDefault();
  const note = findNoteById(noteId);
  if (note) openNote(note);
});

mainListSearch.addEventListener('input', (event) => {
  state.mainSearch = event.target.value;
  renderMainList();
});

homeSearch.addEventListener('input', renderHomeSearch);

homePanel.addEventListener('click', (event) => {
  const createCategory = event.target.closest('[data-create]')?.dataset.create;
  if (createCategory) {
    createNote(createCategory).catch((err) => alert(err.message));
    return;
  }
  const card = event.target.closest('[data-note-id]');
  if (!card) return;
  const note = findNoteById(card.dataset.noteId);
  if (note) openNote(note);
});

archiveDialog.addEventListener('click', (event) => {
  const restoreId = event.target.closest('[data-restore]')?.dataset.restore;
  if (restoreId) {
    restoreArchivedNote(restoreId).catch((err) => settingsMessage.textContent = err.message);
    return;
  }
  const deleteId = event.target.closest('[data-permanent-delete]')?.dataset.permanentDelete;
  if (deleteId) {
    permanentlyDeleteNote(deleteId).catch((err) => settingsMessage.textContent = err.message);
  }
});

function openAccountSetting(mode) {
  const titles = {
    username: 'Change username',
    email: 'Change email',
    password: 'Change password'
  };
  if (!titles[mode]) return;
  accountDialogTitle.textContent = titles[mode];
  settingFields.forEach((field) => field.classList.toggle('hidden', field.dataset.settingField !== mode));
  saveUsernameButton.classList.toggle('hidden', mode === 'password');
  savePasswordButton.classList.toggle('hidden', mode !== 'password');
  accountSettingsDialog.showModal();
  accountSettingsDialog.querySelector('[data-setting-field="' + mode + '"] input, [data-setting-field="' + mode + '"] select')?.focus();
}

settingsPanel.addEventListener('click', (event) => {
  const mode = event.target.closest('[data-open-setting]')?.dataset.openSetting;
  if (mode) openAccountSetting(mode);
});

openArchiveButton.addEventListener('click', () => {
  renderArchive();
  archiveDialog.showModal();
});

document.querySelectorAll('.dialog-close').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog')?.close());
});

[accountSettingsDialog, archiveDialog, collaborationDialog, reminderDialog].forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

collaborationInviteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  collaborationMessage.textContent = 'Inviting…';
  try {
    await api('/api/notes/' + collaborationItemSelect.value + '/collaborators', {
      method: 'POST',
      body: JSON.stringify({ username: collaborationUsername.value.trim() })
    });
    collaborationMessage.textContent = 'Collaborator added.';
    await loadNotes();
    collaborationDialog.close();
  } catch (err) {
    collaborationMessage.textContent = err.message;
  }
});

profileAvatar.addEventListener('click', () => navigateToView('settings').catch((err) => alert(err.message)));

profileStatusButton.addEventListener('click', (event) => {
  event.stopPropagation();
  const opening = profileStatusMenu.classList.contains('hidden');
  profileStatusMenu.classList.toggle('hidden');
  profileStatusButton.setAttribute('aria-expanded', String(opening));
});

profileStatusMenu.addEventListener('click', async (event) => {
  const status = event.target.closest('[data-profile-status]')?.dataset.profileStatus;
  if (!status || !state.user) return;
  event.stopPropagation();
  state.user.status = status;
  localStorage.setItem(userPreferenceKey(PROFILE_STATUS_KEY), status);
  setDisplayedStatus(status);
  profileStatusMenu.classList.add('hidden');
  profileStatusButton.setAttribute('aria-expanded', 'false');
  try {
    const data = await api('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        username: state.user.username,
        email: state.user.email,
        profileColor: state.user.profileColor || ITEM_COLORS[0],
        status
      })
    });
    state.user = { ...data.user, status };
    localStorage.setItem(userPreferenceKey(PROFILE_STATUS_KEY), status);
    setDisplayedStatus(status);
  } catch (err) {
    state.user.status = status;
    setDisplayedStatus(status);
    console.warn('Status will sync when the server is available:', err.message);
  }
});

profileColorButton.addEventListener('click', (event) => {
  event.stopPropagation();
  renderProfileColorMenu();
  const opening = profileColorMenu.classList.contains('hidden');
  profileColorMenu.classList.toggle('hidden');
  profileColorButton.setAttribute('aria-expanded', String(opening));
});

profileColorMenu.addEventListener('click', async (event) => {
  const profileColor = event.target.closest('[data-profile-color]')?.dataset.profileColor;
  if (!profileColor || !state.user) return;
  event.stopPropagation();
  state.user.profileColor = profileColor;
  localStorage.setItem(userPreferenceKey(PROFILE_COLOR_KEY), profileColor);
  localStorage.setItem(LAST_ACCENT_KEY, profileColor);
  profileAvatar.style.background = profileColor;
  setProfileColorPreview(profileColor);
  profileColorMenu.classList.add('hidden');
  profileColorButton.setAttribute('aria-expanded', 'false');
  try {
    const data = await api('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        username: state.user.username,
        email: state.user.email,
        profileColor,
        status: state.user.status || 'Away'
      })
    });
    state.user = { ...data.user, profileColor };
    localStorage.setItem(userPreferenceKey(PROFILE_COLOR_KEY), profileColor);
    localStorage.setItem(LAST_ACCENT_KEY, profileColor);
    profileAvatar.style.background = profileColor;
    setProfileColorPreview(profileColor);
    settingsMessage.textContent = '';
  } catch (err) {
    state.user.profileColor = profileColor;
    profileAvatar.style.background = profileColor;
    setProfileColorPreview(profileColor);
    settingsMessage.textContent = '';
    console.warn('Profile colour will sync when the server is available:', err.message);
  }
});

[noteTitle, noteContent, noteCategory].forEach((field) => {
  field.addEventListener('input', scheduleSave);
  field.addEventListener('change', scheduleSave);
});

async function saveThemePreference(theme) {
  if (!state.user || !['light', 'dark'].includes(theme)) return;
  state.user.theme = theme;
  localStorage.setItem(userPreferenceKey(PROFILE_THEME_KEY), theme);
  try {
    const data = await api('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ theme })
    });
    state.user = {
      ...data.user,
      profileColor: state.user.profileColor || data.user.profileColor || ITEM_COLORS[0],
      status: state.user.status || data.user.status || 'Away',
      theme
    };
    localStorage.setItem(userPreferenceKey(PROFILE_THEME_KEY), theme);
  } catch (err) {
    console.warn('Theme will sync when the server is available:', err.message);
  }
}

function applyTheme(theme, options = {}) {
  const preference = ['light', 'dark'].includes(theme)
    ? theme
    : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.body.dataset.theme = preference;
  themeToggle.dataset.active = preference;
  if (options.persist !== false) localStorage.setItem(THEME_KEY, preference);
  if (state.user) {
    state.user.theme = preference;
    if (options.persist !== false) localStorage.setItem(userPreferenceKey(PROFILE_THEME_KEY), preference);
  }
  themeButtons.forEach((button) => {
    const active = button.dataset.themeOption === preference;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (options.sync) saveThemePreference(preference);
}

themeButtons.forEach((button) => button.addEventListener('click', () => applyTheme(button.dataset.themeOption, { sync: true })));
applyTheme(localStorage.getItem(THEME_KEY));
applyAccentColor(localStorage.getItem(LAST_ACCENT_KEY) || ITEM_COLORS[0]);

weatherLocationToggle.checked = state.weatherLocationEnabled;
weatherLocationToggle.addEventListener('change', async () => {
  settingsMessage.textContent = '';
  state.weatherLocationEnabled = weatherLocationToggle.checked;
  localStorage.setItem(userPreferenceKey(WEATHER_LOCATION_KEY), String(state.weatherLocationEnabled));
  if (!state.weatherLocationEnabled) {
    localStorage.removeItem(userPreferenceKey(WEATHER_COORDS_KEY));
    localStorage.removeItem(userPreferenceKey(WEATHER_CACHE_KEY));
  }
  state.weather = { status: 'idle', text: 'Loading weather…', items: [] };
  await loadWeather();
});

saveUsernameButton.addEventListener('click', async () => {
  const username = settingsUsername.value.trim().slice(0, 32);
  if (!username) {
    settingsMessage.textContent = 'Username cannot be empty.';
    return;
  }
  try {
    const data = await api('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({
        username,
        email: settingsEmail.value,
        profileColor: state.user?.profileColor || ITEM_COLORS[0],
        status: state.user?.status || 'Away'
      })
    });
    const preferredColor = localStorage.getItem(userPreferenceKey(PROFILE_COLOR_KEY)) || localStorage.getItem(LAST_ACCENT_KEY) || state.user?.profileColor || ITEM_COLORS[0];
    const preferredStatus = localStorage.getItem(userPreferenceKey(PROFILE_STATUS_KEY)) || state.user?.status || 'Away';
    state.user = { ...data.user, profileColor: preferredColor, status: preferredStatus };
    localStorage.setItem(DISPLAY_NAME_KEY, data.user.username);
    setDisplayedUsername(data.user.username);
    settingsEmail.value = data.user.email || '';
    profileAvatar.style.background = preferredColor;
    setProfileColorPreview(preferredColor);
    setDisplayedStatus(preferredStatus);
    settingsMessage.textContent = '';
    accountSettingsDialog.close();
  } catch (err) {
    settingsMessage.textContent = err.message;
  }
});

savePasswordButton.addEventListener('click', () => {
  if (settingsPassword.value.length < 6 || settingsPassword.value.length > 32) {
    settingsMessage.textContent = 'Password must be between 6 and 32 characters.';
    return;
  }
  if (/\s/.test(settingsPassword.value)) {
    settingsMessage.textContent = 'Password cannot contain spaces.';
    return;
  }
  settingsPassword.value = '';
  settingsMessage.textContent = 'Password form is ready for backend support.';
  accountSettingsDialog.close();
});

deleteAccountButton.addEventListener('click', async () => {
  if (!confirm('Delete your workspace data and sign out?')) return;
  await Promise.all(state.notes.map((note) => api('/api/notes/' + note.id, { method: 'DELETE' }).catch(() => null)));
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DISPLAY_NAME_KEY);
  state.token = null;
  state.user = null;
  state.notes = [];
  state.activeId = null;
  state.view = 'all';
  closeEditor();
  showApp(false);
});

if (state.token) {
  api('/api/auth/me')
    .then((data) => {
      saveSession({ token: state.token, user: data.user });
      showApp(true);
      return loadNotes();
    })
    .catch(() => {
      localStorage.removeItem(TOKEN_KEY);
      state.token = null;
      showApp(false);
    });
}

window.setInterval(checkReminders, 60 * 1000);
