import logging
from datetime import datetime, timezone
from typing import Dict, Any
from app.agents.state import SafetyWatchState
from app.services.email_service import DEFAULT_MANAGER_EMAIL

logger = logging.getLogger(__name__)

def notification_node(state: SafetyWatchState) -> Dict[str, Any]:
    """
    Node 6: Notification Agent
    Dispatches alerts to safety manager when incident severity is High or Critical.
    Status is strictly flagged as 'simulated' or 'actually sent'.
    """
    logger.info("Running Agent 6: Notification Agent")
    agent_statuses = dict(state.get("agent_statuses", {}))
    agent_statuses["notification"] = "running"
    errors = list(state.get("errors", []))

    severity = state.get("severity", "Medium")
    risk_score = state.get("risk_score", 0)
    incident_code = state.get("incident_code", "WS-XXXX")
    location = state.get("location", "Facility")
    category = state.get("category", "General")
    hazard_desc = state.get("hazard_description", "")

    # Trigger rule: Severity is High or Critical, or Risk Score >= 60
    requires_urgent_notification = severity in ["High", "Critical"] or risk_score >= 60

    if requires_urgent_notification:
        recipient_manager = DEFAULT_MANAGER_EMAIL
        subject = f"[CRITICAL SAFETY ALERT] {severity.upper()} Hazard Detected: {incident_code} at {location}"
        message = (
            f"URGENT ATTENTION REQUIRED:\n"
            f"Incident Code: {incident_code}\n"
            f"Severity: {severity} | Risk Score: {risk_score}/100\n"
            f"Category: {category}\n"
            f"Location: {location}\n"
            f"Description: {hazard_desc}\n"
            f"Recommended Action: Immediate physical area inspection & mitigation."
        )

        notification_status = "simulated"
        sent_at = datetime.now(timezone.utc).isoformat()

        notification_detail = {
            "recipient": recipient_manager,
            "channel": "email",
            "status": notification_status,
            "sent_at": sent_at,
            "subject": subject,
            "message": message
        }
        logger.info(f"Manager notification generated ({notification_status}) to {recipient_manager} for incident {incident_code}")
    else:
        notification_status = "skipped"
        notification_detail = {
            "recipient": "N/A",
            "channel": "none",
            "status": "skipped",
            "sent_at": None,
            "subject": "Notification skipped for low/medium risk incident",
            "message": f"Incident {incident_code} assessed with {severity} severity (score {risk_score}); manager escalation not required."
        }

    agent_statuses["notification"] = "completed"

    return {
        "notification_status": notification_status,
        "notification_detail": notification_detail,
        "agent_statuses": agent_statuses,
        "errors": errors
    }
