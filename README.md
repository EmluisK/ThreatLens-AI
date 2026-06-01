# ThreatLens AI

A full-stack security log analyzer and alert triage platform built for the Advanced Software Engineering course. It ingests system and network logs, runs anomaly detection using machine learning, and uses a local LLM to automatically analyze flagged alerts and suggest remediation steps.

Three user roles are supported: Security Admin, SOC Analyst, and Viewer, each with their own dashboard and access level.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | PostgreSQL |
| AI/ML | Ollama (local LLM) + scikit-learn + LightGBM |

## Project Structure

```
/frontend        React + Vite frontend
/backend         FastAPI backend
```

## Prerequisites

Before running the project you will need the following installed:

- Python 3.11 or higher
- Node.js 18 or higher
- PostgreSQL
- Ollama with at least one model pulled (we use llama3.1:8b)

To pull the model:

```bash
ollama pull llama3.1:8b
```

## Setup

### Database

Create a PostgreSQL database and user:

```bash
sudo -u postgres createdb threatlens
sudo -u postgres psql -c "CREATE USER youruser WITH SUPERUSER PASSWORD 'yourpassword';"
```

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

The `.env` file should look like this:

```
DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/threatlens
SECRET_KEY=pick-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
```

Start the backend:

```bash
uvicorn app.main:app --port 8000 --reload
```

The API will be running at `http://localhost:8000`. You can explore all available endpoints at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

### Create your first user

Once the backend is running, create an admin account by sending a POST request to the register endpoint:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yourorg.com", "password": "yourpassword", "role": "admin"}'
```

After that you can log in through the web interface and create additional users from the admin dashboard.

## How it works

The core flow is:

1. An admin uploads a log file through the dashboard or via the ingest API
2. The backend runs anomaly detection on the log using Isolation Forest and creates alerts for flagged lines
3. An analyst opens the alert in the Triage Console and runs AI triage
4. The local LLM analyzes the flagged line with surrounding log context and returns a plain-language summary and remediation steps
5. Viewers can monitor the overall alert status from their read-only dashboard

## IoT Malware Classification

ThreatLens includes a LightGBM-based classifier for IoT malware detection trained on the CIC-YNU-IoTMal dataset. It classifies IoT binaries into five families: Benign, Mirai, DarkNexus, Gafgyt, and Generic, using behavioral feature vectors derived from network captures (pcap), system activity reports (SAR), and syscall traces (strace).

### Model setup

The model artifacts are not included in the repository. To generate them, run all cells in `iot_malware_detection.ipynb`. The notebook requires the CIC-YNU-IoTMal dataset placed at `data/work/samples/` as 12 parquet files (`arm_pcap.parquet`, `mips_pcap.parquet`, etc., one per architecture per modality). After training, the notebook exports `iot_fusion_model.txt` and `iot_meta.json` to `backend/app/ml_artifacts/`. The backend loads them automatically on startup.

You can check whether the model is loaded:

```bash
curl http://localhost:8000/ingest/iot/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Submitting an IoT sample

```bash
curl -X POST http://localhost:8000/ingest/iot \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "abc123def456",
    "arch": "arm",
    "source": "iot-sandbox",
    "features": {
      "strace_Call_connect": 12500,
      "strace_Call_send": 8200,
      "pcap_Rate_mean": 950.0
    }
  }'
```

The response includes the predicted family, confidence score, per-class probabilities, and the ID of the alert created:

```json
{
  "alert_id": 12,
  "family": "Mirai",
  "confidence": 0.997,
  "severity": "critical",
  "model_ready": true,
  "probabilities": {
    "Benign": 0.001,
    "DarkNexus": 0.001,
    "Gafgyt": 0.0,
    "Generic": 0.001,
    "Mirai": 0.997
  }
}
```

Severity is derived from the predicted family and confidence. Mirai and DarkNexus map to critical, Gafgyt and Generic to high, and Benign to low. If the model artifacts are not present the endpoint still accepts submissions but returns low severity and marks `model_ready: false`.

The Admin dashboard includes an IoT Classifier tab where you can submit feature payloads through the UI and view classification results. The Audit Log table shows a FAMILY column for all IoT-sourced alerts.

## External Log Ingestion API

If you have another system collecting logs (a monitoring agent, a cron job, a SIEM forwarder), you can push logs directly to ThreatLens without going through the UI. This is useful when you want alerts to appear in real time as logs are generated rather than waiting for someone to upload a file manually.

### Authentication

First get a token by logging in:

```bash
curl -X POST http://localhost:8000/auth/login \
  -F "username=admin@yourorg.com" \
  -F "password=yourpassword"
```

You will get back a JSON response with an `access_token`. Use that token in the header for all subsequent requests.

### Sending logs

```bash
curl -X POST http://localhost:8000/ingest/logs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "nginx",
    "filename": "access-2026-05-09.log",
    "content": "your raw log content here"
  }'
```

The response tells you how many alerts were generated:

```json
{
  "log_id": 4,
  "alerts_generated": 3,
  "source": "nginx"
}
```

You can automate this with any script. A basic bash example that ships a log file every minute:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -F "username=admin@yourorg.com" \
  -F "password=yourpassword" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -X POST http://localhost:8000/ingest/logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"source\": \"syslog\", \"filename\": \"syslog-$(date +%F)\", \"content\": \"$(cat /var/log/syslog | tail -500 | sed 's/"/\\"/g')\"}"
```

Tokens expire after 60 minutes by default, so for long-running agents you should re-authenticate periodically or increase `ACCESS_TOKEN_EXPIRE_MINUTES` in your `.env`.

## Wiki

Team documentation, personal logs, and project design pages are in the [Wiki](../../wiki).


## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/EmluisK"><img src="https://avatars.githubusercontent.com/u/2083824?v=4?s=100" width="100px;" alt="Emluis Komino"/><br /><sub><b>Emluis Komino</b></sub></a><br /><a href="https://github.com/EmluisK/ThreatLens-AI/commits?author=Emluis" title="Code">💻</a> <a href="https://github.com/EmluisK/ThreatLens-AI/commits?author=Emluis" title="Documentation">📖</a> <a href="#ideas-Emluis" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-Emluis" title="Design">🎨</a> <a href="https://github.com/EmluisK/ThreatLens-AI/commits?author=Emluis" title="Tests">⚠️</a> <a href="https://github.com/EmluisK/ThreatLens-AI/issues?q=author%3AEmluis" title="Bug reports">🐛</a> <a href="https://github.com/EmluisK/ThreatLens-AI/pulls?q=is%3Apr+reviewed-by%3AEmluis" title="Reviewed Pull Requests">👀</a> <a href="#infra-Emluis" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#research-Emluis" title="Research">🔬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/franceskoh"><img src="https://avatars.githubusercontent.com/u/147883638?v=4?s=100" width="100px;" alt="franceskoh"/><br /><sub><b>franceskoh</b></sub></a><br /><a href="https://github.com/EmluisK/ThreatLens-AI/commits?author=franceskoh" title="Code">💻</a> <a href="https://github.com/EmluisK/ThreatLens-AI/commits?author=franceskoh" title="Documentation">📖</a> <a href="#ideas-franceskoh" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-franceskoh" title="Design">🎨</a> <a href="https://github.com/EmluisK/ThreatLens-AI/commits?author=franceskoh" title="Tests">⚠️</a> <a href="https://github.com/EmluisK/ThreatLens-AI/issues?q=author%3Afranceskoh" title="Bug reports">🐛</a> <a href="https://github.com/EmluisK/ThreatLens-AI/pulls?q=is%3Apr+reviewed-by%3Afranceskoh" title="Reviewed Pull Requests">👀</a> <a href="#infra-franceskoh" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#research-franceskoh" title="Research">🔬</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->


## Branching

Feature branches follow the naming convention `feature/name-or-feature`. Do not commit directly to main.
