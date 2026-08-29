# 🌊 MarineSight AI — Real-Time Marine Debris Detection & Ocean Intelligence Platform

**MarineSight AI** is a real-time marine debris detection, oceanographic intelligence, and cleanup coordination platform. Built with a specialized coastal theme (Deep Teal `#0F766E`, Coral `#FF6B5A`, and Warm Sand `#F7F3EA`), it bridges Computer Vision (YOLOv8) with acoustic sonar telemetry, hydrodynamic drift simulation, and autonomous recovery fleet management.

---

## 🌟 Key Features

### 👁️ 1. Surface Vision & YOLOv8 Detection
- **Real-Time Optical Detection**: Identify and classify marine debris (plastic bottles, ghost nets, microplastics, oil slicks, derelict gear, styrofoam) with bounding box annotations.
- **Interactive Threshold Calibration**: Real-time confidence and IoU NMS threshold sliders.
- **Detailed Coordinate Inspector**: View normalized XYWH bounding boxes, detection timestamps, and optical confidence scores.
- **Sample Presets**: Instantly test coastal, offshore, drone aerial, and floating debris presets.

### 📊 2. Marine Analytics & Ecological Hotspots
- **Interactive Hotspot Mapping**: Heatmap visualization of debris concentration across coastal sectors.
- **Debris Composition Metrics**: Real-time breakdowns of macro vs. micro-plastics and pollution trends.
- **Historical Audit Archive**: Search, filter, inspect, and export detection logs to JSON.

### 🛰️ 3. Multimodal Intelligence Fusion
- **Layer 1: Surface Vision (YOLO)**: High-resolution optical debris classification.
- **Layer 2: Acoustic Sonar Arrays**: Subsurface ghost net and submerged derelict gear resonance.
- **Layer 3: Satellite SAR & Radar**: Wide-area surface tension and slick tracking.

### 🌊 4. Hydrodynamic Drift Simulation
- Eulerian-Lagrangian drift prediction using tidal currents, Ekman wind stress, and wave Stokes drift.
- Coastal vulnerability zone impact forecasting with estimated landfall timelines.

### 🤖 5. MarineSight AI Copilot
- Intelligent conversational assistant powered by Google Gemini for maritime triage, cleanup tactics, and ecological risk mitigation.

### 🚢 6. Fleet Dispatch & Incident Command
- Real-time coordination of autonomous skimmers, containment booms, and vessel recovery operations.
- Emergency escalation protocol for wildlife entanglement and high-volume hazardous slicks.

---

## 🎨 Color Palette & Design System

| Color Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Teal** | `#0F766E` | Primary brand accent, active tabs, action buttons, primary annotations |
| **Coral** | `#FF6B5A` | Secondary telemetry accents, warning indicators, category chips |
| **Warm Sand** | `#F7F3EA` | Global background canvas |
| **Sea Green** | `#2E8B57` | Success status, active YOLO weights, high confidence badges |
| **Amber** | `#F59E0B` | Standby states, moderate hazard alerts |
| **Red** | `#DC2626` | Critical priority incidents, high-risk contamination alerts |
| **Charcoal** | `#1F2937` | Primary high-contrast body & heading typography |
| **Off-White** | `#FFFCF7` | Elevated card & panel surfaces |
| **Border Neutral** | `#E8E2D5` | Card outlines and subtle dividers |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/deva-mk/marinesightai.git
   cd marinesightai
