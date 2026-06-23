# Quill

Quill is a full-stack note-taking workspace built for class notes, projects, chats, and quick writing. Users can register, log in, create and edit their own notes, organize items by type, share notes with other registered users, customize their theme, and view a polished responsive dashboard.

## Tech Stack

- Node.js
- Express.js
- SQLite with Node's built-in `node:sqlite` module
- RESTful JSON API
- HTML, CSS, and vanilla JavaScript frontend
- Token-based authentication
- Server-side validation and centralized error handling

## Requirements

- Node.js 22 or newer
- npm

No external database server is required. SQLite stores the local database in `data/notes.sqlite`.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app:

   ```bash
   npm start
   ```

3. Open the local site:

   ```text
   http://localhost:3000
   ```

4. Optional: run tests:

   ```bash
   npm test
   ```

## Project Structure

```text
src/
  config/        SQLite connection, table setup, and migrations
  controllers/   Request handlers for authentication and notes
  middleware/    Authentication and error handling middleware
  models/        Database access functions
  routes/        Express route definitions
  utils/         Validation helpers
public/
  assets/        App logo
  index.html     Frontend markup
  styles.css     Frontend styling
  app.js         Frontend application logic and API calls
data/
  notes.sqlite   Local SQLite database file, created automatically
test/
  model.test.js  Data model and validation tests
```

## Features

- Register and log in with username, email, and password confirmation.
- Each user has a private workspace protected by bearer token authentication.
- Create, edit, autosave, delete, archive, and search notes.
- Organize items as notes, projects, or chats using metadata stored with each note.
- Share a note, project, or chat with another registered username.
- See collaborations shared with the user and items shared by the user.
- Customize light/dark mode and accent colour per account.
- View local weather, calendar, recent items, and quick-access cards on the dashboard.
- Server-side validation returns clear JSON error messages.

## Authentication

Protected routes require this header:

```text
Authorization: Bearer <token>
```

The token is returned by register and login. The frontend stores it in `localStorage` and sends it with protected API requests.

## API Endpoints

### Register

`POST /api/auth/register`

Request:

```json
{
  "username": "student",
  "email": "student@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Success response:

```json
{
  "user": {
    "id": 1,
    "username": "student",
    "email": "student@example.com",
    "profileColor": "#9b75e8",
    "status": "Away",
    "theme": "dark",
    "createdAt": "2026-06-17 12:00:00"
  },
  "token": "session-token",
  "expiresAt": "2026-06-24T12:00:00.000Z"
}
```

Validation errors return `400`. Duplicate usernames or emails return `409`.

### Login

`POST /api/auth/login`

Request:

```json
{
  "username": "student",
  "password": "password123"
}
```

Success response matches the register response. Invalid credentials return `401`.

### Logout

`POST /api/auth/logout`

Requires authentication. Success returns `204 No Content`.

### Current User

`GET /api/auth/me`

Requires authentication. Returns the logged-in user's public profile.

### Update Profile

`PUT /api/auth/profile`

Requires authentication. Any of these fields may be sent:

```json
{
  "username": "student",
  "email": "student@example.com",
  "profileColor": "#4f7ddf",
  "status": "Working",
  "theme": "light"
}
```

Invalid profile data returns `400`. Duplicate username or email values return `409`.

### Search Users

`GET /api/users?query=stu`

Requires authentication. Returns public usernames that match the beginning of the query. This is used for sharing/collaboration.

### List Notes

`GET /api/notes`

Requires authentication.

Success response:

```json
{
  "notes": [
    {
      "id": 1,
      "title": "Biology Notes",
      "content": "Cell theory...",
      "ownerId": 1,
      "access": "owner",
      "collaboratorCount": 0,
      "ownerUsername": "student",
      "ownerColor": "#9b75e8",
      "ownerStatus": "Away",
      "createdAt": "2026-06-17 12:00:00",
      "updatedAt": "2026-06-17 12:05:00"
    }
  ]
}
```

Only notes owned by the logged-in user or shared with the logged-in user are returned.

### Create Note

`POST /api/notes`

Requires authentication.

Request:

```json
{
  "title": "Biology Notes",
  "content": "Cell theory..."
}
```

Success returns `201` with the created note.

### Get One Note

`GET /api/notes/:id`

Requires authentication. Returns `400` for invalid ids and `404` when the note does not exist or is not accessible to the user.

### Update Note

`PUT /api/notes/:id`

Requires authentication.

Request:

```json
{
  "title": "Updated Biology Notes",
  "content": "Updated content..."
}
```

Success returns the updated note. Invalid ids or validation failures return `400`. Missing or inaccessible notes return `404`.

### Delete Note

`DELETE /api/notes/:id`

Requires authentication. Only the owner can delete the note. Success returns `204 No Content`.

### List Collaborators

`GET /api/notes/:id/collaborators`

Requires authentication. Returns the owner and collaborators for an accessible note.

### Share Note

`POST /api/notes/:id/collaborators`

Requires authentication. Only the owner can share the note.

Request:

```json
{
  "username": "classmate"
}
```

Unknown usernames return `404`. Attempts to share a note the user does not own return `403`.

## Validation Rules

- Username: 3 to 32 characters.
- Username characters: letters, numbers, underscores, periods, and hyphens.
- Email: valid email address required during registration.
- Password: 6 to 32 characters, no spaces.
- Confirm password: must match password during registration.
- Note title: required and 120 characters or fewer.
- Note content: 5000 characters or fewer.

## Error Format

Errors are returned as JSON:

```json
{
  "error": "Title is required and must be 120 characters or fewer."
}
```

## Reflection

The hardest part of this project was keeping the frontend, API, authentication, and database models connected while the design changed. The app started as a notebook-style interface, then shifted into a more realistic note-taking workspace with a sidebar, projects, chats, notes, sharing, account settings, weather, and theme customization. Each design change affected both the browser code and the backend data that needed to be saved.

I learned that full-stack structure matters a lot. Routes should define the API, controllers should handle request and response behavior, models should handle database queries, middleware should protect private routes, and validation should stop bad data before it reaches the database. Separating those responsibilities made the project easier to fix and easier to explain.

I also learned the importance of testing and cleanup. The tests helped confirm that users, sessions, notes, and sharing still worked after major UI changes. Cleaning unused files and keeping the README updated made the project easier to submit and easier for another developer or instructor to run locally.

If I continued improving Quill, I would add more API integration tests, password reset support, production deployment setup, and a real scheduled notification/email service for reminders.
