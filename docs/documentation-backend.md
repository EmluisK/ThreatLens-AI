# ThreatLens AI - Backend Documentation

Written by AD and EI.

---

## Overview

The backend is a REST API built with FastAPI and Python. It handles authentication, log ingestion, anomaly detection, AI-powered alert triage, and IoT malware classification. All data is stored in a PostgreSQL database using SQLAlchemy as the ORM.

---

## Tech Stack

| Component | Technology | Reason |
|---|---|---|
| Framework | FastAPI | Async support, automatic docs at /docs, clean dependency injection |
| Database | PostgreSQL | Relational structure fits the alert and triage data model |
| ORM | SQLAlchemy | Straightforward model definitions, easy session management |
| Auth | JWT + bcrypt | Stateless tokens, passwords never stored in plain text |
| Anomaly Detection | scikit-learn Isolation Forest | Unsupervised, works without labeled training data |
| IoT Classification | LightGBM | Handles high-dimensional tabular features efficiently, fast inference |
| AI Triage | Ollama (local LLM) | Keeps inference local, no external API dependency |

---

## Project Structure

```
backend/
  app/
    main.py              entry point, app setup, startup migrations
    config.py            environment variable loading
    database.py          SQLAlchemy engine and session factory
    models/
      user.py            User model and UserRole enum
      log.py             Log model
      alert.py           Alert, TriageHistory models and enums
    routes/
      auth.py            login and registration endpoints
      admin.py           user management, log upload, audit log
      analyst.py         alert listing, log retrieval, triage
      viewer.py          read-only dashboard and alert endpoints
      ingest.py          external log ingest API
      iot.py             IoT sample submission and classifier status
    services/
      auth.py            password hashing, token creation, user lookup
      anomaly.py         feature extraction and Isolation Forest
      ai.py              context extraction and Ollama prompt
      iot_classifier.py  LightGBM model loading and inference
      deps.py            auth dependencies for route protection
    ml_artifacts/
      iot_fusion_model.txt   trained LightGBM model
      iot_meta.json          feature column list and class labels
```

---

## Database Design

Four tables cover the full data model:

**users** stores registered accounts with hashed passwords and a role field (admin, analyst, viewer).

**logs** stores uploaded log files as raw text content alongside the filename, source label, and a reference to the user who uploaded it.

**alerts** stores individual flagged entries. Each alert has a severity level, a status (open, triaged, resolved), the flagged message, and an optional malware_family field used for IoT-sourced alerts. The log_id foreign key is nullable because IoT alerts are not linked to a log file.

**triage_history** stores the result of each triage action: the AI-generated summary, the remediation steps, and a reference to the analyst who ran it.

Schema migrations for new columns run automatically on startup using idempotent `ALTER TABLE IF NOT EXISTS` statements in `main.py`, so the team does not need to run migration scripts manually.

---

## Authentication

Registration creates a user with a bcrypt-hashed password and assigns a role. Login accepts email and password, verifies the hash, and returns a signed JWT token containing the user email and role. All protected routes use a dependency that decodes the token and checks the role before the handler runs.

Three roles are supported:

- **admin** - full access including user management and log upload
- **analyst** - access to alerts, logs, and triage
- **viewer** - read-only access to processed alerts and dashboard stats

---

## Log Ingestion and Anomaly Detection

Logs can be submitted in two ways: file upload through the Admin dashboard (`POST /admin/upload_logs`) or directly via the external ingest API (`POST /ingest/logs`). Both paths store the raw content in the logs table and immediately run anomaly detection.

Anomaly detection uses Isolation Forest from scikit-learn. Each line of the log is turned into a four-dimensional feature vector:

- line length
- count of error-related keywords (error, fail, denied, critical, warn)
- number of IP addresses found in the line
- whether a port number pattern is present

The model is fit on the full log and flags lines with a prediction of -1 as anomalies. The anomaly score is then adjusted by the error keyword weight and mapped to a severity level:

| Adjusted Score | Severity |
|---|---|
| below -0.6 | critical |
| -0.6 to -0.4 | high |
| -0.4 to -0.2 | medium |
| above -0.2 | low |

An Alert record is created for each flagged line with the corresponding severity.

---

## AI Alert Triage

When an analyst triggers triage on an alert, the backend builds a context window of five lines above and below the flagged line in the original log. This context, along with the alert message and severity, is sent to the local Ollama instance as a structured prompt asking for a JSON response with two fields: `summary` and `remediation`.

The response is parsed with a regex to extract the JSON block, handles the case where remediation comes back as a list, and falls back to a manual review message if Ollama is unavailable or returns malformed output. The result is stored in triage_history and the alert status is updated to triaged.

The model used is configurable via the `OLLAMA_MODEL` environment variable. The default is `llama3.1:8b`.

---

## IoT Malware Classification

The IoT classifier uses a LightGBM fusion model trained on the CIC-YNU-IoTMal dataset. The model was trained across four architectures (arm, mips, mipsel, x86) using behavioral features from three data sources:

- **pcap** - network capture statistics
- **SAR** - system activity reports
- **strace** - system call traces

The training notebook (`iot_malware_detection.ipynb`) handles data cleaning, zero-variance feature removal, gain-based selection of the top 100 features, and model training. After training it exports two artifacts to `backend/app/ml_artifacts/`:

- `iot_fusion_model.txt` - the serialized LightGBM booster
- `iot_meta.json` - the ordered list of the 100 feature columns and the five class labels

The classifier service loads these on backend startup. When a sample is submitted via `POST /ingest/iot`, the service aligns the incoming feature dictionary to the expected 100 columns (filling missing ones with zero), runs inference, and returns the predicted family and per-class probabilities.

Severity is derived from the predicted family and confidence:

| Family | Base Severity |
|---|---|
| Mirai | critical |
| DarkNexus | critical |
| Gafgyt | high |
| Generic | high |
| Benign | low |

If the confidence score is below 50 percent the severity is capped at medium regardless of family. If the model artifacts are not present the endpoint still accepts submissions but returns low severity and sets `model_ready: false` in the response.

---

## API Overview

| Method | Path | Role | Description |
|---|---|---|---|
| POST | /auth/register | open | Create a new user account |
| POST | /auth/login | open | Log in and receive a JWT token |
| GET | /auth/me | any | Get current user info |
| GET | /admin/users | admin | List all users |
| DELETE | /admin/users/{id} | admin | Delete a user |
| POST | /admin/upload_logs | admin | Upload a log file |
| GET | /admin/logs | admin | List all uploaded logs |
| GET | /admin/audit | admin | View all alerts |
| GET | /analyst/alerts | analyst, admin | List all alerts |
| GET | /analyst/logs/{id} | analyst, admin | Get a log file by ID |
| POST | /analyst/alerts/{id}/triage | analyst, admin | Run AI triage on an alert |
| GET | /analyst/triage_history | analyst, admin | View triage history |
| GET | /viewer/dashboard | viewer, analyst, admin | Get alert count by status |
| GET | /viewer/alerts | viewer, analyst, admin | List processed alerts |
| POST | /ingest/logs | any authenticated | Submit log content via API |
| POST | /ingest/iot | any authenticated | Submit IoT sample for classification |
| GET | /ingest/iot/status | any authenticated | Check if IoT model is loaded |
