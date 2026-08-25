# Project Overview

**Workplace SafetyWatch** is an end-to-end multi-agent AI system engineered to detect workplace safety hazards from photographs and telemetry, classify hazard categories, compute explainable risk scores, match actionable safety compliance rules, generate formal incident reports, alert responsible managers, and track incident remediation to completion.

---

## Quick Links to Vault Notes
- [[Problem Statement]] — Industrial safety challenges and objectives
- [[Architecture]] — Full-stack system design & component interaction
- [[Agent Design]] — The 7 specialized LangGraph agent nodes
- [[LangGraph Workflow]] — State machine, branching, and retry resilience
- [[Risk Scoring Rubric]] — Mathematical formulation and priority mapping
- [[Supabase Schema]] — PostgreSQL relational design & image storage
- [[API Documentation]] — FastAPI REST routes and Pydantic schemas
- [[Testing Strategy]] — Unit tests, scenario validation, and error handling
- [[Evaluation]] — Confidence metrics and probabilistic evaluation
- [[Deployment]] — Railway (backend) and Vercel (frontend) rollout
- [[Future Enhancements]] — Video feeds, IoT telemetry, and automated OSHA filings

---

## Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, Lucide React
- **Backend:** Python 3.14, FastAPI, Pydantic v2
- **Orchestration:** [[LangGraph Workflow|LangGraph]]
- **Inference:** [[Agent Design|Groq LLM / Vision]]
- **Database & Storage:** [[Supabase Schema|Supabase Postgres & Storage]]
- **Observability:** LangSmith distributed tracing
- **Code Graph:** [[Architecture|Graphify Analysis]]
