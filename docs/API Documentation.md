# API Documentation

The FastAPI backend exposes interactive OpenAPI docs at `/docs` and ReDoc at `/redoc`.

---

## Endpoints

### 1. Multi-Agent Hazard Analysis
- **Method:** `POST /api/incidents/analyze`
- **Request Body (Multipart Form):**
  - `image`: Binary file (optional, JPG/PNG/WebP $\le 10$ MB)
  - `location`: String (required)
  - `description`: String (optional)
  - `reporter`: String (optional)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Incident analysis completed successfully.",
    "incident_id": "inc-xxxx",
    "incident_code": "WS-1024",
    "hazard_detected": true,
    "incident": { ... },
    "agent_statuses": {
      "detection": "completed",
      "classification": "completed",
      "risk": "completed",
      "rules": "completed",
      "report": "completed",
      "notification": "completed",
      "resolution": "completed"
    },
    "confidence_metrics": {
      "detection_confidence": 94.0,
      "classification_confidence": 91.0,
      "rule_match_confidence": 95.0,
      "risk_assessment_confidence": 88.0,
      "overall_analysis_score": 92.0,
      "disclaimer": "Model confidence / system evaluation metrics - not certified measurements."
    }
  }
  ```

---

### 2. List Incidents
- **Method:** `GET /api/incidents`
- **Query Params:** `status`, `severity`, `category`, `search`
- **Response:** Array of `IncidentDetail` objects sorted by date descending.

---

### 3. Get Single Incident
- **Method:** `GET /api/incidents/{id}`
- **Response:** Detailed incident object with rules, risk rubric, and audit updates.

---

### 4. Manager Updates & Resolution
- **Method:** `PATCH /api/incidents/{id}`
- **Body:**
  ```json
  {
    "status": "IN_PROGRESS",
    "assignee_name": "Sarah Connor (Safety Lead)",
    "resolution_notes": "Crew dispatched to install protective conduit."
  }
  ```

---

### 5. Facility Dashboard Statistics
- **Method:** `GET /api/dashboard/stats`
- **Response:** KPI metrics (`total_incidents`, `open_incidents`, `high_risk_incidents`, `resolved_incidents`, `average_risk_score`, `category_counts`, `severity_counts`).

---

### 6. Live Agent Progress
- **Method:** `GET /api/incidents/{id}/progress`
- **Response:** Real-time state of all 7 agents for frontend polling.

---

### 7. Safety Rules Catalog
- **Method:** `GET /api/safety-rules`
- **Response:** Curated list of active safety compliance standards.

See also: [[Architecture]], [[Agent Design]], [[Testing Strategy]].
