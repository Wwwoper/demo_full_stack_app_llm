"""Main FastAPI application entry point."""

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.database import engine, Base
from backend.routers import tasks, agent_tools

# Create database tables
Base.metadata.create_all(bind=engine)

# Resolve frontend directory path relative to this file
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

app = FastAPI(
    title="DevPlan AI",
    description="Умный планировщик задач с REST API для тестирования AI-агентов",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

# Include routers
app.include_router(tasks.router)
app.include_router(agent_tools.router)


@app.get("/")
def serve_frontend():
    """Serve the frontend index.html."""
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
