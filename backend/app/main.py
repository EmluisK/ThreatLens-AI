from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine, Base
from app.routes import auth, admin, analyst, viewer, ingest
from app.routes import iot

Base.metadata.create_all(bind=engine)

# Idempotent schema migrations — safe to run on every startup
with engine.connect() as _conn:
    _conn.execute(text(
        "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS malware_family VARCHAR"
    ))
    _conn.execute(text(
        "ALTER TABLE alerts ALTER COLUMN log_id DROP NOT NULL"
    ))
    _conn.commit()

app = FastAPI(title="ThreatLens AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(analyst.router)
app.include_router(viewer.router)
app.include_router(ingest.router)
app.include_router(iot.router)


@app.get("/")
def root():
    return {"message": "ThreatLens AI API running"}
