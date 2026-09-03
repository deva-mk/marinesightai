from fastapi import APIRouter, UploadFile, File, Form, Depends
import time
import io
import uuid
from PIL import Image
import numpy as np

from backend.schemas import DebrisDetectionResult, BoundingBoxYOLO, BoundingBoxCOCO
from backend.services.ml_detector import detector
from backend.services.sonar_pipeline import SonarPipelineService
from backend.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import SonarDetectionModel, AuditLogModel

router = APIRouter(prefix="/ml", tags=["Deep Learning & PyTorch Detection"])

@router.post("/detect", response_model=DebrisDetectionResult)
async def detect_marine_debris(
    file: UploadFile = File(...),
    confidence_threshold: float = Form(0.50),
    iou_threshold: float = Form(0.45),
    slant_range_m: float = Form(24.5),
    towfish_altitude_m: float = Form(12.0),
    apply_lee: bool = Form(True),
    apply_clahe_norm: bool = Form(True),
    db: AsyncSession = Depends(get_db)
):
    """
    Runs real-time marine debris object detection using PyTorch / TorchVision pipeline.
    Pre-processes acoustic imagery with Lee Filter and CLAHE, then exports standardized COCO & YOLO annotations.
    """
    start_time = time.time()
    contents = await file.read()
    exif_gps = SonarPipelineService.extract_exif_gps(contents)

    try:
        pil_img = Image.open(io.BytesIO(contents))
        img_array = np.array(pil_img)
    except Exception:
        img_array = np.zeros((640, 640, 3), dtype=np.uint8)

    # Ingestion steps
    processed = img_array
    if apply_lee:
        processed = SonarPipelineService.apply_lee_filter(processed)
    if apply_clahe_norm:
        processed = SonarPipelineService.apply_clahe(processed)

    # PyTorch detector inference
    yolo_boxes, coco_boxes, meta = detector.detect(
        processed,
        confidence_threshold=confidence_threshold,
        iou_threshold=iou_threshold,
        slant_range_m=slant_range_m,
        towfish_altitude_m=towfish_altitude_m
    )

    primary_class = yolo_boxes[0].class_name if yolo_boxes else "Unknown Marine Object"
    primary_conf = yolo_boxes[0].confidence if yolo_boxes else 0.0
    det_id = f"MSA-PT-{str(uuid.uuid4())[:8].upper()}"

    proc_time = round((time.time() - start_time) * 1000, 2)

    # Persist in async SQLite
    detection_record = SonarDetectionModel(
        id=det_id,
        filename=file.filename,
        file_format=file.filename.split(".")[-1].upper(),
        latitude=exif_gps.latitude or 10.9520,
        longitude=exif_gps.longitude or 78.0750,
        depth_meters=slant_range_m,
        altitude_meters=towfish_altitude_m,
        predicted_class=primary_class,
        confidence=primary_conf,
        acoustic_shadow_len_m=meta.get("acoustic_shadow_len_m"),
        estimated_object_height_m=meta.get("estimated_object_height_m"),
        lee_filtered=apply_lee,
        clahe_applied=apply_clahe_norm,
        bounding_boxes=[b.model_dump() for b in yolo_boxes],
        raw_metadata=meta
    )
    db.add(detection_record)
    
    audit = AuditLogModel(
        action="DEBRIS_DETECT_PYTORCH",
        resource_id=det_id,
        details={
            "filename": file.filename,
            "detections_count": len(yolo_boxes),
            "primary_class": primary_class,
            "confidence": primary_conf
        }
    )
    db.add(audit)
    await db.commit()

    return DebrisDetectionResult(
        detection_id=det_id,
        filename=file.filename,
        predicted_class=primary_class,
        confidence=primary_conf,
        acoustic_shadow_m=meta.get("acoustic_shadow_len_m"),
        estimated_height_m=meta.get("estimated_object_height_m"),
        lee_filtered=apply_lee,
        clahe_applied=apply_clahe_norm,
        exif_gps=exif_gps,
        yolo_annotations=yolo_boxes,
        coco_annotations=coco_boxes,
        processing_time_ms=proc_time
    )
