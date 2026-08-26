import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_fetch_dashboard_stats():
    """Verify stats endpoint returns count metrics and reporter lists."""
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_incidents" in data
    assert "open_incidents" in data
    assert "reporters_list" in data

def test_fetch_safety_rules():
    """Verify safety rules standard catalogue retrieval."""
    response = client.get("/api/safety-rules")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) >= 6
    rule_ids = [r.get("id") or r.get("rule_id") or r.get("code") for r in rules]
    assert any("SAFE-ELEC-101" in str(r) for r in rules)

def test_fetch_incidents_list():
    """Verify incidents query endpoint."""
    response = client.get("/api/incidents")
    assert response.status_code == 200
    incidents = response.json()
    assert isinstance(incidents, list)
