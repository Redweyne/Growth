from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import litellm
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30

AI_API_KEY = os.environ.get('AI_API_KEY', os.environ.get('EMERGENT_LLM_KEY', ''))


class UserDB(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    wisdom_notifications = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class GoalDB(Base):
    __tablename__ = "goals"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    category = Column(String, default="personal")
    principle = Column(String, default="think_and_grow_rich")
    why = Column(Text, default="")
    target_date = Column(String, nullable=True)
    milestones = Column(JSON, default=list)
    status = Column(String, default="active")
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class HabitDB(Base):
    __tablename__ = "habits"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    frequency = Column(String, default="daily")
    streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    last_completed = Column(String, nullable=True)
    completion_dates = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class VisionBoardItemDB(Base):
    __tablename__ = "vision_board"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    position = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class JournalEntryDB(Base):
    __tablename__ = "journal"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    mood = Column(String, nullable=True)
    gratitude = Column(JSON, default=list)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ExerciseDB(Base):
    __tablename__ = "exercises"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    exercise_type = Column(String, nullable=False)
    content = Column(JSON, nullable=False)
    completed = Column(Boolean, default=False)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class RitualCompletionDB(Base):
    __tablename__ = "ritual_completions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    ritual_type = Column(String, nullable=False)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WisdomFavoriteDB(Base):
    __tablename__ = "wisdom_favorites"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    quote_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class IdentityStatementDB(Base):
    __tablename__ = "identity_statements"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    old_identity = Column(Text, nullable=False)
    new_identity = Column(Text, nullable=False)
    evidence_count = Column(Integer, default=0)
    strength_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class IdentityEvidenceDB(Base):
    __tablename__ = "identity_evidence"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    identity_id = Column(String, nullable=False)
    evidence_text = Column(Text, nullable=False)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ObstacleDB(Base):
    __tablename__ = "obstacles"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    obstacle_text = Column(Text, nullable=False)
    perception = Column(Text, nullable=True)
    action = Column(Text, nullable=True)
    will = Column(Text, nullable=True)
    status = Column(String, default="active")
    transformed_at = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class BurningDesireDB(Base):
    __tablename__ = "burning_desires"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, unique=True, nullable=False)
    desire_text = Column(Text, nullable=False)
    why_text = Column(Text, nullable=False)
    vision_text = Column(Text, nullable=False)
    intensity = Column(Integer, default=10)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DesireVisualizationDB(Base):
    __tablename__ = "desire_visualizations"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    desire_id = Column(String, nullable=False)
    intensity_rating = Column(Integer, nullable=False)
    emotion = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class PremeditatioPracticeDB(Base):
    __tablename__ = "premeditatio_practices"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    scenario = Column(Text, nullable=False)
    potential_obstacles = Column(JSON, default=list)
    planned_responses = Column(JSON, default=list)
    resilience_score = Column(Integer, nullable=True)
    actual_outcome = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class HabitChainDB(Base):
    __tablename__ = "habit_chains"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    existing_habit = Column(Text, nullable=False)
    new_habit = Column(Text, nullable=False)
    chain_items = Column(JSON, default=list)
    success_count = Column(Integer, default=0)
    total_attempts = Column(Integer, default=0)
    chain_strength = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class HabitChainCompletionDB(Base):
    __tablename__ = "habit_chain_completions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    chain_id = Column(String, nullable=False)
    success = Column(Boolean, nullable=False)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class JourneyMilestoneDB(Base):
    __tablename__ = "journey_milestones"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    emotion = Column(String, nullable=True)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class LegacyStatementDB(Base):
    __tablename__ = "legacy_statements"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, unique=True, nullable=False)
    legacy_text = Column(Text, nullable=False)
    values = Column(JSON, default=list)
    impact_areas = Column(JSON, default=list)
    future_self_letter = Column(Text, nullable=True)
    mission_statement = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class MorningRoutineDB(Base):
    __tablename__ = "morning_routines"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    routine_name = Column(String, nullable=False)
    philosophy = Column(String, nullable=False)
    steps = Column(JSON, default=list)
    total_duration = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    last_completed = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class MorningRoutineCompletionDB(Base):
    __tablename__ = "morning_routine_completions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    routine_id = Column(String, nullable=False)
    completed_steps = Column(JSON, default=list)
    date = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoalCreate(BaseModel):
    title: str
    description: str = ""
    category: str = "personal"
    principle: str = "think_and_grow_rich"
    why: str = ""
    target_date: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = []

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    principle: Optional[str] = None
    why: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    target_date: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = None

class HabitCreate(BaseModel):
    name: str
    description: str
    frequency: str = "daily"

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None

class VisionBoardItemCreate(BaseModel):
    type: str
    content: str
    position: Optional[Dict[str, Any]] = None

class JournalEntryCreate(BaseModel):
    content: str
    mood: Optional[str] = None
    gratitude: Optional[List[str]] = []

class ExerciseCreate(BaseModel):
    exercise_type: str
    content: Dict[str, Any]

class AICoachRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class RitualCompleteRequest(BaseModel):
    ritual_type: str
    completed_at: str

class WisdomFavoriteCreate(BaseModel):
    quote_id: str

class WisdomNotificationPreference(BaseModel):
    enabled: bool

class IdentityStatementCreate(BaseModel):
    old_identity: str
    new_identity: str

class IdentityEvidenceCreate(BaseModel):
    identity_id: str
    evidence_text: str

class ObstacleCreate(BaseModel):
    obstacle_text: str

class ObstacleUpdate(BaseModel):
    perception: Optional[str] = None
    action: Optional[str] = None
    will: Optional[str] = None
    status: Optional[str] = None

class BurningDesireCreate(BaseModel):
    desire_text: str
    why_text: str
    vision_text: str
    intensity: int = 10

class DesireVisualizationCreate(BaseModel):
    desire_id: str
    intensity_rating: int
    emotion: str
    notes: Optional[str] = None

class PremeditatioPracticeCreate(BaseModel):
    scenario: str
    potential_obstacles: List[str] = []
    planned_responses: List[str] = []

class PremeditatioPracticeUpdate(BaseModel):
    resilience_score: Optional[int] = None
    actual_outcome: Optional[str] = None
    lessons_learned: Optional[str] = None

class HabitChainCreate(BaseModel):
    name: str
    existing_habit: str
    new_habit: str
    chain_items: Optional[List[Dict[str, str]]] = []

class HabitChainCompletion(BaseModel):
    chain_id: str
    success: bool

class JourneyMilestoneCreate(BaseModel):
    title: str
    description: str
    category: str
    emotion: Optional[str] = None
    date: Optional[str] = None

class LegacyStatementCreate(BaseModel):
    legacy_text: str
    values: Optional[List[str]] = []
    impact_areas: Optional[List[str]] = []
    future_self_letter: Optional[str] = None
    mission_statement: Optional[str] = None

class MorningRoutineCreate(BaseModel):
    routine_name: str
    philosophy: str
    steps: List[Dict[str, Any]] = []
    total_duration: int = 0

class MorningRoutineCompletion(BaseModel):
    routine_id: str
    completed_steps: List[str] = []


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    return jwt.encode({"user_id": user_id, "exp": expiration}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@api_router.post("/auth/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(UserDB).filter(UserDB.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = UserDB(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    
    token = create_token(user_id)
    return {"token": token, "user": {"id": user_id, "email": user_data.email, "name": user_data.name}}

@api_router.post("/auth/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user.id)
    return {"token": token, "user": {"id": user.id, "email": user.email, "name": user.name}}


@api_router.post("/goals")
def create_goal(goal_data: GoalCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    milestones = goal_data.milestones or []
    progress = 0
    if milestones:
        completed = sum(1 for m in milestones if m.get('completed', False))
        progress = int((completed / len(milestones)) * 100) if milestones else 0
    
    goal_id = str(uuid.uuid4())
    goal = GoalDB(
        id=goal_id,
        user_id=user_id,
        title=goal_data.title,
        description=goal_data.description,
        category=goal_data.category,
        principle=goal_data.principle,
        why=goal_data.why,
        target_date=goal_data.target_date,
        milestones=milestones,
        progress=progress
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    return {
        "id": goal.id, "user_id": goal.user_id, "title": goal.title,
        "description": goal.description, "category": goal.category,
        "principle": goal.principle, "why": goal.why,
        "target_date": goal.target_date, "milestones": goal.milestones,
        "status": goal.status, "progress": goal.progress,
        "created_at": goal.created_at.isoformat(),
        "updated_at": goal.updated_at.isoformat()
    }

@api_router.get("/goals")
def get_goals(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(GoalDB).filter(GoalDB.user_id == user_id).all()
    return [{
        "id": g.id, "user_id": g.user_id, "title": g.title,
        "description": g.description, "category": g.category,
        "principle": g.principle, "why": g.why,
        "target_date": g.target_date, "milestones": g.milestones or [],
        "status": g.status, "progress": g.progress,
        "created_at": g.created_at.isoformat() if g.created_at else None,
        "updated_at": g.updated_at.isoformat() if g.updated_at else None
    } for g in goals]

@api_router.put("/goals/{goal_id}")
def update_goal(goal_id: str, goal_update: GoalUpdate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(GoalDB).filter(GoalDB.id == goal_id, GoalDB.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = goal_update.model_dump(exclude_unset=True)
    
    if 'milestones' in update_data and update_data['milestones']:
        milestones = update_data['milestones']
        completed = sum(1 for m in milestones if m.get('completed', False))
        update_data['progress'] = int((completed / len(milestones)) * 100)
        if completed == len(milestones) and len(milestones) > 0:
            update_data['status'] = 'completed'
    
    for key, value in update_data.items():
        if value is not None:
            setattr(goal, key, value)
    goal.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(goal)
    
    return {
        "id": goal.id, "user_id": goal.user_id, "title": goal.title,
        "description": goal.description, "category": goal.category,
        "principle": goal.principle, "why": goal.why,
        "target_date": goal.target_date, "milestones": goal.milestones or [],
        "status": goal.status, "progress": goal.progress,
        "created_at": goal.created_at.isoformat(),
        "updated_at": goal.updated_at.isoformat()
    }

@api_router.delete("/goals/{goal_id}")
def delete_goal(goal_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(GoalDB).filter(GoalDB.id == goal_id, GoalDB.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}


@api_router.post("/habits")
def create_habit(habit_data: HabitCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    habit_id = str(uuid.uuid4())
    habit = HabitDB(
        id=habit_id, user_id=user_id,
        name=habit_data.name, description=habit_data.description,
        frequency=habit_data.frequency
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    
    return {
        "id": habit.id, "user_id": habit.user_id, "name": habit.name,
        "description": habit.description, "frequency": habit.frequency,
        "streak": habit.streak, "best_streak": habit.best_streak,
        "last_completed": habit.last_completed,
        "completion_dates": habit.completion_dates or [],
        "created_at": habit.created_at.isoformat()
    }

@api_router.get("/habits")
def get_habits(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    habits = db.query(HabitDB).filter(HabitDB.user_id == user_id).all()
    return [{
        "id": h.id, "user_id": h.user_id, "name": h.name,
        "description": h.description, "frequency": h.frequency,
        "streak": h.streak, "best_streak": h.best_streak,
        "last_completed": h.last_completed,
        "completion_dates": h.completion_dates or [],
        "created_at": h.created_at.isoformat() if h.created_at else None
    } for h in habits]

@api_router.post("/habits/{habit_id}/complete")
def complete_habit(habit_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(HabitDB).filter(HabitDB.id == habit_id, HabitDB.user_id == user_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    today = datetime.now(timezone.utc).date().isoformat()
    completion_dates = list(habit.completion_dates or [])
    streak = habit.streak
    
    if today not in completion_dates:
        completion_dates.append(today)
        sorted_dates = sorted(completion_dates, reverse=True)
        streak = 1
        for i in range(len(sorted_dates) - 1):
            current = datetime.fromisoformat(sorted_dates[i]).date()
            previous = datetime.fromisoformat(sorted_dates[i + 1]).date()
            if (current - previous).days == 1:
                streak += 1
            else:
                break
        
        habit.completion_dates = completion_dates
        habit.last_completed = today
        habit.streak = streak
        habit.best_streak = max(habit.best_streak, streak)
        db.commit()
    
    return {"message": "Habit completed", "streak": streak}

@api_router.put("/habits/{habit_id}")
def update_habit(habit_id: str, habit_update: HabitUpdate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(HabitDB).filter(HabitDB.id == habit_id, HabitDB.user_id == user_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    update_data = habit_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(habit, key, value)
    db.commit()
    db.refresh(habit)
    
    return {
        "id": habit.id, "user_id": habit.user_id, "name": habit.name,
        "description": habit.description, "frequency": habit.frequency,
        "streak": habit.streak, "best_streak": habit.best_streak,
        "last_completed": habit.last_completed,
        "completion_dates": habit.completion_dates or [],
        "created_at": habit.created_at.isoformat()
    }

@api_router.delete("/habits/{habit_id}")
def delete_habit(habit_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = db.query(HabitDB).filter(HabitDB.id == habit_id, HabitDB.user_id == user_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted"}


@api_router.post("/vision-board")
def create_vision_item(item_data: VisionBoardItemCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    item_id = str(uuid.uuid4())
    item = VisionBoardItemDB(
        id=item_id, user_id=user_id,
        type=item_data.type, content=item_data.content,
        position=item_data.position
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return {
        "id": item.id, "user_id": item.user_id, "type": item.type,
        "content": item.content, "position": item.position,
        "created_at": item.created_at.isoformat()
    }

@api_router.get("/vision-board")
def get_vision_board(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(VisionBoardItemDB).filter(VisionBoardItemDB.user_id == user_id).all()
    return [{
        "id": i.id, "user_id": i.user_id, "type": i.type,
        "content": i.content, "position": i.position,
        "created_at": i.created_at.isoformat() if i.created_at else None
    } for i in items]

@api_router.delete("/vision-board/{item_id}")
def delete_vision_item(item_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(VisionBoardItemDB).filter(VisionBoardItemDB.id == item_id, VisionBoardItemDB.user_id == user_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}


@api_router.post("/journal")
def create_journal_entry(entry_data: JournalEntryCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    entry_id = str(uuid.uuid4())
    entry = JournalEntryDB(
        id=entry_id, user_id=user_id,
        content=entry_data.content, mood=entry_data.mood,
        gratitude=entry_data.gratitude or [],
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    
    return {
        "id": entry.id, "user_id": entry.user_id, "content": entry.content,
        "mood": entry.mood, "gratitude": entry.gratitude or [],
        "date": entry.date, "created_at": entry.created_at.isoformat()
    }

@api_router.get("/journal")
def get_journal_entries(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    entries = db.query(JournalEntryDB).filter(JournalEntryDB.user_id == user_id).order_by(JournalEntryDB.date.desc()).all()
    return [{
        "id": e.id, "user_id": e.user_id, "content": e.content,
        "mood": e.mood, "gratitude": e.gratitude or [],
        "date": e.date, "created_at": e.created_at.isoformat() if e.created_at else None
    } for e in entries]


@api_router.post("/exercises")
def create_exercise(exercise_data: ExerciseCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    exercise_id = str(uuid.uuid4())
    exercise = ExerciseDB(
        id=exercise_id, user_id=user_id,
        exercise_type=exercise_data.exercise_type,
        content=exercise_data.content, completed=True,
        date=datetime.now(timezone.utc).date().isoformat()
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    
    return {
        "id": exercise.id, "user_id": exercise.user_id,
        "exercise_type": exercise.exercise_type, "content": exercise.content,
        "completed": exercise.completed, "date": exercise.date,
        "created_at": exercise.created_at.isoformat()
    }

@api_router.get("/exercises")
def get_exercises(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    exercises = db.query(ExerciseDB).filter(ExerciseDB.user_id == user_id).order_by(ExerciseDB.date.desc()).all()
    return [{
        "id": e.id, "user_id": e.user_id,
        "exercise_type": e.exercise_type, "content": e.content,
        "completed": e.completed, "date": e.date,
        "created_at": e.created_at.isoformat() if e.created_at else None
    } for e in exercises]


@api_router.post("/ai-coach")
async def ai_coach(request: AICoachRequest, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        goals = db.query(GoalDB).filter(GoalDB.user_id == user_id, GoalDB.status == "active").limit(10).all()
        habits = db.query(HabitDB).filter(HabitDB.user_id == user_id).limit(10).all()
        journals = db.query(JournalEntryDB).filter(JournalEntryDB.user_id == user_id).order_by(JournalEntryDB.created_at.desc()).limit(3).all()
        
        mentor = request.context.get('mentor_personality', 'hill') if request.context else 'hill'
        
        mentor_prompts = {
            'hill': f"""You are Napoleon Hill, author of 'Think and Grow Rich'. You help people develop a success mindset and achieve their definite chief aim.

User Context:
- Active Goals: {len(goals)}
- Habits Tracked: {len(habits)}
- Recent Reflections: {len(journals)}

Your coaching style:
- Focus on the power of thought, desire, and persistence
- Emphasize developing a burning desire and definite purpose
- Teach the principles of auto-suggestion and faith
- Help users overcome fear and develop a millionaire mindset
- Speak with authority and inspiration

Be encouraging, visionary, and help users see their unlimited potential.""",
            
            'clear': f"""You are James Clear, author of 'Atomic Habits'. You help people build better habits through small, incremental changes.

User Context:
- Active Goals: {len(goals)}
- Habits Tracked: {len(habits)}
- Recent Reflections: {len(journals)}

Your coaching style:
- Focus on systems over goals
- Teach the habit loop: cue, craving, response, reward
- Emphasize making habits obvious, attractive, easy, and satisfying
- Help users focus on identity-based habits
- Use practical examples and scientific research

Be practical, encouraging, and help users understand that small changes compound into remarkable results.""",
            
            'holiday': f"""You are Ryan Holiday, author of 'The Obstacle Is The Way'. You help people apply Stoic philosophy to modern challenges.

User Context:
- Active Goals: {len(goals)}
- Habits Tracked: {len(habits)}
- Recent Reflections: {len(journals)}

Your coaching style:
- Focus on perception, action, and will
- Teach that the obstacle in the path becomes the path
- Help users reframe challenges as opportunities
- Emphasize what's in their control vs what's not
- Speak with calm wisdom and philosophical depth

Be thoughtful, challenging, and help users see that every obstacle contains the seed of an equal or greater opportunity."""
        }
        
        context_info = mentor_prompts.get(mentor, mentor_prompts['hill'])
        session_id = request.context.get('session_id', str(uuid.uuid4())) if request.context else str(uuid.uuid4())
        
        messages = [
            {"role": "system", "content": context_info},
            {"role": "user", "content": request.message}
        ]
        
        response = await litellm.acompletion(
            model="gemini/gemini-2.0-flash",
            messages=messages,
            api_key=AI_API_KEY
        )
        
        response_text = response.choices[0].message.content
        return {"response": response_text, "session_id": session_id}
    
    except Exception as e:
        logger.error(f"AI Coach error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@api_router.get("/analytics/overview")
def get_analytics(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(GoalDB).filter(GoalDB.user_id == user_id).all()
    habits = db.query(HabitDB).filter(HabitDB.user_id == user_id).all()
    journals = db.query(JournalEntryDB).filter(JournalEntryDB.user_id == user_id).all()
    exercises = db.query(ExerciseDB).filter(ExerciseDB.user_id == user_id).all()
    
    total_goals = len(goals)
    completed_goals = len([g for g in goals if g.status == 'completed'])
    active_goals = len([g for g in goals if g.status == 'active'])
    
    total_habits = len(habits)
    max_streak = max([h.streak for h in habits], default=0)
    best_streak_ever = max([h.best_streak for h in habits], default=0)
    avg_streak = sum([h.streak for h in habits]) / total_habits if total_habits > 0 else 0
    
    today = datetime.now(timezone.utc).date()
    last_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7)]
    
    habit_completions = []
    for date in last_7_days:
        completed_today = sum(1 for h in habits if date in (h.completion_dates or []))
        habit_completions.append({"date": date, "completed": completed_today, "total": total_habits})
    
    total_completions = sum(len(h.completion_dates or []) for h in habits)
    
    goals_by_category = {}
    for g in goals:
        cat = g.category or 'personal'
        if cat not in goals_by_category:
            goals_by_category[cat] = {'total': 0, 'completed': 0}
        goals_by_category[cat]['total'] += 1
        if g.status == 'completed':
            goals_by_category[cat]['completed'] += 1
    
    journal_streak = 0
    if journals:
        sorted_entries = sorted(journals, key=lambda x: x.date or '', reverse=True)
        check_date = today
        for entry in sorted_entries:
            if entry.date == check_date.isoformat():
                journal_streak += 1
                check_date -= timedelta(days=1)
            elif entry.date and entry.date < check_date.isoformat():
                break
    
    mood_counts = {}
    for entry in journals:
        mood = entry.mood or 'reflective'
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    return {
        "goals": {
            "total": total_goals, "active": active_goals, "completed": completed_goals,
            "completion_rate": round(completed_goals / total_goals * 100, 1) if total_goals > 0 else 0,
            "by_category": goals_by_category
        },
        "habits": {
            "total": total_habits, "max_streak": max_streak,
            "best_streak_ever": best_streak_ever,
            "avg_streak": round(avg_streak, 1), "total_completions": total_completions
        },
        "journal": {"total_entries": len(journals), "current_streak": journal_streak, "mood_distribution": mood_counts},
        "exercises": {"total_completed": len(exercises)},
        "habit_completions_7_days": habit_completions
    }


@api_router.post("/rituals/complete")
def complete_ritual(ritual_data: RitualCompleteRequest, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    ritual_id = str(uuid.uuid4())
    ritual = RitualCompletionDB(
        id=ritual_id, user_id=user_id,
        ritual_type=ritual_data.ritual_type,
        completed_at=datetime.fromisoformat(ritual_data.completed_at.replace('Z', '+00:00'))
    )
    db.add(ritual)
    db.commit()
    return {"message": "Ritual completed", "id": ritual_id}

@api_router.get("/rituals/completed")
def get_completed_rituals(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    rituals = db.query(RitualCompletionDB).filter(RitualCompletionDB.user_id == user_id).order_by(RitualCompletionDB.completed_at.desc()).limit(50).all()
    return [{"id": r.id, "user_id": r.user_id, "ritual_type": r.ritual_type, "completed_at": r.completed_at.isoformat() if r.completed_at else None} for r in rituals]


@api_router.post("/wisdom/favorites")
def add_wisdom_favorite(favorite_data: WisdomFavoriteCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(WisdomFavoriteDB).filter(WisdomFavoriteDB.user_id == user_id, WisdomFavoriteDB.quote_id == favorite_data.quote_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    fav_id = str(uuid.uuid4())
    fav = WisdomFavoriteDB(id=fav_id, user_id=user_id, quote_id=favorite_data.quote_id)
    db.add(fav)
    db.commit()
    return {"message": "Added to favorites", "id": fav_id}

@api_router.get("/wisdom/favorites")
def get_wisdom_favorites(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    favs = db.query(WisdomFavoriteDB).filter(WisdomFavoriteDB.user_id == user_id).order_by(WisdomFavoriteDB.created_at.desc()).all()
    return [{"id": f.id, "user_id": f.user_id, "quote_id": f.quote_id, "created_at": f.created_at.isoformat() if f.created_at else None} for f in favs]

@api_router.delete("/wisdom/favorites/{quote_id}")
def remove_wisdom_favorite(quote_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    fav = db.query(WisdomFavoriteDB).filter(WisdomFavoriteDB.user_id == user_id, WisdomFavoriteDB.quote_id == quote_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites"}

@api_router.post("/wisdom/notifications")
def update_wisdom_notifications(prefs: WisdomNotificationPreference, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user:
        user.wisdom_notifications = prefs.enabled
        db.commit()
    return {"message": "Notification preferences updated", "enabled": prefs.enabled}


@api_router.post("/identity/statements")
def create_identity_statement(data: IdentityStatementCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt_id = str(uuid.uuid4())
    stmt = IdentityStatementDB(id=stmt_id, user_id=user_id, old_identity=data.old_identity, new_identity=data.new_identity)
    db.add(stmt)
    db.commit()
    db.refresh(stmt)
    return {"id": stmt.id, "user_id": stmt.user_id, "old_identity": stmt.old_identity, "new_identity": stmt.new_identity, "evidence_count": stmt.evidence_count, "strength_score": stmt.strength_score, "created_at": stmt.created_at.isoformat(), "updated_at": stmt.updated_at.isoformat()}

@api_router.get("/identity/statements")
def get_identity_statements(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    stmts = db.query(IdentityStatementDB).filter(IdentityStatementDB.user_id == user_id).all()
    return [{"id": s.id, "user_id": s.user_id, "old_identity": s.old_identity, "new_identity": s.new_identity, "evidence_count": s.evidence_count, "strength_score": s.strength_score, "created_at": s.created_at.isoformat() if s.created_at else None, "updated_at": s.updated_at.isoformat() if s.updated_at else None} for s in stmts]

@api_router.post("/identity/evidence")
def add_identity_evidence(data: IdentityEvidenceCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    ev_id = str(uuid.uuid4())
    ev = IdentityEvidenceDB(id=ev_id, user_id=user_id, identity_id=data.identity_id, evidence_text=data.evidence_text, date=datetime.now(timezone.utc).date().isoformat())
    db.add(ev)
    db.commit()
    
    evidence_count = db.query(IdentityEvidenceDB).filter(IdentityEvidenceDB.user_id == user_id, IdentityEvidenceDB.identity_id == data.identity_id).count()
    strength_score = min(100, evidence_count * 2)
    
    stmt = db.query(IdentityStatementDB).filter(IdentityStatementDB.id == data.identity_id, IdentityStatementDB.user_id == user_id).first()
    if stmt:
        stmt.evidence_count = evidence_count
        stmt.strength_score = strength_score
        stmt.updated_at = datetime.now(timezone.utc)
        db.commit()
    
    return {"id": ev.id, "user_id": ev.user_id, "identity_id": ev.identity_id, "evidence_text": ev.evidence_text, "date": ev.date, "created_at": ev.created_at.isoformat()}

@api_router.get("/identity/evidence/{identity_id}")
def get_identity_evidence(identity_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    evs = db.query(IdentityEvidenceDB).filter(IdentityEvidenceDB.user_id == user_id, IdentityEvidenceDB.identity_id == identity_id).order_by(IdentityEvidenceDB.created_at.desc()).all()
    return [{"id": e.id, "user_id": e.user_id, "identity_id": e.identity_id, "evidence_text": e.evidence_text, "date": e.date, "created_at": e.created_at.isoformat() if e.created_at else None} for e in evs]


@api_router.post("/obstacles")
def create_obstacle(data: ObstacleCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    obs_id = str(uuid.uuid4())
    obs = ObstacleDB(id=obs_id, user_id=user_id, obstacle_text=data.obstacle_text)
    db.add(obs)
    db.commit()
    db.refresh(obs)
    return {"id": obs.id, "user_id": obs.user_id, "obstacle_text": obs.obstacle_text, "perception": obs.perception, "action": obs.action, "will": obs.will, "status": obs.status, "transformed_at": obs.transformed_at, "created_at": obs.created_at.isoformat(), "updated_at": obs.updated_at.isoformat()}

@api_router.get("/obstacles")
def get_obstacles(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    obs_list = db.query(ObstacleDB).filter(ObstacleDB.user_id == user_id).order_by(ObstacleDB.created_at.desc()).all()
    return [{"id": o.id, "user_id": o.user_id, "obstacle_text": o.obstacle_text, "perception": o.perception, "action": o.action, "will": o.will, "status": o.status, "transformed_at": o.transformed_at, "created_at": o.created_at.isoformat() if o.created_at else None, "updated_at": o.updated_at.isoformat() if o.updated_at else None} for o in obs_list]

@api_router.put("/obstacles/{obstacle_id}")
def update_obstacle(obstacle_id: str, data: ObstacleUpdate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    obs = db.query(ObstacleDB).filter(ObstacleDB.id == obstacle_id, ObstacleDB.user_id == user_id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Obstacle not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(obs, key, value)
    
    if (obs.perception and obs.action and obs.will) and obs.status != 'transformed':
        obs.status = 'transformed'
        obs.transformed_at = datetime.now(timezone.utc).isoformat()
    
    obs.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(obs)
    return {"id": obs.id, "user_id": obs.user_id, "obstacle_text": obs.obstacle_text, "perception": obs.perception, "action": obs.action, "will": obs.will, "status": obs.status, "transformed_at": obs.transformed_at, "created_at": obs.created_at.isoformat(), "updated_at": obs.updated_at.isoformat()}

@api_router.delete("/obstacles/{obstacle_id}")
def delete_obstacle(obstacle_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    obs = db.query(ObstacleDB).filter(ObstacleDB.id == obstacle_id, ObstacleDB.user_id == user_id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Obstacle not found")
    db.delete(obs)
    db.commit()
    return {"message": "Obstacle deleted"}


@api_router.post("/burning-desire")
def create_burning_desire(data: BurningDesireCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(BurningDesireDB).filter(BurningDesireDB.user_id == user_id).first()
    
    if existing:
        existing.desire_text = data.desire_text
        existing.why_text = data.why_text
        existing.vision_text = data.vision_text
        existing.intensity = data.intensity
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return {"id": existing.id, "user_id": existing.user_id, "desire_text": existing.desire_text, "why_text": existing.why_text, "vision_text": existing.vision_text, "intensity": existing.intensity, "created_at": existing.created_at.isoformat(), "updated_at": existing.updated_at.isoformat()}
    else:
        des_id = str(uuid.uuid4())
        des = BurningDesireDB(id=des_id, user_id=user_id, desire_text=data.desire_text, why_text=data.why_text, vision_text=data.vision_text, intensity=data.intensity)
        db.add(des)
        db.commit()
        db.refresh(des)
        return {"id": des.id, "user_id": des.user_id, "desire_text": des.desire_text, "why_text": des.why_text, "vision_text": des.vision_text, "intensity": des.intensity, "created_at": des.created_at.isoformat(), "updated_at": des.updated_at.isoformat()}

@api_router.get("/burning-desire")
def get_burning_desire(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    des = db.query(BurningDesireDB).filter(BurningDesireDB.user_id == user_id).first()
    if not des:
        raise HTTPException(status_code=404, detail="No burning desire set")
    return {"id": des.id, "user_id": des.user_id, "desire_text": des.desire_text, "why_text": des.why_text, "vision_text": des.vision_text, "intensity": des.intensity, "created_at": des.created_at.isoformat(), "updated_at": des.updated_at.isoformat()}

@api_router.post("/burning-desire/visualizations")
def create_visualization(data: DesireVisualizationCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    viz_id = str(uuid.uuid4())
    viz = DesireVisualizationDB(id=viz_id, user_id=user_id, desire_id=data.desire_id, intensity_rating=data.intensity_rating, emotion=data.emotion, notes=data.notes, date=datetime.now(timezone.utc).date().isoformat())
    db.add(viz)
    db.commit()
    db.refresh(viz)
    return {"id": viz.id, "user_id": viz.user_id, "desire_id": viz.desire_id, "intensity_rating": viz.intensity_rating, "emotion": viz.emotion, "notes": viz.notes, "date": viz.date, "created_at": viz.created_at.isoformat()}

@api_router.get("/burning-desire/visualizations")
def get_visualizations(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    vizs = db.query(DesireVisualizationDB).filter(DesireVisualizationDB.user_id == user_id).order_by(DesireVisualizationDB.created_at.desc()).limit(30).all()
    return [{"id": v.id, "user_id": v.user_id, "desire_id": v.desire_id, "intensity_rating": v.intensity_rating, "emotion": v.emotion, "notes": v.notes, "date": v.date, "created_at": v.created_at.isoformat() if v.created_at else None} for v in vizs]


@api_router.post("/premeditatio")
def create_premeditatio(data: PremeditatioPracticeCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    p_id = str(uuid.uuid4())
    practice = PremeditatioPracticeDB(id=p_id, user_id=user_id, scenario=data.scenario, potential_obstacles=data.potential_obstacles, planned_responses=data.planned_responses, date=datetime.now(timezone.utc).date().isoformat())
    db.add(practice)
    db.commit()
    db.refresh(practice)
    return {"id": practice.id, "user_id": practice.user_id, "scenario": practice.scenario, "potential_obstacles": practice.potential_obstacles, "planned_responses": practice.planned_responses, "resilience_score": practice.resilience_score, "actual_outcome": practice.actual_outcome, "lessons_learned": practice.lessons_learned, "date": practice.date, "created_at": practice.created_at.isoformat(), "updated_at": practice.updated_at.isoformat()}

@api_router.get("/premeditatio")
def get_premeditatio_practices(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    practices = db.query(PremeditatioPracticeDB).filter(PremeditatioPracticeDB.user_id == user_id).order_by(PremeditatioPracticeDB.created_at.desc()).all()
    return [{"id": p.id, "user_id": p.user_id, "scenario": p.scenario, "potential_obstacles": p.potential_obstacles or [], "planned_responses": p.planned_responses or [], "resilience_score": p.resilience_score, "actual_outcome": p.actual_outcome, "lessons_learned": p.lessons_learned, "date": p.date, "created_at": p.created_at.isoformat() if p.created_at else None, "updated_at": p.updated_at.isoformat() if p.updated_at else None} for p in practices]

@api_router.put("/premeditatio/{practice_id}")
def update_premeditatio(practice_id: str, data: PremeditatioPracticeUpdate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    practice = db.query(PremeditatioPracticeDB).filter(PremeditatioPracticeDB.id == practice_id, PremeditatioPracticeDB.user_id == user_id).first()
    if not practice:
        raise HTTPException(status_code=404, detail="Practice not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(practice, key, value)
    practice.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(practice)
    return {"id": practice.id, "user_id": practice.user_id, "scenario": practice.scenario, "potential_obstacles": practice.potential_obstacles or [], "planned_responses": practice.planned_responses or [], "resilience_score": practice.resilience_score, "actual_outcome": practice.actual_outcome, "lessons_learned": practice.lessons_learned, "date": practice.date, "created_at": practice.created_at.isoformat(), "updated_at": practice.updated_at.isoformat()}


@api_router.post("/habit-stacking")
def create_habit_chain(data: HabitChainCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    chain_id = str(uuid.uuid4())
    chain = HabitChainDB(id=chain_id, user_id=user_id, name=data.name, existing_habit=data.existing_habit, new_habit=data.new_habit, chain_items=data.chain_items or [])
    db.add(chain)
    db.commit()
    db.refresh(chain)
    return {"id": chain.id, "user_id": chain.user_id, "name": chain.name, "existing_habit": chain.existing_habit, "new_habit": chain.new_habit, "chain_items": chain.chain_items or [], "success_count": chain.success_count, "total_attempts": chain.total_attempts, "chain_strength": chain.chain_strength, "created_at": chain.created_at.isoformat(), "updated_at": chain.updated_at.isoformat()}

@api_router.get("/habit-stacking")
def get_habit_chains(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    chains = db.query(HabitChainDB).filter(HabitChainDB.user_id == user_id).all()
    return [{"id": c.id, "user_id": c.user_id, "name": c.name, "existing_habit": c.existing_habit, "new_habit": c.new_habit, "chain_items": c.chain_items or [], "success_count": c.success_count, "total_attempts": c.total_attempts, "chain_strength": c.chain_strength, "created_at": c.created_at.isoformat() if c.created_at else None, "updated_at": c.updated_at.isoformat() if c.updated_at else None} for c in chains]

@api_router.post("/habit-stacking/complete")
def complete_habit_chain(data: HabitChainCompletion, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    chain = db.query(HabitChainDB).filter(HabitChainDB.id == data.chain_id, HabitChainDB.user_id == user_id).first()
    if not chain:
        raise HTTPException(status_code=404, detail="Chain not found")
    
    chain.success_count += 1 if data.success else 0
    chain.total_attempts += 1
    chain.chain_strength = int((chain.success_count / chain.total_attempts) * 100) if chain.total_attempts > 0 else 0
    chain.updated_at = datetime.now(timezone.utc)
    
    comp = HabitChainCompletionDB(id=str(uuid.uuid4()), user_id=user_id, chain_id=data.chain_id, success=data.success, date=datetime.now(timezone.utc).date().isoformat())
    db.add(comp)
    db.commit()
    
    return {"message": "Chain completion recorded", "chain_strength": chain.chain_strength}


@api_router.post("/journey/milestones")
def create_journey_milestone(data: JourneyMilestoneCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    ms_id = str(uuid.uuid4())
    ms = JourneyMilestoneDB(id=ms_id, user_id=user_id, title=data.title, description=data.description, category=data.category, emotion=data.emotion, date=data.date or datetime.now(timezone.utc).date().isoformat())
    db.add(ms)
    db.commit()
    db.refresh(ms)
    return {"id": ms.id, "user_id": ms.user_id, "title": ms.title, "description": ms.description, "category": ms.category, "emotion": ms.emotion, "date": ms.date, "created_at": ms.created_at.isoformat()}

@api_router.get("/journey/milestones")
def get_journey_milestones(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    milestones = db.query(JourneyMilestoneDB).filter(JourneyMilestoneDB.user_id == user_id).order_by(JourneyMilestoneDB.date.desc()).all()
    return [{"id": m.id, "user_id": m.user_id, "title": m.title, "description": m.description, "category": m.category, "emotion": m.emotion, "date": m.date, "created_at": m.created_at.isoformat() if m.created_at else None} for m in milestones]

@api_router.delete("/journey/milestones/{milestone_id}")
def delete_journey_milestone(milestone_id: str, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    ms = db.query(JourneyMilestoneDB).filter(JourneyMilestoneDB.id == milestone_id, JourneyMilestoneDB.user_id == user_id).first()
    if not ms:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(ms)
    db.commit()
    return {"message": "Milestone deleted"}


@api_router.post("/legacy")
def create_legacy_statement(data: LegacyStatementCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(LegacyStatementDB).filter(LegacyStatementDB.user_id == user_id).first()
    
    if existing:
        existing.legacy_text = data.legacy_text
        existing.values = data.values or []
        existing.impact_areas = data.impact_areas or []
        existing.future_self_letter = data.future_self_letter
        existing.mission_statement = data.mission_statement
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return {"id": existing.id, "user_id": existing.user_id, "legacy_text": existing.legacy_text, "values": existing.values or [], "impact_areas": existing.impact_areas or [], "future_self_letter": existing.future_self_letter, "mission_statement": existing.mission_statement, "created_at": existing.created_at.isoformat(), "updated_at": existing.updated_at.isoformat()}
    else:
        leg_id = str(uuid.uuid4())
        leg = LegacyStatementDB(id=leg_id, user_id=user_id, legacy_text=data.legacy_text, values=data.values or [], impact_areas=data.impact_areas or [], future_self_letter=data.future_self_letter, mission_statement=data.mission_statement)
        db.add(leg)
        db.commit()
        db.refresh(leg)
        return {"id": leg.id, "user_id": leg.user_id, "legacy_text": leg.legacy_text, "values": leg.values or [], "impact_areas": leg.impact_areas or [], "future_self_letter": leg.future_self_letter, "mission_statement": leg.mission_statement, "created_at": leg.created_at.isoformat(), "updated_at": leg.updated_at.isoformat()}

@api_router.get("/legacy")
def get_legacy_statement(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    leg = db.query(LegacyStatementDB).filter(LegacyStatementDB.user_id == user_id).first()
    if not leg:
        raise HTTPException(status_code=404, detail="No legacy statement set")
    return {"id": leg.id, "user_id": leg.user_id, "legacy_text": leg.legacy_text, "values": leg.values or [], "impact_areas": leg.impact_areas or [], "future_self_letter": leg.future_self_letter, "mission_statement": leg.mission_statement, "created_at": leg.created_at.isoformat(), "updated_at": leg.updated_at.isoformat()}


@api_router.post("/morning-algorithm")
def create_morning_routine(data: MorningRoutineCreate, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    rt_id = str(uuid.uuid4())
    routine = MorningRoutineDB(id=rt_id, user_id=user_id, routine_name=data.routine_name, philosophy=data.philosophy, steps=data.steps, total_duration=data.total_duration)
    db.add(routine)
    db.commit()
    db.refresh(routine)
    return {"id": routine.id, "user_id": routine.user_id, "routine_name": routine.routine_name, "philosophy": routine.philosophy, "steps": routine.steps or [], "total_duration": routine.total_duration, "streak": routine.streak, "best_streak": routine.best_streak, "last_completed": routine.last_completed, "created_at": routine.created_at.isoformat(), "updated_at": routine.updated_at.isoformat()}

@api_router.get("/morning-algorithm")
def get_morning_routines(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    routines = db.query(MorningRoutineDB).filter(MorningRoutineDB.user_id == user_id).all()
    return [{"id": r.id, "user_id": r.user_id, "routine_name": r.routine_name, "philosophy": r.philosophy, "steps": r.steps or [], "total_duration": r.total_duration, "streak": r.streak, "best_streak": r.best_streak, "last_completed": r.last_completed, "created_at": r.created_at.isoformat() if r.created_at else None, "updated_at": r.updated_at.isoformat() if r.updated_at else None} for r in routines]

@api_router.post("/morning-algorithm/complete")
def complete_morning_routine(data: MorningRoutineCompletion, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    routine = db.query(MorningRoutineDB).filter(MorningRoutineDB.id == data.routine_id, MorningRoutineDB.user_id == user_id).first()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    today = datetime.now(timezone.utc).date()
    last_completed = routine.last_completed
    current_streak = routine.streak
    
    if last_completed:
        last_date = datetime.fromisoformat(last_completed).date()
        if (today - last_date).days == 1:
            current_streak += 1
        elif (today - last_date).days == 0:
            pass
        else:
            current_streak = 1
    else:
        current_streak = 1
    
    routine.streak = current_streak
    routine.best_streak = max(routine.best_streak, current_streak)
    routine.last_completed = today.isoformat()
    routine.updated_at = datetime.now(timezone.utc)
    
    comp = MorningRoutineCompletionDB(id=str(uuid.uuid4()), user_id=user_id, routine_id=data.routine_id, completed_steps=data.completed_steps, date=today.isoformat())
    db.add(comp)
    db.commit()
    
    return {"message": "Routine completed", "streak": current_streak, "best_streak": routine.best_streak}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "growth-mindset-api", "database": "postgresql"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
