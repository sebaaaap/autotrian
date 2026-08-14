"""
Notifications API — feed de activity logs para la campanita.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional

from app.api.deps import get_current_user
from app.db.tenant_session import TenantSession
from app.api.deps import get_tenant_session
from app.models.base import User
from app.services import activity_service

router = APIRouter()


@router.get("")
def get_notifications(
    days: int = 7,
    limit: int = 50,
    only_unread: bool = False,
    db: TenantSession = Depends(get_tenant_session),
    current_user: User = Depends(get_current_user),
):
    """
    Feed de notificaciones (activity logs) de la empresa.
    Devuelve también el contador de no leídas para el badge.
    """
    company_id = current_user.company_id
    if not company_id:
        return {"notifications": [], "unread_count": 0}

    logs = activity_service.get_recent_logs(
        db._db, company_id, days=days, limit=limit, only_unread=only_unread
    )

    return {
        "notifications": [
            {
                "id": str(l.id),
                "user_id": l.user_id,
                "user_name": l.user_name,
                "action": l.action,
                "entity_type": l.entity_type,
                "description": l.description,
                "severity": l.severity.value if hasattr(l.severity, "value") else str(l.severity),
                "is_read": l.is_read,
                "created_at": l.created_at.isoformat(),
                "metadata": l.metadata_json,
            }
            for l in logs
        ],
        "unread_count": activity_service.count_unread(db._db, company_id),
    }


@router.post("/read-all")
def mark_all_read(
    db: TenantSession = Depends(get_tenant_session),
    current_user: User = Depends(get_current_user),
):
    """Marca todas las notificaciones como leídas."""
    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(status_code=400, detail="Usuario sin empresa")
    count = activity_service.mark_all_read(db._db, company_id)
    return {"marked_read": count}


@router.post("/{log_id}/read")
def mark_one_read(
    log_id: UUID,
    db: TenantSession = Depends(get_tenant_session),
    current_user: User = Depends(get_current_user),
):
    """Marca una notificación específica como leída."""
    company_id = current_user.company_id
    if not company_id:
        raise HTTPException(status_code=400, detail="Usuario sin empresa")
    ok = activity_service.mark_read(db._db, company_id, log_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return {"status": "ok"}


@router.get("/email-status")
def email_report_status(
    db: TenantSession = Depends(get_tenant_session),
    current_user: User = Depends(get_current_user),
):
    """
    Estado del último reporte por correo enviado a esta empresa.
    Para mostrar "Estimado X, revisa el reporte en tu correo ✓".
    """
    company_id = current_user.company_id
    if not company_id:
        return {"last_email": None}

    from app.models.base import ActivityLog
    last = db._db.query(ActivityLog).filter(
        ActivityLog.company_id == company_id,
        ActivityLog.action == activity_service.Actions.EMAIL_REPORT_SENT,
    ).order_by(ActivityLog.created_at.desc()).first()

    if not last:
        return {"last_email": None}

    return {
        "last_email": {
            "sent_at": last.created_at.isoformat(),
            "period": (last.metadata_json or {}).get("period"),
            "recipients": (last.metadata_json or {}).get("recipients", []),
            "description": last.description,
        }
    }
