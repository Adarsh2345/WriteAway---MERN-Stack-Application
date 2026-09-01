# 📝 WriteAway

WriteAway is a full-stack blog application where users can register, write and edit
posts with a rich-text editor, upload images, comment on each other's posts, and
browse posts by tag or full-text search. The backend is a JSON API written in
TypeScript on Node.js/Express, backed by MongoDB; the frontend is a React +
TypeScript single-page app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js, TypeScript |
| API framework | Express 4 |
| Database | MongoDB with Mongoose 8 |
| Frontend | React 19 + TypeScript (Vite), React Router |
| Auth | Passport.js (local strategy) + bcryptjs, session cookies |
| File storage | Multer + Cloudinary |
| Sessions | express-session + connect-mongo |
| Testing | Vitest + Supertest + mongodb-memory-server |

**Architecture note:** the backend is a pure JSON API — it never renders HTML. The
frontend in `client/` is a separate single-page React app that talks to that API
over `fetch`. In development they run as two processes (Express on `:3000`, the
Vite dev server on `:5173`); in production, the built React app is served as
static files from the same Express process, so there's one deployable server and
no CORS involved at all.

---

## Features

- 🔐 **Authentication** — registration and login via Passport's local strategy,
  passwords hashed with bcrypt, session-based auth (a `GET /auth/me` endpoint lets
  the frontend check login state on page load/refresh).
- ✍️ **Post CRUD** — create, edit, and delete posts with a Quill rich-text editor
  and multi-image upload (stored on Cloudinary). Images are optional.
- 🏷️ **Tags & search** — posts can be tagged, browsed by tag, and searched with
  MongoDB's full-text search across title and content. Results are paginated, and
  the current search/filter/page all live in the URL, so a result is shareable.
- 💬 **Comments** — logged-in users can comment on posts; only a comment's author
  can edit (inline, no separate page) or delete it.
- 👤 **Profiles** — users can update their username, email, bio, and profile
  picture, or delete their account (which cleans up all of their posts, comments,
  uploaded files, and Cloudinary assets).
- 🔒 **Authorization** — every edit/delete action is checked server-side against
  the resource's actual owner. The frontend also hides buttons a non-owner
  shouldn't see, but that's a UX nicety — the real enforcement is always the API.

---

## Project structure

```
src/                       Backend — Express JSON API
  app.ts                    entry point: connects to MongoDB, starts the server
  createApp.ts               builds the Express app (routes, middleware, CORS)
  config/                     Cloudinary, Multer, Passport, and environment setup
  models/                     Mongoose schemas (User, Post, Comment, File)
  controllers/                 route handler logic, all JSON responses
  routes/                      Express routers
  middlewares/                 auth guard, error handler
  types/                       Express.User type augmentation
tests/                     Vitest + Supertest test suite (against the JSON API)
client/                    Frontend — React + TypeScript (Vite)
  src/
    pages/                     one component per route
    components/                 shared UI (Navbar, PostCard, RichTextEditor, ...)
    api/                        typed fetch wrapper + per-resource API calls
    context/                    auth state (AuthContext)
    types/                      DTOs mirroring the backend's JSON shapes
    styles/                     the app's design system (plain CSS)
```

---

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (e.g. a free MongoDB Atlas cluster)
- A Cloudinary account (for image uploads)

### Setup

```bash
git clone <this-repo-url>
cd WriteAway
npm install
cd client && npm install && cd ..
```

Copy `.env.example` to `.env` (backend) and fill in real values:

```bash
cp .env.example .env
```

```
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/writeaway
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SESSION_SECRET=<generate with the command below>
CLIENT_URL=http://localhost:5173   # dev only
```

Generate a strong session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The frontend also has its own `.env` — copy `client/.env.example` to `client/.env`
(the default `VITE_API_URL=http://localhost:3000` is usually fine as-is).

### Run it in development

Two processes, in separate terminals:

```bash
npm run dev              # backend, http://localhost:3000
```
```bash
cd client && npm run dev # frontend, http://localhost:5173
```

Open `http://localhost:5173` — that's the app. The backend on `:3000` is the API
only; visiting it directly returns JSON, not a page.

### Build and run for production

```bash
cd client && npm run build && cd ..   # builds client/dist/
npm run build                          # compiles the backend to dist/
NODE_ENV=production npm start          # serves everything from one process
```

In production, Express serves the built React app as static files and handles
API requests on the same origin — visit `http://localhost:3000` (or whatever
`PORT` is set to) for the whole app.

---

## Testing

```bash
npm test         # run the full backend test suite once
npm run test:watch
```

Tests run against an in-memory MongoDB instance (via `mongodb-memory-server`) —
they never touch the real database configured in `.env`. Coverage includes the
registration/login flow and validation, ownership/authorization checks on post
and comment edits, stored-content sanitization, and the tag/search/pagination
feature. Frontend tests are not included in this pass.

---

## Screenshots

<!-- TODO: add screenshots of the posts listing, a post detail page, and the editor -->
