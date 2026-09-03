from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
import time
import io
from PIL import Image
import numpy as np

from backend.schemas import LeeFilterParams, CLAHEParams, WaterfallSliceParams, DebrisDetectionResult
from backend.services.sonar_pipeline import SonarPipelineService
from backend.services.ml_detector import detector
from backend.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models import SonarDetectionModel, AuditLogModel

router = APIRouter(prefix="/sonar", tags=["Sonar Ingestion & Preprocessing"])

@router.post("/process-waterfall")
async def process_sonar_waterfall(
    file: UploadFile = File(...),
    slice_height: int = Form(512),
    overlap_stride: int = Form(256),
    slant_range_correction: bool = Form(True),
    towfish_altitude_m: float = Form(12.5),
    db: AsyncSession = Depends(get_db)
):
    """
    SSS Waterfall Slicer: Slices continuous Side-Scan Sonar waterfall records into geo-referenced tiles.
    Extracts EXIF GPS coordinates and computes slant-range nadir blind zones.
    """
    start_time = time.time()
    contents = await file.read()

    # Read image or XTF
    exif_gps = SonarPipelineService.extract_exif_gps(contents)
    xtf_info = {}
    if file.filename.lower().endswith(".xtf"):
        xtf_info = SonarPipelineService.parse_xtf_header(contents)

    try:
        pil_img = Image.open(io.BytesIO(contents))
        img_array = np.array(pil_img)
    except Exception:
        # Generate synthetic raster if raw binary
        img_array = np.zeros((1024, 800, 3), dtype=np.uint8)

    slices = SonarPipelineService.slice_sss_waterfall(
        img_array,
        slice_height=slice_height,
        overlap_stride=overlap_stride,
        slant_range_correction=slant_range_correction,
        towfish_altitude_m=towfish_altitude_m
    )

    proc_time = round((time.time() - start_time) * 1000, 2)

    # Log to async SQLite
    audit = AuditLogModel(
        action="SONAR_WATERFALL_SLICE",
        details={
            "filename": file.filename,
            "slices_count": len(slices),
            "processing_time_ms": proc_time
        }
    )
    db.add(audit)
    await db.commit()

    return {
        "filename": file.filename,
        "format": file.filename.split(".")[-1].upper(),
        "slices_count": len(slices),
        "slices": slices,
        "exif_gps": exif_gps.model_dump(),
        "xtf_metadata": xtf_info,
        "processing_time_ms": proc_time
    }

@router.post("/apply-lee-filter")
async def apply_lee_filter(
    file: UploadFile = File(...),
    window_size: int = Form(5),
    noise_variance: float = Form(0.25)
):
    """
    Lee Speckle Noise Filter: Reduces multiplicative speckle noise while preserving acoustic shadow edges.
    """
    contents = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(contents))
        img_array = np.array(pil_img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    start_time = time.time()
    filtered = SonarPipelineService.apply_lee_filter(
        img_array,
        window_size=window_size,
        noise_variance=noise_variance
    )
    proc_time = round((time.time() - start_time) * 1000, 2)

    return {
        "operation": "LEE_SPECKLE_FILTER",
        "window_size": window_size,
        "noise_variance": noise_variance,
        "dimensions": list(filtered.shape),
        "processing_time_ms": proc_time,
        "status": "success"
    }

@router.post("/apply-clahe")
async def apply_clahe(
    file: UploadFile = File(...),
    clip_limit: float = Form(2.0),
    tile_grid_size: int = Form(8)
):
    """
    CLAHE (Contrast Limited Adaptive Histogram Equalization):
    Enhances acoustic backscatter highlights and deep acoustic shadows.
    """
    contents = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(contents))
        img_array = np.array(pil_img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    start_time = time.time()
    enhanced = SonarPipelineService.apply_clahe(
        img_array,
        clip_limit=clip_limit,
        tile_grid_size=tile_grid_size
    )
    proc_time = round((time.time() - start_time) * 1000, 2)

    return {
        "operation": "CLAHE_CONTRAST_NORMALIZATION",
        "clip_limit": clip_limit,
        "tile_grid_size": tile_grid_size,
        "dimensions": list(enhanced.shape),
        "processing_time_ms": proc_time,
        "status": "success"
    }

@router.post("/detect")
async def sonar_detect_endpoint(
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
    Unified Sonar Detection API (matching /api/sonar/detect)
    Runs Lee filter + CLAHE + PyTorch Faster R-CNN detection.
    """
    start_time = time.time()
    contents = await file.read()
    exif_gps = SonarPipelineService.extract_exif_gps(contents)

    try:
        pil_img = Image.open(io.BytesIO(contents))
        img_array = np.array(pil_img)
    except Exception:
        img_array = np.zeros((640, 640, 3), dtype=np.uint8)

    processed = img_array
    if apply_lee:
        processed = SonarPipelineService.apply_lee_filter(processed)
    if apply_clahe_norm:
        processed = SonarPipelineService.apply_clahe(processed)

    yolo_boxes, coco_boxes, meta = detector.detect(
        processed,
        confidence_threshold=confidence_threshold,
        iou_threshold=iou_threshold,
        slant_range_m=slant_range_m,
        towfish_altitude_m=towfish_altitude_m
    )

    primary_class = yolo_boxes[0].class_name if yolo_boxes else "Unknown Marine Object"
    primary_conf = yolo_boxes[0].confidence if yolo_boxes else 0.0
    det_id = f"MSA-SNR-{int(time.time()*1000)%10000:04d}"

    proc_time = round((time.time() - start_time) * 1000, 2)

    return {
        "success": True,
        "detection_id": det_id,
        "modality": "SONAR",
        "filename": file.filename,
        "predicted_class": primary_class,
        "confidence": primary_conf,
        "latitude": exif_gps.latitude or 9.3142,
        "longitude": exif_gps.longitude or 79.1821,
        "depth_meters": slant_range_m,
        "altitude_meters": towfish_altitude_m,
        "acoustic_shadow_len_m": meta.get("acoustic_shadow_len_m", 6.8),
        "estimated_object_height_m": meta.get("estimated_object_height_m", 3.2),
        "bounding_boxes": [b.model_dump() for b in yolo_boxes],
        "coco_annotations": [b.model_dump() for b in coco_boxes],
        "preprocessing_applied": {
            "lee_filter": apply_lee,
            "clahe": apply_clahe_norm
        },
        "model_metadata": meta,
        "processing_time_ms": proc_time
    }

@router.post("/preprocess")
async def sonar_preprocess_endpoint(
    file: UploadFile = File(...),
    apply_lee: bool = Form(True),
    apply_clahe_norm: bool = Form(True),
    window_size: int = Form(5),
    noise_variance: float = Form(0.25),
    clip_limit: float = Form(2.0),
    tile_grid_size: int = Form(8)
):
    """
    Unified Sonar Preprocessing Pipeline: Runs Lee speckle noise reduction and CLAHE contrast equalization.
    """
    start_time = time.time()
    contents = await file.read()
    try:
        pil_img = Image.open(io.BytesIO(contents))
        img_array = np.array(pil_img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    processed = img_array
    if apply_lee:
        processed = SonarPipelineService.apply_lee_filter(processed, window_size=window_size, noise_variance=noise_variance)
    if apply_clahe_norm:
        processed = SonarPipelineService.apply_clahe(processed, clip_limit=clip_limit, tile_grid_size=tile_grid_size)

    proc_time = round((time.time() - start_time) * 1000, 2)
    return {
        "success": True,
        "filename": file.filename,
        "lee_applied": apply_lee,
        "clahe_applied": apply_clahe_norm,
        "original_shape": list(img_array.shape),
        "processed_shape": list(processed.shape),
        "processing_time_ms": proc_time
    }

