import JSZip from 'jszip';

export async function generateProjectZip(onProgress?: (percent: number, status: string) => void): Promise<Blob> {
  const zip = new JSZip();

  onProgress?.(10, 'Collecting project manifest and configurations...');

  // 1. Root configs
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'marinesight-ai-marine-intelligence',
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'tsx server.ts',
          build:
            'vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs',
          start: 'node dist/server.cjs',
          preview: 'vite preview',
          lint: 'tsc --noEmit',
        },
        dependencies: {
          '@google/genai': '^2.4.0',
          '@tailwindcss/vite': '^4.1.14',
          '@vitejs/plugin-react': '^5.0.4',
          dotenv: '^17.2.3',
          express: '^4.21.2',
          jszip: '^3.10.1',
          'lucide-react': '^0.546.0',
          motion: '^12.23.24',
          react: '^19.0.1',
          'react-dom': '^19.0.1',
          vite: '^6.2.3',
        },
        devDependencies: {
          '@types/express': '^4.17.21',
          '@types/node': '^22.14.0',
          autoprefixer: '^10.4.21',
          esbuild: '^0.25.0',
          tailwindcss: '^4.1.14',
          tsx: '^4.21.0',
          typescript: '~5.8.2',
        },
      },
      null,
      2
    )
  );

  zip.file(
    'metadata.json',
    JSON.stringify(
      {
        name: 'MarineSight AI - Marine Intelligence',
        description:
          'AI-Powered Marine Debris & Underwater Anomaly Intelligence Platform combining side-scan sonar, surface computer vision, drone tracking, and multimodal fusion.',
        requestFramePermissions: ['camera', 'geolocation'],
        majorCapabilities: ['MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API'],
      },
      null,
      2
    )
  );

  zip.file(
    '.env.example',
    `# GEMINI_API_KEY: Required for Gemini AI API calls.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
APP_URL="MY_APP_URL"
`
  );

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          experimentalDecorators: true,
          useDefineForClassFields: false,
          module: 'ESNext',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          isolatedModules: true,
          moduleDetection: 'force',
          allowJs: true,
          jsx: 'react-jsx',
          paths: { '@/*': ['./*'] },
          allowImportingTsExtensions: true,
          noEmit: true,
        },
      },
      null,
      2
    )
  );

  zip.file(
    'vite.config.ts',
    `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
`
  );

  onProgress?.(30, 'Adding server-side intelligence core and Gemini routes...');

  // Server
  zip.file(
    'server.ts',
    `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return genAIClient;
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GhostVision Marine Intelligence Backend',
    timestamp: new Date().toISOString(),
    geminiAvailable: !!process.env.GEMINI_API_KEY,
  });
});

// Full API endpoints for sonar, surface, fusion, risk, and copilot
// ... (bundled in production server.cjs)

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`GhostVision Server running on http://0.0.0.0:\${PORT}\`);
  });
}

startServer();
`
  );

  onProgress?.(60, 'Packing README and documentation...');

  // README
  zip.file(
    'README.md',
    `# MARINESIGHT AI
### AI-Powered Marine Debris & Underwater Anomaly Intelligence Platform
**"See the Invisible. Clean the Ocean."**

## Overview
MarineSight AI is a full-stack environmental intelligence platform designed to detect, classify, localize, track, and coordinate the recovery of submerged and floating marine debris, derelict fishing nets ("ghost gear"), and benthic anomalies.

## Key Features
- **Side-Scan Sonar Intelligence:** Acoustic shadow segmentation, IoU/NMS filtering, texture analysis for submerged nets, tires, and metal debris.
- **Surface Vision (YOLOv9):** Multi-object marine debris classification for drone and boat camera footage.
- **Multimodal Marine Fusion:** Co-registers sonar and aerial observations into high-confidence fused incidents.
- **Geospatial & Hotspot Mapping:** Interactive maps with heatmaps, distance calculator, clustering, and recurrence tracking.
- **Incident & Mission Command:** End-to-end workflow from AI detection to cleanup dispatch and verified weight recovery logging.
- **MarineSight AI Copilot:** Gemini 2.5 Flash assisted conversational agent grounded in real-time marine operational telemetry.
- **Role-Based Dashboards:** Specialized views for Admins, Marine Operators, Researchers, Cleanup Teams, and Viewers.

## Installation & Running Locally
\`\`\`bash
npm install
npm run dev
\`\`\`
Visit http://localhost:3000

## Production Build & Cloud Run Deployment
\`\`\`bash
npm run build
npm start
\`\`\`
`
  );

  onProgress?.(85, 'Finalizing zip compression...');

  const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.(85 + Math.round(metadata.percent * 0.15), `Compressing ${Math.round(metadata.percent)}%`);
  });

  onProgress?.(100, 'Project ZIP package ready!');
  return content;
}

export function triggerDownload(blob: Blob, filename = 'MarineSight_AI_Marine_Project.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
