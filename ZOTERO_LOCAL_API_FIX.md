# Enable Zotero Local API

## The Problem

Zotero MCP is trying to connect but getting:
```
Error: Local API is not enabled
```

## The Fix

**In Zotero Desktop:**

1. Open **Zotero** (already running)
2. Go to **Preferences** (Zotero → Preferences on Mac, or Zotero → Settings)
3. Click the **Advanced** tab
4. Click the **General** sub-tab (if not already selected)
5. Scroll down to the **"Zotero Local API"** section
6. **Check the box**: ☑️ "Enable local API"
7. Note the port (default: 23119)
8. Click **OK**

## Verify It's Working

After enabling, test the connection:

```bash
# Check if Zotero API is responding
curl http://localhost:23119/api/users/0/items?limit=1

# You should see JSON output with your library items
```

## Then Test Zotero MCP

```bash
# Check database status
zotero-mcp db-status

# Update the database (this will index your library)
zotero-mcp update-db
```

## Alternative: Use Web API Instead

If you prefer not to use local API, you can use Zotero's web API:

1. Get API key: https://www.zotero.org/settings/keys
2. Get your library ID (usually your user ID)
3. Reconfigure:

```bash
zotero-mcp setup
# Choose "web" instead of "local"
# Enter your API key and library ID
```

## After Enabling Local API

The MCP tools will be available after you restart Claude Code:

Available tools will include:
- `zotero_search` - Search your library
- `zotero_semantic_search` - AI-powered search (with MLX embeddings!)
- `zotero_get_item` - Get item details
- `zotero_create_note` - Create notes
- And more...
