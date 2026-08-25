# Architecture

The system architecture follows a decoupled, resilient microservices approach:

## Component Topology

```mermaid
graph TD
    User([Employee / Manager]) <--> FE[Next.js Frontend / Vercel]
    FE <-->|REST API / CORS| BE[FastAPI Server / Railway]
    BE <--> LG[LangGraph Multi-Agent Engine]
    LG <--> AG1[[Agent 1: Detection]]
    LG <--> AG2[[Agent 2: Classification]]
    LG <--> AG3[[Agent 3: Risk Assessment]]
    LG <--> AG4[[Agent 4: Safety Rules]]
    LG <--> AG5[[Agent 5: Incident Report]]
    LG <--> AG6[[Agent 6: Notification]]
    LG <--> AG7[[Agent 7: Resolution]]
    LG <--> GROQ[Groq Vision & LLM APIs]
    BE <--> DB[(Supabase Postgres & Storage)]
    LG -.-> LS[LangSmith Observability]
```

## Layers
1. **Frontend:** React, Next.js App Router, Tailwind CSS, Lucide icons.
2. **Backend Gateway:** FastAPI async server with strict Pydantic models ([[API Documentation]]).
3. **Multi-Agent Pipeline:** Seven dedicated nodes orchestrated by [[LangGraph Workflow]].
4. **Data Persistence:** Relational tables and image bucket storage in [[Supabase Schema]].
5. **Observability:** Distributed tracing and latency tracking via LangSmith.

See also: [[Agent Design]], [[LangGraph Workflow]], [[Supabase Schema]], [[Deployment]].
