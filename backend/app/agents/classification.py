import logging
from typing import Dict, Any
from app.agents.state import SafetyWatchState
from app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

VALID_CATEGORIES = [
    "Electrical", "Fire", "PPE", "Slip/Trip", "Machinery",
    "Chemical", "Emergency Exit", "Structural", "Housekeeping", "Other"
]

CLASSIFICATION_SYSTEM_PROMPT = f"""
You are the Hazard Classification Agent in Workplace SafetyWatch.
Your task is to classify a detected workplace hazard into exactly ONE of the following approved categories:
{', '.join(VALID_CATEGORIES)}

Respond in strict JSON with the following schema:
{{
    "category": "One of the approved category names",
    "hazard_type": "Brief 2-4 word hazard label (e.g., 'Exposed Live Wires', 'Blocked Fire Exit', 'Chemical Solvent Spill')",
    "confidence_score": 91.0 (number between 0 and 100 representing classification confidence)
}}
"""

def classify_hazard_node(state: SafetyWatchState) -> Dict[str, Any]:
    """
    Node 2: Hazard Classification Agent
    Categorizes the hazard into one of the designated safety categories.
    """
    logger.info("Running Agent 2: Hazard Classification Agent")
    agent_statuses = dict(state.get("agent_statuses", {}))
    agent_statuses["classification"] = "running"
    errors = list(state.get("errors", []))

    hazard_desc = state.get("hazard_description", "")
    description = state.get("description", "")
    full_context = f"{hazard_desc} {description}".lower()

    category = "Other"
    hazard_type = "Unspecified Hazard"
    confidence = 91.0

    try:
        if groq_service.is_available():
            user_prompt = f"Classify this hazard:\nHazard Description: {hazard_desc}\nLocation: {state.get('location', '')}\nAdditional context: {description}"
            llm_result = groq_service.generate_json_response(
                system_prompt=CLASSIFICATION_SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
            cat_cand = llm_result.get("category")
            if cat_cand in VALID_CATEGORIES:
                category = cat_cand
            elif cat_cand:
                # Fuzzy match
                for valid_cat in VALID_CATEGORIES:
                    if valid_cat.lower() in cat_cand.lower():
                        category = valid_cat
                        break
            hazard_type = llm_result.get("hazard_type", hazard_type)
            confidence = float(llm_result.get("confidence_score", 91.0))
        else:
            # Deterministic heuristic classifier
            if any(w in full_context for w in ["wire", "electric", "cable", "shock", "voltage", "conduit", "breaker", "spark"]):
                category = "Electrical"
                hazard_type = "Exposed Electrical Wires"
                confidence = 94.0
            elif any(w in full_context for w in ["exit", "door", "egress", "evacuat", "blocked door", "corridor"]):
                category = "Emergency Exit"
                hazard_type = "Blocked Emergency Exit"
                confidence = 95.0
            elif any(w in full_context for w in ["ppe", "helmet", "glasses", "goggle", "vest", "harness", "glove", "mask", "ear protection"]):
                category = "PPE"
                hazard_type = "Missing Required PPE"
                confidence = 92.0
            elif any(w in full_context for w in ["slip", "trip", "wet", "puddle", "spill", "slippery", "grease", "water on floor"]):
                category = "Slip/Trip"
                hazard_type = "Wet / Slippery Floor"
                confidence = 93.0
            elif any(w in full_context for w in ["machine", "blade", "gear", "conveyor", "crush", "lathe", "guard", "pinch"]):
                category = "Machinery"
                hazard_type = "Unsafe / Unguarded Machinery"
                confidence = 91.0
            elif any(w in full_context for w in ["chemical", "acid", "solvent", "fume", "toxic", "leak", "corrosive", "barrel"]):
                category = "Chemical"
                hazard_type = "Hazardous Chemical Exposure"
                confidence = 92.0
            elif any(w in full_context for w in ["fire", "extinguisher", "flammab", "combust", "ignit"]):
                category = "Fire"
                hazard_type = "Fire Hazard / Obstructed Extinguisher"
                confidence = 93.0
            elif any(w in full_context for w in ["rack", "shelf", "collapse", "beam", "structural", "cracked wall", "ceiling", "load"]):
                category = "Structural"
                hazard_type = "Structural / Storage Racking Defect"
                confidence = 89.0
            elif any(w in full_context for w in ["trash", "debris", "mess", "clutter", "boxes", "scrap", "housekeeping"]):
                category = "Housekeeping"
                hazard_type = "Poor Housekeeping & Scrap Accumulation"
                confidence = 90.0
            else:
                category = "Other"
                hazard_type = "General Workplace Safety Irregularity"
                confidence = 88.0

        agent_statuses["classification"] = "completed"

    except Exception as e:
        logger.error(f"Hazard Classification Agent failed: {e}")
        agent_statuses["classification"] = "completed"
        category = "Other"
        hazard_type = "Unclassified Hazard"
        confidence = 80.0
        errors.append(f"Classification Agent notice: {str(e)}")

    return {
        "category": category,
        "hazard_type": hazard_type,
        "classification_confidence": confidence,
        "agent_statuses": agent_statuses,
        "errors": errors
    }
