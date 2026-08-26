import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_safety_chat_relevant_query():
    """Test safety assistant with valid safety question."""
    response = client.post(
        "/api/chat/safety-assistant",
        json={"message": "What is the safety rule for exposed electrical wiring?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data.get("is_relevant") is True
    assert len(data["reply"]) > 20

def test_safety_chat_off_topic_guardrail():
    """Test safety assistant strict refusal on off-topic questions."""
    response = client.post(
        "/api/chat/safety-assistant",
        json={"message": "Can you write a poem about chocolate ice cream and football?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data.get("is_relevant") is False
    assert "Workplace SafetyWatch Assistant" in data["reply"] or "domain" in data["reply"]
