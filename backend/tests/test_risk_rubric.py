import pytest
from app.agents.risk_assessment import assess_risk_node, calculate_rubric

def test_calculate_rubric_formula():
    """Verify standard formula: (Severity * Likelihood / 25) * 100."""
    score, severity, priority, rationale = calculate_rubric(5, 5, "Electrical")
    assert score == 100
    assert severity == "Critical"
    assert priority in ["Urgent", "Critical"]

    score_med, sev_med, prio_med, _ = calculate_rubric(3, 3, "Slip/Trip")
    assert score_med == 36
    assert sev_med == "Medium"
    assert prio_med == "Medium"

def test_risk_rubric_node_electrical():
    """Verify Agent 3 node output for electrical category."""
    state = {
        "hazard_detected": True,
        "hazard_type": "Exposed Live Electrical Wiring",
        "category": "Electrical",
        "hazard_description": "Exposed high voltage wires near active walkway",
        "location": "Substation B",
        "errors": []
    }
    updated_state = assess_risk_node(state)
    assert updated_state["severity"] in ["Critical", "High"]
    assert updated_state["risk_score"] >= 60
    assert updated_state["priority"] in ["Urgent", "Critical", "High"]
