from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional, Dict, Any
import time

from backend.database import get_db
from backend.models import CleanupOperationModel
from backend.schemas import CleanupOperationSchema

router = APIRouter(prefix="/cleanup", tags=["Marine Cleanup Operations & Dispatch"])

DEFAULT_CLEANUP_OPS = [
    {
        "id": "CLN-401",
        "operation_code": "CLN-401",
        "target_incident_id": "INC-8092",
        "title": "Operation NetSweep Sector 4A",
        "vessel_id": "VES-01",
        "vessel_name": "RV Sagar Guardian (IMO 941208)",
        "status": "DISPATCHED",
        "target_lat": 9.3148,
        "target_lng": 79.1828,
        "recovered_weight_kg": 420.0,
        "target_debris_type": "Ghost Fishing Gear (Heavy Monofilament)",
        "created_at": "2025-02-28T10:30:00Z"
    },
    {
        "id": "CLN-402",
        "operation_code": "CLN-402",
        "target_incident_id": "INC-8091",
        "title": "Harbor Channel Boom Containment",
        "vessel_id": "VES-02",
        "vessel_name": "Interceptor Alpha",
        "status": "IN_PROGRESS",
        "target_lat": 9.3245,
        "target_lng": 79.1790,
        "recovered_weight_kg": 85.0,
        "target_debris_type": "Industrial Plastic Crates",
        "created_at": "2025-02-28T09:45:00Z"
    }
]

@router.get("", response_model=List[CleanupOperationSchema])
async def list_cleanup_operations(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns dispatched and active marine debris cleanup and recovery missions.
    """
    try:
        query = select(CleanupOperationModel).order_by(desc(CleanupOperationModel.created_at))
        if status:
            query = query.where(CleanupOperationModel.status == status.upper())
        result = await db.execute(query)
        db_records = result.scalars().all()
        if db_records:
            return [
                CleanupOperationSchema(
                    id=r.id,
                    operation_code=r.operation_code,
                    target_incident_id=r.target_incident_id,
                    title=r.title,
                    vessel_id=r.vessel_id,
                    vessel_name=r.vessel_name,
                    status=r.status,
                    target_lat=r.target_lat,
                    target_lng=r.target_lng,
                    recovered_weight_kg=r.recovered_weight_kg,
                    target_debris_type=r.target_debris_type,
                    created_at=r.created_at.isoformat() if r.created_at else None
                ) for r in db_records
            ]
    except Exception:
        pass

    ops = DEFAULT_CLEANUP_OPS
    if status:
        ops = [o for o in ops if o["status"] == status.upper()]
    return [CleanupOperationSchema(**o) for o in ops]

@router.post("/dispatch", response_model=CleanupOperationSchema)
async def dispatch_cleanup(
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatches a retrieval vessel or autonomous cleanup skimmer to a designated debris target.
    """
    op_id = f"CLN-{int(time.time()*1000)%10000:04d}"
    vessel_name = payload.get("vesselName", "RV Sagar Guardian (IMO 941208)")
    vessel_id = payload.get("vesselId", "VES-01")
    coords = payload.get("targetCoords", [9.3148, 79.1828])
    debris_type = payload.get("debrisType", "Ghost Fishing Gear")
    incident_id = payload.get("incidentId", "INC-8092")

    record = CleanupOperationModel(
        id=op_id,
        operation_code=op_id,
        target_incident_id=incident_id,
        title=f"Salvage Mission for {debris_type}",
        vessel_id=vessel_id,
        vessel_name=vessel_name,
        status="DISPATCHED",
        target_lat=coords[0],
        target_lng=coords[1],
        recovered_weight_kg=0.0,
        target_debris_type=debris_type
    )
    db.add(record)
    await db.commit()

    return CleanupOperationSchema(
        id=op_id,
        operation_code=op_id,
        target_incident_id=incident_id,
        title=f"Salvage Mission for {debris_type}",
        vessel_id=vessel_id,
        vessel_name=vessel_name,
        status="DISPATCHED",
        target_lat=coords[0],
        target_lng=coords[1],
        recovered_weight_kg=0.0,
        target_debris_type=debris_type,
        created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ")
    )
