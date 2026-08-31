# 🌊 MarineSight AI — Real-Time Marine Debris Detection & Ocean Intelligence Platform

**MarineSight AI** is a real-time marine debris detection, oceanographic intelligence, and cleanup coordination platform. Built with a specialized coastal theme (Deep Teal `#4F6F52`, Coral `#FF6F59`, and Warm Sand `#F7F3EA`), it integrates in-browser edge neural vision, multimodal satellite and sonar telemetry, hydrodynamic drift simulation, and autonomous recovery fleet management.

---

## 🌟 Architecture & Core Capabilities

### 👁️ 1. Hybrid Neural Vision & Multi-Object Tracking
- **On-Device Edge Neural Inference**: Real-time forward pass using **TensorFlow.js (WebGL / WebAssembly)** for client-side object detection and coordinate bounding box segmentation at <15ms latency.
- **Multimodal Zero-Shot Cloud Vision**: Powered by **Google Gemini 3.7 Flash Vision API** for high-resolution semantic classification and optical signature characterization.
- **Real-Time Video Multi-Object Tracking**: Frame-by-frame Hungarian / IoU association with continuous centroid velocity vector estimation and persistent Tracker IDs.
- **Interactive Threshold Calibration**: Real-time confidence and IoU NMS threshold sliders with downloadable YOLO `.txt` format label files.

### 🛰️ 2. Multimodal Intelligence Fusion
- **Layer 1: Surface Vision (Optical/Drone)**: High-resolution optical debris classification and boundary localization.
- **Layer 2: Acoustic Sonar Arrays**: Slant-range geometric rectification ($H = \frac{L_{shadow} \cdot H_{towfish}}{R_{slant}}$) and acoustic shadow anomaly analysis for submerged ghost gear.
- **Layer 3: Satellite SAR & Coastal Radar**: Wide-area surface tension dampening and hydrocarbon slick co-registration.
- **Spatial-Temporal Co-Registration**: Haversine correlation radius with Bayesian joint confidence integration across asynchronous sensors.

### 🌊 3. Hydrodynamic Drift & Risk Simulation
- **Eulerian-Lagrangian Advection**: 4th-order Runge-Kutta computational model combining tidal current vectors, Ekman wind stress (3% windage factor), and wave Stokes drift.
- **Ecological Vulnerability Interception**: Real-time collision detection against Marine Protected Areas (MPAs), coral reefs, and coastal transects with landfall ETA forecasts.

### 🗺️ 4. Geospatial Hydrographic Hotspots & Navigation
- **WGS 84 Dynamic Adaptive Projection**: Auto-framing bounding box computation across all active marine transects and GPS telemetry.
- **Live Navigational Telemetry**: True bearing computation (degrees & 16-point cardinal compass) and Haversine distance calculations in both kilometers and nautical miles.
- **Live Cursor Coordinate HUD**: Real-time decimal and DMS (Degrees, Minutes, Seconds) coordinate resolution.

### 🚢 5. Fleet Dispatch & Incident Command
- Real-time coordination of autonomous skimmers, containment booms, and vessel recovery operations.
- Emergency escalation protocol for wildlife entanglement and high-volume hazardous slicks.
- Searchable historical audit archive with single-click JSON export.

---

## 🛠️ Technology Stack

- **Frontend & Visualization**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Neural Network Inference**: TensorFlow.js (`@tensorflow/tfjs`), COCO-SSD (`@tensorflow-models/coco-ssd`), ONNX Runtime Web (`onnxruntime-web`)
- **Multimodal AI & Reasoning**: Google Gen AI SDK (`@google/genai`, Gemini 3.7 Flash)
- **Backend & APIs**: Express.js, TypeScript (`tsx`), Node.js
