from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.configuration.settings import get_settings
from app.repository.database import connect_to_mongo, close_mongo_connection, get_database, init_indexes
from app.authentication.router import auth_router, admin_router
from app.authentication.service import UserService

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await init_indexes()
    # Seed initial admin user
    db = get_database()
    user_service = UserService(db)
    await user_service.create_initial_admin_if_not_exists()
    yield
    # Shutdown
    await close_mongo_connection()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.ingestion.router import router as ingestion_router
from app.search.router import router as search_router
from app.monitoring.router import router as monitoring_router
from app.documents.router import router as documents_router

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(ingestion_router)
app.include_router(search_router)
app.include_router(monitoring_router)
app.include_router(documents_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "app_name": settings.app_name}
