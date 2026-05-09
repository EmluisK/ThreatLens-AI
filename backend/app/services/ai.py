import json
import re
import httpx
from app.config import settings


def extract_context(log_content: str, flagged_line: str, window: int = 5) -> str:
    lines = log_content.splitlines()
    for i, line in enumerate(lines):
        if flagged_line.strip() in line:
            start = max(0, i - window)
            end = min(len(lines), i + window + 1)
            snippet = lines[start:end]
            return "\n".join(
                f"{'>>>' if j + start == i else '   '} {line}"
                for j, line in enumerate(snippet)
            )
    return flagged_line


async def triage_alert(message: str, severity: str, log_content: str = "") -> dict:
    if log_content:
        context = extract_context(log_content, message)
        context_block = f"\nLog context (>>> marks the flagged line):\n{context}\n"
    else:
        context_block = ""

    prompt = f"""You are a security analyst AI. Analyze the following alert and respond only with a JSON object, no markdown, no explanation.

Alert severity: {severity}
Alert message: {message}
{context_block}
Respond with exactly this JSON structure, both values must be plain strings:
{{"summary": "one or two sentences explaining what this alert means based on the context", "remediation": "concrete actionable steps to address this alert as a single string"}}"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False}
            )
            response.raise_for_status()
            raw = response.json().get("response", "").strip()

            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
                summary = parsed.get("summary", "")
                remediation = parsed.get("remediation", "")
                if isinstance(remediation, list):
                    remediation = " ".join(
                        item.get("action", str(item)) if isinstance(item, dict) else str(item)
                        for item in remediation
                    )
                if summary:
                    return {"summary": str(summary), "remediation": str(remediation)}
    except Exception as e:
        print(f"[ai] triage error: {e}")

    return {
        "summary": "AI triage unavailable. Manual review required.",
        "remediation": "Please review this alert manually."
    }
