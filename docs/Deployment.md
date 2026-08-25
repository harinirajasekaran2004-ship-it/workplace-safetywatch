# Deployment Guide

Workplace SafetyWatch is built for rapid cloud deployment with zero secrets hardcoded into Git.

---

## 1. Backend Deployment (Railway)
- **Runtime:** Python 3.11+
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `GROQ_API_KEY`: Your Groq production key
  - `SUPABASE_URL`: Supabase project URL
  - `SUPABASE_KEY`: Supabase service/anon key
  - `LANGCHAIN_TRACING_V2`: `true`
  - `LANGCHAIN_PROJECT`: `workplace-safetywatch`
  - `LANGCHAIN_API_KEY`: LangSmith API key

## 2. Frontend Deployment (Vercel)
- **Framework Preset:** Next.js
- **Root Directory:** `frontend/`
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL`: Your deployed Railway backend URL (e.g. `https://workplace-safetywatch-api.up.railway.app`)

## 3. Database & Storage Setup (Supabase)
1. Execute `backend/app/db/schema.sql` in Supabase SQL Editor.
2. Create public storage bucket named `hazard-images`.
3. Enable CORS for the frontend origin.

See also: [[Architecture]], [[Supabase Schema]], [[Project Overview]].
