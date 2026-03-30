from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== Models ==============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionRequest(BaseModel):
    session_id: str

class Pin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    latitude: float
    longitude: float
    altitude: Optional[float] = 0.0
    bearing: Optional[float] = None
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PinCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    altitude: Optional[float] = 0.0
    bearing: Optional[float] = None
    notes: Optional[str] = ""

class Trace(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    points: List[dict]  # [{lat, lng, alt, timestamp}]
    total_distance: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TraceCreate(BaseModel):
    name: str
    points: List[dict]
    total_distance: float = 0.0

class Measurement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    start_point: dict  # {lat, lng, alt}
    end_point: dict  # {lat, lng, alt}
    distance: float
    bearing: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MeasurementCreate(BaseModel):
    name: str
    start_point: dict
    end_point: dict
    distance: float
    bearing: float

# ============== Auth Helpers ==============

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token in cookie or Authorization header"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry with timezone awareness
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

async def require_auth(request: Request) -> User:
    """Require authentication, raise 401 if not authenticated"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ============== Auth Routes ==============

@api_router.post("/auth/session")
async def process_session(session_req: SessionRequest, response: Response):
    """Exchange Emergent session_id for session_token"""
    try:
        # Call Emergent Auth API to get user data
        async with httpx.AsyncClient() as client_http:
            resp = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_req.session_id}
            )
            
            if resp.status_code != 200:
                logger.error(f"Emergent Auth error: {resp.status_code} - {resp.text}")
                raise HTTPException(status_code=401, detail="Invalid session")
            
            auth_data = resp.json()
    except httpx.RequestError as e:
        logger.error(f"Emergent Auth request error: {e}")
        raise HTTPException(status_code=500, detail="Auth service unavailable")
    
    email = auth_data.get("email")
    name = auth_data.get("name", email.split("@")[0] if email else "User")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    if not email or not session_token:
        raise HTTPException(status_code=401, detail="Invalid auth data")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "session_id": str(uuid.uuid4()),
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Remove old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    # Get full user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {"success": True, "user": user_doc}

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await require_auth(request)
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user by clearing session"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"success": True}

# ============== Pin Routes ==============

@api_router.get("/pins", response_model=List[Pin])
async def get_pins(request: Request):
    """Get all pins for current user"""
    user = await require_auth(request)
    pins = await db.pins.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    return pins

@api_router.post("/pins", response_model=Pin)
async def create_pin(pin_data: PinCreate, request: Request):
    """Create a new pin"""
    user = await require_auth(request)
    
    pin = Pin(
        user_id=user.user_id,
        **pin_data.model_dump()
    )
    
    doc = pin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.pins.insert_one(doc)
    return pin

@api_router.delete("/pins/{pin_id}")
async def delete_pin(pin_id: str, request: Request):
    """Delete a pin"""
    user = await require_auth(request)
    result = await db.pins.delete_one({"id": pin_id, "user_id": user.user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pin not found")
    
    return {"success": True}

# ============== Trace Routes ==============

@api_router.get("/traces", response_model=List[Trace])
async def get_traces(request: Request):
    """Get all traces for current user"""
    user = await require_auth(request)
    traces = await db.traces.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    return traces

@api_router.post("/traces", response_model=Trace)
async def create_trace(trace_data: TraceCreate, request: Request):
    """Create a new trace"""
    user = await require_auth(request)
    
    trace = Trace(
        user_id=user.user_id,
        **trace_data.model_dump()
    )
    
    doc = trace.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.traces.insert_one(doc)
    return trace

@api_router.delete("/traces/{trace_id}")
async def delete_trace(trace_id: str, request: Request):
    """Delete a trace"""
    user = await require_auth(request)
    result = await db.traces.delete_one({"id": trace_id, "user_id": user.user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trace not found")
    
    return {"success": True}

# ============== Measurement Routes ==============

@api_router.get("/measurements", response_model=List[Measurement])
async def get_measurements(request: Request):
    """Get all measurements for current user"""
    user = await require_auth(request)
    measurements = await db.measurements.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    return measurements

@api_router.post("/measurements", response_model=Measurement)
async def create_measurement(measurement_data: MeasurementCreate, request: Request):
    """Create a new measurement"""
    user = await require_auth(request)
    
    measurement = Measurement(
        user_id=user.user_id,
        **measurement_data.model_dump()
    )
    
    doc = measurement.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.measurements.insert_one(doc)
    return measurement

@api_router.delete("/measurements/{measurement_id}")
async def delete_measurement(measurement_id: str, request: Request):
    """Delete a measurement"""
    user = await require_auth(request)
    result = await db.measurements.delete_one({"id": measurement_id, "user_id": user.user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Measurement not found")
    
    return {"success": True}

# ============== Health Check ==============

@api_router.get("/")
async def root():
    return {"message": "AR Survey API", "status": "healthy"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
