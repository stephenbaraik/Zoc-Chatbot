# Ambassador Fellowship Chatbot

This is an AI-powered lead qualification chatbot for the Ambassador Fellowship Program.
It uses:
- **Frontend**: Next.js 14 + TailwindCSS
- **Backend**: FastAPI + LangChain + ChromaDB (RAG)
- **Database**: SQLite

## Setup Instructions

### 1. Backend

1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    python -m venv venv
    .\venv\Scripts\Activate  # Windows
    pip install -r requirements.txt
    ```
3.  Configure `.env`:
    - Rename `.env.example` to `.env` (or create one).
    - Add `OPENROUTER_API_KEY=your_key_here`.
4.  Run the server:
    ```bash
    python main.py
    ```
    The server runs at `http://localhost:8000`.

### 2. Frontend

1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to chat.

## Admin Dashboard

Visit `http://localhost:3000/admin` to see collected leads and their qualification scores.
