import logging
import uuid
import random
from datetime import datetime, timezone
from typing import Dict, Any
from app.agents.state import SafetyWatchState

logger = logging.getLogger(__name__)

def generate_incident_report_node(state: SafetyWatchState) -> Dict[str, Any]:
    """
    Node 5: Incident Report Agent
    Generates a formal, structured incident report object with unique incident code.
    """
    logger.info("Running Agent 5: Incident Report Agent")
    agent_statuses = dict(state.get("agent_statuses", {}))
    agent_statuses["report"] = "running"
    errors = list(state.get("errors", []))

    # Generate or reuse incident ID & Code
    incident_id = state.get("incident_id") or str(uuid.uuid4())
    incident_code = state.get("incident_code")
    if not incident_code:
        # Standard format WS-1024 style
        num = random.randint(1020, 9999)
        incident_code = f"WS-{num}"

    created_at = state.get("created_at") or datetime.now(timezone.utc).isoformat()
    matched_rules = state.get("matched_rules", [])
    primary_rule = matched_rules[0] if matched_rules else {}

    report = {
        "incident_id": incident_id,
        "incident_code": incident_code,
        "created_at": created_at,
        "hazard_type": state.get("hazard_type", "Workplace Hazard"),
        "category": state.get("category", "Other"),
        "description": state.get("hazard_description", state.get("description", "Safety incident reported")),
        "location": state.get("location", "Unspecified Location"),
        "reporter_name": state.get("reporter", "Employee"),
        "risk_score": state.get("risk_score", 50),
        "severity": state.get("severity", "Medium"),
        "priority": state.get("priority", "Medium"),
        "matched_rule": primary_rule.get("title", "General Safety Standard"),
        "corrective_action": primary_rule.get("recommended_corrective_action", "Conduct safety review and mitigate risk."),
        "status": "REPORTED"
    }

    # Aggregate Confidence Metrics
    det_conf = state.get("detection_confidence", 94.0)
    cls_conf = state.get("classification_confidence", 91.0)
    rul_conf = state.get("rule_match_confidence", 95.0)
    rsk_conf = state.get("risk_assessment_confidence", 88.0)
    overall = round((det_conf * 0.25) + (cls_conf * 0.25) + (rul_conf * 0.25) + (rsk_conf * 0.25), 1)

    confidence_metrics = {
        "detection_confidence": det_conf,
        "classification_confidence": cls_conf,
        "rule_match_confidence": rul_conf,
        "risk_assessment_confidence": rsk_conf,
        "overall_analysis_score": overall,
        "disclaimer": "Model confidence / system evaluation metrics - not certified measurements."
    }

    agent_statuses["report"] = "completed"

    return {
        "incident_id": incident_id,
        "incident_code": incident_code,
        "incident_report": report,
        "incident_status": "REPORTED",
        "confidence_metrics": confidence_metrics,
        "agent_statuses": agent_statuses,
        "errors": errors
    }
