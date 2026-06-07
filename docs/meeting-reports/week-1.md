# Meeting Report - Week 1

**Date:** April 6, 2026
**Location:** University Metropolitan Tirana
**Attendees:** EK, AD, GZ, EI, SD, FH

---

## Discussion

The team met for the first time to agree on a project idea and define the scope. Three candidate ideas were evaluated and ThreatLens AI was selected: a full-stack security log analyzer and alert triage platform with role-based access and local AI integration.

The team discussed the overall architecture and agreed on the tech stack: FastAPI for the backend, PostgreSQL for the database, React with Vite and Tailwind CSS for the frontend, and Ollama for running a local language model to handle alert triage.

## Decisions

- Project selected: ThreatLens AI
- Tech stack confirmed: FastAPI, PostgreSQL, React, Vite, Tailwind CSS, Ollama
- Three user roles defined: Security Admin, SOC Analyst, Viewer
- Communication channel: WhatsApp group, minimum once daily check-in

## Tasks Assigned

| Member | Task |
|---|---|
| EK | Research Ollama local deployment, lead prompt architecture and JSON output schema design for alert triage |
| AD | Set up FastAPI project structure, design PostgreSQL schema, configure database connection |
| EI | Assist AD with backend structure and database setup |
| GZ | Set up React and Vite project, scaffold main pages, configure client-side routing |
| FH | Assist GZ with page scaffolding, focus on Analyst and Viewer dashboards |
| SD | Research local LLM deployment options, review Ollama requirements, begin planning triage output schema |
