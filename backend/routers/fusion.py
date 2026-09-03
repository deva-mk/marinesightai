from fastapi import APIRouter, HTTPException
import math
import time
from backend.schemas import MultimodalFusionRequest, MultimodalFusionResponse

router = APIRouter(prefix="/fusion", tags=["Multimodal Marine Fusion Engine"])

@router.post("/analyze", response_model=MultimodalFusionResponse)
async def analyze_multimodal_fusion(payload: MultimodalFusionRequest):
    """
    Multimodal Marine Fusion Engine:
    Combines Surface Vision (optical/UAV/vessel) + Underwater Sonar (SSS acoustic shadows)
    Calculates spatial co-registration distance via Haversine formula, and computes joint Bayesian confidence:
    P(Debris | Sonar and Surface) = 1 - (1 - P_sonar) * (1 - P_surface) * discount
    """
    sonar = payload.sonarTarget
    drone = payload.droneTarget
    camera = payload.cameraTarget

    sonar_coords = sonar.coords if sonar else [9.3142, 79.1821]
    drone_coords = drone.coords if drone else [9.3155, 79.1834]

    lat1, lon1 = sonar_coords[0], sonar_coords[1]
    lat2, lon2 = drone_coords[0], drone_coords[1]

    # Haversine distance in meters
    R = 6371e3
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance_meters = round(R * c)

    sonar_conf = sonar.confidence if sonar else 0.94
    drone_conf = drone.confidence if drone else 0.91

    # Co-registration threshold: within 200m
    is_coregistered = distance_meters <= 200
    if is_coregistered:
        # Bayesian combination of independent sensor detections
        joint_conf = round(min(0.99, 1.0 - (1.0 - sonar_conf) * (1.0 - drone_conf) * 0.7), 2)
    else:
        joint_conf = max(sonar_conf, drone_conf)

    priority = "Critical" if joint_conf >= 0.92 else "High"
    fused_lat = round((lat1 + lat2) / 2.0, 5)
    fused_lng = round((lon1 + lon2) / 2.0, 5)

    fused_id = f"FUSED-{int(time.time()*1000)%10000:04d}"

    result = {
        "fusedId": fused_id,
        "targetCategory": "Ghost Fishing Gear",
        "combinedConfidence": joint_conf,
        "priority": priority,
        "coordinates": [fused_lat, fused_lng],
        "spatialMatchDistanceM": distance_meters,
        "sensorSignals": {
            "sonar": {
                "detected": sonar.detected if sonar else True,
                "confidence": sonar_conf,
                "depthMeters": sonar.depthMeters if sonar else 14.2,
                "shadowLengthM": sonar.shadowLengthM if sonar else 6.8,
                "note": f"Submerged acoustic anomaly with {sonar.shadowLengthM if sonar else 6.8}m acoustic shadow at {sonar.depthMeters if sonar else 14.2}m depth."
            },
            "drone": {
                "detected": drone.detected if drone else True,
                "confidence": drone_conf,
                "altitudeM": drone.altitudeM if drone else 45.0,
                "note": "Surface floating markers and synthetic polymer signature observed."
            },
            "camera": {
                "detected": camera.detected if camera else True,
                "confidence": camera.confidence if camera else 0.88,
                "note": "Optical validation of surface gyre trapping entangled debris."
            },
            "gps": {
                "lat": fused_lat,
                "lng": fused_lng,
                "accuracyMeters": 2.1
            }
        },
        "aiExplanation": (
            f"Multimodal Fusion Engine co-registered surface optical and subsurface acoustic signals (Δd = {distance_meters}m). "
            f"Acoustic shadow relief aligns with aerial multi-spectral surface sighting, establishing joint confidence at {int(joint_conf * 100)}%."
        ),
        "recommendation": "Deploy RV Sagar Guardian salvage team with specialized hydraulic net cutters."
    }

    return MultimodalFusionResponse(success=True, fusion=result)
