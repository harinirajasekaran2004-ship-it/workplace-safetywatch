import pytest
from fastapi.testclient import TestClient
import os
import sys
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.agents.risk_assessment import calculate_rubric
from app.agents.workflow import safetywatch_graph
from app.agents.state import SafetyWatchState

client = TestClient(app)

def test_rubric_calculations_unit():
    """Unit tests for the explainable scoring rubric formula across categories."""
    # Negligible low risk
    score, sev, prio, rat = calculate_rubric(1, 1, "Housekeeping")
    assert score <= 20
    assert sev == "Low"
    assert prio == "Low"

    # High electrical hazard (with category boost)
    score_elec, sev_elec, prio_elec, _ = calculate_rubric(4, 4, "Electrical")
    assert score_elec >= 70
    assert sev_elec in ["High", "Critical"]

    # Catastrophic
    score_cat, sev_cat, prio_cat, _ = calculate_rubric(5, 5, "Fire")
    assert score_cat == 100
    assert sev_cat == "Critical"
    assert prio_cat == "Urgent"

def test_unsupported_file_format_error():
    """Validation test: uploading invalid file type (e.g. .pdf or .txt) returns 400."""
    fake_file = io.BytesIO(b"dummy pdf contents")
    response = client.post(
        "/api/incidents/analyze",
        files={"image": ("test.pdf", fake_file, "application/pdf")},
        data={"location": "Office Suite"}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]

def test_oversized_file_error():
    """Validation test: uploading file > 10MB returns 400."""
    large_payload = b"0" * (11 * 1024 * 1024)  # 11 MB
    fake_large_file = io.BytesIO(large_payload)
    response = client.post(
        "/api/incidents/analyze",
        files={"image": ("big.jpg", fake_large_file, "image/jpeg")},
        data={"location": "Main Hall"}
    )
    assert response.status_code == 400
    assert "exceeds maximum limit" in response.json()["detail"]

def test_blocked_exit_scenario():
    """Test scenario: Blocked emergency exit -> Emergency Exit category -> Life safety rule matched."""
    form_data = {
        "location": "North Wing Fire Gate",
        "description": "Emergency exit door blocked by heavy wooden crates and pallets",
        "reporter": "Logistics Lead"
    }
    response = client.post("/api/incidents/analyze", data=form_data)
    assert response.status_code == 201
    res = response.json()
    assert res["hazard_detected"] is True
    assert res["incident"]["category"] == "Emergency Exit"
    assert res["incident"]["matched_rules"][0]["code"] == "SAFE-EXIT-201"

def test_missing_ppe_scenario():
    """Test scenario: Missing PPE in hazardous production floor."""
    form_data = {
        "location": "Welding Cell 3",
        "description": "Operators working without safety goggles or welding helmet",
        "reporter": "Safety Auditor"
    }
    response = client.post("/api/incidents/analyze", data=form_data)
    assert response.status_code == 201
    res = response.json()
    assert res["hazard_detected"] is True
    assert res["incident"]["category"] == "PPE"
    assert res["incident"]["matched_rules"][0]["code"] == "SAFE-PPE-301"

def test_wet_floor_slip_scenario():
    """Test scenario: Wet slippery floor spill."""
    form_data = {
        "location": "Cafeteria Entrance",
        "description": "Water leak puddle on slick tile floor creating severe slip hazard",
        "reporter": "Janitorial Team"
    }
    response = client.post("/api/incidents/analyze", data=form_data)
    assert response.status_code == 201
    res = response.json()
    assert res["hazard_detected"] is True
    assert res["incident"]["category"] == "Slip/Trip"
    assert res["incident"]["matched_rules"][0]["code"] == "SAFE-SLIP-401"

def test_invalid_incident_id_404():
    """Test non-existent incident lookup returns 404."""
    response = client.get("/api/incidents/non-existent-uuid-999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_patch_non_existent_incident_404():
    """Test patching non-existent incident returns 404."""
    response = client.patch("/api/incidents/non-existent-uuid-999", json={"status": "RESOLVED"})
    assert response.status_code == 404
