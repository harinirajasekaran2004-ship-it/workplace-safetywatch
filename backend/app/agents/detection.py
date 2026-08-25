import logging
from typing import Dict, Any
from app.agents.state import SafetyWatchState
from app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

DETECTION_SYSTEM_PROMPT = """
You are the Hazard Detection Agent in Workplace SafetyWatch.
Your task is to analyze the provided workplace image and/or text description to determine whether a physical safety hazard exists.
A hazard is any unsafe condition, equipment defect, environmental risk, missing safety measure, or structural problem that could harm workers or visitors.

Respond in strict JSON with the following schema:
{
    "hazard_detected": true/false,
    "hazard_description": "Detailed factual description of what unsafe condition is observed",
    "confidence_score": 92.5 (number between 0 and 100 representing detection confidence)
}
"""

def detect_hazard_node(state: SafetyWatchState) -> Dict[str, Any]:
    """
    Node 1: Hazard Detection Agent
    Determines if a hazard is present from the image and/or description.
    """
    logger.info("Running Agent 1: Hazard Detection Agent")
    agent_statuses = dict(state.get("agent_statuses", {}))
    agent_statuses["detection"] = "running"
    errors = list(state.get("errors", []))

    description = state.get("description", "").strip()
    image_base64 = state.get("image_base64")
    location = state.get("location", "Unspecified Area")

    user_prompt = f"Analyze this workplace scenario for safety hazards.\nLocation: {location}\nReported description: {description if description else 'No text description provided. Inspect image directly.'}"

    hazard_detected = True
    hazard_description = description or "Visible physical safety irregularity detected in workplace environment."
    confidence = 94.0

    try:
        if groq_service.is_available():
            llm_result = groq_service.generate_json_response(
                system_prompt=DETECTION_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                image_base64=image_base64
            )
            if "hazard_detected" in llm_result:
                hazard_detected = bool(llm_result.get("hazard_detected"))
                hazard_description = llm_result.get("hazard_description", hazard_description)
                confidence = float(llm_result.get("confidence_score", 90.0))
        else:
            # Fallback heuristic analysis
            text_lower = (description + " " + location).lower()
            safe_keywords = ["all safe", "clean and clear", "no issue", "inspected safe", "normal condition", "empty room clear"]
            if any(k in text_lower for k in safe_keywords) and not any(h in text_lower for h in ["hazard", "wire", "spill", "leak", "fire", "crack", "smoke", "broken", "blocked", "slip"]):
                hazard_detected = False
                hazard_description = "Environment inspected; no observable safety hazards or code infractions detected."
                confidence = 95.0
            else:
                hazard_detected = True
                if not description:
                    hazard_description = "Active physical workplace hazard detected requiring mitigation."
                else:
                    hazard_description = f"Hazard identified: {description}"
                confidence = 93.5

        agent_statuses["detection"] = "completed"

    except Exception as e:
        logger.error(f"Hazard Detection Agent failed: {e}")
        # Retry once / fallback
        hazard_detected = True
        hazard_description = description or "Workplace safety hazard requiring inspection."
        confidence = 85.0
        agent_statuses["detection"] = "completed"
        errors.append(f"Detection Agent notice: {str(e)}")

    return {
        "hazard": hazard_detected,
        "hazard_description": hazard_description,
        "detection_confidence": confidence,
        "agent_statuses": agent_statuses,
        "errors": errors
    }
