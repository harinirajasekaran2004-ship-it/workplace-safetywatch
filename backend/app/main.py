import os
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.api.incidents import router as incidents_router
from app.api.dashboard import router as dashboard_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("safetywatch")

# LangSmith Environment Setup
if settings.LANGCHAIN_API_KEY:
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT
    os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
    os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGCHAIN_ENDPOINT
    logger.info(f"LangSmith Tracing active for project '{settings.LANGCHAIN_PROJECT}'")

app = FastAPI(
    title="Workplace SafetyWatch API",
    description="Multi-Agent Workplace Hazard Detection and Incident Management System",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development & Vercel/Railway previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local upload directory if it exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(incidents_router)
app.include_router(dashboard_router)

@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Workplace SafetyWatch API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "endpoints": {
            "docs": "/docs",
            "incidents_analyze": "/api/incidents/analyze",
            "incidents_list": "/api/incidents",
            "dashboard_stats": "/api/dashboard/stats",
            "safety_rules": "/api/safety-rules"
        }
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "groq_configured": bool(settings.GROQ_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://your-project"))
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred during safety analysis. Our engineering team has been notified."
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
