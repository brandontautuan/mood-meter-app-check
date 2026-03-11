# Deployment Guide (Dashboard, Kiosk, Backend, PurpleAir)

## Overview

- **Dashboard** and **Kiosk** are static frontends (Vite/React), deployed e.g. on Vercel.
- **Backend** (Express in `server/`) runs separately and holds secrets (Supabase, PurpleAir). Deploy it on a service that runs Node (Railway, Render, Fly.io, or Vercel Serverless with a small adapter).

---

## 1. PurpleAir API key and sensors

1. Log in at [PurpleAir](https://www.purpleair.com/) and create an **API READ key** (account/settings or developer section).
2. Find your sensor IDs (optional but recommended):
   - Open the [PurpleAir map](https://map.purpleair.com/), find **InnovationCenterPurple - Spider Shed** and **InnovationCenterPurple FLC - Outdoor**.
   - Click a sensor → the URL or sensor details usually show the **sensor index** (numeric ID).
3. Keep the READ key and sensor IDs for the backend env (below).

---

## 2. Backend (Express server)

The backend serves mood APIs and **proxies PurpleAir** so the API key never goes to the browser.

### Env vars (create a `.env` in `server/` for local dev)

```env
PORT=4001
PURPLEAIR_READ_KEY=your_purpleair_api_read_key_here
```

Optional:

```env
# Comma-separated sensor indexes (e.g. from the map). If set, only these sensors are returned.
PURPLEAIR_SENSOR_IDS=12345,67890

# If PURPLEAIR_SENSOR_IDS is not set, the server uses the "list sensors" API and keeps only sensors whose name contains this string (default: InnovationCenterPurple).
PURPLEAIR_NAME_FILTER=InnovationCenterPurple
```

- If you set **PURPLEAIR_SENSOR_IDS**, the server fetches only those sensors by ID (reliable).
- If you leave it unset, the server lists sensors and filters by **PURPLEAIR_NAME_FILTER** so both “InnovationCenterPurple - Spider Shed” and “InnovationCenterPurple FLC - Outdoor” can show up without looking up IDs.

### Run locally

```bash
cd server
npm install
npm run dev
```

- Health: [http://localhost:4001/api/health](http://localhost:4001/api/health)
- PurpleAir proxy: [http://localhost:4001/api/purpleair](http://localhost:4001/api/purpleair) (returns JSON with `sensors` array)

### Deploy backend to a host

Pick one and set the same env vars in the host’s dashboard.

| Service   | Steps (summary) |
|----------|------------------|
| **Railway** | New Project → Deploy from GitHub → select this repo, set **Root Directory** to `server`. Add env vars in the project. Railway assigns a URL like `https://your-app.up.railway.app`. |
| **Render**  | New Web Service → connect repo, **Root Directory** `server`, build `npm install`, start `npm start`. Add env vars in Environment. Use the generated URL. |
| **Fly.io**  | From repo root: `fly launch` (or create `fly.toml` with `app = "mood-meter-api"`). Set env with `fly secrets set PURPLEAIR_READ_KEY=...`. Set root to `server` or run from `server` in Dockerfile/build. |

After deploy you get a URL like:

- `https://your-backend.up.railway.app`  
or  
- `https://your-backend.onrender.com`

Use this as the dashboard’s API base URL (next section).

---

## 3. Dashboard (Vercel)

1. In Vercel, create a project for the **dashboard** (repo root, no root directory).
2. Build command: `npm run build`  
   Output: `src-DashboardMT/dist`
3. Environment variables in Vercel:
   - Supabase (if you use it): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - **Backend (and PurpleAir):** set **VITE_API_BASE_URL** to your deployed backend URL, e.g.  
     `https://your-backend.up.railway.app`  
     (no trailing slash)
4. Redeploy. The “Air quality” tab will call `VITE_API_BASE_URL/api/purpleair` and show Innovation Center PurpleAir sensors.

---

## 4. Kiosk (Vercel, second project)

- Same repo; create a **second** Vercel project.
- **Root Directory:** `srcMTapp`
- Build: `npm run build`  
  Output: `dist`
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` if the kiosk uses Supabase.

---

## 5. Checklist

- [ ] PurpleAir READ key created and set as **PURPLEAIR_READ_KEY** on the backend.
- [ ] Optional: **PURPLEAIR_SENSOR_IDS** or **PURPLEAIR_NAME_FILTER** set on the backend so the right sensors (Spider Shed, FLC - Outdoor) are returned.
- [ ] Backend deployed and **VITE_API_BASE_URL** in the dashboard project set to that backend URL.
- [ ] Dashboard and (if used) kiosk deployed with their respective env vars.

After this, the dashboard’s **Air quality** tab should show the two Innovation Center PurpleAir sensors (and a clear error if the backend or PurpleAir key is missing).

---

## 6. Full deployment checklist (in order)

| Step | What to do |
|------|-------------|
| 1 | **PurpleAir:** Create API READ key at purpleair.com. Set it as `PURPLEAIR_READ_KEY` in backend env. |
| 2 | **Backend:** Create `server/.env` from `server/.env.example`. Add `PURPLEAIR_READ_KEY`. Optionally add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` if you use `/api/moods`. |
| 3 | **Backend deploy:** Deploy `server/` to Railway, Render, or Fly.io. Set the same env vars there. Note the backend URL (e.g. `https://xxx.railway.app`). |
| 4 | **Dashboard (Vercel):** One project, repo root. Build: `npm run build`, Output: `src-DashboardMT/dist`. Set **VITE_API_BASE_URL** to your backend URL. Set **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** if you use Supabase. **Redeploy** after changing any env vars. |
| 5 | **Kiosk (Vercel):** Second project, Root Directory: `srcMTapp`, Build: `npm run build`, Output: `dist`. Set Supabase env vars if needed. |
| 6 | **Git:** Push your repo so Vercel and your backend host build from the latest code. |

---

## 7. Anything else?

- **CORS:** The backend allows all origins. No extra CORS setup for the dashboard on another domain.
- **Vercel env vars:** Vite bakes `VITE_*` at **build time**. After adding or changing `VITE_API_BASE_URL`, trigger a **new deploy** or the old value is still used.
- **Backend without Supabase:** The server starts and serves `/api/health` and `/api/purpleair` without Supabase. Only `/api/moods` returns 503 until Supabase is configured.
- **Demo mode:** Dashboard and kiosk work in demo mode without backend or Supabase; only the Air quality tab needs the backend and PurpleAir key for real data.
