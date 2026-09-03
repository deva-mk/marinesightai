from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/geospatial", tags=["Geospatial & Leaflet Mapping"])

@router.get("/tracks")
async def get_vessel_gps_tracks():
    """
    Returns live and historical research vessel GPS tracks formatted for Leaflet GeoJSON polyline layers.
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "vessel": "RV Sagar Guardian",
                    "callsign": "VT-SG4",
                    "status": "SURVEYING",
                    "speed_knots": 8.4,
                    "heading_deg": 142.0,
                    "depth_m": 24.5,
                    "color": "#FF6F59"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [78.0620, 10.9700],
                        [78.0665, 10.9650],
                        [78.0720, 10.9580],
                        [78.0754, 10.9520],
                        [78.0810, 10.9470]
                    ]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "vessel": "Patrol Craft Vajra-2",
                    "callsign": "PC-VJ2",
                    "status": "PATROL",
                    "speed_knots": 14.2,
                    "heading_deg": 88.5,
                    "depth_m": 16.8,
                    "color": "#4F6F52"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [78.0580, 10.9400],
                        [78.0680, 10.9420],
                        [78.0790, 10.9450],
                        [78.0890, 10.9490]
                    ]
                }
            }
        ]
    }

@router.get("/anomaly-density")
async def get_anomaly_density_geojson():
    """
    Returns anomaly density clusters for Leaflet CircleMarker and Heatmap layers.
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": "HOTSPOT-01",
                    "name": "Sector 4B Coral Sanctuary Cluster",
                    "anomaly_type": "Ghost Net Tangle",
                    "density_score": 94,
                    "radius_m": 450,
                    "severity": "CRITICAL"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [78.0754, 10.9520]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "HOTSPOT-02",
                    "name": "Palk Strait Convergence Rip",
                    "anomaly_type": "Microplastic & Buoyant Polymer Vortex",
                    "density_score": 82,
                    "radius_m": 720,
                    "severity": "HIGH"
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [78.0820, 10.9630]
                }
            }
        ]
    }
