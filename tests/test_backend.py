import pytest
from fastapi.testclient import TestClient
import os
import sys

# Ensure backend package is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.agents.workflow import safetywatch_graph
from app.agents.state import SafetyWatchState
from app.db.store import store

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"

def test_safety_rules_endpoint():
    response = client.get("/api/safety-rules")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) >= 10
    assert any(r["category"] == "Electrical" for r in rules)
    assert any(r["category"] == "Emergency Exit" for r in rules)

def test_dashboard_stats_endpoint():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total_incidents" in stats
    assert "open_incidents" in stats
    assert "high_risk_incidents" in stats
    assert "resolved_incidents" in stats
    assert "average_risk_score" in stats

def test_analyze_electrical_hazard_scenario():
    """
    Test Section 17 Demo scenario:
    Exposed electrical wires -> Electrical Hazard -> High/Critical risk -> Rule matched -> WS-XXXX code -> Notification generated
    """
    form_data = {
        "location": "Electrical Room B2",
        "description": "Exposed electrical wires dangling from open junction box with visible spark marks",
        "reporter": "Alex Rivera"
    }
    response = client.post("/api/incidents/analyze", data=form_data)
    assert response.status_code == 201
    res = response.json()
    
    assert res["success"] is True
    assert res["hazard_detected"] is True
    assert res["incident_code"].startswith("WS-")
    
    incident = res["incident"]
    assert incident["category"] == "Electrical"
    assert incident["risk_score"] >= 60
    assert incident["severity"] in ["High", "Critical"]
    assert len(incident["matched_rules"]) > 0
    assert incident["matched_rules"][0]["category"] == "Electrical"
    assert incident["incident_report"] is not None
    assert incident["notifications"][0]["status"] == "simulated"
    
    # Check agent statuses all completed
    agent_statuses = res["agent_statuses"]
    assert agent_statuses["detection"] == "completed"
    assert agent_statuses["classification"] == "completed"
    assert agent_statuses["risk"] == "completed"
    assert agent_statuses["rules"] == "completed"
    assert agent_statuses["report"] == "completed"
    assert agent_statuses["notification"] == "completed"
    assert agent_statuses["resolution"] == "completed"

def test_analyze_no_hazard_scenario():
    """
    Test conditional routing:
    Clean/safe room -> No hazard detected -> early exit -> safe resolved record
    """
    form_data = {
        "location": "Main Lobby Office",
        "description": "All safe, clean and clear unobstructed floor with normal condition inspection",
        "reporter": "Inspection Team"
    }
    response = client.post("/api/incidents/analyze", data=form_data)
    assert response.status_code == 201
    res = response.json()
    assert res["hazard_detected"] is False
    assert res["incident"]["severity"] == "Low"
    assert res["incident"]["risk_score"] == 0

def test_incident_manager_lifecycle():
    """
    Test full lifecycle:
    1. Create incident
    2. Get single incident detail
    3. Manager assigns to Safety Lead & updates to IN_PROGRESS
    4. Manager adds resolution notes & marks RESOLVED
    """
    # 1. Create
    form_data = {
        "location": "Chemical Storage Bay C",
        "description": "Corrosive chemical drum leaking solvent onto floor without secondary containment",
        "reporter": "Dana Scully"
    }
    create_res = client.post("/api/incidents/analyze", data=form_data)
    assert create_res.status_code == 201
    inc_id = create_res.json()["incident_id"]

    # 2. Get Detail
    detail_res = client.get(f"/api/incidents/{inc_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == inc_id
    assert detail_res.json()["category"] == "Chemical"

    # 3. Manager Assigns & sets IN_PROGRESS
    patch_1 = client.patch(f"/api/incidents/{inc_id}", json={
        "status": "IN_PROGRESS",
        "assignee_name": "Fox Mulder (HazMat Officer)",
        "assignee_id": "usr-hazmat-1",
        "resolution_notes": "HazMat crew dispatched with neutralizing agent."
    })
    assert patch_1.status_code == 200
    data_1 = patch_1.json()
    assert data_1["status"] == "IN_PROGRESS"
    assert data_1["assignee_name"] == "Fox Mulder (HazMat Officer)"
    assert len(data_1["resolution_updates"]) >= 2

    # 4. Manager marks RESOLVED
    patch_2 = client.patch(f"/api/incidents/{inc_id}", json={
        "status": "RESOLVED",
        "resolution_notes": "Spill neutralized, drum transferred to ventilated containment cabinet, air quality confirmed safe."
    })
    assert patch_2.status_code == 200
    data_2 = patch_2.json()
    assert data_2["status"] == "RESOLVED"

    # 5. Progress endpoint verification
    prog_res = client.get(f"/api/incidents/{inc_id}/progress")
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert prog_data["is_completed"] is True

def test_incident_filters():
    """Test incident listing filters by status, severity, and category."""
    all_res = client.get("/api/incidents")
    assert all_res.status_code == 200
    assert len(all_res.json()) >= 1

    elec_res = client.get("/api/incidents?category=Electrical")
    assert elec_res.status_code == 200
    for inc in elec_res.json():
        assert inc["category"] == "Electrical"
