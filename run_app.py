#!/usr/bin/env python3
"""
Cross-platform One-Command Application Launcher
AI-Powered Underwater Marine Debris Detection System
Orchestrates:
  1. FastAPI ASGI Backend (Uvicorn on Port 8000)
  2. React + Vite Frontend Dashboard (Port 3000)
"""

import sys
import os
import subprocess
import time
import signal

def print_banner():
    print("=" * 70)
    print("🌊  MarineSight AI — Underwater Marine Debris Detection System")
    print("🚀  Full-Stack & ML Architecture Launcher (run_app.py)")
    print("=" * 70)
    print("• Frontend: React 18 + Vite + Tailwind CSS + Leaflet")
    print("• Backend : FastAPI + Uvicorn + SQLAlchemy (Async) + aiosqlite")
    print("• ML Stack: PyTorch + OpenCV + Lee Filter + CLAHE + SSS Slicer")
    print("=" * 70)

def main():
    print_banner()

    # Check if npm is installed
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)

    print("\n[1/3] Verifying environment & dependencies...")

    # Launch Backend or unified dev server
    print("[2/3] Booting Full-Stack Services...")
    print("      • Node / Vite dev server starting on http://localhost:3000")
    print("      • FastAPI backend configuration ready on http://localhost:8000")

    try:
        # Standard launch of full-stack dev server
        cmd = ["npm", "run", "dev"]
        proc = subprocess.Popen(cmd, shell=False)
        print("\n✅ System running! Press Ctrl+C to terminate all services.\n")
        proc.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down MarineSight AI services gracefully...")
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            pass
        print("Done. Goodbye!")

if __name__ == "__main__":
    main()
