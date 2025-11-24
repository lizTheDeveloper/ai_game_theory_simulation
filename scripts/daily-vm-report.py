#!/usr/bin/env python3
"""
Daily VM Report - Sends summary to lizthedeveloper via Matrix DM.
Uses Morgan bot (@agent-morgan:themultiverse.school)
"""

import os
import sys
import json
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
import subprocess

HOMESERVER = "https://matrix.themultiverse.school"
AGENT_NAME = "morgan"
DM_ROOM_ID = os.getenv("MATRIX_DM_ROOM_LIZTHEDEVELOPER", "")

def load_env():
    env_path = Path.home() / ".superalignment-env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value.strip('"').strip("'")

load_env()

PROJECT_DIR = Path("/home/lizthedeveloper_gmail_com/ai_game_theory_simulation")
LOGS_DIR = PROJECT_DIR / "logs" / "autonomous"

def get_token():
    return os.getenv("MATRIX_TOKEN_MORGAN", "") or os.getenv("MATRIX_TOKEN_MONITOR", "")

def analyze_worker_logs(since_hours=24):
    cutoff = datetime.now() - timedelta(hours=since_hours)
    stats = {"runs": 0, "successful": 0, "failed": 0, "prs_created": 0, "errors": []}

    for log_file in LOGS_DIR.glob("worker_*.log"):
        try:
            if datetime.fromtimestamp(log_file.stat().st_mtime) < cutoff:
                continue
            stats["runs"] += 1
            content = log_file.read_text()
            if "WORKER CYCLE COMPLETE" in content:
                stats["successful"] += 1
            if "error" in content.lower() or "failed" in content.lower():
                stats["failed"] += 1
                for line in content.split('\n'):
                    if 'error' in line.lower():
                        stats["errors"].append(line[:100])
            stats["prs_created"] += content.count("pull request created")
        except:
            pass
    return stats

def analyze_researcher_logs(since_hours=24):
    cutoff = datetime.now() - timedelta(hours=since_hours)
    stats = {"runs": 0, "successful": 0}
    researcher_dir = LOGS_DIR / "researcher"

    for log_file in researcher_dir.glob("researcher_*.log"):
        try:
            if datetime.fromtimestamp(log_file.stat().st_mtime) < cutoff:
                continue
            stats["runs"] += 1
            if "COMPLETE" in log_file.read_text():
                stats["successful"] += 1
        except:
            pass
    return stats

def check_system_health():
    health = {"channel_monitor": False, "disk_ok": True, "git_clean": True}
    try:
        result = subprocess.run(["pgrep", "-f", "channel-monitor"], capture_output=True)
        health["channel_monitor"] = result.returncode == 0
    except:
        pass
    try:
        result = subprocess.run(["df", "-h", "/"], capture_output=True, text=True)
        lines = result.stdout.strip().split('\n')
        if len(lines) > 1:
            usage = int(lines[1].split()[4].replace('%', ''))
            health["disk_ok"] = usage < 90
    except:
        pass
    try:
        result = subprocess.run(["git", "status", "--porcelain"], cwd=PROJECT_DIR, capture_output=True, text=True)
        health["git_clean"] = "UU " not in result.stdout
    except:
        pass
    return health

def generate_report():
    now = datetime.now()
    worker = analyze_worker_logs(24)
    researcher = analyze_researcher_logs(24)
    health = check_system_health()

    h = lambda x: "OK" if x else "ISSUE"
    report = [
        f"## Daily VM Report - {now.strftime('%Y-%m-%d')}",
        "",
        "### System Health",
        f"- Channel Monitor: {h(health['channel_monitor'])}",
        f"- Disk Space: {h(health['disk_ok'])}",
        f"- Git Status: {h(health['git_clean'])}",
        "",
        "### Worker Activity (24h)",
        f"- Runs: {worker['runs']} | Success: {worker['successful']} | Failed: {worker['failed']}",
        f"- PRs Created: {worker['prs_created']}",
        "",
        "### Researcher Activity (24h)",
        f"- Runs: {researcher['runs']} | Successful: {researcher['successful']}",
        "",
    ]
    if worker['errors']:
        report.extend(["### Recent Errors"] + [f"- {e}" for e in worker['errors'][:3]] + [""])
    report.append(f"_Generated at {now.strftime('%H:%M:%S UTC')}_")
    return "\n".join(report)

async def send_dm(message: str):
    try:
        from nio import AsyncClient, RoomSendResponse
    except ImportError:
        print("matrix-nio not installed")
        print("\n=== DAILY VM REPORT ===\n" + message)
        return False

    token = get_token()
    if not token or not DM_ROOM_ID:
        print("Missing token or DM room ID")
        print("\n=== DAILY VM REPORT ===\n" + message)
        return False

    client = AsyncClient(HOMESERVER, f"@agent-{AGENT_NAME}:themultiverse.school")
    client.access_token = token
    client.device_id = f"{AGENT_NAME.upper()}_DEVICE"

    try:
        response = await client.room_send(
            room_id=DM_ROOM_ID,
            message_type="m.room.message",
            content={"msgtype": "m.text", "body": message}
        )
        if isinstance(response, RoomSendResponse):
            print(f"Report sent (event_id: {response.event_id})")
            return True
        print(f"Failed: {response}")
        return False
    finally:
        await client.close()

def main():
    print(f"[{datetime.now()}] Generating daily VM report...")
    report = generate_report()
    asyncio.run(send_dm(report))
    log_file = LOGS_DIR / f"daily_report_{datetime.now().strftime('%Y%m%d')}.md"
    log_file.write_text(report)
    print(f"Report saved to {log_file}")

if __name__ == "__main__":
    main()
