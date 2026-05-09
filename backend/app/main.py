from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, admin, analyst, viewer, ingest

Base.metadata.create_all(bind=engine)

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


@app.get("/")
def root():
    return {"message": "ThreatLens AI API running"}
