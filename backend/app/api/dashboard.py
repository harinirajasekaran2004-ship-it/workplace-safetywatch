from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas.incident import DashboardStats, MatchedRule
from app.db.store import store
from app.db.safety_rules_data import DEFAULT_SAFETY_RULES

router = APIRouter(prefix="/api", tags=["Dashboard & Rules"])

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_statistics():
    """
    Returns aggregated metrics: total, open, high-risk, resolved, average risk score,
    category distribution, and recent incidents.
    """
    stats_data = store.get_dashboard_stats()
    return DashboardStats(**stats_data)

@router.get("/safety-rules", response_model=List[Dict[str, Any]])
@router.get("/rules", response_model=List[Dict[str, Any]])
def get_safety_rules():
    """
    Returns the curated safety rules catalog used for compliance matching.
    """
    return DEFAULT_SAFETY_RULES
