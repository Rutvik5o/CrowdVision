# CrowdVision — Real-Time People Counting & Queue Intelligence

> AI-powered crowd analytics for retail, events, and healthcare. Upload any CCTV video and get instant people counting, queue management, dwell time estimation, and overcrowding alerts.

---

## Architecture

```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐
│   FRONTEND (Vercel)             │     │   BACKEND (Railway.app)          │
│   Next.js 14 + Tailwind         │────▶│   FastAPI + Python               │
│   Framer Motion + Recharts      │◀────│   YOLOv8n + ByteTrack            │
│   app/page.tsx     (landing)    │ SSE │   /api/analyze  (upload)         │
│   app/dashboard/   (analysis)   │     │   /api/stream   (live updates)   │
└─────────────────────────────────┘     │   /api/download (results)        │
                                        └──────────────────────────────────┘
```

**Video flow:**
1. User uploads video on Vercel frontend
2. Frontend POSTs to `/api/analyze` on Railway backend
3. Backend starts processing in background thread
4. Frontend connects to `/api/stream/{job_id}` (SSE) for live updates
5. Every N frames: backend pushes progress % + preview frame (base64 JPEG)
6. On completion: download annotated MP4, heatmap, CSVs as ZIP

---

## Project Structure

```
crowdvision/
├── frontend/                    ← Next.js app (deploy to Vercel)
│   ├── app/
│   │   ├── layout.tsx           ← Root layout + fonts + metadata
│   │   ├── globals.css          ← Tailwind + custom CSS
│   │   ├── page.tsx             ← Landing / hero page
│   │   └── dashboard/
│   │       └── page.tsx         ← Upload + live analysis UI
│   ├── components/
│   │   ├── StatsPanel.tsx       ← Live stat cards (IN/OUT/occupancy/dwell)
│   │   ├── AlertBanner.tsx      ← Alert log with level colours
│   │   └── LiveChart.tsx        ← Recharts time-series (occupancy/flow/fps)
│   ├── lib/
│   │   └── api.ts               ← All API calls + SSE streaming
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json
│   └── .env.example
│
└── backend/                     ← FastAPI Python app (deploy to Railway)
    ├── main.py                  ← FastAPI routes + SSE streaming
    ├── processor.py             ← YOLOv8 + ByteTrack pipeline
    ├── requirements.txt
    ├── Procfile
    ├── railway.toml
    └── .env.example
```

---

## Step 1 — Local Development Setup

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- Python 3.10+ ([python.org](https://python.org))
- Git ([git-scm.com](https://git-scm.com))
- A free [Railway](https://railway.app) account
- A free [Vercel](https://vercel.com) account

---

### Backend Setup (local)

```bash
# 1. Go to backend folder
cd crowdvision/backend

# 2. Create virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy env file
cp .env.example .env
# Edit .env: set BACKEND_URL=http://localhost:8000

# 5. Run the backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 6. Test it: open http://localhost:8000/health in browser
# Expected: {"status":"ok","gpu":false,"device":"cpu",...}
```

> **Note:** First run downloads YOLOv8n weights (~6 MB) automatically.

---

### Frontend Setup (local)

```bash
# 1. Go to frontend folder
cd crowdvision/frontend

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# 4. Run the dev server
npm run dev

# 5. Open http://localhost:3000
```

You should see the CrowdVision landing page. Click "Analyse Your Video" to go to the dashboard. The backend status indicator (top right) should show "Backend Online" in green.

---

## Step 2 — Deploy Backend to Railway

Railway is the easiest way to host the Python backend for free.

### 2.1 Create Railway account
Go to [railway.app](https://railway.app) → Sign up with GitHub (free).

### 2.2 Push backend to GitHub

```bash
# From the root of your project:
git init
git add .
git commit -m "Initial commit: CrowdVision"

# Create a new repo on GitHub (github.com → New repository)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/crowdvision.git
git push -u origin main
```

### 2.3 Deploy on Railway

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your `crowdvision` repository
4. Railway will ask **which folder** — type `backend`
5. Click **Deploy**

Railway auto-detects Python via `requirements.txt` and runs the `Procfile`.

### 2.4 Set environment variables on Railway

In Railway dashboard → your project → **Variables** tab:

| Variable | Value |
|---|---|
| `BACKEND_URL` | `https://your-app-name.railway.app` (copy from Railway's generated URL) |
| `OUTPUT_DIR` | `/tmp/crowdvision_output` |

### 2.5 Get your Railway URL

In Railway dashboard → your project → **Settings** → **Domains** → copy the URL.

It looks like: `https://crowdvision-backend-production.up.railway.app`

Test it: open `https://YOUR-RAILWAY-URL.railway.app/health` in browser.

> **Free tier note:** Railway free tier gives 500 hours/month. The backend sleeps after inactivity and takes ~30 seconds to wake on first request. For demo purposes this is fine.

---

## Step 3 — Deploy Frontend to Vercel

### 3.1 Deploy to Vercel

```bash
# From the frontend folder:
cd crowdvision/frontend

# Install Vercel CLI globally
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
#   Set up and deploy? Y
#   Which scope? (your username)
#   Link to existing project? N
#   What's your project name? crowdvision
#   In which directory is your code? ./  (you're already in frontend/)
#   Want to override settings? N
```

Vercel builds and deploys automatically. You'll get a URL like:
`https://crowdvision.vercel.app`

### 3.2 Set environment variable on Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → your project
2. **Settings** → **Environment Variables**
3. Add:
   - **Name:** `NEXT_PUBLIC_BACKEND_URL`
   - **Value:** `https://YOUR-RAILWAY-URL.railway.app`
   - **Environment:** Production + Preview + Development

4. Go to **Deployments** → click the three dots on latest → **Redeploy**

### 3.3 Verify

Open your Vercel URL. The "Backend Online" indicator should show green within 30 seconds (Railway wakes up). Upload a test video and the pipeline runs.

---

## Step 4 — Update the backend URL after redeployment

Whenever Railway gives you a new URL, update it in two places:

1. **Railway Variables:** `BACKEND_URL` = new URL
2. **Vercel Environment Variables:** `NEXT_PUBLIC_BACKEND_URL` = new URL → redeploy

---

## Known Limitations

| Limitation | Detail | Workaround |
|---|---|---|
| **Railway free tier sleeps** | Backend sleeps after ~10 min inactivity | First request wakes it (takes ~30s). Upgrade to Hobby ($5/mo) to keep alive |
| **No persistent storage** | Railway ephemeral disk loses files on restart | Download ZIP immediately after processing. For persistence, add Railway Volume or use S3 |
| **Video size limit** | FastAPI defaults to 1 GB body; Railway memory is 512 MB on free tier | Keep videos under 100 MB for free tier. 500 MB works on paid tier |
| **Single worker** | FastAPI runs 1 worker → 1 video at a time | For concurrent users, add job queue (Celery + Redis) or scale workers |
| **No ReID** | ByteTrack IDs are per-camera, not cross-camera | For cross-camera, add deep-sort-realtime (increases backend size) |
| **CPU-only free tier** | Railway free has no GPU → ~4-8 FPS processing | For faster processing, use Railway GPU instance ($34/mo) or Google Cloud |
| **Vercel SSE timeout** | Vercel Pro has 5-min timeout on responses | The SSE connects directly to Railway (not via Vercel), so this is not an issue |

---

## Local GPU Setup (optional)

If your local machine has an NVIDIA GPU:

```bash
# Install CUDA-enabled PyTorch first
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# Then install requirements
pip install -r requirements.txt

# In .env, set: (the processor auto-detects GPU)
# No change needed — processor.py checks torch.cuda.is_available()
```

With GPU, processing speed increases from ~6 FPS to ~60–100 FPS.

---

## Common Errors and Fixes

### "Backend Offline" indicator on dashboard
- Make sure the backend is running: `uvicorn main:app --reload --port 8000`
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local` is correct
- Railway free tier: wait 30 seconds for cold start

### `UnpicklingError` when loading YOLOv8 model
- Upgrade ultralytics: `pip install -U "ultralytics>=8.3.0"`
- The patch in `processor.py` handles this automatically

### `CORS error` in browser console
- The backend `main.py` has `allow_origins=["*"]` for development
- For production, change to your Vercel URL: `allow_origins=["https://crowdvision.vercel.app"]`

### Video processing hangs / no progress
- Check Railway logs: dashboard → your project → **Logs** tab
- Large videos on CPU take time: a 2-minute 1080p video takes ~8 minutes on CPU

### `Module not found: 'ultralytics'`
- Make sure venv is activated: `source venv/bin/activate`
- Run `pip install -r requirements.txt` again

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend framework | Next.js 14 | SSR + App Router + Vercel native |
| UI | Tailwind CSS | Utility-first, fast iteration |
| Animation | Framer Motion | Production-grade React animations |
| Charts | Recharts | Composable React chart library |
| Icons | Lucide React | Consistent icon set |
| Font | DM Serif Display + DM Sans | Editorial + clean pairing |
| Detection | YOLOv8n | Fastest COCO-pretrained person detector |
| Tracking | ByteTrack (via Ultralytics) | No extra install, robust re-association |
| Backend | FastAPI | Async Python, SSE support, auto Swagger docs |
| Deployment (front) | Vercel | Zero-config Next.js deployment |
| Deployment (back) | Railway | Free Python hosting, Procfile support |

---

## API Reference (auto-generated at /docs)

When the backend is running, visit `http://localhost:8000/docs` for the full interactive Swagger UI with all endpoints documented.

---

## Team 9 — Adani Institute of Digital Technology Management
PGDM — Artificial Intelligence & Data Science
