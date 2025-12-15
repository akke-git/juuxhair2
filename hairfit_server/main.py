import os
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Import internal modules
from models import Base
import models, database
from dependencies import limiter
from services import style_service

# Import Routers
from routers import auth, members, styles, synthesis, users, files

load_dotenv()

# Initialize DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="HairFit API")

# Setup Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Config
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
print(f"Allowed Origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    max_age=600,
)

# Gemini API Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Include Routers
app.include_router(auth.router, tags=["Auth"])
app.include_router(members.router, prefix="/members", tags=["Members"])
app.include_router(styles.router, prefix="/styles", tags=["Styles"])
app.include_router(synthesis.router, tags=["Synthesis"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(files.router, tags=["Files"])

@app.on_event("startup")
async def startup_event():
    print("Server starting up...")

    # Load metadata first
    style_service.load_style_metadata()
    # Then load images and sync
    style_service.load_style_images()

    if GEMINI_API_KEY:
        print("Listing available models...")
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    print(f"Found model: {m.name}")
        except Exception as e:
            print(f"Error listing models: {e}")
    else:
        print("GEMINI_API_KEY is not set.")

@app.get("/")
def read_root():
    return {"message": "Welcome to HairFit API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
