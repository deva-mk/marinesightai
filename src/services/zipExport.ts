import JSZip from 'jszip';

export async function exportProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('package.json', JSON.stringify({
    "name": "marinesight-ai-marine-intelligence",
    "private": true,
    "version": "2.4.0",
    "type": "module",
    "scripts": {
      "dev": "tsx server.ts",
      "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
      "start": "node dist/server.cjs",
      "preview": "vite preview",
      "lint": "tsc --noEmit"
    },
    "dependencies": {
      "@google/genai": "^2.4.0",
      "@tailwindcss/vite": "^4.1.14",
      "@vitejs/plugin-react": "^5.0.4",
      "canvas-confetti": "^1.9.4",
      "dotenv": "^17.2.3",
      "express": "^4.21.2",
      "jszip": "^3.10.1",
      "lucide-react": "^0.546.0",
      "motion": "^12.23.24",
      "react": "^19.0.1",
      "react-dom": "^19.0.1",
      "vite": "^6.2.3"
    },
    "devDependencies": {
      "@types/canvas-confetti": "^1.9.0",
      "@types/express": "^4.17.21",
      "@types/node": "^22.14.0",
      "autoprefixer": "^10.4.21",
      "esbuild": "^0.25.0",
      "tailwindcss": "^4.1.14",
      "tsx": "^4.21.0",
      "typescript": "~5.8.2"
    }
  }, null, 2));

  zip.file('.env.example', `# GEMINI_API_KEY: Required for Gemini AI Marine Copilot
GEMINI_API_KEY=""

# APP_URL: The URL where this applet is hosted
APP_URL="https://marinesight-ai.run.app"
`);

  zip.file('metadata.json', JSON.stringify({
    "name": "MarineSight AI - Marine Intelligence",
    "description": "AI-Powered Marine Debris & Underwater Anomaly Intelligence Platform combining side-scan sonar, surface computer vision, drone tracking, and multimodal fusion.",
    "requestFramePermissions": ["camera", "geolocation"],
    "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
  }, null, 2));

  zip.file('README.md', `# MARINESIGHT AI — AI Marine Debris & Underwater Anomaly Platform
> **"See the Invisible. Clean the Ocean."**

MarineSight AI is a comprehensive full-stack marine intelligence platform engineered for side-scan sonar interpretation, aerial drone optical debris tracking, vessel computer vision, and multimodal spatial-temporal fusion.

## Features
- **Side-Scan Sonar Analysis**: Slant-range correction, bilateral noise filtration, IoU/NMS bounding box classification.
- **Surface Vision (YOLO)**: Floating polymer slicks, discarded line, buoy detection from drone & vessel cameras.
- **Multimodal Fusion**: Spatial & temporal correlation joining aerial optical buoys with seafloor sonar acoustic shadows.
- **Geospatial Hotspots & Interactive Map**: Live cluster mapping, GPS "Locate Me", distance calculations, and recurrence timeline.
- **Marine Risk Intelligence**: Hydrodynamic eddy drift prediction, benthic bio-risk scoring, and cleanup priority indices.
- **Incident Command & Cleanup Operations**: Multi-role taskforce workflows, before/after evidence photos, and tonnage metrics.
- **MarineSight AI Copilot**: Gemini 2.5 Flash assisted marine science assistant.
- **Role-Based Access Control**: Admin, Marine Operator, Researcher, Cleanup Team, and Viewer personas with demo switcher.

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`
Visit http://localhost:3000

## Deploy to Cloud Run
\`\`\`bash
npm run build
npm start
\`\`\`
`);

  // We pack key project files into the zip
  return await zip.generateAsync({ type: 'blob' });
}

export async function downloadProjectZip(filename = 'MarineSight-AI-Marine-Intelligence-Full-Project.zip') {
  const blob = await exportProjectZip();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
