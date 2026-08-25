# Graphify Architectural Analysis Report: Workplace SafetyWatch

## 1. Executive Summary

This Graphify relationship analysis maps the end-to-end multi-agent software architecture of **Workplace SafetyWatch**. The system decouples interactive client reporting (Next.js), high-throughput asynchronous execution (FastAPI), sequential/conditional AI orchestration (LangGraph), resilient persistence (Supabase Postgres & Storage), and complete lifecycle observability (LangSmith).

```mermaid
graph TD
    subgraph "Frontend Layer (Next.js + Tailwind CSS)"
        FE_APP[app/page.tsx]
        FE_EMP[EmployeeReportView]
        FE_MGR[ManagerDashboardView]
        FE_STATS[StatsOverview]
        FE_TIME[LiveAgentTimeline]
        FE_CONF[ConfidenceMetricsCard]
        FE_API[lib/api.ts]
        
        FE_APP --> FE_EMP
        FE_APP --> FE_MGR
        FE_APP --> FE_STATS
        FE_EMP --> FE_TIME
        FE_EMP --> FE_CONF
        FE_EMP --> FE_API
        FE_MGR --> FE_API
        FE_STATS --> FE_API
    end

    subgraph "Backend API Layer (FastAPI)"
        BE_API[FastAPI app/main.py]
        BE_R_INC[api/incidents.py]
        BE_R_DASH[api/dashboard.py]
        BE_SCHEMAS[schemas/incident.py]
        
        FE_API -->|HTTP REST / CORS| BE_API
        BE_API --> BE_R_INC
        BE_API --> BE_R_DASH
        BE_R_INC --> BE_SCHEMAS
    end

    subgraph "LangGraph Multi-Agent Pipeline"
        LG_FLOW[workflow.py: StateGraph]
        LG_STATE[state.py: SafetyWatchState]
        
        A1[1. Hazard Detection Agent]
        A2[2. Hazard Classification Agent]
        A3[3. Risk Assessment Agent]
        A4[4. Safety Rule & Compliance Agent]
        A5[5. Incident Report Agent]
        A6[6. Notification Agent]
        A7[7. Resolution Tracking Agent]
        
        BE_R_INC -->|invoke| LG_FLOW
        LG_FLOW --> LG_STATE
        LG_FLOW --> A1
        A1 -->|Hazard Detected| A2
        A1 -->|No Hazard| SAFE_EXIT[Early Exit]
        A2 --> A3
        A3 --> A4
        A4 --> A5
        A5 --> A6
        A6 --> A7
    end

    subgraph "External Services & Persistence"
        GROQ[Groq Vision / LLM Service]
        STORE[DataStore / Local DB]
        SUPABASE[(Supabase Postgres & Storage)]
        LANGSMITH[LangSmith Observability]
        
        A1 -.-> GROQ
        A2 -.-> GROQ
        A3 -.-> GROQ
        A4 -.-> GROQ
        
        BE_R_INC --> STORE
        BE_R_DASH --> STORE
        STORE -.-> SUPABASE
        LG_FLOW -.-> LANGSMITH
    end
```

---

## 2. Key Architecture Relationships

| Component | Connected To | Protocol / Dependency | Purpose |
| :--- | :--- | :--- | :--- |
| `EmployeeReportView` | `LiveAgentTimeline` | React Props | Live rendering of agent execution states (`waiting` $\to$ `running` $\to$ `completed` $\to$ `failed`) |
| `lib/api.ts` | `FastAPI (app/main.py)` | HTTP Fetch | Multipart image upload and REST querying |
| `api/incidents.py` | `LangGraph (workflow.py)` | In-process Python | Orchestration of 7 specialized agent nodes |
| `RiskAssessmentAgent` | Explainable Rubric Formula | Python Logic / Groq | Computes $(S \times L / 25) \times 100$ risk score |
| `SafetyRuleAgent` | `safety_rules_data.py` | Relational Search | Compliance standard matching and corrective action |
| `NotificationAgent` | Simulation / Alert Log | Internal Dispatch | Manager escalation for High/Critical incidents |
| `workflow.py` | `LangSmith` | OpenTelemetry Traces | Emits execution step latencies and run traces |
