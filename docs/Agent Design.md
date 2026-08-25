# Agent Design

Workplace SafetyWatch splits safety analysis across seven specialized agents rather than relying on an ambiguous monolithic prompt:

---

### 1. Hazard Detection Agent
- **File:** `backend/app/agents/detection.py`
- **Input:** Image (base64 / URL) + optional description + location.
- **Function:** Inspects visual features and telemetry to verify whether an unsafe condition exists.
- **Output:** `hazard` (boolean), `hazard_description`, `detection_confidence`.
- **Branching:** If no hazard is found, routes directly to safe early exit node.

---

### 2. Hazard Classification Agent
- **File:** `backend/app/agents/classification.py`
- **Input:** Hazard description, location context.
- **Categories:** `Electrical`, `Fire`, `PPE`, `Slip/Trip`, `Machinery`, `Chemical`, `Emergency Exit`, `Structural`, `Housekeeping`, `Other`.
- **Output:** `category`, `hazard_type`, `classification_confidence`.

---

### 3. Risk Assessment Agent
- **File:** `backend/app/agents/risk_assessment.py`
- **Input:** Category, hazard description, physical context.
- **Rubric:** [[Risk Scoring Rubric]] mapping Severity (1-5), Likelihood (1-5), and priority thresholds.
- **Output:** `severity_score`, `likelihood`, `risk_score` (0-100), `severity`, `priority`, `risk_rationale`.

---

### 4. Safety Rule & Compliance Matching Agent
- **File:** `backend/app/agents/safety_rules.py`
- **Input:** Classified hazard and curated `safety_rules` catalogue.
- **Feature Name:** *"Safety Rule & Compliance Matching"* (internal standards, non-certified).
- **Output:** `matched_rules` list, `compliance_status`, `recommended_corrective_action`, `rule_match_confidence`.

---

### 5. Incident Report Agent
- **File:** `backend/app/agents/incident_report.py`
- **Input:** All agent outputs and metadata.
- **Output:** Unique code (e.g. `WS-1024`), structured incident summary document, aggregate [[Evaluation|Confidence Metrics]].

---

### 6. Notification Agent
- **File:** `backend/app/agents/notification.py`
- **Trigger Condition:** Incident Severity is `High` or `Critical` (or risk score $\ge 60$).
- **Status Flag:** Explicitly marked as `"simulated"` or `"actually sent"`.
- **Output:** Notification log with recipient, subject, body, and timestamp.

---

### 7. Resolution / Follow-up Agent
- **File:** `backend/app/agents/resolution.py`
- **Function:** Initializes remediation lifecycle and processes manager operations (assignee, status transitions, resolution audit notes).

See also: [[LangGraph Workflow]], [[Risk Scoring Rubric]], [[API Documentation]].
