"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import tasks, agent_tools

# Create database tables
Base.metadata.create_all(bind=engine)

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

# Include routers
app.include_router(tasks.router)
app.include_router(agent_tools.router)


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
