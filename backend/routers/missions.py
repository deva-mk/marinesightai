from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from backend.database import get_db
from backend.models import MissionRecordModel, AuditLogModel
from backend.schemas import MissionCreate, MissionResponse

router = APIRouter(prefix="/missions", tags=["Missions & Audit Logs (SQLite Async)"])

@router.get("/", response_model=List[MissionResponse])
async def list_missions(db: AsyncSession = Depends(get_db)):
    """
    Returns active and historical recovery missions from SQLite embedded database via SQLAlchemy.
    """
    result = await db.execute(select(MissionRecordModel).order_by(desc(MissionRecordModel.start_time)))
    missions = result.scalars().all()
    return missions

@router.post("/", response_model=MissionResponse)
async def create_mission(payload: MissionCreate, db: AsyncSession = Depends(get_db)):
    """
    Dispatches a new vessel cleanup mission and logs audit event to SQLite.
    """
    mission = MissionRecordModel(
        mission_code=payload.mission_code,
        vessel_name=payload.vessel_name,
        target_area=payload.target_area,
        start_lat=payload.start_lat,
        start_lng=payload.start_lng,
        target_lat=payload.target_lat,
        target_lng=payload.target_lng,
        waypoints=payload.waypoints or [],
        operator_notes=payload.operator_notes,
        status="ACTIVE"
    )
    db.add(mission)
    await db.flush()

    audit = AuditLogModel(
        action="MISSION_DISPATCH",
        resource_id=mission.id,
        details={
            "mission_code": mission.mission_code,
            "vessel": mission.vessel_name,
            "target_area": mission.target_area
        }
    )
    db.add(audit)
    await db.commit()
    await db.refresh(mission)

    return mission

@router.get("/audit-logs")
async def list_audit_logs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """
    Retrieves recent system audit trail events.
    """
    result = await db.execute(select(AuditLogModel).order_by(desc(AuditLogModel.timestamp)).limit(limit))
    logs = result.scalars().all()
    return logs
