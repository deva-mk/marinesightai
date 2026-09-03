import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "Marine Debris" in data["app_name"]

def test_geospatial_tracks():
    response = client.get("/api/v1/geospatial/tracks")
    assert response.status_code == 200
    geojson = response.json()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) >= 2
    assert geojson["features"][0]["properties"]["vessel"] == "RV Sagar Guardian"

def test_geospatial_anomaly_density():
    response = client.get("/api/v1/geospatial/anomaly-density")
    assert response.status_code == 200
    geojson = response.json()
    assert len(geojson["features"]) >= 1
