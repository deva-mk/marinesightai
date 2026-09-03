from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, Text, JSON
from datetime import datetime
import uuid
from backend.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class SonarDetectionModel(Base):
    __tablename__ = "sonar_detections"

    id = Column(String, primary_key=True, default=generate_uuid)
    filename = Column(String, nullable=False)
    file_format = Column(String, nullable=False)  # 'XTF', 'DAT', 'TIF', 'PNG'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # EXIF & Geolocation
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    depth_meters = Column(Float, nullable=True)
    altitude_meters = Column(Float, nullable=True)
    towfish_heading = Column(Float, nullable=True)
    
    # Classification & Acoustic Properties
    predicted_class = Column(String, nullable=False)  # 'Ghost Fishing Gear', 'Plastic Container', etc.
    confidence = Column(Float, nullable=False)
    acoustic_shadow_len_m = Column(Float, nullable=True)
    estimated_object_height_m = Column(Float, nullable=True)
    
    # Preprocessing Status
    lee_filtered = Column(Boolean, default=False)
    clahe_applied = Column(Boolean, default=False)
    
    # Bounding Boxes in COCO / YOLO
    bounding_boxes = Column(JSON, default=list)
    raw_metadata = Column(JSON, default=dict)

class MissionRecordModel(Base):
    __tablename__ = "mission_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    mission_code = Column(String, unique=True, nullable=False)
    vessel_name = Column(String, nullable=False)
    target_area = Column(String, nullable=False)
    status = Column(String, default="PLANNED")  # 'PLANNED', 'ACTIVE', 'COMPLETED', 'ABORTED'
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    
    # Coordinates & Route
    start_lat = Column(Float, nullable=False)
    start_lng = Column(Float, nullable=False)
    target_lat = Column(Float, nullable=False)
    target_lng = Column(Float, nullable=False)
    waypoints = Column(JSON, default=list)  # Leaflet route coordinates
    
    # Yield & Environmental Metrics
    debris_retrieved_kg = Column(Float, default=0.0)
    area_swept_sq_km = Column(Float, default=0.0)
    operator_notes = Column(Text, nullable=True)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action = Column(String, nullable=False)  # 'SONAR_INGEST', 'LEE_FILTER', 'CLAHE', 'MISSION_DISPATCH', 'DEBRIS_DETECT'
    user_id = Column(String, default="operator_auto")
    user_role = Column(String, default="MARINE_OPERATOR")
    resource_id = Column(String, nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String, nullable=True)

class GPSTrackModel(Base):
    __tablename__ = "gps_tracks"

    id = Column(String, primary_key=True, default=generate_uuid)
    vessel_id = Column(String, nullable=False)
    vessel_name = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed_knots = Column(Float, default=0.0)
    heading_deg = Column(Float, default=0.0)
    depth_m = Column(Float, default=0.0)
    mission_id = Column(String, nullable=True)

class UnifiedDetectionModel(Base):
    __tablename__ = "unified_detections"

    id = Column(String, primary_key=True, default=generate_uuid)
    modality = Column(String, nullable=False)  # 'SURFACE' | 'SONAR' | 'FUSION'
    class_name = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    bbox = Column(JSON, default=list)  # [x, y, width, height] or normalized
    timestamp = Column(DateTime, default=datetime.utcnow)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    source_filename = Column(String, nullable=True)
    risk_level = Column(String, default="HIGH")  # 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'
    status = Column(String, default="VERIFIED")   # 'UNVERIFIED', 'VERIFIED', 'RESOLVED'
    depth_meters = Column(Float, nullable=True)
    acoustic_shadow_len_m = Column(Float, nullable=True)
    estimated_dimensions = Column(String, nullable=True)
    estimated_weight_kg = Column(Float, nullable=True)
    signature_details = Column(String, nullable=True)
    ai_explanation = Column(Text, nullable=True)
    extra_metadata = Column(JSON, default=dict)

class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    severity = Column(String, default="HIGH")  # 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'
    status = Column(String, default="ACTIVE")   # 'REPORTED', 'ACTIVE', 'IN_PROGRESS', 'RESOLVED'
    priority_score = Column(Integer, default=85)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    target_area = Column(String, default="Sector 4A - North Transect")
    assigned_vessel = Column(String, nullable=True)
    assigned_lead = Column(String, nullable=True)
    detection_ids = Column(JSON, default=list)
    operator_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AlertModel(Base):
    __tablename__ = "system_alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    level = Column(String, default="HIGH")  # 'CRITICAL', 'HIGH', 'WARNING', 'INFO'
    message = Column(Text, nullable=False)
    source_modality = Column(String, default="MULTIMODAL")  # 'SURFACE', 'SONAR', 'FUSION'
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    incident_id = Column(String, nullable=True)
    acknowledged = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class CleanupOperationModel(Base):
    __tablename__ = "cleanup_operations"

    id = Column(String, primary_key=True, default=generate_uuid)
    operation_code = Column(String, unique=True, nullable=False)
    target_incident_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    vessel_id = Column(String, nullable=False)
    vessel_name = Column(String, nullable=False)
    status = Column(String, default="PLANNED")  # 'PLANNED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED'
    target_lat = Column(Float, nullable=False)
    target_lng = Column(Float, nullable=False)
    recovered_weight_kg = Column(Float, default=0.0)
    target_debris_type = Column(String, default="Ghost Fishing Gear")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
