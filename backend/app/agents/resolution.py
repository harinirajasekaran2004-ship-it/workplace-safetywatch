import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from app.agents.state import SafetyWatchState

logger = logging.getLogger(__name__)

def resolution_node(state: SafetyWatchState) -> Dict[str, Any]:
    """
    Node 7: Resolution & Follow-up Agent (Initial run setup)
    Initializes resolution tracking state for the newly created incident.
    """
    logger.info("Running Agent 7: Resolution Tracking Agent (Init)")
    agent_statuses = dict(state.get("agent_statuses", {}))
    agent_statuses["resolution"] = "completed"
    errors = list(state.get("errors", []))

    resolution_updates = list(state.get("resolution_updates", []))
    if not resolution_updates:
        resolution_updates.append({
            "updated_by": state.get("reporter", "System / AI Pipeline"),
            "notes": "Incident registered into Workplace SafetyWatch system. Pending manager triage and assignment.",
            "status": "REPORTED",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    return {
        "resolution_updates": resolution_updates,
        "agent_statuses": agent_statuses,
        "errors": errors
    }

def apply_manager_resolution_action(
    incident_data: Dict[str, Any],
    status: Optional[str] = None,
    assignee_name: Optional[str] = None,
    assignee_id: Optional[str] = None,
    resolution_notes: Optional[str] = None,
    updated_by: str = "Manager"
) -> Dict[str, Any]:
    """
    Applies manager follow-up actions: updating status, assigning responsibility, recording notes.
    """
    updated_incident = dict(incident_data)
    now_iso = datetime.now(timezone.utc).isoformat()
    updated_incident["updated_at"] = now_iso

    if assignee_name:
        updated_incident["assignee_name"] = assignee_name
    if assignee_id:
        updated_incident["assignee_id"] = assignee_id
    if status:
        updated_incident["status"] = status

    resolution_updates = list(updated_incident.get("resolution_updates", []))
    if resolution_notes or status:
        note_text = resolution_notes or f"Status updated to {status} by {updated_by}."
        if assignee_name and not resolution_notes:
            note_text = f"Assigned to {assignee_name}. Status: {status or updated_incident.get('status')}."

        resolution_updates.append({
            "updated_by": updated_by,
            "notes": note_text,
            "status": updated_incident.get("status", "REPORTED"),
            "created_at": now_iso
        })

    updated_incident["resolution_updates"] = resolution_updates
    return updated_incident
