from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from . import admin_progress

# FastAPI app
app = FastAPI(title="Admin Backend API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "Admin Backend API"}

@app.get("/")
def root():
    return {"message": "Admin Backend API is running"}

# ✅ ADD PROGRESS ROUTES HERE
app.include_router(admin_progress.router)