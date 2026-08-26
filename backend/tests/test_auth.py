import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_manager_login_success():
    """Test successful manager login for Harini R."""
    response = client.post(
        "/api/auth/login",
        json={"email": "harinirajasekaran2004@gmail.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["name"] == "Harini R"
    assert data["user"]["role"] == "manager"
    assert "token" in data

def test_reporter_login_success():
    """Test successful employee login for Alex Rivera."""
    response = client.post(
        "/api/auth/login",
        json={"email": "alex.rivera@facility.internal", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["name"] == "Alex Rivera"
    assert data["user"]["role"] == "employee"

def test_login_invalid_password():
    """Test login rejection with wrong credentials."""
    response = client.post(
        "/api/auth/login",
        json={"email": "harinirajasekaran2004@gmail.com", "password": "wrong_password"}
    )
    assert response.status_code == 401

def test_register_new_employee():
    """Test registering a new technician."""
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Jordan Lee",
            "email": "jordan.lee@facility.internal",
            "password": "password123",
            "role": "employee",
            "department": "Robotics & Automation",
            "facility_location": "Bay 3"
        }
    )
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["user"]["name"] == "Jordan Lee"
    assert data["user"]["role"] == "employee"
