# Narrative Forge

A personal creative writing application with LLM assistance, world-building
tools, and deep personalization.

## Structure

- `backend/` — FastAPI LLM orchestration layer (Python + Poetry)
- `frontend/` — React + Vite + TypeScript UI (pnpm)

## Quick Start

### Backend
```bash
cd backend
poetry install
cp .env.example .env
poetry run uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```