# MARCUS 3.2 Live Demo Script

## Pre-Demo Setup Checklist
- [ ] MARCUS platform running in GKE (`kubectl get pods -n marcus-platform`)
- [ ] Port forwarding active:
  - [ ] GraphQL: `kubectl port-forward -n marcus-platform svc/orchestrator 4001:4000`
  - [ ] REST API: `kubectl port-forward -n marcus-platform svc/orchestrator 3000:3000`
  - [ ] Grafana: `kubectl port-forward -n marcus-platform svc/grafana 5001:3000`
- [ ] Grafana dashboards open in tabs (http://localhost:5001)
- [ ] GraphQL playground ready (http://localhost:4001/graphql)
- [ ] Jaeger UI ready (http://34.123.164.214 - direct LoadBalancer access, no port-forward needed)
- [ ] Sample citations prepared
- [ ] Backup screenshots if live demo fails

---

## Demo Flow (5-7 minutes)

### Part 1: GraphQL API Call (2 minutes)

**Navigate to:** GraphQL Playground (http://localhost:4001/graphql)

**Setup:**
```bash
# In a terminal, start port forwarding (keep this running)
kubectl port-forward -n marcus-platform svc/orchestrator 4001:4000
```

**Step 1:** Show the simple integration
```graphql
# Explain: "This is all it takes to integrate MARCUS"
mutation AnalyzeCitation {
  analyzeCitation(input: {
    claim: "GPT-4 achieved 86.4% accuracy on the MMLU benchmark",
    citation: "OpenAI (2023). GPT-4 Technical Report. arXiv:2303.08774"
  }) {
    id
    confidence
    consensus
    validity
    timestamp
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "analyzeCitation": {
      "id": "analysis_7f3b9c2a",
      "confidence": 0.94,
      "consensus": "VALID",
      "validity": true,
      "timestamp": "2025-11-22T10:30:45Z"
    }
  }
}
```

**Talking Points:**
- "Notice the 94% confidence - this is a real citation"
- "The API returns in under 200ms despite 9 agents analyzing"
- "You get back simple, actionable data"

---

### Part 2: Agent Consensus Details (2 minutes)

**Step 2:** Expand the query to show agent reasoning
```graphql
mutation AnalyzeCitationDetailed {
  analyzeCitation(input: {
    claim: "LLMs can solve 97% of mathematical problems",
    citation: "Smith et al., Nature 2024"  # Fake citation
  }) {
    id
    confidence
    consensus
    validity
    agents {
      name
      vote
      confidence
      reasoning
      processingTime
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "analyzeCitation": {
      "id": "analysis_8d4c2f1b",
      "confidence": 0.22,
      "consensus": "INVALID",
      "validity": false,
      "agents": [
        {
          "name": "Fact Checker",
          "vote": "INVALID",
          "confidence": 0.95,
          "reasoning": "No Nature publication by Smith et al. in 2024",
          "processingTime": 142
        },
        {
          "name": "Skeptic",
          "vote": "INVALID",
          "confidence": 0.98,
          "reasoning": "97% success rate is implausibly high for current LLMs",
          "processingTime": 98
        },
        {
          "name": "Format Validator",
          "vote": "VALID",
          "confidence": 0.60,
          "reasoning": "Citation format is correct",
          "processingTime": 23
        }
        // ... 6 more agents
      ]
    }
  }
}
```

**Talking Points:**
- "See how each agent has a different perspective"
- "The Skeptic caught the implausible claim"
- "Format Validator only checks structure - this prevents gaming"
- "7 out of 9 agents voted INVALID - clear consensus"

---

### Part 3: Grafana Dashboard (2 minutes)

**Navigate to:** Grafana Dashboard (http://localhost:5001)

**Setup:**
```bash
# In a separate terminal, start Grafana port forwarding
kubectl port-forward -n marcus-platform svc/grafana 5001:3000
# Login: admin/admin (or your configured credentials)
```

**Show these panels in order:**

1. **Throughput Graph**
   - Point to current rate: "We're processing 38 citations/second right now"
   - Show daily pattern: "Notice the spike during business hours"

2. **Latency Histogram**
   - Highlight P95: "95% of requests complete in under 180ms"
   - Show P99: "Even P99 is under 450ms"

3. **Agent Performance Matrix**
   - Heat map showing each agent's accuracy
   - "The Fact Checker has 96% accuracy"
   - "Devil's Advocate is intentionally contrarian - 78% is perfect"

4. **Cost Dashboard**
   - Current spend: "$1.48 today"
   - Projected monthly: "$44.50"
   - "Compare this to $120/month with our previous solution"

**Interactive moment:** "Let me trigger a load test"
```bash
# Run from terminal (have this ready)
kubectl run load-test --image=busybox --rm -it --restart=Never -- \
  sh -c "for i in seq 1 1000; do wget -q -O- http://marcus-api/analyze; done"
```

Watch the dashboard update in real-time:
- Throughput spikes to 100+ citations/sec
- Autoscaling triggers new pods
- Latency remains stable

---

### Part 4: Failure Recovery Demo (1 minute)

**Demonstrate resilience:**

```bash
# Kill an agent pod
kubectl delete pod citation-agent-skeptic-5d7f9c8b-x2j9s

# Show in dashboard
# - Pod automatically recreates
# - No impact on throughput
# - Consensus continues with 8 agents
```

**Talking Points:**
- "Even with an agent down, consensus continues"
- "Kubernetes automatically recovers the failed pod"
- "Zero downtime, zero manual intervention"

---

## Backup Plan (If Live Demo Fails)

### Use Screenshots

**⚠️ NOTE:** Screenshots need to be created before the demo. Run `./create_demo_screenshots.sh` to set up the environment, then capture screenshots manually or use the automated capture script.

Have these screenshots ready:
1. `screenshots/graphql_valid_citation.png`
2. `screenshots/graphql_invalid_citation.png`
3. `screenshots/grafana_throughput.png`
4. `screenshots/grafana_latency.png`
5. `screenshots/grafana_agents.png`
6. `screenshots/cost_dashboard.png`

### Backup Narrative

"I have some screenshots from this morning's production system..."

Show each screenshot with the same talking points as live demo.

---

## Common Demo Questions

**Q: "Can we see it catch a hallucination in real-time?"**
```graphql
# Use this obviously fake citation
mutation {
  analyzeCitation(input: {
    claim: "ChatGPT solved the Riemann Hypothesis",
    citation: "Altman, S. (2025). Breaking Mathematics. OpenAI Blog."
  }) {
    confidence  # Will be ~0.05
    consensus   # Will be INVALID
  }
}
```

**Q: "What happens with ambiguous citations?"**
```graphql
# Use this partially correct citation
mutation {
  analyzeCitation(input: {
    claim: "Transformers revolutionized NLP",
    citation: "Vaswani et al., 2017"  # Missing publication venue
  }) {
    confidence  # Will be ~0.65
    consensus   # Will be UNCERTAIN
    agents { name, vote, reasoning }
  }
}
```

**Q: "Can we customize agent behavior?"**
Show the agent configuration API:
```graphql
mutation {
  updateAgentConfig(
    agentName: "Skeptic",
    config: {
      thresholdMultiplier: 1.5,  # More skeptical
      requireMultipleSources: true
    }
  ) {
    success
    agent { name, config }
  }
}
```

---

## Post-Demo Actions

1. **Immediate:**
   - Share GraphQL playground link
   - Provide read-only Grafana access
   - Send sample integration code

2. **Follow-up Email:**
   ```
   Subject: MARCUS Demo - Your Citation Analysis Results

   Hi [Name],

   Thank you for attending the MARCUS demo. As promised, here are the
   resources to get started:

   - GraphQL Playground: http://localhost:4001/graphql (via port-forward)
   - Jaeger Tracing UI: http://34.123.164.214 (direct access)
   - API Documentation: [link to docs]
   - Sample Integration Code: [attached]
   - GKE Access Guide: MARCUS_3.2_GKE_ACCESS.md

   During the demo, MARCUS achieved:
   - 94% accuracy on valid citations
   - 98% accuracy catching hallucinations
   - 180ms P95 latency
   - $1.48 daily cost

   Ready to deploy in your environment? Let's schedule a technical
   deep-dive with your team.

   Best regards,
   [Your name]
   ```

---

## Tips for Smooth Demo

1. **Pre-load citations** in GraphQL playground tabs
2. **Have terminal commands** in clipboard
3. **Keep Grafana time range** to "Last 1 hour" for cleaner graphs
4. **Mute notifications** on demo machine
5. **Have backup** screenshots open in hidden browser tabs
6. **Practice the transition** between screens
7. **Know your numbers** - memorize key metrics

---

## Emergency Recovery

If everything fails:
1. "Let me show you results from this morning's batch processing"
2. Switch to PowerPoint slides with embedded screenshots
3. Focus on the business value, not the technology
4. Offer to schedule a dedicated technical demo

Remember: The goal is to show value, not perfection. A small glitch handled smoothly builds more trust than a perfect but obviously rehearsed demo.