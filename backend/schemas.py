from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class LeeFilterParams(BaseModel):
    window_size: int = Field(default=5, ge=3, le=15, description="Odd kernel window dimension (3, 5, 7, etc.)")
    noise_variance: float = Field(default=0.25, ge=0.01, le=1.0, description="Estimated speckle noise variance")

class CLAHEParams(BaseModel):
    clip_limit: float = Field(default=2.0, ge=1.0, le=10.0, description="Contrast clipping threshold limit")
    tile_grid_size: int = Field(default=8, ge=2, le=32, description="Tile grid dimension (e.g. 8 for 8x8 tiles)")

class WaterfallSliceParams(BaseModel):
    slice_height: int = Field(default=512, ge=64, le=2048, description="Height in pixels for each along-track ping slice")
    overlap_stride: int = Field(default=256, ge=0, le=1024, description="Step stride in pixels for tile overlap")
    slant_range_correction: bool = Field(default=True, description="Apply geometric ground-range rectification")
    towfish_altitude_m: Optional[float] = Field(default=12.5, description="Towfish altitude above seafloor in meters")

class EXIFGPSMetadata(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude_meters: Optional[float] = None
    towfish_depth_m: Optional[float] = None
    timestamp: Optional[str] = None
    camera_make: Optional[str] = None
    software: Optional[str] = None

class BoundingBoxYOLO(BaseModel):
    class_id: int
    class_name: str
    x_center: float
    y_center: float
    width: float
    height: float
    confidence: float

class BoundingBoxCOCO(BaseModel):
    id: int
    category_id: int
    category_name: str
    bbox: List[float] = Field(description="[x_min, y_min, width, height]")
    area: float
    score: float

class DebrisDetectionResult(BaseModel):
    detection_id: str
    filename: str
    predicted_class: str
    confidence: float
    acoustic_shadow_m: Optional[float] = None
    estimated_height_m: Optional[float] = None
    lee_filtered: bool
    clahe_applied: bool
    exif_gps: Optional[EXIFGPSMetadata] = None
    yolo_annotations: List[BoundingBoxYOLO] = []
    coco_annotations: List[BoundingBoxCOCO] = []
    processing_time_ms: float

class MissionCreate(BaseModel):
    mission_code: str
    vessel_name: str
    target_area: str
    start_lat: float
    start_lng: float
    target_lat: float
    target_lng: float
    waypoints: Optional[List[Dict[str, float]]] = []
    operator_notes: Optional[str] = None

class MissionResponse(MissionCreate):
    id: str
    status: str
    start_time: datetime
    debris_retrieved_kg: float
    area_swept_sq_km: float

class GPSTrackPoint(BaseModel):
    vessel_id: str
    vessel_name: str
    latitude: float
    longitude: float
    speed_knots: float = 0.0
    heading_deg: float = 0.0
    depth_m: float = 0.0
    timestamp: Optional[datetime] = None

class SystemHealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    device: str
    pytorch_version: str
    opencv_version: str
    database: str

class UnifiedDetectionSchema(BaseModel):
    id: str
    modality: str = Field(description="'SURFACE' | 'SONAR' | 'FUSION'")
    class_name: str
    confidence: float
    bbox: Optional[List[Any]] = None
    timestamp: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source_filename: Optional[str] = None
    risk_level: str = "HIGH"
    status: str = "VERIFIED"
    depth_meters: Optional[float] = None
    acoustic_shadow_len_m: Optional[float] = None
    estimated_dimensions: Optional[str] = None
    estimated_weight_kg: Optional[float] = None
    signature_details: Optional[str] = None
    ai_explanation: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None

class IncidentSchema(BaseModel):
    id: str
    incident_code: str
    title: str
    category: str
    severity: str = "HIGH"
    status: str = "ACTIVE"
    priority_score: int = 85
    latitude: float
    longitude: float
    target_area: str = "Sector 4A - North Transect"
    assigned_vessel: Optional[str] = None
    assigned_lead: Optional[str] = None
    detection_ids: List[str] = []
    operator_notes: Optional[str] = None
    created_at: Optional[str] = None

class AlertSchema(BaseModel):
    id: str
    title: str
    level: str = "HIGH"
    message: str
    source_modality: str = "MULTIMODAL"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    incident_id: Optional[str] = None
    acknowledged: bool = False
    timestamp: Optional[str] = None

class CleanupOperationSchema(BaseModel):
    id: str
    operation_code: str
    target_incident_id: Optional[str] = None
    title: str
    vessel_id: str
    vessel_name: str
    status: str = "PLANNED"
    target_lat: float
    target_lng: float
    recovered_weight_kg: float = 0.0
    target_debris_type: str = "Ghost Fishing Gear"
    created_at: Optional[str] = None

class FusionTargetInput(BaseModel):
    detected: bool = True
    confidence: float = 0.90
    coords: List[float] = Field(default=[9.3142, 79.1821], description="[lat, lng]")
    depthMeters: Optional[float] = None
    shadowLengthM: Optional[float] = None
    altitudeM: Optional[float] = None

class MultimodalFusionRequest(BaseModel):
    sonarTarget: Optional[FusionTargetInput] = None
    droneTarget: Optional[FusionTargetInput] = None
    cameraTarget: Optional[FusionTargetInput] = None

class MultimodalFusionResponse(BaseModel):
    success: bool
    fusion: Dict[str, Any]

class RiskPredictRequest(BaseModel):
    coordinates: List[float] = Field(default=[9.3148, 79.1828], description="[lat, lng]")
    debrisHistoryCount: int = 14
    primaryCategory: str = "Ghost Fishing Gear"

class RiskPredictResponse(BaseModel):
    success: bool
    riskScore: int
    classification: str
    densityScore: int
    ghostGearRisk: int
    cleanupPriority: int
    recurrenceProbability: int
    explanation: str
    factors: List[Dict[str, Any]]

