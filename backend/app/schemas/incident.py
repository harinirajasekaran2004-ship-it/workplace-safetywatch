from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AgentStateEnum(str, Enum):
    WAITING = "waiting"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class HazardCategoryEnum(str, Enum):
    ELECTRICAL = "Electrical"
    FIRE = "Fire"
    PPE = "PPE"
    SLIP_TRIP = "Slip/Trip"
    MACHINERY = "Machinery"
    CHEMICAL = "Chemical"
    EMERGENCY_EXIT = "Emergency Exit"
    STRUCTURAL = "Structural"
    HOUSEKEEPING = "Housekeeping"
    OTHER = "Other"

class SeverityEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class PriorityEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class IncidentStatusEnum(str, Enum):
    REPORTED = "REPORTED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class NotificationChannelEnum(str, Enum):
    EMAIL = "email"
    IN_APP = "in-app"
    SMS = "sms"

class NotificationStatusEnum(str, Enum):
    SIMULATED = "simulated"
    ACTUALLY_SENT = "actually sent"
    SKIPPED = "skipped"
    FAILED = "failed"

class AgentStatuses(BaseModel):
    detection: AgentStateEnum = AgentStateEnum.WAITING
    classification: AgentStateEnum = AgentStateEnum.WAITING
    risk: AgentStateEnum = AgentStateEnum.WAITING
    rules: AgentStateEnum = AgentStateEnum.WAITING
    report: AgentStateEnum = AgentStateEnum.WAITING
    notification: AgentStateEnum = AgentStateEnum.WAITING
    resolution: AgentStateEnum = AgentStateEnum.WAITING

class ConfidenceMetrics(BaseModel):
    detection_confidence: float = Field(default=0.0, ge=0.0, le=100.0, description="Detection Confidence %")
    classification_confidence: float = Field(default=0.0, ge=0.0, le=100.0, description="Classification Confidence %")
    rule_match_confidence: float = Field(default=0.0, ge=0.0, le=100.0, description="Rule Match Confidence %")
    risk_assessment_confidence: float = Field(default=0.0, ge=0.0, le=100.0, description="Risk Assessment Score %")
    overall_analysis_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Overall Analysis Score %")
    disclaimer: str = Field(
        default="Model confidence / system evaluation metrics - not certified measurements.",
        description="Mandatory confidence score evaluation disclaimer"
    )

class MatchedRule(BaseModel):
    rule_id: str
    code: str
    title: str
    description: str
    category: str
    why_it_applies: str
    compliance_status: str
    recommended_corrective_action: str

class RiskAssessmentDetail(BaseModel):
    severity: SeverityEnum = SeverityEnum.MEDIUM
    likelihood: int = Field(default=3, ge=1, le=5)
    severity_score: int = Field(default=3, ge=1, le=5)
    risk_score: int = Field(default=50, ge=0, le=100)
    priority: PriorityEnum = PriorityEnum.MEDIUM
    rationale: str = ""
    rubric_formula: str = "Risk Score = (Severity [1-5] * Likelihood [1-5] * 4) modified by Environmental/Vulnerability Multipliers"

class IncidentReportSummary(BaseModel):
    incident_id: str
    incident_code: str
    created_at: str
    hazard_type: str
    category: str
    description: str
    location: str
    reporter_name: str
    risk_score: int
    severity: str
    priority: str
    matched_rule: str
    corrective_action: str
    status: str

class NotificationDetail(BaseModel):
    recipient: str
    channel: str = "email"
    status: NotificationStatusEnum = NotificationStatusEnum.SIMULATED
    sent_at: Optional[str] = None
    subject: str = ""
    message: str = ""

class ResolutionUpdate(BaseModel):
    id: Optional[str] = None
    updated_by: str
    notes: str
    status: IncidentStatusEnum
    created_at: str

class IncidentDetail(BaseModel):
    id: str
    incident_code: str
    location: str
    description: str
    image_url: Optional[str] = None
    hazard_detected: bool = True
    hazard_type: Optional[str] = None
    category: Optional[str] = None
    confidence: Optional[float] = None
    risk_score: Optional[int] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    status: IncidentStatusEnum = IncidentStatusEnum.REPORTED
    reporter_name: str = "Anonymous / Employee"
    assignee_name: Optional[str] = None
    assignee_id: Optional[str] = None
    created_at: str
    updated_at: str
    risk_assessment: Optional[RiskAssessmentDetail] = None
    matched_rules: List[MatchedRule] = []
    incident_report: Optional[IncidentReportSummary] = None
    notifications: List[NotificationDetail] = []
    resolution_updates: List[ResolutionUpdate] = []
    agent_statuses: AgentStatuses = Field(default_factory=AgentStatuses)
    confidence_metrics: Optional[ConfidenceMetrics] = None
    errors: List[str] = []

class IncidentCreateResponse(BaseModel):
    success: bool
    message: str
    incident_id: str
    incident_code: str
    hazard_detected: bool
    incident: IncidentDetail
    agent_statuses: AgentStatuses
    confidence_metrics: Optional[ConfidenceMetrics] = None

class IncidentUpdateRequest(BaseModel):
    status: Optional[IncidentStatusEnum] = None
    assignee_name: Optional[str] = None
    assignee_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    updated_by: Optional[str] = "Manager"

class DashboardStats(BaseModel):
    total_incidents: int = 0
    open_incidents: int = 0
    high_risk_incidents: int = 0
    resolved_incidents: int = 0
    average_risk_score: float = 0.0
    category_counts: Dict[str, int] = {}
    severity_counts: Dict[str, int] = {}
    recent_incidents: List[IncidentDetail] = []

class ProgressResponse(BaseModel):
    incident_id: str
    agent_statuses: AgentStatuses
    current_step: str
    is_completed: bool
    has_errors: bool
    errors: List[str] = []
    incident: Optional[IncidentDetail] = None
