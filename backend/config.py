from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "MarineSight AI — Underwater Marine Debris Detection System"
    APP_VERSION: str = "2.4.0"
    API_V1_STR: str = "/api/v1"
    
    # Server & ASGI config
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Embedded SQLite Database via aiosqlite
    DATABASE_URL: str = "sqlite+aiosqlite:///./marine_debris.db"
    
    # Local Filesystem Data Lake
    DATA_LAKE_PATH: str = "./data_lake"
    SONAR_UPLOAD_DIR: str = "./data_lake/sonar"
    ANNOTATIONS_DIR: str = "./data_lake/annotations"
    
    # ML & Deep Learning
    MODEL_DEVICE: str = "cpu"  # 'cuda' if available else 'cpu'
    PYTORCH_BACKBONE: str = "mobilenet_v3_large"
    SONAR_CHECKPOINT_PATH: str = "./weights/sonar_faster_rcnn_mobilenet.pth"
    CONFIDENCE_THRESHOLD: float = 0.50
    IOU_THRESHOLD: float = 0.45
    GEMINI_API_KEY: str = ""
    
    # Sonar Preprocessing Defaults
    LEE_FILTER_WINDOW: int = 5
    LEE_FILTER_NOISE_VAR: float = 0.25
    CLAHE_CLIP_LIMIT: float = 2.0
    CLAHE_TILE_GRID_SIZE: int = 8
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
