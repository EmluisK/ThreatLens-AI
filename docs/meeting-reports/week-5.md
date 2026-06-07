# Meeting Report - Week 5

**Date:** May 9, 2026
**Location:** Remote (WhatsApp)
**Attendees:** EK, AD, GZ, EI, SD, FH

---

## Discussion

This was the main integration week. EK coordinated the full development kickoff and the team focused on connecting all the pieces that had been built separately.

AD completed the AI triage service, building the layer that constructs the context window from surrounding log lines, sends the prompt to Ollama, and parses the structured JSON response back into the triage schema. The anomaly detection step was also integrated into the log ingest pipeline so alerts are created automatically when a log is submitted. AD and EI worked together to wire all backend services into a consistent end-to-end flow.

EI implemented the analyst backend endpoints covering alert listing, log retrieval by ID, triage history, and the alert triage submission endpoint. The viewer endpoints for the stats dashboard and read-only alert listing were also completed. EI also built the external log ingest API at POST /ingest/logs, which allows authenticated external applications to push log content directly to the platform.

EK and SD validated the full end-to-end flow from log upload through anomaly detection to AI triage output. A model connection issue was resolved during testing. SD compared AI triage outputs against the expected JSON schema and proposed refinements to the prompts for clearer and more consistent responses.

GZ set up the React and Vite frontend project with Tailwind CSS and configured the Vite proxy to route API calls to the backend. The landing page, login page with password reveal toggle, and the shared dashboard layout component were completed. GZ chose IBM Plex fonts and a navy color palette for a clinical, professional look and configured protected routes with role-based redirects.

FH built all three role-based dashboards and connected them to the backend through an Axios API service layer with JWT auth headers.

## Decisions

- Ollama model confirmed as llama3.1:8b for the final integration
- External log ingest API included to support real-time log forwarding from external systems
- Frontend design system settled on IBM Plex fonts and navy color palette

## Tasks Assigned

| Member | Task |
|---|---|
| EK | Coordinate IoT malware classification feature, review dataset and model approach |
| AD | Implement IoT classifier service and update Alert model |
| EI | Implement IoT ingest endpoints |
| GZ | Add IoT Classifier navigation to the Admin dashboard layout |
| FH | Build IoT Classifier UI component and update Audit Log table |
| SD | Run the training pipeline on the CIC-YNU-IoTMal dataset and export model artifacts |
