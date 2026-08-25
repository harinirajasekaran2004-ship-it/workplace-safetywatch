from typing import TypedDict, List, Dict, Any, Optional

class SafetyWatchState(TypedDict, total=False):
    # Inputs
    image: Optional[str]
    image_url: Optional[str]
    image_base64: Optional[str]
    description: Optional[str]
    location: str
    reporter: str
    
    # Identification
    incident_id: str
    incident_code: str
    incident_status: str

    # Agent 1: Hazard Detection
    hazard: bool
    hazard_description: str
    detection_confidence: float

    # Agent 2: Hazard Classification
    category: str
    classification_confidence: float
    hazard_type: str

    # Agent 3: Risk Assessment
    severity: str
    likelihood: int
    severity_score: int
    risk_score: int
    priority: str
    risk_rationale: str
    risk_assessment_confidence: float

    # Agent 4: Safety Rule & Compliance Matching
    matched_rules: List[Dict[str, Any]]
    rule_match_confidence: float

    # Agent 5: Incident Report Generation
    incident_report: Dict[str, Any]

    # Agent 6: Notification Agent
    notification_status: str
    notification_detail: Optional[Dict[str, Any]]

    # Agent 7: Resolution Tracking
    resolution_updates: List[Dict[str, Any]]
    assignee_name: Optional[str]
    assignee_id: Optional[str]

    # Aggregate evaluation metrics
    confidence_metrics: Dict[str, Any]

    # Agent progress execution states
    agent_statuses: Dict[str, str]  # keys: detection, classification, risk, rules, report, notification, resolution
    
    # Audit & Error Tracking
    errors: List[str]
    created_at: str
    updated_at: str
