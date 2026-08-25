import logging
import base64
import uuid
import os
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, status

from app.schemas.incident import (
    IncidentCreateResponse,
    IncidentDetail,
    IncidentUpdateRequest,
    ProgressResponse,
    HazardCategoryEnum,
    SeverityEnum,
    IncidentStatusEnum,
    AgentStatuses,
    ConfidenceMetrics
)
from app.agents.state import SafetyWatchState
from app.agents.workflow import safetywatch_graph
from app.agents.resolution import apply_manager_resolution_action
from app.db.store import store
from app.db.supabase_client import supabase_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

# Allowed MIME types and max size (10 MB)
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
MAX_IMAGE_SIZE = 10 * 1024 * 1024

@router.post("/analyze", response_model=IncidentCreateResponse, status_code=status.HTTP_201_CREATED)
async def analyze_hazard_incident(
    image: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
    location: str = Form(...),
    reporter: Optional[str] = Form("Employee")
):
    """
    Kicks off the 7-Agent LangGraph Pipeline to detect, classify, assess risk,
    match compliance rules, generate report, and notify management.
    """
    image_base64 = None
    image_url = None
    file_bytes = None

    if image is not None:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{image.content_type}'. Please upload JPEG, PNG, or WebP images."
            )
        
        file_bytes = await image.read()
        if len(file_bytes) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image size exceeds maximum limit of 10MB."
            )

        image_base64 = base64.b64encode(file_bytes).decode("utf-8")
        
        # Try uploading to Supabase Storage if configured
        file_ext = image.filename.split(".")[-1] if "." in image.filename else "jpg"
        storage_filename = f"{uuid.uuid4()}.{file_ext}"
        image_url = supabase_service.upload_image(file_bytes, storage_filename, image.content_type)
        
        # If Supabase storage is not active, save locally or use data URL
        if not image_url:
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            local_path = os.path.join(settings.UPLOAD_DIR, storage_filename)
            try:
                with open(local_path, "wb") as f:
                    f.write(file_bytes)
                image_url = f"/uploads/{storage_filename}"
            except Exception as e:
                logger.warning(f"Could not write local upload: {e}")
                image_url = f"data:{image.content_type};base64,{image_base64[:100]}..."

    incident_id = f"inc-{uuid.uuid4().hex[:8]}"
    initial_agent_statuses = {
        "detection": "waiting",
        "classification": "waiting",
        "risk": "waiting",
        "rules": "waiting",
        "report": "waiting",
        "notification": "waiting",
        "resolution": "waiting"
    }

    initial_state: SafetyWatchState = {
        "image": image_url,
        "image_url": image_url,
        "image_base64": image_base64,
        "description": description or "",
        "location": location,
        "reporter": reporter or "Employee",
        "incident_id": incident_id,
        "incident_status": "REPORTED",
        "agent_statuses": initial_agent_statuses,
        "errors": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    # Execute LangGraph Multi-Agent Pipeline with LangSmith metadata
    logger.info(f"Invoking SafetyWatch LangGraph for incident {incident_id}")
    try:
        run_config = {
            "run_name": f"SafetyWatch-Pipeline-{incident_id}",
            "tags": ["workplace-safetywatch", "hazard-detection", "mvp"],
            "metadata": {
                "incident_id": incident_id,
                "location": location,
                "reporter": reporter or "Employee"
            }
        }
        final_state: SafetyWatchState = safetywatch_graph.invoke(initial_state, config=run_config)
    except Exception as e:
        logger.error(f"LangGraph execution exception: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Safety analysis pipeline failure: {str(e)}"
        )

    # Build and persist Incident Record
    hazard_detected = final_state.get("hazard", True)
    incident_code = final_state.get("incident_code", "WS-1000")
    
    risk_assessment_obj = None
    if hazard_detected:
        risk_assessment_obj = {
            "severity": final_state.get("severity", "Medium"),
            "likelihood": final_state.get("likelihood", 3),
            "severity_score": final_state.get("severity_score", 3),
            "risk_score": final_state.get("risk_score", 50),
            "priority": final_state.get("priority", "Medium"),
            "rationale": final_state.get("risk_rationale", ""),
            "rubric_formula": "Risk Score = (Severity * Likelihood * 4) modified by Environmental Multipliers"
        }

    incident_record = {
        "id": incident_id,
        "incident_code": incident_code,
        "location": location,
        "description": description or final_state.get("hazard_description", ""),
        "image_url": image_url,
        "hazard_detected": hazard_detected,
        "hazard_type": final_state.get("hazard_type", "No Hazard Detected" if not hazard_detected else "Workplace Hazard"),
        "category": final_state.get("category", "None" if not hazard_detected else "Other"),
        "confidence": final_state.get("detection_confidence", 90.0),
        "risk_score": final_state.get("risk_score", 0 if not hazard_detected else 50),
        "severity": final_state.get("severity", "Low" if not hazard_detected else "Medium"),
        "priority": final_state.get("priority", "Low" if not hazard_detected else "Medium"),
        "status": final_state.get("incident_status", "RESOLVED" if not hazard_detected else "REPORTED"),
        "reporter_name": reporter or "Employee",
        "assignee_name": None,
        "assignee_id": None,
        "created_at": final_state.get("created_at", datetime.now(timezone.utc).isoformat()),
        "updated_at": final_state.get("updated_at", datetime.now(timezone.utc).isoformat()),
        "risk_assessment": risk_assessment_obj,
        "matched_rules": final_state.get("matched_rules", []),
        "incident_report": final_state.get("incident_report"),
        "notifications": [final_state.get("notification_detail")] if final_state.get("notification_detail") else [],
        "resolution_updates": final_state.get("resolution_updates", []),
        "agent_statuses": final_state.get("agent_statuses", {}),
        "confidence_metrics": final_state.get("confidence_metrics"),
        "errors": final_state.get("errors", [])
    }

    # Save to storage
    saved_incident = store.save_incident(incident_record)

    return IncidentCreateResponse(
        success=True,
        message="Incident analysis completed successfully.",
        incident_id=incident_id,
        incident_code=incident_code,
        hazard_detected=hazard_detected,
        incident=IncidentDetail(**saved_incident),
        agent_statuses=AgentStatuses(**final_state.get("agent_statuses", {})),
        confidence_metrics=ConfidenceMetrics(**final_state.get("confidence_metrics", {})) if final_state.get("confidence_metrics") else None
    )

@router.get("", response_model=List[IncidentDetail])
def list_incidents(
    status: Optional[str] = Query(None, description="Filter by status (REPORTED, IN_PROGRESS, RESOLVED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (Low, Medium, High, Critical)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search keyword in location/description/code")
):
    """Lists all incidents with optional filtering."""
    incidents = store.list_incidents(status=status, severity=severity, category=category, search=search)
    return [IncidentDetail(**inc) for inc in incidents]

@router.get("/{id}", response_model=IncidentDetail)
def get_incident_by_id(id: str):
    """Retrieves full details of an incident by ID or code."""
    incident = store.get_incident(id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID or code '{id}' was not found."
        )
    return IncidentDetail(**incident)

@router.patch("/{id}", response_model=IncidentDetail)
def update_incident(id: str, updates: IncidentUpdateRequest):
    """
    Manager endpoint to assign responsibility, update workflow status,
    and add resolution audit notes.
    """
    incident = store.get_incident(id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID or code '{id}' was not found."
        )

    updated_data = apply_manager_resolution_action(
        incident_data=incident,
        status=updates.status.value if updates.status else None,
        assignee_name=updates.assignee_name,
        assignee_id=updates.assignee_id,
        resolution_notes=updates.resolution_notes,
        updated_by=updates.updated_by or "Manager"
    )

    saved = store.save_incident(updated_data)
    return IncidentDetail(**saved)

@router.get("/{id}/progress", response_model=ProgressResponse)
def get_incident_progress(id: str):
    """
    Returns the real-time agent progression states for live UI updates.
    """
    incident = store.get_incident(id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID '{id}' was not found."
        )

    statuses = incident.get("agent_statuses", {})
    all_completed = all(v in ["completed", "failed"] for v in statuses.values())
    errors = incident.get("errors", [])

    return ProgressResponse(
        incident_id=id,
        agent_statuses=AgentStatuses(**statuses),
        current_step="Resolution Monitoring" if all_completed else "Agent Processing",
        is_completed=all_completed,
        has_errors=len(errors) > 0,
        errors=errors,
        incident=IncidentDetail(**incident)
    )
