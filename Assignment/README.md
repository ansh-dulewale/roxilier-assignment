# Roxilier Assignment

This project contains a full-stack application with a backend (Node.js/Express/Sequelize) and a frontend (React/Vite/Tailwind CSS).

## Prerequisites
- Node.js (v16 or above recommended)
- pnpm (recommended) or npm
- MySQL (or compatible database)

---

## Backend Setup
# Roxilier Assignment

A full-stack app with:
- Backend: Node.js/Express + Sequelize (MySQL)
- Frontend: React (Vite) + Tailwind CSS

Features
- Users can rate stores (1–5). Store average updates in real time via SSE.
- Admin dashboard: manage users/stores, see live stats, delete users/stores with cascade cleanup.
- Store Owner dashboard: see users who rated any owned store and overall average; auto-refresh on rating events.
- Profile page: view/edit profile, change password.

## Prerequisites
- Node.js 18+
- MySQL 8+ (or MariaDB compatible)
- Windows PowerShell (commands below are PowerShell-safe)

## 1) Install dependencies
```powershell
# From repo root
cd Assignment/backend
npm install

cd ../frontend
npm install
```

## 2) Configure backend environment
Create `Assignment/backend/.env` (already added for you, adjust as needed):
```
NODE_ENV=development
PORT=3000

DB_NAME=roxilier_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql
```

Ensure the database exists (create it in MySQL if missing):
```sql
CREATE DATABASE IF NOT EXISTS roxilier_db;
```

## 3) Initialize database schema
From `Assignment/backend`:
```powershell
npm run db:sync
```
This authenticates and syncs the Sequelize models (Users, Stores, Ratings).

Optional: seed an admin user (resets data):
```powershell
# Admin credentials: admin@example.com / admin123
node --env-file=.env seed.js
```

## 4) Run the servers
Backend (from `Assignment/backend`):
```powershell
npm start
```
- API base: http://localhost:3000/api/v1
- SSE stream: http://localhost:3000/api/v1/store/ratings/stream

Frontend (from `Assignment/frontend`):
```powershell
npm run dev
```
- App: http://localhost:5173

## 5) App accounts and roles
- Roles: `admin`, `owner`, `user` (legacy `store-owner` is normalized to `owner`)
- After seeding: login with admin@example.com / admin123
- You can register new users or add stores + owners from the Admin dashboard

## 6) Key pages
- Login/Register: `/auth`
- User Store List (rate stores): `/stores`
- Store Owner Dashboard: `/store-owner`
- Admin Dashboard: `/admin`
- Profile: `/profile`

## 7) Troubleshooting
- 500 errors on admin endpoints after startup:
  - Ensure DB is reachable and `.env` is loaded. Re-run: `npm run db:sync`.
  - On Windows, prefer `DB_HOST=127.0.0.1` instead of `localhost`.
- Ratings not updating in owner/admin views:
  - Confirm backend is running and SSE stream is reachable.
  - Ensure the store you rated belongs to the logged-in owner for owner view updates.
- Login redirects to `/auth` repeatedly:
  - Role must be `owner` (not `store-owner`). The app auto-normalizes but old localStorage can cause issues. Clear storage and re-login.

## 8) Scripts
Backend:
- `npm start` — start API with `.env`
- `npm run dev` — start API in watch mode with `.env`
- `npm run db:sync` — create/update tables
- `npm test` — run backend tests

Frontend:
- `npm run dev` — start Vite dev server

## 9) Tech notes
- API under `/api/v1`: admin, auth, rating, store routers.
- Real-time updates via Server-Sent Events (SSE) for rating changes.
- Sequelize models: `User` (admin/user/owner), `Store` (belongsTo owner), `Rating` (belongsTo user & store).

## 10) Security
- Don’t commit real credentials. Keep `.env` out of VCS when public.
- Move JWT secret to `.env` (e.g., `JWT_SECRET`) and reference it in `routes/auth.js` for production.
