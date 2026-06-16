# Note-Taking App

A full-stack note-taking application built with Node.js, Express, SQLite, HTML, CSS, and browser JavaScript. Users can register, log in, and manage their own private notes.

## Features

- User registration and login
- Password hashing with Node's `crypto.scryptSync`
- Token-based sessions
- Private note collections for each user
- Create, read, update, and delete notes
- Server-side validation with clear error messages
- SQLite database stored locally in `data/notes.sqlite`
- Simple responsive frontend integrated with the API

## Tech Stack

- Node.js
- Express.js
- SQLite using Node's built-in `node:sqlite`
- HTML, CSS, and vanilla JavaScript

## Project Structure

```text
src/
  config/          Database setup
  controllers/     Request handlers
  middleware/      Authentication and error handling
  models/          SQLite data access
  routes/          API route definitions
  utils/           Validation helpers
public/            Frontend files
data/              Local SQLite database, created at runtime
```

## Setup

1. Install Node.js 25 or newer.
2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm start
```

4. Open the app:

```text
http://localhost:3000
```

The SQLite database is created automatically the first time the server starts.

## Development

Run the server in watch mode:

```bash
npm run dev
```

Run automated API tests:

```bash
npm test
```

## API Endpoints

All note routes require an `Authorization: Bearer <token>` header.

### Health Check

`GET /api/health`

Response:

```json
{
  "status": "ok",
  "app": "Note-Taking App"
}
```

### Register

`POST /api/auth/register`

Request:

```json
{
  "username": "student",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "id": 1,
    "username": "student",
    "createdAt": "2026-06-16 12:00:00"
  },
  "token": "session-token",
  "expiresAt": "2026-06-23T12:00:00.000Z"
}
```

### Login

`POST /api/auth/login`

Request:

```json
{
  "username": "student",
  "password": "password123"
}
```

### Current User

`GET /api/auth/me`

### Logout

`POST /api/auth/logout`

Returns `204 No Content`.

### List Notes

`GET /api/notes`

Response:

```json
{
  "notes": [
    {
      "id": 1,
      "title": "Lecture notes",
      "content": "REST APIs use HTTP methods.",
      "createdAt": "2026-06-16 12:00:00",
      "updatedAt": "2026-06-16 12:00:00"
    }
  ]
}
```

### Create Note

`POST /api/notes`

Request:

```json
{
  "title": "Lecture notes",
  "content": "REST APIs use HTTP methods."
}
```

### Get One Note

`GET /api/notes/:id`

### Update Note

`PUT /api/notes/:id`

Request:

```json
{
  "title": "Updated lecture notes",
  "content": "GET, POST, PUT, and DELETE map to CRUD operations."
}
```

### Delete Note

`DELETE /api/notes/:id`

Returns `204 No Content`.

## Validation and Error Handling

- Usernames must be 3 to 32 characters and may contain letters, numbers, underscores, periods, and hyphens.
- Passwords must be 6 to 100 characters.
- Note titles are required and limited to 120 characters.
- Note content is required and limited to 5000 characters.
- Invalid IDs, missing notes, duplicate usernames, bad login attempts, and unauthenticated requests return clear JSON error messages.

## Reflection

The most challenging part of this project was connecting all of the layers cleanly: the browser interface, Express routes, controllers, validation, authentication, and database queries all need to agree on the same data shape. I learned that a full-stack app is easier to reason about when each file has one job. Routes define the URLs, controllers handle request logic, models talk to the database, and middleware handles shared concerns like authentication.

Another important lesson was that authentication affects almost every part of the app. It is not enough to create notes; each note must belong to a user, and every database query must check the current user's ID so users cannot access each other's data. Server-side validation also matters because frontend validation can be bypassed.

If I continued improving this project, I would add richer note searching, categories or tags, password reset, and more detailed automated tests for edge cases.
