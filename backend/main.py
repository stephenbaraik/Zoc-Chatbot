from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, create_engine, select
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from models import User, Conversation
from chat_logic import process_message

load_dotenv()

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./chatbot.db")
connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# App Lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Ambassador Fellowship Chatbot", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Models
class ChatRequest(BaseModel):
    user_id: int # Simple ID for now, can be session ID or UUID in prod
    message: str

class ChatResponse(BaseModel):
    response: str
    user_id: int

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Ambassador Fellowship Chatbot API is running."}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, session: Session = Depends(get_session)):
    try:
        response_text = await process_message(request.user_id, request.message, session)
        return ChatResponse(response=response_text, user_id=request.user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/leads")
def get_leads(session: Session = Depends(get_session)):
    """Admin endpoint to view leads and their scores."""
    statement = select(User).order_by(User.score.desc())
    results = session.exec(statement).all()
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
