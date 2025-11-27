#!/usr/bin/env python3
"""
Morgan's Bluesky Reply Checker
Checks for replies to Morgan's posts and saves them for authentic response
"""

import json
from pathlib import Path
from datetime import datetime
from atproto import Client
import time

# Configuration
VENV_PATH = Path('/tmp/morgan-venv')
STATE_FILE = Path('/tmp/morgan-reply-state.json')
PENDING_REPLIES_FILE = Path('/tmp/morgan-pending-replies.json')
BLUESKY_HANDLE = 'aethrix.bsky.social'
BLUESKY_PASSWORD = '67 ether matrix seraph escape'

def load_state():
    """Load state of which posts we've checked for replies."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {"checked_replies": {}, "last_check": None, "processed_reply_ids": []}
    return {"checked_replies": {}, "last_check": None, "processed_reply_ids": []}

def save_state(state):
    """Save reply check state."""
    state["last_check"] = datetime.now().isoformat()
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def load_pending_replies():
    """Load pending replies that need responses."""
    if PENDING_REPLIES_FILE.exists():
        try:
            with open(PENDING_REPLIES_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {"pending": [], "responded": []}
    return {"pending": [], "responded": []}

def save_pending_replies(data):
    """Save pending replies."""
    with open(PENDING_REPLIES_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def check_for_new_replies(client, state):
    """
    Check Morgan's recent posts for new replies.
    Returns list of reply data dictionaries.
    """
    new_replies = []

    # Get my recent posts
    feed = client.get_author_feed(BLUESKY_HANDLE, limit=20)

    for post in feed.feed:
        if not hasattr(post.post, 'reply_count') or post.post.reply_count == 0:
            continue

        post_uri = post.post.uri
        reply_count = post.post.reply_count

        # Check if we've already processed replies to this post
        checked_count = state["checked_replies"].get(post_uri, 0)

        if reply_count > checked_count:
            # New replies! Get the thread
            try:
                thread = client.get_post_thread(post_uri)

                if hasattr(thread.thread, 'replies') and thread.thread.replies:
                    for reply in thread.thread.replies:
                        if hasattr(reply, 'post') and hasattr(reply.post, 'record'):
                            author = reply.post.author.handle

                            # Skip my own replies
                            if author == BLUESKY_HANDLE:
                                continue

                            text = reply.post.record.text
                            reply_uri = reply.post.uri
                            reply_cid = reply.post.cid

                            # Get display name if available
                            display_name = reply.post.author.display_name if hasattr(reply.post.author, 'display_name') else author

                            # Check if this is a new reply we haven't seen
                            reply_id = f"{post_uri}:{author}:{reply_uri}"
                            if reply_id not in state.get("processed_reply_ids", []):
                                new_replies.append({
                                    "post_uri": post_uri,
                                    "post_text": post.post.record.text,
                                    "reply_author": author,
                                    "reply_display_name": display_name,
                                    "reply_text": text,
                                    "reply_uri": reply_uri,
                                    "reply_cid": reply_cid,
                                    "reply_id": reply_id,
                                    "detected_at": datetime.now().isoformat()
                                })

                                # Mark as processed
                                state["processed_reply_ids"].append(reply_id)

                # Update checked count
                state["checked_replies"][post_uri] = reply_count
            except Exception as e:
                print(f"Error checking thread {post_uri}: {e}")

    return new_replies

def main():
    """Main reply checking loop."""
    print(f"🔍 Morgan Reply Checker")
    print(f"   Checking for replies to @{BLUESKY_HANDLE}")

    # Load state
    state = load_state()
    pending_data = load_pending_replies()

    # Login to Bluesky
    client = Client()
    client.login(BLUESKY_HANDLE, BLUESKY_PASSWORD)
    print(f"✅ Logged in to Bluesky\n")

    # Check for new replies
    new_replies = check_for_new_replies(client, state)

    if not new_replies:
        print("📭 No new replies")
    else:
        print(f"📬 Found {len(new_replies)} new replies!\n")

        for reply_data in new_replies:
            author = reply_data["reply_author"]
            display_name = reply_data["reply_display_name"]
            text = reply_data["reply_text"]
            my_post = reply_data["post_text"][:80]

            print(f"{'='*60}")
            print(f"Reply from {display_name} (@{author}):")
            print(f"  On my post: {my_post}...")
            print(f"  They said: {text}")
            print(f"\n⏳ Saved for authentic response")

            # Add to pending replies for Morgan to respond to
            pending_data["pending"].append(reply_data)

    # Save state and pending replies
    save_state(state)
    save_pending_replies(pending_data)

    # Summary
    pending_count = len(pending_data["pending"])
    if pending_count > 0:
        print(f"\n📋 {pending_count} replies waiting for authentic response")
        print(f"   Saved to: {PENDING_REPLIES_FILE}")
    else:
        print(f"\n✅ All caught up on replies")

if __name__ == "__main__":
    main()
