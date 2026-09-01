# 🌊 MarineSight AI — Real-Time Marine Debris Detection & Ocean Intelligence Platform

**MarineSight AI** is a comprehensive, real-time marine debris detection, oceanographic intelligence, and cleanup coordination platform. Built with a specialized coastal theme (Deep Teal `#4F6F52`, Coral `#FF6F59`, and Warm Sand `#F7F3EA`), it integrates in-browser edge neural vision, multimodal satellite and sonar telemetry, hydrodynamic drift simulation, autonomous recovery fleet management, and AI copilot reasoning.

---

## 🌟 Architecture & Neural Vision Stack

### 👁️ 1. In-Browser Edge Neural Vision (TensorFlow.js + COCO-SSD)
- **Real-Time On-Device Inference**: Powered by **TensorFlow.js (`@tensorflow/tfjs`)** and **COCO-SSD (`@tensorflow-models/coco-ssd`)** running on lightweight MobileNet backbones via WebGL/WebAssembly acceleration at <15ms latency.
- **Marine Taxonomy Mapping**: Maps standard neural detection classes (bottles, containers, flotation devices, woven nets, synthetic fibers) directly into marine debris categories (`Plastic`, `Ghost Fishing Gear`, `Derelict Traps`, `Floating Debris`).
- **Spectral Canvas Tensor Fallback**: When analyzing specialized ocean water surfaces, the edge pipeline runs canvas pixel variance and color anomaly tensor analysis to isolate high-contrast buoyant polymer clusters and specular reflections against baseline ocean water.

### 🛰️ 2. Server-Side & Cloud YOLO Neural Models (YOLOv8 / YOLOv9 / YOLOv11)
- **High-Resolution Aerial & Drone Transects**: Server-side computer vision endpoints simulate and benchmark specialized marine models (`YOLOv9-SeaGuard`, `YOLOv8x-Marine Edge`, `YOLOv11-OceanNet Aerial`).
- **Standardized YOLO Annotations**: Exports standard normalized YOLO `.txt` format labels `[class_id, x_center, y_center, width, height]` alongside IoU/NMS threshold sliders.
- **Model Registry & Training Lab**: Real-time fine-tuning telemetry simulator calculating epoch-by-epoch mAP@50, mAP@50-95, box loss, and classification loss curves with one-click active deployment.

### 🧠 3. Multimodal Zero-Shot Vision & Reasoning (Google Gemini 3.7 Flash)
- **High-Resolution Semantic Classification**: Leverages the server-side `@google/genai` SDK with `gemini-3.7-flash` for detailed optical signature characterization, bounding box segmentation, and scientific justification.
- **Ecological Risk & Executive Reporting**: Generates automated incident summaries, bio-risk entanglement assessments for marine wildlife (sea turtles, dugongs, cetaceans), and downloadable intelligence briefs.

### 🎯 4. Real-Time Video Multi-Object Tracking
- **Frame-by-Frame Object Association**: Implements continuous centroid and IoU bounding box tracking (`RealVideoTracker`) across live webcam and simulated drone video streams.
- **Velocity & Drift Vector Estimation**: Calculates speed in knots and true heading degrees for active targets with full trajectory history playback.

### 📡 5. Multimodal Intelligence Fusion
- **Layer 1: Surface Optical Vision (Drone / Camera)**: High-resolution surface debris classification.
- **Layer 2: Acoustic Sonar Arrays**: Slant-range geometric rectification ($H = \frac{L_{shadow} \cdot H_{towfish}}{R_{slant}}$) and acoustic shadow anomaly analysis for submerged ghost gear.
- **Spatial-Temporal Co-Registration**: Haversine distance computation with Bayesian joint confidence integration across asynchronous sensors.

### 🌊 6. Hydrodynamic Drift & Risk Simulation
- **Eulerian-Lagrangian Advection**: 4th-order Runge-Kutta computational model combining tidal current vectors, Ekman wind stress (3% windage factor + Ekman deflection), and wave Stokes drift.
- **Ecological Vulnerability Interception**: Collision detection against Marine Protected Areas (MPAs) and coral reefs with landfall ETA forecasts.

### 🚢 7. Fleet Dispatch & Incident Command
- Real-time coordination of autonomous skimmers, containment booms, and vessel recovery operations (`RV Sagar Guardian`, `Patrol Craft Vajra-2`, `Coral Star`, `OceanCleaner-3`).
- 1-click incident generation from fused targets, status transitions (`NEW` → `ASSIGNED` → `CLEANUP_IN_PROGRESS` → `RESOLVED`), and full JSON data backup/export.

---

## 🚀 Live Pages & Feature Matrix

| View / Page | Key Capabilities | Testing Status |
| :--- | :--- | :--- |
| **Main Overview Dashboard** | Metric counters, live sensor feed tickers, interactive mini-map, recent detections & mission status. | ✅ Fully Functional |
| **Sonar Intelligence** | Hydroacoustic `.DAT`/`.XTF`/`.JSF` parser simulation, slant-range depth calculation, acoustic shadow measurement. | ✅ Fully Functional |
| **Surface Optical Vision** | Image upload, preset transects, in-browser TensorFlow.js COCO-SSD inference, Gemini 3.7 Cloud Vision, YOLO `.txt` export, video tracking. | ✅ Fully Functional |
| **Live Surface Monitoring** | Real webcam streaming via `getUserMedia`, drone feed simulator, live bounding box HUD, GPS lock. | ✅ Fully Functional |
| **Multimodal Fusion** | Multi-sensor candidate selection, Haversine spatial distance, Bayesian confidence synthesis, 1-click incident creation. | ✅ Fully Functional |
| **Hotspot Map** | Interactive WGS84 ocean map, transect layers, nautical telemetry, coordinate HUD (Decimal & DMS). | ✅ Fully Functional |
| **Marine Risk & Drift** | Eulerian-Lagrangian trajectory simulation, MPA landfall collision warnings, interactive physics sliders. | ✅ Fully Functional |
| **Detection History** | Searchable multi-sensor audit log, category filters, CSV & JSON data export. | ✅ Fully Functional |
| **Incident Command** | Triage lifecycle management, priority scoring, vessel dispatch linking, operational notes. | ✅ Fully Functional |
| **Cleanup Operations** | Fleet tracking, mission yield metrics, vessel recovery assignments. | ✅ Fully Functional |
| **Drone Missions** | Aerial UAV transect planning, altitude & battery monitoring, live telemetry. | ✅ Fully Functional |
| **Alerts Center** | Critical bio-risk notifications, acknowledgment toggles, audit history. | ✅ Fully Functional |
| **Model Registry & Lab** | YOLO architecture comparison, active model deployment, real-time training loop simulation. | ✅ Fully Functional |
| **Dataset Lab** | Dataset annotation inspection, class balance charts, zip export. | ✅ Fully Functional |
| **Marine Analytics** | Recharts debris distribution charts, historical recovery trends, sensor performance. | ✅ Fully Functional |
| **Reports Center** | Executive intelligence report generation powered by Gemini, PDF/Markdown export. | ✅ Fully Functional |
| **Authentication & Users** | Pre-configured role sign-in (`ADMIN`, `OPERATOR`, `RESEARCHER`, `CLEANUP_TEAM`), session persistence, custom registration. | ✅ Fully Functional |
| **System Settings** | Sonar threshold calibration, sensor simulation toggles, theme and notification preferences. | ✅ Fully Functional |

---

## 🌐 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check & Gemini API key availability status |
| `/api/detection/sonar` | `POST` | Processes hydroacoustic sonar data with slant-range depth estimation |
| `/api/detection/surface` | `POST` | Analyzes optical images via Gemini Vision & YOLO marine pipeline |
| `/api/detection/video` | `POST` | Simulates multi-frame debris tracking with trajectory keyframes |
| `/api/fusion/analyze` | `POST` | Executes Bayesian co-registration across Sonar, Drone, and Camera inputs |
| `/api/risk/predict` | `POST` | Evaluates marine ecological risk, recurrence probability, and Gemini explanation |
| `/api/drift/predict` | `POST` | Calculates 48-hour Eulerian-Lagrangian hydrodynamic drift waypoints |
| `/api/fleet/vessels` | `GET` | Returns active marine fleet positions, fuel, speed, and gear |
| `/api/fleet/dispatch` | `POST` | Dispatches recovery vessels to active incident coordinates |
| `/api/model/train` | `POST` | Runs fine-tuning epoch progression with mAP metrics |
| `/api/model/deploy` | `POST` | Deploys newly trained YOLO weights to active inference pipeline |
| `/api/model/status` | `GET` | Retrieves active model specifications and recent training runs |
| `/api/ai/copilot` | `POST` | Expert marine AI chat assistant with telemetry context |
| `/api/ai/explain` | `POST` | Scientific justification for detection classifications |
| `/api/ai/report` | `POST` | Generates executive marine impact and recovery reports |

---

## 🚢 Render Deployment Instructions

This repository is pre-configured for instant deployment on [Render](https://render.com) using the included `render.yaml` specification.

### 1-Click / Git Deployment on Render:
1. Push this repository to GitHub or GitLab.
2. In the Render Dashboard, click **New +** → **Web Service** (or **Blueprint**).
3. Connect your repository.
4. Render will automatically detect the configuration from `render.yaml` or you can manually enter:
   - **Environment**: `Node`
   - **Node Version**: `20` or higher
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key *(Optional, enables live multimodal AI reasoning)*
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server (Node Express + Vite middleware on port 3000)
npm run dev

# Run TypeScript type check
npm run lint

# Build for production (bundles client to dist/ and server to dist/server.cjs)
npm run build

# Start production server
npm start
```
