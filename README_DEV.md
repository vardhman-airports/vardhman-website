# Vardhman Website — Developer README

## Overview

Company marketing and operations website for **Vardhman**, an aerospace/defense airfield lighting company. Built with a traditional server-rendered Express.js + EJS stack, backed by two separate databases (MongoDB and Supabase).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES6 modules, `"type": "module"`) |
| Framework | Express.js v5 |
| Templating | EJS (server-side rendering) |
| Styling | Vanilla CSS (per-page files) |
| Frontend JS | Vanilla JavaScript |
| Primary DB | MongoDB (via Mongoose) — Blog/VIN posts |
| Secondary DB | Supabase (PostgreSQL) — Careers, POV, Admin users |
| File Storage | Supabase Storage — PDF/document uploads |
| Auth | express-session + session-file-store (file-based sessions) |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet (CSP), express-rate-limit, bcrypt |

---

## Project Structure

```
vardhman-website-main/
├── index.js                  # Express app entry point — all middleware, route mounting
├── package.json
├── .env                      # Environment secrets — DO NOT COMMIT
│
├── routes/                   # Route handlers (business logic lives here)
│   ├── home.routes.js
│   ├── about.routes.js
│   ├── products.routes.js    # Reads from data/products.json
│   ├── solutions.routes.js   # Hardcoded case study data
│   ├── careers.routes.js     # Supabase-backed job portal + admin
│   ├── pov.routes.js         # Supabase-backed white papers + admin
│   ├── vin.routes.js         # MongoDB-backed blog + admin
│   ├── contact.routes.js     # Nodemailer form submission
│   ├── search.routes.js      # Reads from public/data/test.json
│   ├── news.routes.js
│   └── METAR.routes.js       # Disabled/commented out
│
├── views/                    # EJS templates
│   ├── home.ejs
│   ├── about.ejs
│   ├── contact.ejs
│   ├── news.ejs / newsTemp.ejs
│   ├── partials/
│   │   ├── header.ejs        # Global nav
│   │   ├── footer.ejs
│   │   ├── about-slider.ejs
│   │   └── product-slider.ejs
│   ├── products/
│   │   ├── index.ejs
│   │   ├── category.ejs
│   │   └── product.ejs
│   ├── solutions/
│   │   ├── index.ejs
│   │   └── solution.ejs
│   ├── careers/
│   │   ├── index.ejs
│   │   └── admin/            # login, dashboard, add, edit
│   └── pov/
│       ├── index.ejs
│       └── admin/            # login, dashboard, add, edit
│
├── public/                   # Static assets (served at /)
│   ├── css/                  # Per-page CSS files
│   ├── js/                   # Per-page JS files
│   ├── images/               # 308+ images organized by section
│   ├── data/
│   │   └── test.json         # Search index
│   └── uploads/pov/          # Supabase-uploaded PDFs land here locally
│
├── data/
│   ├── products.json         # Full product catalog (~142 KB)
│   └── downloads/            # Product datasheets (PDFs)
│
└── out/
    └── sessions/             # File-based session store
```

---

## Local Development Setup

### Prerequisites
- Node.js >= 18
- MongoDB instance (local or Atlas)
- Supabase project (with tables and storage bucket configured)

### Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd vardhman-website-main
npm install

# 2. Create .env (see Environment Variables section below)
cp .env .env.local  # or create fresh

# 3. Start the server
npm start
# Server runs at http://localhost:4444
```

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Admin (global admin password used across session checks)
ADMIN_PASSWORD=<your-password>

# Email (Gmail SMTP — requires App Password if 2FA is on)
EMAIL_USER=<gmail-address>
EMAIL_PASS=<gmail-app-password>

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
MONGODB_USER=<user>
MONGODB_PASS=<pass>
```

> **Warning**: The `.env` file is currently committed to git. Rotate all credentials and add `.env` to `.gitignore` immediately.

---

## Route Map

| Method | Path | Handler | Notes |
|--------|------|---------|-------|
| GET | `/` | home.routes.js | Homepage |
| GET | `/about` | about.routes.js | |
| GET | `/products` | products.routes.js | Reads products.json |
| GET | `/products/category/:id` | products.routes.js | |
| GET | `/products/:id` | products.routes.js | |
| GET | `/solutions` | solutions.routes.js | Hardcoded data |
| GET | `/solutions/:id` | solutions.routes.js | |
| GET | `/news` | news.routes.js | |
| GET | `/careers` | careers.routes.js | Supabase |
| GET/POST | `/careers/admin/*` | careers.routes.js | Session-protected |
| GET | `/pov` | pov.routes.js | Supabase |
| GET/POST | `/pov/admin/*` | pov.routes.js | Session-protected |
| GET | `/contact` | contact.routes.js | |
| POST | `/contact` | contact.routes.js | Sends email via Nodemailer |
| GET | `/search` | search.routes.js | Reads test.json |
| GET/POST | `/api/*` | vin.routes.js | Blog API (MongoDB) |

---

## Database Details

### MongoDB (vin.routes.js)

Mongoose models defined inline in `routes/vin.routes.js`:

```
Blog     — { title, description, images[], links[], date, timestamps }
Comment  — { blogId, author, text, createdAt }
Popup    — { key, order, message, limit }
Image    — { data (Buffer), contentType }
Visit    — { clientId, visitCount }
```

### Supabase (PostgreSQL)

Tables used across routes:

| Table | Used by | Purpose |
|-------|---------|---------|
| `careers` | careers.routes.js | Job postings |
| `pov_posts` | pov.routes.js | White papers / PDFs |
| `admin_users` | careers, pov routes | Admin accounts, role-based login |

Storage bucket: Used for POV PDF uploads (via Multer → Supabase Storage).

---

## Admin Portals

Both admin panels use server-side session auth. The session is set on successful password match against Supabase `admin_users` table (or the global `ADMIN_PASSWORD` env var — verify per route).

| Portal | Login URL | Dashboard URL |
|--------|-----------|---------------|
| Careers | `/careers/admin/login` | `/careers/admin/dashboard` |
| POV (White Papers) | `/pov/admin/login` | `/pov/admin/dashboard` |

Session expiry: 24 hours. Sessions stored at `out/sessions/`.

---

## Product Catalog

All product data lives in `data/products.json`. Structure:

```json
{
  "products": [
    {
      "id": "...",
      "name": "...",
      "description": "...",
      "category": "...",
      "classification": "...",
      "sector": "airport | defense",
      "market": "civil | defense",
      "image": "/images/products/...",
      "specs": { ... },
      "downloads": ["path/to/datasheet.pdf"]
    }
  ]
}
```

`products.routes.js` reads this file at request time (no caching). To add/edit products, edit the JSON directly.

---

## Search

Search reads from `public/data/test.json`. This is a flat index file — update it manually when products, pages, or content changes. The search route (`search.routes.js`) filters this JSON on the server.

---

## Security Notes

### Known Issues (Fix Before Production)

1. **`.env` committed to git** — rotate all credentials, add to `.gitignore`.
2. **File-based sessions (`out/sessions/`)** — not suitable for multi-instance deployments. Switch to Redis or a DB-backed store for production scale.
3. **Admin password potentially stored in env** — verify each route; some may fall back to `ADMIN_PASSWORD` instead of database lookup.
4. **No CSRF protection** — admin POST forms are not CSRF-protected.
5. **Multer disk storage** — uploaded files go to `public/uploads/pov/`. Ensure this path is gitignored and served securely.

### What's Already Done

- Helmet with custom CSP (configured in `index.js`)
- Rate limiting: 10,000 req / 15 min per IP
- bcrypt for password hashing
- HttpOnly session cookies
- Secure cookies in production mode

---

## Adding a New Page

1. Create the route file: `routes/newpage.routes.js`
2. Create the EJS template: `views/newpage.ejs` (include `<%- include('../partials/header') %>` and footer)
3. Add CSS: `public/css/newpage.css`
4. Add JS (if needed): `public/js/newpage.js`
5. Mount the route in `index.js`:
   ```js
   import newpageRouter from './routes/newpage.routes.js';
   app.use('/newpage', newpageRouter);
   ```
6. Update navigation in `views/partials/header.ejs`
7. Update search index at `public/data/test.json`

---

## Deployment

There is currently no deployment config in the repo. The app is a standard Node.js server — deploy to any platform that runs Node.

### Environment Setup on Host

Set all `.env` variables as environment variables on the hosting platform (Render, Railway, VPS, etc.).

### Start Command

```bash
node index.js
```

### Port

Default: `4444`. Override with `PORT` env variable if needed (check `index.js` — may need to add `process.env.PORT || 4444`).

### Static Files

All static assets are in `public/` — served by Express directly. No build step required.

### Things to Configure on a New Server

- Ensure `out/sessions/` directory exists and is writable
- Ensure `public/uploads/pov/` directory exists and is writable
- Set `NODE_ENV=production` to enable secure cookies
- Point a reverse proxy (nginx / Caddy) at port 4444 for HTTPS

---

## Known Technical Debt

| Issue | Location | Priority |
|-------|----------|---------|
| Mongoose schemas defined inline in route file | vin.routes.js | Medium |
| Case study data hardcoded in route | solutions.routes.js | Low |
| Search index manually maintained | public/data/test.json | Medium |
| No `.env.example` | root | Low |
| File-based sessions | out/sessions/ | High (for scale) |
| `.env` committed | .env | Critical |
| No deployment config or CI/CD | root | Medium |
