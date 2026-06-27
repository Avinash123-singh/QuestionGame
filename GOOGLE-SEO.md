# Google pe Game kaise aayega — Fake Answer Party

## Pehle ye karo (1 baar)

### 1. Domain + Deploy
- Domain: `fakeanswer.party` (ya jo bhi lo)
- Frontend: **Vercel** → `frontend/` folder
- Backend: **Render** → `backend/` folder
- DB: **Neon** free PostgreSQL

Poora guide: [DEPLOY.md](./DEPLOY.md)

### 2. Domain Vercel se connect
Vercel → Project → Settings → Domains → `fakeanswer.party` add karo

### 3. Agar domain alag hai
In files me `fakeanswer.party` replace karo apne domain se:
- `frontend/index.html` (canonical, og:url)
- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`

---

## Google Search Console (index ke liye zaroori)

1. Jao: https://search.google.com/search-console
2. **Add property** → `https://fakeanswer.party`
3. Verify ownership (DNS TXT record ya HTML file)
4. **Sitemaps** → Submit URL:
   ```
   https://fakeanswer.party/sitemap.xml
   ```
5. **URL Inspection** → Homepage → **Request Indexing**

1–4 hafte me Google pe dikhna shuru ho sakta hai.

---

## SEO jo code me add ho chuka hai

| File | Kaam |
|------|------|
| `index.html` | Title, description, Open Graph, JSON-LD |
| `public/robots.txt` | Google ko crawl allow |
| `public/sitemap.xml` | Pages list for Google |
| `public/site.webmanifest` | Mobile home screen name |

---

## Traffic badhao (ranking fast)

- Friends ko link bhejo
- Reddit: r/WebGames, r/PartyGames
- Discord servers
- YouTube: "Fake Answer Party gameplay"
- WhatsApp / Instagram story with link

---

## Check karo index hua ya nahi

Google me search karo:
```
site:fakeanswer.party
```

Agar pages dikhein = indexed ✅
