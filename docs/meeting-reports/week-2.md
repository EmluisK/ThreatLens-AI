# Meeting Report - Week 2

**Date:** April 8, 2026
**Location:** University Metropolitan Tirana
**Attendees:** EK, AD, GZ, EI, SD, FH

---

## Discussion

The team reviewed progress from the first week and aligned on implementation details for each module.

AD and EI discussed the database schema and agreed on the relationships between the User, Log, Alert, and Triage tables, including which fields should be required and which nullable. AD set up the FastAPI project structure, SQLAlchemy engine, and the session dependency that all routes would use.

GZ presented findings on React, Vite, and Tailwind CSS to the team. The team confirmed this as the frontend stack and GZ began reviewing component patterns and dashboard layout options alongside FH.

EK continued planning the Ollama integration, focusing on prompt design and the structured JSON output schema that the triage endpoint would return. SD drafted initial prompt templates and proposed the required fields for triage responses: severity, summary, indicators, and confidence. EK and SD aligned on the output contract.

## Decisions

- SQLAlchemy models confirmed for User, Log, Alert, and TriageHistory
- Frontend stack finalized: React, Vite, Tailwind CSS
- Triage JSON output schema drafted with fields for summary, remediation, severity, and confidence
- Candidate models reviewed: Mistral and Llama family noted as options for local deployment

## Tasks Assigned

| Member | Task |
|---|---|
| EK | Continue Ollama architecture research, finalize JSON output schema |
| AD | Finalize SQLAlchemy models and database session setup |
| EI | Review backend requirements for log ingestion and anomaly scoring endpoints |
| GZ | Begin scaffolding React pages and configuring routing |
| FH | Review Tailwind component patterns for the Analyst dashboard |
| SD | Produce example prompt and response pairs to use as endpoint contract tests |
