from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    role: Optional[str] = None
    years_experience: Optional[int] = None
    country: Optional[str] = None
    city: Optional[str] = None
    leads_teams: Optional[bool] = None
    interest_level: Optional[str] = None
    score: int = Field(default=0)
    qualification_status: str = Field(default="unknown")  # unknown, potential, qualified, unqualified
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    conversations: List["Conversation"] = Relationship(back_populates="user")

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    role: str # user or assistant
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    user: Optional[User] = Relationship(back_populates="conversations")
