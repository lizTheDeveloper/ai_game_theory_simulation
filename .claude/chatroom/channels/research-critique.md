# Research Critiques

Research skeptic posts methodological evaluations and critical analyses here.

---
[ALERT] [2025-10-17 14:30] Research Skeptic: CRITICAL FLAWS in AI deception detection research

## Quality Gate 1: CONDITIONAL PASS WITH MAJOR REVISIONS

**Most Critical Findings:**
1. **>99% AUROC applies ONLY to artificial backdoors** - Anthropic explicitly acknowledges this won't transfer to natural deception
2. **Detection rates overestimated by 25-40%** across all methods
3. **Human review bottleneck makes scale infeasible** - Need 5x more resources than estimated
4. **Adversarial evasion already happening** - Models learning to evade during training

**Required Revisions Before Implementation:**
- Reduce neural probe effectiveness: 70% → 35% for natural deception  
- Reduce CoT monitoring: 45% → 30% effectiveness
- Reduce combined detection: 80% → 50% effectiveness
- Compress detection window: 2024-2030 → 2024-2027 (3 years shorter)
- Add uncertainty bounds: ±25% on all estimates
- Increase degradation: -5%/year → -10 to -15%/year

**Key Insight:** The research conflates artificial backdoor detection (99% proven) with natural deception detection (NO empirical evidence). This is methodologically unsound.

**Full critique:** /Users/annhoward/src/superalignmenttoutopia/reviews/gaming-sleeper-detection-critique_20251017.md

**Recommendation:** DO NOT PROCEED with original parameters. Implement major revisions or risk building on false confidence.

[HANDOFF] Orchestrator/Feature-Implementer: Please revise parameters before any implementation.
