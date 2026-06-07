# Meeting Report - Week 3

**Date:** April 14, 2026
**Location:** University Metropolitan Tirana
**Attendees:** EK, AD, GZ, EI, SD, FH

---

## Discussion

The team reviewed what had been built so far and identified what needed to be completed before the backend and frontend could be connected.

AD presented the completed authentication system including password hashing with bcrypt, JWT token creation and decoding, and the OAuth2 login endpoint. The role-based access dependency was also done and would be used across all protected routes. AD and EI reviewed the full route structure together to make sure all endpoints followed the same auth pattern.

EK reviewed Ollama local deployment options and evaluated which model configuration would work best for the triage use case. The team discussed how the triage panel should sit within the Analyst dashboard and how it connects to the backend alert flow.

SD shared example prompt cases built that week, covering single-alert scenarios, multi-line log context, and noisy logs, along with expected JSON outputs. These were shared with EI for backend contract alignment and with EK for prompt tuning.

GZ and FH discussed the plan for the frontend scaffold. GZ focused on client-side routing for the three dashboards and the authentication flow. FH began planning the Viewer dashboard structure using tabbed navigation.

## Decisions

- Authentication system complete and shared pattern confirmed for all routes
- Triage prompt design updated to include surrounding log context window
- Frontend routing structure agreed upon: protected routes redirecting based on user role

## Tasks Assigned

| Member | Task |
|---|---|
| EK | Continue evaluating Ollama model options, finalize triage prompt design |
| AD | Begin building admin backend endpoints |
| EI | Research endpoint design for log ingestion and alert generation |
| GZ | Build React and Vite scaffold with routing and authentication flow |
| FH | Begin planning Analyst dashboard page structure |
| SD | Integrate prompt tests into a local test harness, continue refining output stability |
