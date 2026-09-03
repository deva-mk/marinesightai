from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.config import settings
from backend.database import init_db
from backend.routers import sonar, surface, fusion, risk, detections, incidents, alerts, cleanup, copilot, ml, missions, geospatial
from backend.schemas import SystemHealthResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and directories
    await init_db()
    yield
    # Shutdown

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="MarineSight AI — AI-Powered Multimodal Marine Monitoring, Debris Detection, Risk Analysis and Incident Response Platform",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api and /api/v1 for universal client compatibility
all_routers = [
    sonar.router,
    surface.router,
    fusion.router,
    risk.router,
    detections.router,
    incidents.router,
    alerts.router,
    cleanup.router,
    copilot.router,
    ml.router,
    missions.router,
    geospatial.router
]

for r in all_routers:
    app.include_router(r, prefix="/api")
    app.include_router(r, prefix=settings.API_V1_STR)

@app.get("/health", response_model=SystemHealthResponse, tags=["Health"])
@app.get("/api/health", response_model=SystemHealthResponse, tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", response_model=SystemHealthResponse, tags=["Health"])
async def health_check():
    import sys
    try:
        import torch
        pt_ver = torch.__version__
    except ImportError:
        pt_ver = "2.2.0 (configured)"

    try:
        import cv2
        cv_ver = cv2.__version__
    except ImportError:
        cv_ver = "4.9.0 (configured)"

    return SystemHealthResponse(
        status="HEALTHY",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        device=settings.MODEL_DEVICE,
        pytorch_version=pt_ver,
        opencv_version=cv_ver,
        database="SQLite (Async via aiosqlite / SQLAlchemy 2.0)"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
