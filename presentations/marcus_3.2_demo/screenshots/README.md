# MARCUS 3.2 Demo Screenshots

This directory contains backup screenshots for the MARCUS 3.2 live demo.

## Required Screenshots

1. **graphql_valid_citation.png** - GraphQL playground showing valid citation analysis
2. **graphql_invalid_citation.png** - GraphQL playground showing invalid citation detection
3. **grafana_throughput.png** - Grafana dashboard throughput graph
4. **grafana_latency.png** - Grafana dashboard latency histogram
5. **grafana_agents.png** - Grafana dashboard agent performance matrix
6. **cost_dashboard.png** - Grafana dashboard cost tracking panel

## Creating Screenshots

### Option 1: Automated Capture (Recommended)

Run the helper scripts in order:

```bash
# 1. Set up port forwarding and get instructions
cd presentations/marcus_3.2_demo
./create_demo_screenshots.sh

# 2. In another terminal, run automated capture
npx tsx presentations/marcus_3.2_demo/capture_screenshots_auto.ts
```

### Option 2: Manual Capture

1. **Set up port forwarding:**
   ```bash
   ./create_demo_screenshots.sh
   ```

2. **Capture GraphQL screenshots:**
   - Open http://localhost:4001/graphql
   - Copy queries from `DEMO_SCRIPT.md`
   - Execute and screenshot responses
   - Save with appropriate filenames

3. **Capture Grafana screenshots:**
   - Open http://localhost:5001
   - Login: admin/admin
   - Navigate to MARCUS dashboard
   - Screenshot each required panel
   - Crop to panel if needed

4. **Capture Jaeger (optional):**
   - Open http://34.123.164.214
   - Find interesting trace
   - Screenshot

## Image Guidelines

- **Format:** PNG (for transparency and quality)
- **Resolution:** 1920x1080 recommended
- **Aspect:** 16:9 for presentation slides
- **Quality:** High-res for projection
- **Content:** Ensure no sensitive data visible

## Using Screenshots in Demo

These screenshots serve as backup if the live demo fails. See `DEMO_SCRIPT.md` section "Backup Plan (If Live Demo Fails)" for usage instructions.

The presentation flow:
1. Attempt live demo first
2. If technical issues arise, switch to screenshots seamlessly
3. Use same talking points as live demo
4. Offer to schedule follow-up live demo

## Maintenance

Update screenshots when:
- Dashboard layout changes
- New metrics are added
- Performance numbers change significantly
- UI receives visual updates

Last updated: [date]
