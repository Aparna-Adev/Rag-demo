# Simple RAG

A full-stack RAG demo with a FastAPI backend and a React/Vite frontend.

## Project structure

- `backend/` - FastAPI API, SQLite persistence, document ingestion, auth, search, and chat routes.
- `frontend/` - React/Vite app that talks to the backend API.

## Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The backend runs on `http://127.0.0.1:8000` by default. Put secrets such as `GROQ_API_KEY`, `JWT_SECRET_KEY`, and rate-limit values in `backend/.env`.

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `VITE_API_BASE_URL` when set, and otherwise calls `http://127.0.0.1:8000`.

## Notes

Local runtime files are ignored by Git, including `.env`, virtual environments, `node_modules`, SQLite databases, uploaded documents, build output, and Python caches.
