# MarineSight AI — System Architecture & Integration Specification

## 1. System Overview

MarineSight AI is an **AI-Powered Multimodal Marine Monitoring, Debris Detection, Risk Analysis, and Incident Response Platform**. The platform integrates two sensory tiers into a unified operational dashboard:
1. **Surface Optical Surveillance**: Aerial drones (UAVs), satellite optical feeds, and vessel patrol cameras processed through YOLO object detection.
2. **Subsurface Hydroacoustic Intelligence**: Side-Scan Sonar (SSS) data streams processed through Lee speckle filtering, CLAHE dynamic range normalization, and PyTorch Faster R-CNN detection.

```
                  ┌──────────────────────────────────────────────┐
                  │          MarineSight AI Frontend             │
                  │   (React 18 + Vite + Tailwind + Leaflet)     │
                  └──────────────────────┬───────────────────────┘
                                         │ HTTP REST / JSON
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          Unified API Gateway                 │
                  │     (FastAPI / Node.js Express 3000)         │
                  └──────┬───────────────┬───────────────┬───────┘
                         │               │               │
       ┌─────────────────┴──────┐        │        ┌──────┴────────────────┐
       ▼                        ▼        ▼        ▼                       ▼
┌──────────────┐      ┌─────────────┐ ┌──────┐ ┌───────────────┐ ┌──────────────┐
│Surface Vision│      │ Sonar SSS   │ │Fusion│ │Risk Prediction│ │Incident & Ops│
│ (YOLOv9/v8)  │      │(Faster R-CNN│ │Engine│ │    Engine     │ │   Dispatch   │
│              │      │ + Lee/CLAHE)│ │      │ │               │ │              │
└──────────────┘      └─────────────┘ └──────┘ └───────────────┘ └──────────────┘
       │                        │        │            │                  │
       └────────────────────────┼────────┴────────────┴──────────────────┘
                                │
                                ▼
                  ┌──────────────────────────────┐
                  │ SQLite Database via aiosqlite│
                  │  (Detections, Incidents,     │
                  │   Alerts, Missions, Tracks)  │
                  └──────────────────────────────┘
```

---

## 2. Core Subsystems

### A. Subsurface Sonar Intelligence Pipeline
- **Formats Handled**: XTF, GeoTIFF, DAT, PNG, JPEG.
- **Speckle Noise Filter**: Adaptive Lee filter calculating local mean and variance over a $5\times 5$ window to suppress multiplicative acoustic speckle.
- **Contrast Enhancement**: CLAHE (Contrast Limited Adaptive Histogram Equalization) with clip limit 2.0 to balance dynamic range across seabed nadir and outer slant-range boundaries.
- **Deep Neural Network**: Faster R-CNN with MobileNetV3-Large Feature Pyramid Network (FPN). Gracefully falls back to calibrated acoustic shadow geometry if `.pth` weights are not installed.
- **Relief Height Calculation**:
  $$H_{\text{object}} = \frac{L_{\text{shadow}} \cdot H_{\text{towfish}}}{R_{\text{slant}}}$$

### B. Surface Vision Pipeline
- Real-time optical inference for polymer aggregations, ghost net surface floats, containers, and oil slicks.
- Bounding-box localization, class confidence, and normalized YOLO coordinates.
- Live video stream tracker monitoring drift vectors and keyframe trajectories.

### C. Multimodal Fusion Engine
- Co-registers surface coordinates and subsurface acoustic targets using the Haversine distance formula.
- Detections within a 200m spatial radius are treated as the same target (e.g. surface float tied to submerged ghost net).
- Computes joint Bayesian confidence score and escalates target priority.

### D. Ecological Risk Engine
- Deterministic risk modeling based on:
  - Historical debris concentration in local 1km² grid
  - Category severity weighting (Ghost fishing gear = +20 pts)
  - Proximity to Marine Protected Areas (MPAs) and coral reefs
  - Hydrodynamic drift convergence propensity

### E. Incident Command & Cleanup Operations
- Turns verified detections and multimodal alerts into actionable incidents (`INC-xxxx`).
- Dispatches salvage vessels (e.g., *RV Sagar Guardian*) and logs recovery operations.
- Real-time alert acknowledgment by marine watch officers.

---

## 3. Data Lake & Storage Layer
- **SQLite Database** managed via SQLAlchemy 2.0 async engine (`aiosqlite`):
  - `unified_detections`: Unified table storing Surface, Sonar, and Fusion events.
  - `incidents`: Emergency response and operational salvage cases.
  - `system_alerts`: Real-time sensory threshold warnings.
  - `cleanup_operations`: Vessel dispatch and recovery logs.
  - `sonar_detections`: Hydroacoustic telemetry and shadow measurements.
  - `missions`: Systematic transect surveys.
  - `gps_tracks`: Real-time vessel AIS telemetry.
  - `audit_logs`: Operational action accountability.
