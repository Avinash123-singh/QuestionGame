# Docker — Local Run (PostgreSQL + Backend + Frontend)

## Start everything

```bash
docker compose up --build -d
```

## Open game

| Service | URL |
|---------|-----|
| **Game (frontend)** | http://localhost:3000 |
| **API (backend)** | http://localhost:5002 |
| **PostgreSQL** | `localhost:5433` (user: `postgres`, pass: `fakeanswer`, db: `fakeanswer`) |

## What's inside

- **fakeanswer-db** — PostgreSQL 16 with **58,054 questions** auto-seeded on first start
- **fakeanswer-api** — Node.js + Socket.io backend
- **fakeanswer-web** — React frontend (nginx)

## Useful commands

```bash
docker compose ps          # status
docker compose logs -f     # live logs
docker compose down        # stop
docker compose down -v     # stop + delete database volume
docker compose restart backend
```

## Re-seed questions

```bash
docker compose exec backend node scripts/docker-seed.js
```
