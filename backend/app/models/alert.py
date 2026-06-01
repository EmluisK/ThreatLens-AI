from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AlertStatus(str, enum.Enum):
    open = "open"
    triaged = "triaged"
    resolved = "resolved"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("logs.id"), nullable=True)
    severity = Column(Enum(AlertSeverity), nullable=False, default=AlertSeverity.low)
    status = Column(Enum(AlertStatus), nullable=False, default=AlertStatus.open)
    message = Column(Text, nullable=False)
    malware_family = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    log = relationship("Log", back_populates="alerts")
    triage_history = relationship("TriageHistory", back_populates="alert")


class TriageHistory(Base):
    __tablename__ = "triage_history"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    triaged_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    ai_response = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    alert = relationship("Alert", back_populates="triage_history")
    analyst = relationship("User", foreign_keys=[triaged_by])
