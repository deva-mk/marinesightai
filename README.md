# MARINESIGHT AI — AI Marine Debris & Underwater Anomaly Intelligence Platform

> **See the Invisible. Clean the Ocean.**

MarineSight AI is a full-stack marine intelligence platform designed for detecting, monitoring, analyzing, and managing marine debris and underwater anomalies.

The platform combines:

* Side-Scan Sonar Intelligence
* Surface Computer Vision
* Drone Monitoring
* Video Object Tracking
* Multimodal Sensor Fusion
* Geospatial Hotspot Analysis
* Marine Risk Prediction
* Incident Command
* Cleanup Operations
* AI-powered MarineSight Copilot
* Role-Based Access Control
* Interactive Marine Analytics

---

# 1. Technology Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Motion
* HTML5
* CSS3

## Backend

* Node.js
* Express.js
* TypeScript
* TSX
* esbuild

## AI

* Google Gemini API
* Gemini AI Marine Copilot
* AI-assisted detection explanation
* AI-assisted report generation

## Client Storage

The current application uses browser `localStorage` for demo/application state.

Stored information includes:

* Detection records
* Incidents
* Cleanup missions
* Drone missions
* Hotspots
* AI models
* Datasets
* Alerts
* Live stream events
* Current user
* Demo mode

## Build Tools

* Vite
* TypeScript
* esbuild
* npm

---

# 2. System Requirements

Before running the project, install the following software.

### Required

* Node.js 20 or higher
* npm 10 or higher
* Git

Recommended:

* Node.js 22 LTS
* npm latest stable version

Check your installed versions:

```bash
node --version
npm --version
git --version
```

Example:

```text
Node.js: v22.x.x
npm: 10.x.x
```

---

# 4. Download / Clone the Project

If the project is available through GitHub:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Then enter the project directory:

```bash
cd marinesight-ai-marine-intelligence
```

If you downloaded the project as a ZIP file, extract it and open the extracted project folder in VS Code.

---

# 5. Install Dependencies

Open a terminal inside the project root directory.

Run:

```bash
npm install
```

This installs all frontend and backend dependencies specified in `package.json`.

After installation, verify that the project contains:

```text
node_modules/
package-lock.json
```

---

# 6. Configure Environment Variables

Create a `.env` file in the project root.

Copy the example configuration:

```bash
cp .env.example .env
```

On Windows PowerShell, you can also create `.env` manually.

The `.env` file should contain:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
APP_URL=http://localhost:3000
```

### GEMINI_API_KEY

This key is required for Gemini-powered features such as:

* MarineSight AI Copilot
* AI detection explanations
* Executive report generation

Replace:

```text
YOUR_GEMINI_API_KEY
```

with your actual Gemini API key.

**Never commit your `.env` file to GitHub.**

Your `.gitignore` should contain:

```text
.env
.env.local
node_modules/
dist/
```

---

# 7. Run the Application Locally

After installing dependencies and configuring `.env`, run:

```bash
npm run dev
```

The application starts using the Express server and Vite development environment.

Open:

```text
http://localhost:3000
```

You should see the MarineSight AI landing page.

---

# 8. Verify Backend Health

MarineSight AI provides a backend health endpoint.

Open:

```text
http://localhost:3000/api/health
```

A successful response should look similar to:

```json
{
  "status": "ok",
  "service": "MarineSight AI Marine Intelligence Backend",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "geminiAvailable": true
}
```

If:

```json
"geminiAvailable": false
```

appears, check that `GEMINI_API_KEY` is correctly configured in `.env`.

---

# 9. Available API Endpoints

The Express backend provides the following API routes.

## Health Check

```http
GET /api/health
```

Used to verify that the backend is running.

---

## Sonar Detection

```http
POST /api/detection/sonar
```

Processes side-scan sonar detection requests.

Example request:

```json
{
  "filename": "sonar_scan.dat",
  "fileSize": 1024000,
  "fileType": "DAT",
  "coordinates": [
    9.3142,
    79.1821
  ],
  "params": {
    "confidenceThreshold": 0.5,
    "noiseReduction": true,
    "frequencyKhz": 455,
    "contrastEnhancement": 50
  }
}
```

---

## Surface Vision

```http
POST /api/detection/surface
```

Processes surface/debris detection requests.

Example:

```json
{
  "filename": "drone_image.jpg",
  "source": "Drone Vision",
  "confidenceThreshold": 0.5
}
```

---

## Video Tracking

```http
POST /api/detection/video
```

Used for tracking detected marine debris across video frames.

Example:

```json
{
  "durationSeconds": 10,
  "fps": 30
}
```

---

## Multimodal Fusion

```http
POST /api/fusion/analyze
```

Combines information from:

* Sonar
* Drone
* Camera

The fusion service calculates spatial relationships and combined detection confidence.

---

## Marine Risk Prediction

```http
POST /api/risk/predict
```

Used for marine debris risk prediction and prioritization.

---

## AI Copilot

```http
POST /api/ai/copilot
```

Sends marine intelligence questions to the Gemini-powered AI assistant.

Example:

```json
{
  "message": "Explain the detected marine debris risk.",
  "context": {}
}
```

---

## Detection Explanation

```http
POST /api/ai/explain
```

Generates an AI explanation for a detected object.

---

## Executive Report

```http
POST /api/ai/report
```

Generates an AI-assisted marine intelligence report.

---

# 10. Production Build

Before deploying the application, create a production build.

Run:

```bash
npm run build
```

This performs two operations:

```text
Vite build
      ↓
Frontend production files

esbuild
      ↓
Express backend bundle
```

The resulting structure will contain:

```text
dist/
├── assets/
├── index.html
└── server.cjs
```

---

# 11. Test the Production Build Locally

After building the application:

```bash
npm start
```

The production server will start.

Open:

```text
http://localhost:3000
```

Test the backend:

```text
http://localhost:3000/api/health
```

---

# 12. Important Deployment Configuration

Before deploying to a cloud platform, update the following line in `server.ts`.

### Current code

```typescript
const PORT = 3000;
```

### Change it to

```typescript
const PORT = Number(process.env.PORT) || 3000;
```

This allows the application to:

* Use port `3000` locally
* Automatically use the port assigned by a cloud platform

This change is **required for reliable cloud deployment**.

---

# 13. Deploy Using Render

Render can host the complete application because MarineSight AI contains both:

* React frontend
* Express backend

Create a new **Web Service** in Render and connect your GitHub repository.

Use the following configuration.

### Build Command

```bash
npm install && npm run build
```

### Start Command

```bash
npm start
```

### Environment Variables

Add:

```text
GEMINI_API_KEY = YOUR_GEMINI_API_KEY
```

and:

```text
APP_URL = YOUR_DEPLOYED_APPLICATION_URL
```

For example:

```text
APP_URL=https://your-marinesight-app.onrender.com
```

Do not place secrets directly inside the source code.

---

# 14. Deploy Using Google Cloud Run

MarineSight AI can also be deployed as a containerized Node.js application.

Before deployment, make sure `server.ts` contains:

```typescript
const PORT = Number(process.env.PORT) || 3000;
```

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

Build the Docker image:

```bash
docker build -t marinesight-ai .
```

Run locally:

```bash
docker run -p 3000:3000 --env GEMINI_API_KEY=YOUR_GEMINI_API_KEY marinesight-ai
```

Then open:

```text
http://localhost:3000
```

For Google Cloud Run, configure the Gemini API key as a Cloud Run environment variable or secret rather than hard-coding it into the image.

---

# 15. Deploy Using Any Node.js Hosting Platform

MarineSight AI can also be deployed on a platform that supports a long-running Node.js/Express application.

The platform should support:

* Node.js
* npm
* Express
* Environment variables
* Custom application ports

Use:

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

The hosting provider should route traffic to:

```text
process.env.PORT
```

The application itself falls back to:

```text
3000
```

when running locally.

---

# 16. Deployment Environment Variables

The following variables are supported:

| Variable         | Required            | Description                            |
| ---------------- | ------------------- | -------------------------------------- |
| `GEMINI_API_KEY` | Yes for AI features | Google Gemini API key                  |
| `APP_URL`        | Recommended         | Public URL of the deployed application |
| `PORT`           | Platform supplied   | Port used by the hosting platform      |

Example:

```env
GEMINI_API_KEY=your_api_key
APP_URL=https://your-domain.com
PORT=3000
```

For cloud platforms, normally **do not manually hard-code `PORT`** unless the platform specifically requires it.

---

# 17. Application Features

## Dashboard

The main dashboard provides an overview of marine intelligence operations, including:

* Detection statistics
* Active incidents
* Marine debris records
* Cleanup operations
* Risk information
* Live intelligence events

---

## Sonar Intelligence

The Sonar Intelligence module provides a simulated/model-adapter workflow for:

* Side-scan sonar analysis
* Noise reduction
* Contrast enhancement
* Frequency selection
* Confidence thresholding
* Object detection
* Acoustic shadow analysis
* Detection quality scoring

Supported sonar formats can be represented through the platform's detection workflow.

---

## Surface Vision

Surface Vision provides computer-vision-style marine debris detection for:

* Plastic
* Fishing nets
* Floating debris
* Marine objects

The API follows a YOLO-style detection response structure.

---

## Multimodal Fusion

The Fusion module combines multiple marine observation sources:

```text
                 ┌──────────────┐
                 │ Side-Scan    │
                 │ Sonar        │
                 └──────┬───────┘
                        │
                        │
┌──────────────┐        ▼        ┌──────────────┐
│ Drone Vision │ ──► MULTIMODAL ◄── Camera Data │
└──────────────┘      FUSION      └──────────────┘
                        │
                        ▼
                ┌──────────────┐
                │ Risk / Event │
                │ Intelligence │
                └──────────────┘
```

The system evaluates spatial proximity and combines observations to generate a unified marine intelligence result.

---

## Hotspot Mapping

The map module provides:

* Marine debris hotspots
* Geographic coordinates
* Detection locations
* Distance calculations
* Recurrence information
* Location visualization

---

## Risk Prediction

Marine risk intelligence considers detection information and geographic context to produce risk-oriented results.

---

## Incident Command

Operators can manage:

* Marine incidents
* Incident severity
* Incident status
* Team assignment
* Vessel assignment
* Incident notes
* Alerts

---

## Cleanup Operations

Cleanup teams can manage:

* Cleanup missions
* Mission status
* Collected debris
* High-risk debris resolution
* Before/after evidence
* Mission completion

---

## Drone Missions

The application provides a dashboard for monitoring and managing drone-based marine surveillance missions.

---

## AI Copilot

The MarineSight AI Copilot uses Gemini to provide an AI-assisted marine intelligence interface.

Example questions:

```text
What is the highest-risk debris detected?

Explain why this sonar detection is classified as critical.

Which area should the cleanup team prioritize?

Generate a marine debris incident summary.
```

---

# 18. Demo Mode and Local Storage

The application initializes demonstration data automatically.

On first launch, sample data is stored in browser `localStorage`.

This includes:

```text
Detections
Incidents
Cleanup Missions
Drone Missions
Hotspots
AI Models
Datasets
Alerts
Live Stream
Current User
Demo Mode
```

Therefore, the current version does **not require a database** for the demo workflow.

Data is stored in the browser of the user running the application.

---

# 19. Reset Demo Data

If the application data becomes inconsistent during testing, clear the browser's site data/local storage.

In Chrome:

```text
Developer Tools
→ Application
→ Storage
→ Local Storage
→ Delete MarineSight entries
```

Then reload the application.

The sample data will be initialized again.

---

# 20. Role-Based Demo Access

The application supports different operational personas, including:

* Admin
* Marine Operator
* Researcher
* Cleanup Team
* Viewer

The demo role can be switched through the application's role/demo interface.

These roles are currently implemented as application-level demo roles rather than a production authentication provider.

---

# 21. Development Commands

### Start development server

```bash
npm run dev
```

### Build production application

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Preview Vite output

```bash
npm run preview
```

### TypeScript validation

```bash
npm run lint
```

---

# 22. Troubleshooting

## Problem: `npm install` fails

Try:

```bash
npm cache clean --force
npm install
```

Also verify:

```bash
node --version
npm --version
```

Use Node.js 20+.

---

## Problem: Port 3000 is already in use

Stop the process using port 3000 or run the application with another port after ensuring the server uses:

```typescript
const PORT = Number(process.env.PORT) || 3000;
```

---

## Problem: Gemini features are not working

Check `.env`:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Restart the development server:

```bash
npm run dev
```

Then check:

```text
/api/health
```

The response should contain:

```json
"geminiAvailable": true
```

---

## Problem: Page loads but API requests fail

Verify that the Express server is running.

Check:

```text
http://localhost:3000/api/health
```

If the health endpoint does not respond, restart:

```bash
npm run dev
```

---

## Problem: Cloud deployment starts but application is unreachable

Make sure `server.ts` uses:

```typescript
const PORT = Number(process.env.PORT) || 3000;
```

Cloud platforms generally assign the listening port through the `PORT` environment variable.

---

# 23. Production Security

Before using MarineSight AI in a real production environment:

* Never expose the Gemini API key in frontend code.
* Never commit `.env` files.
* Use cloud secret management for API credentials.
* Add proper authentication.
* Add authorization middleware.
* Validate all API input.
* Add rate limiting.
* Add HTTPS.
* Add persistent database storage.
* Add server-side logging and monitoring.
* Configure CORS appropriately.
* Replace simulated detection adapters with validated ML inference services.
* Secure uploaded sonar/image/video files.
* Implement audit logging for operational actions.

---

# 24. Current Implementation Note

MarineSight AI currently contains several **simulation/model-adapter components** intended to demonstrate the complete marine intelligence workflow.

For example:

```text
Sonar Input
     ↓
Preprocessing Parameters
     ↓
Detection Adapter
     ↓
Confidence Filtering
     ↓
Risk Classification
     ↓
Marine Intelligence Dashboard
```

Similarly:

```text
Drone / Camera Input
        ↓
Surface Detection Adapter
        ↓
Object Classification
        ↓
Confidence Score
        ↓
Marine Risk Analysis
```

These components provide the application's end-to-end workflow and can later be connected to production ML models such as:

* YOLO
* YOLOv9/YOLOv10/YOLO11
* ONNX Runtime
* TensorRT
* PyTorch
* TensorFlow
* Custom Side-Scan Sonar models

---

# 25. Recommended Production Architecture

For a full production implementation, the recommended architecture is:

```text
                         MARINESIGHT AI
                              │
              ┌───────────────┴────────────────┐
              │                                │
         React Frontend                  Express API
              │                                │
              │                    ┌───────────┼───────────┐
              │                    │           │           │
              │                 Sonar       Vision      Gemini
              │                  API          API         AI
              │                    │           │           │
              │                    └─────┬─────┴───────────┘
              │                          │
              │                    Fusion Engine
              │                          │
              │                    Risk Engine
              │                          │
              └──────────────┬───────────┘
                             │
                       PostgreSQL /
                       MongoDB
                             │
                       Object Storage
```

---

# 26. Quick Deployment Checklist

Before deployment:

```text
[ ] Install Node.js 20+
[ ] Clone/download project
[ ] Run npm install
[ ] Create .env
[ ] Add GEMINI_API_KEY
[ ] Update server.ts to use process.env.PORT
[ ] Run npm run lint
[ ] Run npm run build
[ ] Run npm start
[ ] Test /api/health
[ ] Test main dashboard
[ ] Test AI Copilot
[ ] Test detection modules
[ ] Configure cloud environment variables
[ ] Deploy
[ ] Test deployed /api/health
[ ] Test deployed application
```

---

# 27. One-Command Local Setup

After Node.js is installed:

```bash
npm install && npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 28. Production Deployment Summary

The standard production process is:

```text
Clone Repository
       ↓
npm install
       ↓
Configure Environment Variables
       ↓
npm run lint
       ↓
npm run build
       ↓
npm start
       ↓
Cloud Platform
       ↓
Public MarineSight AI URL
```

The application is designed as a single Node.js service containing both the React frontend and Express backend, making it suitable for deployment on Node.js-compatible cloud hosting platforms.

---

# 29. Project Purpose

MarineSight AI aims to provide a unified intelligence platform for marine debris monitoring by combining underwater sensing, surface computer vision, geospatial intelligence, AI-assisted analysis, and operational response.

The long-term objective is to connect:

```text
UNDERWATER
Side-Scan Sonar
       +
SURFACE
Drone / Camera
       +
LOCATION
GPS / Geospatial Data
       +
AI
Computer Vision + Gemini
       +
FUSION
Spatial + Temporal Intelligence
       +
ACTION
Incident Response + Cleanup
```

into a single marine intelligence ecosystem.

---

# 30. License

Add the appropriate license for your project before public distribution.

If this is an academic/hackathon project, clearly mention the project ownership and institutional/team information here.

---

## MarineSight AI

**AI-Powered Marine Debris & Underwater Anomaly Intelligence Platform**

> **See the Invisible. Clean the Ocean.**
