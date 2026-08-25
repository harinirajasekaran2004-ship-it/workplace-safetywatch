import logging
from typing import Dict, Any, List
from app.agents.state import SafetyWatchState
from app.db.safety_rules_data import DEFAULT_SAFETY_RULES
from app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

RULE_MATCHING_SYSTEM_PROMPT = """
You are the Safety Rule & Compliance Matching Agent in Workplace SafetyWatch.
Feature Purpose: Identify relevant workplace safety guidelines and recommend corrective action.
Disclaimer: This feature performs Safety Rule & Compliance Matching based on internal standards and general best practices; it is not a formal legal or certified regulatory audit.

Analyze the given hazard and candidate rules, and return the best-matching safety rule with contextual justification.

Respond in strict JSON with schema:
{
    "matched_rule_id": "RULE-ID",
    "why_it_applies": "Concise 2-sentence explanation detailing why this specific rule applies to the observed condition.",
    "compliance_status": "NON_COMPLIANT" / "PARTIAL_COMPLIANCE" / "AT_RISK",
    "recommended_corrective_action": "Clear step-by-step corrective remediation action to restore safety compliance.",
    "confidence_score": 95.0
}
"""

def match_safety_rules_node(state: SafetyWatchState) -> Dict[str, Any]:
    """
    Node 4: Safety Rule & Compliance Matching Agent
    Identifies relevant safety guidelines, compliance status, and corrective action.
    """
    logger.info("Running Agent 4: Safety Rule & Compliance Matching Agent")
    agent_statuses = dict(state.get("agent_statuses", {}))
    agent_statuses["rules"] = "running"
    errors = list(state.get("errors", []))

    category = state.get("category", "Other")
    hazard_desc = state.get("hazard_description", "")
    location = state.get("location", "")

    # Candidate rule selection from catalogue
    category_rules = [r for r in DEFAULT_SAFETY_RULES if r.get("category", "").lower() == category.lower()]
    if not category_rules:
        category_rules = DEFAULT_SAFETY_RULES

    # Default best candidate
    best_candidate = category_rules[0] if category_rules else DEFAULT_SAFETY_RULES[0]
    
    why_it_applies = f"The identified condition ({hazard_desc}) violates the requirement for {best_candidate['title']} at {location}."
    compliance_status = "NON_COMPLIANT"
    corrective_action = best_candidate.get("default_corrective_action", "Inspect and mitigate hazard immediately.")
    confidence = 94.0

    try:
        if groq_service.is_available():
            rules_summary = "\n".join([f"- ID: {r['id']} | Title: {r['title']} | Desc: {r['description']}" for r in category_rules[:4]])
            user_prompt = f"Hazard Details:\nCategory: {category}\nDescription: {hazard_desc}\nLocation: {location}\n\nCandidate Rules:\n{rules_summary}"
            
            llm_result = groq_service.generate_json_response(
                system_prompt=RULE_MATCHING_SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
            
            cand_id = llm_result.get("matched_rule_id")
            found = next((r for r in category_rules if r["id"] == cand_id), None)
            if found:
                best_candidate = found
                
            why_it_applies = llm_result.get("why_it_applies", why_it_applies)
            compliance_status = llm_result.get("compliance_status", compliance_status)
            corrective_action = llm_result.get("recommended_corrective_action", corrective_action)
            confidence = float(llm_result.get("confidence_score", 95.0))

        agent_statuses["rules"] = "completed"

    except Exception as e:
        logger.error(f"Safety Rule Agent failed: {e}")
        agent_statuses["rules"] = "completed"
        errors.append(f"Safety Rule Agent notice: {str(e)}")

    matched_rule_payload = {
        "rule_id": best_candidate["id"],
        "code": best_candidate["code"],
        "title": best_candidate["title"],
        "description": best_candidate["description"],
        "category": best_candidate["category"],
        "why_it_applies": why_it_applies,
        "compliance_status": compliance_status,
        "recommended_corrective_action": corrective_action
    }

    return {
        "matched_rules": [matched_rule_payload],
        "rule_match_confidence": confidence,
        "agent_statuses": agent_statuses,
        "errors": errors
    }
