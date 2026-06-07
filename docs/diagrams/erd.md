# Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        int id PK
        string email
        string password_hash
        string role
        datetime created_at
    }

    LOG {
        int id PK
        string filename
        string source
        text content
        int uploaded_by FK
        datetime created_at
    }

    ALERT {
        int id PK
        int log_id FK
        string severity
        string status
        text message
        string malware_family
        datetime created_at
    }

    TRIAGE_HISTORY {
        int id PK
        int alert_id FK
        int triaged_by FK
        text ai_response
        text remediation
        datetime created_at
    }

    USER ||--o{ LOG : "uploads"
    USER ||--o{ TRIAGE_HISTORY : "performs"
    LOG ||--o{ ALERT : "generates"
    ALERT ||--o{ TRIAGE_HISTORY : "has"
```

## Notes

- `ALERT.log_id` is nullable. Alerts generated from IoT submissions are not linked to a log file.
- `ALERT.malware_family` is nullable. Only populated for IoT-sourced alerts where the model is loaded and returns a valid prediction.
- `ALERT.severity` is one of: low, medium, high, critical.
- `ALERT.status` is one of: open, triaged, resolved.
- `USER.role` is one of: admin, analyst, viewer.
