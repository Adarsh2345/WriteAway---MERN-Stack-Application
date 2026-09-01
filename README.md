# 📝 WriteAway

WriteAway is a full-stack blog application where users can register, write and edit
posts with a rich-text editor, upload images, comment on each other's posts, and
browse posts by tag or full-text search. It's a server-rendered Node.js/Express app
written in TypeScript, backed by MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js, TypeScript |
| Web framework | Express 4 |
| Database | MongoDB with Mongoose 8 |
| Views | EJS (server-rendered — no separate frontend framework) |
| Auth | Passport.js (local strategy) + bcryptjs |
| File storage | Multer + Cloudinary |
| Sessions | express-session + connect-mongo |
| Testing | Vitest + Supertest + mongodb-memory-server |

**Architecture note:** this is a traditional server-rendered MVC app — Express
renders EJS templates directly and returns full HTML pages, rather than exposing a
JSON API consumed by a separate single-page frontend. There's no `client/`
directory and no React; the browser talks to one Express server the whole way.

---

## Features

- 🔐 **Authentication** — registration and login via Passport's local strategy,
  passwords hashed with bcrypt, session-based auth with sessions persisted in
  MongoDB.
- ✍️ **Post CRUD** — create, edit, and delete posts with a Quill rich-text editor
  and multi-image upload (stored on Cloudinary).
- 🏷️ **Tags & search** — posts can be tagged, browsed by tag, and searched with
  MongoDB's full-text search across title and content. Results are paginated.
- 💬 **Comments** — logged-in users can comment on posts; only a comment's author
  can edit or delete it.
- 👤 **Profiles** — users can update their username, email, bio, and profile
  picture, or delete their account (which cleans up all of their posts, comments,
  uploaded files, and Cloudinary assets).
- 🔒 **Authorization** — every edit/delete action is checked server-side against
  the resource's actual owner, not just hidden in the UI.

---

## Project structure

```
src/
  app.ts               entry point: connects to MongoDB, starts the server
  createApp.ts          builds the Express app (routes, middleware, view engine)
  config/                Cloudinary, Multer, Passport, and environment setup
  models/                Mongoose schemas (User, Post, Comment, File)
  controllers/            route handler logic
  routes/                 Express routers
  middlewares/            auth guard, error handler
  types/                  Express.User type augmentation
views/                   EJS templates (plain .ejs, not compiled by TypeScript)
public/                  static assets (CSS)
tests/                   Vitest + Supertest test suite
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
```

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

```
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/writeaway
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SESSION_SECRET=<generate with the command below>
```

Generate a strong session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Run it

```bash
npm run dev      # local development, auto-reloads on file changes
```

```bash
npm run build    # compile TypeScript to dist/
npm start        # run the compiled app (production)
```

The app listens on `http://localhost:3000` by default (override with `PORT` in `.env`).

---

## Testing

```bash
npm test         # run the full test suite once
npm run test:watch
```

Tests run against an in-memory MongoDB instance (via `mongodb-memory-server`) —
they never touch the real database configured in `.env`. Coverage includes the
registration/login flow and validation, ownership/authorization checks on post
and comment edits, stored-content sanitization, and the tag/search/pagination
feature.

---

## Screenshots

<!-- TODO: add screenshots of the posts listing, a post detail page, and the editor -->
