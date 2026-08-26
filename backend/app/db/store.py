import logging
import threading
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.db.safety_rules_data import DEFAULT_SAFETY_RULES
from app.db.supabase_client import supabase_service

logger = logging.getLogger(__name__)

class DataStore:
    """
    Central Data Access Layer supporting both direct Supabase PostgreSQL queries
    and an in-memory/fallback database for local execution, test coverage, and offline resilience.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self.users: Dict[str, Dict[str, Any]] = {}
        self.incidents: Dict[str, Dict[str, Any]] = {}
        self.safety_rules: List[Dict[str, Any]] = list(DEFAULT_SAFETY_RULES)
        self.agent_run_logs: Dict[str, Dict[str, Any]] = {}
        self._seed_sample_users()
        self._seed_sample_incidents()

    def _seed_sample_users(self):
        """Seed default Reporter and Manager accounts."""
        u1 = {
            "id": "usr-emp-1",
            "name": "Alex Rivera",
            "email": "alex.rivera@facility.internal",
            "password": "password123",
            "role": "employee",
            "department": "Plant Maintenance & Electrical",
            "facility_location": "Main Assembly Quadrant B",
            "created_at": "2026-08-25T00:00:00Z"
        }
        u2 = {
            "id": "usr-mgr-1",
            "name": "Sarah Connor",
            "email": "sarah.connor@facility.internal",
            "password": "password123",
            "role": "manager",
            "department": "EHS Safety & Compliance Command",
            "facility_location": "Central Safety Control Office",
            "created_at": "2026-08-25T00:00:00Z"
        }
        u3 = {
            "id": "usr-emp-2",
            "name": "David Kim",
            "email": "david.kim@facility.internal",
            "password": "password123",
            "role": "employee",
            "department": "Warehouse Logistics & Freight",
            "facility_location": "South Loading Dock Gate 4",
            "created_at": "2026-08-25T00:00:00Z"
        }
        self.users[u1["id"]] = u1
        self.users[u2["id"]] = u2
        self.users[u3["id"]] = u3

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Registers a new user in the store."""
        with self._lock:
            # Check existing email
            for u in self.users.values():
                if u["email"].lower() == user_data["email"].lower():
                    raise ValueError(f"An account with email '{user_data['email']}' already exists.")
            
            user_id = user_data.get("id") or f"usr-{uuid.uuid4().hex[:8]}"
            user_record = {
                "id": user_id,
                "name": user_data["name"],
                "email": user_data["email"].lower(),
                "password": user_data.get("password", "password123"),
                "role": user_data.get("role", "employee"),
                "department": user_data.get("department", "Operations"),
                "facility_location": user_data.get("facility_location", "Main Plant"),
                "created_at": user_data.get("created_at") or datetime.now(timezone.utc).isoformat()
            }
            self.users[user_id] = user_record
            return user_record

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            for u in self.users.values():
                if u["email"].lower() == email.lower():
                    return dict(u)
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            if user_id in self.users:
                return dict(self.users[user_id])
        return None

    def list_users(self, role: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            users_list = list(self.users.values())
        if role:
            users_list = [u for u in users_list if u.get("role") == role]
        return [
            {k: v for k, v in u.items() if k != "password"}
            for u in users_list
        ]

    def _seed_sample_incidents(self):
        """Seed initial realistic incidents for immediate dashboard demonstration."""
        sample_1 = {
            "id": "inc-sample-101",
            "incident_code": "WS-1019",
            "location": "Warehouse Sector 4",
            "description": "Oil spill near main forklift loading ramp creating severe slip risk.",
            "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
            "hazard_detected": True,
            "hazard_type": "Wet / Slippery Floor",
            "category": "Slip/Trip",
            "confidence": 93.0,
            "risk_score": 68,
            "severity": "High",
            "priority": "High",
            "status": "IN_PROGRESS",
            "reporter_name": "Marcus Vance",
            "reporter_email": "marcus.vance@facility.internal",
            "reporter_id": "usr-emp-1",
            "assignee_name": "Sarah Connor (Safety Lead)",
            "assignee_id": "usr-mgr-1",
            "created_at": "2026-08-25T08:15:00Z",
            "updated_at": "2026-08-25T08:45:00Z",
            "risk_assessment": {
                "severity": "High",
                "likelihood": 4,
                "severity_score": 4,
                "risk_score": 68,
                "priority": "High",
                "rationale": "High traffic forklift thoroughfare combined with uncontained oil residue creates acute slip and collision hazard.",
                "rubric_formula": "Risk Score = (Severity * Likelihood * 4) modified by Environmental Multipliers"
            },
            "matched_rules": [
                {
                    "rule_id": "RULE-SLIP-01",
                    "code": "SAFE-SLIP-401",
                    "title": "Walking-Working Surfaces & Immediate Spill Remediation",
                    "description": "Floors, passageways, and stairs must be maintained clean, dry, and free from slip hazards.",
                    "category": "Slip/Trip",
                    "why_it_applies": "Active petroleum liquid spill on operational concrete flooring violates walking surface safety mandate.",
                    "compliance_status": "NON_COMPLIANT",
                    "recommended_corrective_action": "Deploy absorbent granules, cordon off section with yellow caution tape, and verify seal on oil reservoir."
                }
            ],
            "incident_report": {
                "incident_id": "inc-sample-101",
                "incident_code": "WS-1019",
                "created_at": "2026-08-25T08:15:00Z",
                "hazard_type": "Wet / Slippery Floor",
                "category": "Slip/Trip",
                "description": "Oil spill near main forklift loading ramp.",
                "location": "Warehouse Sector 4",
                "reporter_name": "Marcus Vance",
                "risk_score": 68,
                "severity": "High",
                "priority": "High",
                "matched_rule": "Walking-Working Surfaces & Immediate Spill Remediation",
                "corrective_action": "Deploy absorbent granules and cordon off section.",
                "status": "IN_PROGRESS"
            },
            "notifications": [
                {
                    "recipient": "harinirajasekaran2004@gmail.com",
                    "channel": "email",
                    "status": "actually sent",
                    "sent_at": "2026-08-25T08:15:05Z",
                    "subject": "[CRITICAL SAFETY ALERT] HIGH Hazard Detected: WS-1019 at Warehouse Sector 4",
                    "message": "High severity slip hazard reported."
                }
            ],
            "resolution_updates": [
                {
                    "id": "res-1",
                    "updated_by": "AI Pipeline",
                    "notes": "Incident registered into Workplace SafetyWatch.",
                    "status": "REPORTED",
                    "created_at": "2026-08-25T08:15:00Z"
                },
                {
                    "id": "res-2",
                    "updated_by": "Sarah Connor",
                    "notes": "Deployed maintenance crew with industrial degreaser.",
                    "status": "IN_PROGRESS",
                    "created_at": "2026-08-25T08:45:00Z"
                }
            ],
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
                "classification_confidence": 93.0,
                "rule_match_confidence": 96.0,
                "risk_assessment_confidence": 89.0,
                "overall_analysis_score": 93.0,
                "disclaimer": "Model confidence / system evaluation metrics - not certified measurements."
            },
            "errors": []
        }
        self.incidents[sample_1["id"]] = sample_1

    def save_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves or updates an incident in store (and Supabase if connected)."""
        inc_id = incident_data.get("id") or incident_data.get("incident_id")
        with self._lock:
            self.incidents[inc_id] = incident_data
        
        if supabase_service.is_connected():
            try:
                client = supabase_service.client
                client.table("incidents").upsert({
                    "id": inc_id,
                    "incident_code": incident_data.get("incident_code"),
                    "location": incident_data.get("location"),
                    "description": incident_data.get("description"),
                    "hazard_detected": incident_data.get("hazard_detected", True),
                    "hazard_type": incident_data.get("hazard_type"),
                    "category": incident_data.get("category"),
                    "confidence": incident_data.get("confidence"),
                    "risk_score": incident_data.get("risk_score"),
                    "severity": incident_data.get("severity"),
                    "priority": incident_data.get("priority"),
                    "status": incident_data.get("status", "REPORTED"),
                    "reporter_name": incident_data.get("reporter_name", "Employee"),
                    "assignee_name": incident_data.get("assignee_name"),
                    "assignee_id": incident_data.get("assignee_id"),
                    "created_at": incident_data.get("created_at"),
                    "updated_at": incident_data.get("updated_at")
                }).execute()
            except Exception as e:
                logger.error(f"Failed to upsert incident to Supabase: {e}")

        return incident_data

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single incident by ID or incident_code."""
        with self._lock:
            if incident_id in self.incidents:
                return self.incidents[incident_id]
            for inc in self.incidents.values():
                if inc.get("incident_code") == incident_id:
                    return inc
        return None

    def list_incidents(
        self,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        reporter_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Returns filtered list of incidents sorted by creation date descending."""
        with self._lock:
            results = list(self.incidents.values())

        if status:
            results = [i for i in results if str(i.get("status", "")).upper() == status.upper()]
        if severity:
            results = [i for i in results if str(i.get("severity", "")).lower() == severity.lower()]
        if category:
            results = [i for i in results if str(i.get("category", "")).lower() == category.lower()]
        if reporter_id:
            results = [i for i in results if i.get("reporter_id") == reporter_id]
        if search:
            s_lower = search.lower()
            results = [
                i for i in results
                if s_lower in str(i.get("location", "")).lower()
                or s_lower in str(i.get("description", "")).lower()
                or s_lower in str(i.get("incident_code", "")).lower()
                or s_lower in str(i.get("hazard_type", "")).lower()
                or s_lower in str(i.get("reporter_name", "")).lower()
            ]

        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return results

    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Calculates aggregated metrics for safety dashboard."""
        with self._lock:
            all_incidents = list(self.incidents.values())
            all_users = list(self.users.values())

        total = len(all_incidents)
        open_count = sum(1 for i in all_incidents if i.get("status") in ["REPORTED", "IN_PROGRESS"])
        high_risk_count = sum(1 for i in all_incidents if i.get("severity") in ["High", "Critical"] or (i.get("risk_score") or 0) >= 60)
        resolved_count = sum(1 for i in all_incidents if i.get("status") in ["RESOLVED", "CLOSED"])

        scores = [i.get("risk_score") for i in all_incidents if i.get("risk_score") is not None]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        category_counts: Dict[str, int] = {}
        for inc in all_incidents:
            cat = inc.get("category") or "Other"
            category_counts[cat] = category_counts.get(cat, 0) + 1

        severity_counts: Dict[str, int] = {}
        for inc in all_incidents:
            sev = inc.get("severity") or "Low"
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

        sorted_recent = sorted(all_incidents, key=lambda x: x.get("created_at", ""), reverse=True)[:5]

        # Extract unique reporters
        reporters_map: Dict[str, Dict[str, Any]] = {}
        for inc in all_incidents:
            rep_name = inc.get("reporter_name", "Anonymous Reporter")
            if rep_name not in reporters_map:
                reporters_map[rep_name] = {
                    "name": rep_name,
                    "email": inc.get("reporter_email", f"{rep_name.lower().replace(' ', '.')}@facility.internal"),
                    "incidents_count": 0,
                    "latest_incident": inc.get("created_at")
                }
            reporters_map[rep_name]["incidents_count"] += 1

        return {
            "total_incidents": total,
            "open_incidents": open_count,
            "high_risk_incidents": high_risk_count,
            "resolved_incidents": resolved_count,
            "average_risk_score": avg_score,
            "category_counts": category_counts,
            "severity_counts": severity_counts,
            "total_reporters": len(reporters_map),
            "reporters_list": list(reporters_map.values()),
            "recent_incidents": sorted_recent
        }

store = DataStore()
