# Fake Answer Party — Full Stack Multiplayer Game

Online bluffing party game built with **React + Vite**, **Node.js + Express + Socket.io**, and optional **PostgreSQL/Supabase**.

## Quick Start (Local)

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Server runs on `http://localhost:5002`

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm install socket.io-client
npm run dev
```
App runs on `http://localhost:5173`

### 3. Play with friends (same network)
Open two browser tabs/windows. One player **Create Room**, others **Join Room** with the 6-letter code.

---

## Architecture

```
Frontend (Vercel)          Backend (Railway/Render)        Database (optional)
     │                              │                           │
     │  Socket.io (realtime)        │                           │
     ├─────────────────────────────►│  In-memory active rooms     │
     │  REST /health                │                           │
     │                              ├──────────────────────────►│ PostgreSQL
     │                              │  Questions + game history   │ (Supabase)
```

### Game Flow (Server-Authoritative)
1. Host creates room → server generates room code
2. Players join via code → live lobby sync
3. Host starts game → submit → vote → results → repeat
4. Scoring: +100 correct guess, +50 per fooled player
5. Final leaderboard → game over

---

## Deploy to Production

### Frontend → Vercel
1. Push repo to GitHub
2. Import project in [Vercel](https://vercel.com) → set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_SOCKET_URL=https://your-backend-url.railway.app
   ```
4. Deploy

### Backend → Railway (recommended)
1. Create project at [Railway](https://railway.app)
2. Deploy from GitHub → set **Root Directory** to `backend`
3. Add environment variables:
   ```
   PORT=5002
   CLIENT_URL=https://your-app.vercel.app
   NODE_ENV=production
   DATABASE_URL=postgresql://...   (optional)
   ```
4. Railway auto-assigns a public URL — use this as `VITE_SOCKET_URL`

### Backend → Render (alternative)
1. New **Web Service** → root: `backend`
2. Build: `npm install` | Start: `npm start`
3. Set same env vars as Railway

### Database → Supabase (optional)
1. Create project at [Supabase](https://supabase.com)
2. SQL Editor → run `backend/db/schema.sql`
3. Copy connection string → set as `DATABASE_URL` on Railway
4. Questions auto-seed on first server start

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_SOCKET_URL` | Frontend | Backend Socket.io URL |
| `CLIENT_URL` | Backend | Frontend URL(s) for CORS (comma-separated) |
| `PORT` | Backend | Server port (default 5002) |
| `DATABASE_URL` | Backend | PostgreSQL connection (optional) |
| `NODE_ENV` | Backend | `production` in deploy |

---

## Socket Events

| Client → Server | Server → Client |
|-----------------|-----------------|
| `create-room` | `room-created` |
| `join-room` | `join-success` / `join-error` |
| `start-game` | `game-started` |
| `submit-answer` | `submit-progress`, `phase-changed` |
| `cast-vote` | `vote-progress`, `round-results` |
| `next-round` | `phase-changed`, `game-over` |
| `chat-message` | `chat-message` |
| `leave-room` | `players-update` |

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind, MUI, Socket.io Client
- **Backend:** Node.js, Express, Socket.io
- **Database:** PostgreSQL / Supabase (optional)
- **Hosting:** Vercel + Railway/Render

---

## License

MIT
