"""
Risk Assessment Agent & Explainable Scoring Rubric

SCORING RUBRIC SPECIFICATION:
=============================
1. Severity Scale (S: 1-5):
   1 - Negligible: Minor nuisance or superficial scratch; no lost time.
   2 - Minor: Requires standard first-aid; low material damage.
   3 - Moderate: Medical attention needed; localized work interruption.
   4 - Major: Severe injury (fracture, burn, shock); extensive equipment damage.
   5 - Catastrophic: Potential fatality, permanent disability, or widespread fire/explosion.

2. Likelihood Scale (L: 1-5):
   1 - Rare: Exceptional circumstances; very low employee exposure.
   2 - Unlikely: Infrequent exposure; occurs only occasionally.
   3 - Possible: Moderate foot-traffic area or regular operational shift.
   4 - Likely: High foot-traffic; frequent near-miss conditions.
   5 - Almost Certain / Imminent: Direct daily contact, open unprotected hazard.

3. Mathematical Formulation:
   Base Risk = (Severity * Likelihood) / 25.0 * 100.0
   Adjusted Risk Score = Clamp(Base Risk + Environmental Multiplier, 0, 100)

4. Priority Categorization:
   80 - 100 : Critical  -> Immediate stop-work, urgent escalation
   60 - 79  : High      -> Remediate within 2-4 hours, manager alert triggered
   35 - 59  : Medium    -> Remediate within 24 hours
   0  - 34  : Low       -> Routine maintenance log
"""

import logging
from typing import Dict, Any, Tuple
from app.agents.state import SafetyWatchState
from app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

RISK_SYSTEM_PROMPT = """
You are the Risk Assessment Agent in Workplace SafetyWatch.
Evaluate the workplace hazard using the following standardized explainable safety rubric:
- Severity (1 to 5): 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic
- Likelihood (1 to 5): 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain
- Risk Score: (Severity * Likelihood / 25) * 100, clamped to [0, 100]
- Priority: "Urgent" (80-100), "High" (60-79), "Medium" (35-59), or "Low" (0-34)
- Severity Label: "Critical" (5), "High" (4), "Medium" (3), "Low" (1-2)

Respond in strict JSON with the schema:
{
    "severity_score": 4,
    "likelihood_score": 4,
    "risk_score": 88,
    "severity": "High",
    "priority": "High",
    "rationale": "Clear 2-sentence explanation breaking down the severity impact and likelihood of worker exposure.",
    "confidence_score": 90.0
}
"""

def calculate_rubric(severity_score: int, likelihood_score: int, category: str) -> Tuple[int, str, str, str]:
    """Calculate deterministic risk score and priority from severity & likelihood scores."""
    s = max(1, min(5, severity_score))
    l = max(1, min(5, likelihood_score))
    
    # Specific category baseline adjustments
    cat_boost = 0
    if category in ["Electrical", "Fire", "Chemical"]:
        cat_boost = 8  # High inherent energy / rapid escalation potential
    elif category in ["Emergency Exit", "Machinery"]:
        cat_boost = 4

    raw_score = int(((s * l) / 25.0) * 100.0) + cat_boost
    risk_score = max(0, min(100, raw_score))

    if risk_score >= 80 or s >= 5:
        severity = "Critical" if s == 5 else "High"
        priority = "Urgent"
    elif risk_score >= 60 or s == 4:
        severity = "High"
        priority = "High"
    elif risk_score >= 35 or s == 3:
        severity = "Medium"
        priority = "Medium"
    else:
        severity = "Low"
        priority = "Low"

    rationale = f"Assessed at Severity {s}/5 ({severity}) and Likelihood {l}/5 based on hazard profile in {category}. Base risk index calculated at {risk_score}/100."
    return risk_score, severity, priority, rationale

def assess_risk_node(state: SafetyWatchState) -> Dict[str, Any]:
    """
    Node 3: Risk Assessment Agent
    Calculates explainable severity, likelihood, risk score, priority, and rationale.
    """
    logger.info("Running Agent 3: Risk Assessment Agent")
    agent_statuses = dict(state.get("agent_statuses", {}))
    agent_statuses["risk"] = "running"
    errors = list(state.get("errors", []))

    category = state.get("category", "Other")
    hazard_desc = state.get("hazard_description", "")
    location = state.get("location", "")
    full_text = f"{hazard_desc} {location}".lower()

    # Default baseline scores based on category hazard profile
    if category == "Electrical":
        severity_score = 4
        likelihood_score = 4
    elif category in ["Fire", "Emergency Exit"]:
        severity_score = 4
        likelihood_score = 3
    elif category in ["Chemical", "Machinery"]:
        severity_score = 4
        likelihood_score = 3
    elif category in ["Slip/Trip", "Structural"]:
        severity_score = 3
        likelihood_score = 4
    elif category == "Housekeeping":
        severity_score = 2
        likelihood_score = 3
    elif category == "PPE":
        severity_score = 3
        likelihood_score = 3
    else:
        severity_score = 2
        likelihood_score = 2

    # Adjust for high-urgency keywords
    if any(w in full_text for w in ["exposed", "live wire", "spark", "smoke", "imminent", "blocked", "heavy leak"]):
        severity_score = max(severity_score, 4)
        likelihood_score = max(likelihood_score, 4)

    risk_score, severity, priority, rationale = calculate_rubric(severity_score, likelihood_score, category)
    confidence = 90.0

    try:
        if groq_service.is_available():
            user_prompt = f"Assess risk for this incident:\nCategory: {category}\nHazard: {hazard_desc}\nLocation: {location}"
            llm_result = groq_service.generate_json_response(
                system_prompt=RISK_SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
            s_cand = int(llm_result.get("severity_score", severity_score))
            l_cand = int(llm_result.get("likelihood_score", likelihood_score))
            severity_score = max(1, min(5, s_cand))
            likelihood_score = max(1, min(5, l_cand))
            
            # Recalculate deterministic rubric with LLM calibrated inputs
            risk_score, severity, priority, rubric_rat = calculate_rubric(severity_score, likelihood_score, category)
            rationale = llm_result.get("rationale", rubric_rat)
            confidence = float(llm_result.get("confidence_score", 90.0))

        agent_statuses["risk"] = "completed"

    except Exception as e:
        logger.error(f"Risk Assessment Agent failed: {e}")
        agent_statuses["risk"] = "completed"
        errors.append(f"Risk Assessment notice: {str(e)}")

    return {
        "severity": severity,
        "severity_score": severity_score,
        "likelihood": likelihood_score,
        "risk_score": risk_score,
        "priority": priority,
        "risk_rationale": rationale,
        "risk_assessment_confidence": confidence,
        "agent_statuses": agent_statuses,
        "errors": errors
    }
