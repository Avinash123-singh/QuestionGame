# 🚀 Fake Answer Party — FREE Deploy Guide

**100% free stack** — koi payment nahi:

| Service | Kaam | Cost |
|---------|------|------|
| [Neon](https://neon.tech) ya [Supabase](https://supabase.com) | PostgreSQL database | **FREE** |
| [Render](https://render.com) | Backend (Node.js) | **FREE** |
| [Vercel](https://vercel.com) | Frontend (React) | **FREE** |

> Railway ($5/mo) ki zaroorat **nahi** — Render free tier use karo.

---

## Step 1 — Database (Neon — FREE, recommended)

1. [neon.tech](https://neon.tech) → Sign up → New Project
2. Copy connection string
3. SQL Editor → paste & run `backend/db/schema.sql`
4. Seed questions:
   ```bash
   cd backend
   echo "DATABASE_URL=your-neon-url" >> .env
   npm run seed-questions
   ```
   Ye **58,000 questions** (1000 × 58 categories) insert karega.

**Alternative:** Supabase bhi free hai — same steps.

---

## Step 2 — Backend (Render — FREE)

1. GitHub pe code push karo
2. [render.com](https://render.com) → New **Web Service** → connect repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build:** `npm install`
   - **Start:** `npm start`
4. Environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon/Supabase connection string |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |

5. Deploy → copy URL: `https://fakeanswer-api.onrender.com`

> Render free tier cold start ho sakta hai (30 sec) — normal hai.

---

## Step 3 — Frontend (Vercel — FREE)

1. [vercel.com](https://vercel.com) → Import GitHub repo
2. **Root Directory:** `frontend`
3. Environment:
   ```
   VITE_SOCKET_URL=https://fakeanswer-api.onrender.com
   ```
4. Deploy → `https://your-game.vercel.app`
5. Render me `CLIENT_URL` update karo

---

## Local Run (abhi test karo)

```bash
# Questions already generated in backend/data/ (58,000)

# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open: **http://localhost:5173**

### Docker Postgres (optional, local DB)
```bash
docker compose up -d
# backend/.env already has DATABASE_URL for port 5433
cd backend && npm run seed-questions
```

---

## Categories (58 total)

Create Room → **Categories dropdown**:
- 🎲 **Mixed Mode** — har round alag category
- **Multi-select** — jitni categories select karo, sirf unhi se questions aayenge

---

## Ollama AI (better quality questions)

```bash
brew install ollama
ollama pull llama3
cd backend
npm run generate-questions weird_facts 100
```

Game me AI **nahi** chalta — sirf pre-generated questions.

---

## Checklist

- [ ] 58,000 questions generated (`backend/data/bulk-*.json`)
- [ ] Neon/Supabase DATABASE_URL set
- [ ] Render backend live
- [ ] Vercel frontend live
- [ ] `VITE_SOCKET_URL` = Render URL
- [ ] 2 phones se same room code test
