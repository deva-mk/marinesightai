# MarineSight AI — Unified API Architecture Specification

This document details the unified REST API endpoints provided by the MarineSight AI platform across both FastAPI and Node.js backends.

---

## 1. Modality Vision & Sonar Endpoints

### `POST /api/sonar/detect`
Performs Side-Scan Sonar (SSS) acoustic anomaly detection using Lee speckle filtering, CLAHE equalization, and PyTorch Faster R-CNN inference.

- **Request Format**: `multipart/form-data` or `application/json`
- **Parameters**:
  - `file`: Sonar image / waterfall slice (PNG, GeoTIFF, XTF, DAT)
  - `confidence_threshold`: Minimum confidence score (default: `0.50`)
  - `iou_threshold`: IoU threshold for NMS (default: `0.45`)
  - `slant_range_m`: Sonar slant range in meters (default: `24.5`)
  - `towfish_altitude_m`: Towfish altitude above seabed (default: `12.0`)
  - `apply_lee`: Apply Lee speckle filter (boolean, default: `true`)
  - `apply_clahe_norm`: Apply CLAHE normalization (boolean, default: `true`)
- **Response**:
  ```json
  {
    "success": true,
    "detection_id": "MSA-SNR-1042",
    "modality": "SONAR",
    "filename": "Palk_Bay_Transect_04.dat",
    "predicted_class": "Ghost Fishing Gear",
    "confidence": 0.94,
    "latitude": 9.3142,
    "longitude": 79.1821,
    "depth_meters": 14.2,
    "acoustic_shadow_len_m": 6.8,
    "estimated_object_height_m": 3.2,
    "bounding_boxes": [
      {
        "class_id": 0,
        "class_name": "Ghost Fishing Gear",
        "x_center": 0.52,
        "y_center": 0.48,
        "width": 0.28,
        "height": 0.22,
        "confidence": 0.94
      }
    ],
    "model_metadata": {
      "model_architecture": "Faster R-CNN MobileNetV3-Large FPN",
      "checkpoint_loaded": false,
      "inference_engine": "Acoustic-Shadow Geometry Engine"
    }
  }
  ```

---

### `POST /api/sonar/preprocess`
Runs image conditioning (Lee Filter + CLAHE) without running detection.

- **Request Format**: `application/json` or `multipart/form-data`
- **Body**: `{ "applyLee": true, "applyClahe": true, "windowSize": 5, "clipLimit": 2.0 }`
- **Response**: Preprocessing dimensions, parameters applied, and status.

---

### `POST /api/surface/detect`
Detects surface floating debris from aerial drone, vessel camera, or satellite imagery using YOLOv9/v8 computer vision.

- **Request Format**: `application/json` or `multipart/form-data`
- **Body**:
  ```json
  {
    "filename": "aerial-survey-04.jpg",
    "source": "DRONE",
    "modelId": "yolo-v9-marine",
    "confidenceThreshold": 0.45,
    "coordinates": [10.9582, 78.0790]
  }
  ```
- **Response**: Bounding boxes, taxonomy category, estimated weight, dimensions, and severity.

---

### `POST /api/surface/live`
Accepts live webcam or stream video frames and returns real-time object tracking and FPS telemetry.

---

## 2. Multimodal Fusion & Risk Prediction

### `POST /api/fusion/analyze`
Co-registers optical surface detections and underwater sonar detections within spatial proximity ($\Delta d \le 200\text{m}$) and computes joint Bayesian confidence:

$$P(\text{Debris} \mid S, D) = 1 - (1 - P_{\text{sonar}}) \cdot (1 - P_{\text{drone}}) \cdot 0.7$$

- **Body**:
  ```json
  {
    "sonarTarget": {
      "detected": true,
      "confidence": 0.94,
      "coords": [9.3142, 79.1821],
      "depthMeters": 14.2,
      "shadowLengthM": 6.8
    },
    "droneTarget": {
      "detected": true,
      "confidence": 0.91,
      "coords": [9.3155, 79.1834],
      "altitudeM": 45.0
    }
  }
  ```
- **Response**: Fused ID, combined confidence, spatial match distance, priority, and coordinated action recommendation.

---

### `POST /api/risk/predict`
Calculates ecological risk score and hazard level based on debris density, ghost gear entanglement factor, and sensitive MPA proximity.

- **Body**:
  ```json
  {
    "coordinates": [9.3148, 79.1828],
    "debrisHistoryCount": 14,
    "primaryCategory": "Ghost Fishing Gear"
  }
  ```
- **Response**: Risk score (0–100), classification (`CRITICAL`, `HIGH`, `MODERATE`), density score, recurrence probability, and contributing factors.

---

## 3. Operational Repositories & Incident Command

### `GET /api/detections`
Returns unified detection log across Surface Vision, Underwater Sonar, and Multimodal Fusion.
- **Query Parameter**: `modality` (`SURFACE` | `SONAR` | `FUSION`)

### `POST /api/detections`
Logs a new unified detection record into the database.

---

### `GET /api/incidents`
Lists active operational incidents.
- **Query Parameters**: `status` (`ACTIVE` | `IN_PROGRESS` | `RESOLVED`), `severity`

### `POST /api/incidents`
Creates an operational incident.

### `PATCH /api/incidents/{id}/status`
Updates status and operator dispatch notes.

---

### `GET /api/alerts`
Returns real-time system alerts triggered by surface or sonar sensor events.

### `POST /api/alerts/{id}/acknowledge`
Acknowledges an alert by the active watch officer.

---

### `GET /api/cleanup`
Returns scheduled and active marine cleanup missions.

### `POST /api/cleanup/dispatch`
Dispatches a cleanup vessel (e.g. RV Sagar Guardian) or autonomous skimmer to coordinates.

---

## 4. Tactical AI Copilot

### `POST /api/ai/copilot`
Submits queries to the MarineSight AI Copilot. Uses Google Gemini API when `GEMINI_API_KEY` is configured, or falls back seamlessly to domain-calibrated nautical heuristics.

- **Body**: `{ "query": "What is the physical height of a target with a 6.8m shadow at 14m depth?" }`
- **Response**: `{ "success": true, "reply": "...", "source": "Gemini 2.5 Flash", "citations": [...] }`
