import logging
import time
from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, START, END

from app.agents.state import SafetyWatchState
from app.agents.detection import detect_hazard_node
from app.agents.classification import classify_hazard_node
from app.agents.risk_assessment import assess_risk_node
from app.agents.safety_rules import match_safety_rules_node
from app.agents.incident_report import generate_incident_report_node
from app.agents.notification import notification_node
from app.agents.resolution import resolution_node

logger = logging.getLogger(__name__)

def safe_node_runner(node_func, node_name: str):
    """
    Wraps an agent node with automated single-retry on transient failure
    and graceful error state recording.
    """
    def wrapper(state: SafetyWatchState) -> Dict[str, Any]:
        retries = 1
        for attempt in range(retries + 1):
            try:
                return node_func(state)
            except Exception as e:
                logger.warning(f"Error in node '{node_name}' (attempt {attempt + 1}/{retries + 1}): {e}")
                if attempt == retries:
                    agent_statuses = dict(state.get("agent_statuses", {}))
                    agent_statuses[node_name] = "failed"
                    errors = list(state.get("errors", []))
                    errors.append(f"Agent '{node_name}' failed after retry: {str(e)}")
                    return {
                        "agent_statuses": agent_statuses,
                        "errors": errors
                    }
                time.sleep(0.5)
        return {}
    return wrapper

# Define router condition after Detection Agent
def route_after_detection(state: SafetyWatchState) -> Literal["classification", "no_hazard_exit"]:
    if state.get("hazard", True) is False:
        logger.info("Routing decision: No hazard detected -> exiting early.")
        return "no_hazard_exit"
    return "classification"

def no_hazard_exit_node(state: SafetyWatchState) -> Dict[str, Any]:
    """Handles graceful early exit when no hazard is detected."""
    agent_statuses = dict(state.get("agent_statuses", {}))
    agent_statuses["classification"] = "completed"
    agent_statuses["risk"] = "completed"
    agent_statuses["rules"] = "completed"
    agent_statuses["report"] = "completed"
    agent_statuses["notification"] = "completed"
    agent_statuses["resolution"] = "completed"
    
    det_conf = state.get("detection_confidence", 95.0)
    confidence_metrics = {
        "detection_confidence": det_conf,
        "classification_confidence": 100.0,
        "rule_match_confidence": 100.0,
        "risk_assessment_confidence": 100.0,
        "overall_analysis_score": det_conf,
        "disclaimer": "Model confidence / system evaluation metrics - not certified measurements."
    }

    report = {
        "incident_id": state.get("incident_id", "SAFE-001"),
        "incident_code": "SAFE-VERIFIED",
        "created_at": state.get("created_at", ""),
        "hazard_type": "No Hazard Detected",
        "category": "None",
        "description": state.get("hazard_description", "Area verified clear and safe."),
        "location": state.get("location", "Facility"),
        "reporter_name": state.get("reporter", "Employee"),
        "risk_score": 0,
        "severity": "Low",
        "priority": "Low",
        "matched_rule": "Standard Safe Operating Conditions",
        "corrective_action": "No remediation required. Regular monitoring continues.",
        "status": "RESOLVED"
    }

    return {
        "hazard": False,
        "category": "None",
        "severity": "Low",
        "risk_score": 0,
        "priority": "Low",
        "incident_status": "RESOLVED",
        "incident_report": report,
        "confidence_metrics": confidence_metrics,
        "agent_statuses": agent_statuses
    }

def create_safetywatch_graph() -> StateGraph:
    """Builds and compiles the 7-agent LangGraph workflow."""
    workflow = StateGraph(SafetyWatchState)

    # Add Nodes
    workflow.add_node("detection", safe_node_runner(detect_hazard_node, "detection"))
    workflow.add_node("no_hazard_exit", no_hazard_exit_node)
    workflow.add_node("classification", safe_node_runner(classify_hazard_node, "classification"))
    workflow.add_node("risk", safe_node_runner(assess_risk_node, "risk"))
    workflow.add_node("rules", safe_node_runner(match_safety_rules_node, "rules"))
    workflow.add_node("report", safe_node_runner(generate_incident_report_node, "report"))
    workflow.add_node("notification", safe_node_runner(notification_node, "notification"))
    workflow.add_node("resolution", safe_node_runner(resolution_node, "resolution"))

    # Add Edges
    workflow.add_edge(START, "detection")
    
    # Conditional branching from detection
    workflow.add_conditional_edges(
        "detection",
        route_after_detection,
        {
            "classification": "classification",
            "no_hazard_exit": "no_hazard_exit"
        }
    )
    
    workflow.add_edge("no_hazard_exit", END)
    workflow.add_edge("classification", "risk")
    workflow.add_edge("risk", "rules")
    workflow.add_edge("rules", "report")
    workflow.add_edge("report", "notification")
    workflow.add_edge("notification", "resolution")
    workflow.add_edge("resolution", END)

    return workflow

# Compile default graph
safetywatch_graph = create_safetywatch_graph().compile()
