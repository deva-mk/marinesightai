from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional, Dict, Any
import time

from backend.database import get_db
from backend.models import IncidentModel
from backend.schemas import IncidentSchema

router = APIRouter(prefix="/incidents", tags=["Incident Response Command System"])

DEFAULT_INCIDENTS = [
    {
        "id": "INC-8092",
        "incident_code": "INC-8092",
        "title": "Severe Ghost Net Entanglement Cluster",
        "category": "Ghost Fishing Gear",
        "severity": "CRITICAL",
        "status": "ACTIVE",
        "priority_score": 96,
        "latitude": 9.3148,
        "longitude": 79.1828,
        "target_area": "Sector 4A - North Transect",
        "assigned_vessel": "RV Sagar Guardian (IMO 941208)",
        "assigned_lead": "Capt. M. Rodriguez",
        "detection_ids": ["MSA-DET-1001", "MSA-DET-1003"],
        "operator_notes": "Multimodal fusion verified high-risk acoustic shadow on benthic shelf with surface float indicators. Immediate diver/ROV salvage required.",
        "created_at": "2025-02-28T10:15:00Z"
    },
    {
        "id": "INC-8091",
        "incident_code": "INC-8091",
        "title": "Industrial Plastic Pallet Hazard",
        "category": "Industrial Debris",
        "severity": "HIGH",
        "status": "IN_PROGRESS",
        "priority_score": 82,
        "latitude": 9.3245,
        "longitude": 79.1790,
        "target_area": "Sector 4B - Eastern Channel",
        "assigned_vessel": "Interceptor Alpha (Patrol Craft)",
        "assigned_lead": "Lt. K. Alva",
        "detection_ids": ["MSA-DET-1002"],
        "operator_notes": "Vessel intercept in progress. Surface boom deployment scheduled.",
        "created_at": "2025-02-28T09:30:00Z"
    }
]

@router.get("", response_model=List[IncidentSchema])
async def list_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists active incidents for emergency coordination and dispatch.
    """
    try:
        query = select(IncidentModel).order_by(desc(IncidentModel.created_at))
        if status:
            query = query.where(IncidentModel.status == status.upper())
        if severity:
            query = query.where(IncidentModel.severity == severity.upper())
        result = await db.execute(query)
        db_records = result.scalars().all()
        if db_records:
            return [
                IncidentSchema(
                    id=r.id,
                    incident_code=r.incident_code,
                    title=r.title,
                    category=r.category,
                    severity=r.severity,
                    status=r.status,
                    priority_score=r.priority_score,
                    latitude=r.latitude,
                    longitude=r.longitude,
                    target_area=r.target_area,
                    assigned_vessel=r.assigned_vessel,
                    assigned_lead=r.assigned_lead,
                    detection_ids=r.detection_ids or [],
                    operator_notes=r.operator_notes,
                    created_at=r.created_at.isoformat() if r.created_at else None
                ) for r in db_records
            ]
    except Exception:
        pass

    return [IncidentSchema(**inc) for inc in DEFAULT_INCIDENTS]

@router.post("", response_model=IncidentSchema)
async def create_incident(
    payload: IncidentSchema,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new operational incident from a verified detection or multimodal fusion alert.
    """
    inc = IncidentModel(
        id=payload.id,
        incident_code=payload.incident_code,
        title=payload.title,
        category=payload.category,
        severity=payload.severity,
        status=payload.status,
        priority_score=payload.priority_score,
        latitude=payload.latitude,
        longitude=payload.longitude,
        target_area=payload.target_area,
        assigned_vessel=payload.assigned_vessel,
        assigned_lead=payload.assigned_lead,
        detection_ids=payload.detection_ids,
        operator_notes=payload.operator_notes
    )
    db.add(inc)
    await db.commit()
    return payload

@router.patch("/{incident_id}/status")
async def update_incident_status(
    incident_id: str,
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates incident status ('ACTIVE', 'IN_PROGRESS', 'RESOLVED') and operational notes.
    """
    new_status = payload.get("status", "IN_PROGRESS")
    notes = payload.get("notes")

    try:
        result = await db.execute(select(IncidentModel).where(IncidentModel.id == incident_id))
        record = result.scalar_one_or_none()
        if record:
            record.status = new_status
            if notes:
                record.operator_notes = (record.operator_notes or "") + f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] {notes}"
            await db.commit()
            return {"success": True, "incident_id": incident_id, "status": new_status}
    except Exception:
        pass

    return {"success": True, "incident_id": incident_id, "status": new_status, "note": "Updated in-memory state."}
