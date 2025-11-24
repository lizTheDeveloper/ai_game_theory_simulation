#!/usr/bin/env python3
"""
Morgan Command Monitor - Watches DMs and executes Claude Code commands.
Uses Morgan bot (@agent-morgan:themultiverse.school)
"""

import os
import sys
import json
import asyncio
import subprocess
import time
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

HOMESERVER = "https://matrix.themultiverse.school"
AGENT_NAME = "morgan"
PROJECT_DIR = Path("/home/lizthedeveloper_gmail_com/ai_game_theory_simulation")
POLL_INTERVAL = 30
ALLOWED_USERS = ["@lizthedeveloper:themultiverse.school"]
STATE_FILE = Path.home() / ".claude/morgan-command-state.json"
LOG_DIR = Path.home() / ".claude/logs"

LOG_DIR.mkdir(parents=True, exist_ok=True)
STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

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

DM_ROOM_ID = os.getenv("MATRIX_DM_ROOM_LIZTHEDEVELOPER", "")
TOKEN = os.getenv("MATRIX_TOKEN_MORGAN", "")

def log(msg: str):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}", flush=True)

def load_state() -> Dict[str, Any]:
    if STATE_FILE.exists():
        try:
            return json.load(open(STATE_FILE))
        except:
            pass
    return {"last_event_id": None, "commands_today": 0, "last_date": None}

def save_state(state: Dict[str, Any]):
    state["last_check"] = datetime.now().isoformat()
    json.dump(state, open(STATE_FILE, 'w'), indent=2)

async def get_client():
    try:
        from nio import AsyncClient
    except ImportError:
        log("ERROR: pip install matrix-nio")
        return None
    if not TOKEN:
        log("ERROR: MATRIX_TOKEN_MORGAN not set")
        return None
    client = AsyncClient(HOMESERVER, f"@agent-{AGENT_NAME}:themultiverse.school")
    client.access_token = TOKEN
    client.device_id = f"{AGENT_NAME.upper()}_DEVICE"
    return client

async def fetch_messages(client, room_id: str):
    try:
        from nio import RoomMessagesResponse
        response = await client.room_messages(room_id=room_id, start="", limit=10, direction="b")
        if isinstance(response, RoomMessagesResponse):
            return [{"event_id": e.event_id, "sender": e.sender, "body": e.body, "ts": e.server_timestamp}
                    for e in response.chunk if hasattr(e, 'body')]
        return []
    except Exception as e:
        log(f"Fetch error: {e}")
        return []

async def send_msg(client, room_id: str, msg: str):
    try:
        from nio import RoomSendResponse
        r = await client.room_send(room_id, "m.room.message", {"msgtype": "m.text", "body": msg})
        return isinstance(r, RoomSendResponse)
    except:
        return False

def execute_claude(prompt: str) -> str:
    log(f"Executing: {prompt[:80]}...")
    ts = int(time.time())
    log_file = LOG_DIR / f"morgan_cmd_{ts}.log"

    try:
        result = subprocess.run(
            ["claude", "--print", "--dangerously-skip-permissions", "--output-format", "text"],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=300,
            cwd=PROJECT_DIR
        )
        with open(log_file, 'w') as f:
            f.write(f"Prompt: {prompt}\nExit: {result.returncode}\nStdout:\n{result.stdout}\nStderr:\n{result.stderr}")

        output = result.stdout
        if len(output) > 2000:
            output = output[:1900] + "\n\n[truncated]"
        if result.returncode != 0:
            output = f"Exit {result.returncode}:\n{result.stderr[:500]}\n\n{output}"
        return output
    except subprocess.TimeoutExpired:
        return "Timed out (5 min)"
    except Exception as e:
        return f"Error: {e}"

async def process_msg(client, room_id: str, msg: Dict, state: Dict):
    if msg["sender"] not in ALLOWED_USERS:
        return
    if msg["sender"] == f"@agent-{AGENT_NAME}:themultiverse.school":
        return
    if state.get("last_event_id") == msg["event_id"]:
        return

    today = datetime.now().date().isoformat()
    if state.get("last_date") != today:
        state["commands_today"] = 0
        state["last_date"] = today

    if state["commands_today"] >= 50:
        await send_msg(client, room_id, "Daily limit (50) reached")
        return

    log(f"Command from {msg['sender']}: {msg['body'][:80]}")
    await send_msg(client, room_id, "Executing...")

    output = execute_claude(msg["body"])
    await send_msg(client, room_id, f"Result:\n\n{output}")

    state["last_event_id"] = msg["event_id"]
    state["commands_today"] += 1
    save_state(state)
    log(f"Done. Commands today: {state['commands_today']}")

async def main_loop():
    log("Starting Morgan Command Monitor...")
    if not DM_ROOM_ID:
        log("ERROR: MATRIX_DM_ROOM_LIZTHEDEVELOPER not set")
        sys.exit(1)

    client = await get_client()
    if not client:
        sys.exit(1)

    state = load_state()
    log(f"Room: {DM_ROOM_ID}")

    try:
        while True:
            try:
                msgs = await fetch_messages(client, DM_ROOM_ID)
                for m in reversed(msgs):
                    if state.get("last_event_id") and m["event_id"] <= state.get("last_event_id", ""):
                        continue
                    await process_msg(client, DM_ROOM_ID, m, state)
                save_state(state)
            except Exception as e:
                log(f"Error: {e}")
            await asyncio.sleep(POLL_INTERVAL)
    except KeyboardInterrupt:
        log("Shutting down")
    finally:
        await client.close()

if __name__ == "__main__":
    log("=" * 40)
    log("Morgan Command Monitor")
    log("=" * 40)
    asyncio.run(main_loop())
