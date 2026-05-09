from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.deps import get_current_user
from app.services.anomaly import detect_anomalies
from app.models.user import User
from app.models.log import Log
from app.models.alert import Alert

router = APIRouter(prefix="/ingest", tags=["ingest"])


class IngestRequest(BaseModel):
    source: str
    content: str
    filename: str = "api-ingest"


@router.post("/logs")
def ingest_log(
    body: IngestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = Log(
        filename=body.filename,
        source=body.source,
        content=body.content,
        uploaded_by=current_user.id
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    anomalies = detect_anomalies(body.content)
    for anomaly in anomalies:
        db.add(Alert(log_id=log.id, severity=anomaly["severity"], message=anomaly["line"]))
    db.commit()

    return {
        "log_id": log.id,
        "alerts_generated": len(anomalies),
        "source": body.source
    }
