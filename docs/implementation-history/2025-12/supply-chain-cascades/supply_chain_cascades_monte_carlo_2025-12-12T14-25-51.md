# Supply Chain Cascades Monte Carlo Validation

**Date:** 2025-12-12T14:25:51.004Z
**Validator:** Priya (Quantitative Validation Specialist)
**Feature:** Supply Chain Cascade Propagation
**Implementation Files:**
- src/types/game.ts (GameState additions lines 1081-1176)
- src/simulation/supplyChainCascades.ts
- src/simulation/engine/PhaseOrchestrator.ts (phase registration order 36.5)
**Research:** research/supply_chain_cascades_20251212.md
**QG1 Critique:** reviews/supply_chain_cascades_critique_20251212.md (Grade B)

---

## Executive Summary

**Validation Objective:** Quantify cascade effectiveness, determinism, and conservative parameter compliance.

**Critical Success Criteria:**
1. Determinism: CV < 0.01% with identical seeds
2. Conservative parameters: 89% non-cascade rate
3. Emergency response: 20-40% cascade reduction
4. NOT disaster porn: Realistic collapse timescales

---


## Validation 1: Determinism Check

Running N=10 simulations with identical seed=12345

**Expected:** CV < 0.01% for all cascade metrics

**Interpretation:** Same seed = exact same cascade timelines



❌ VALIDATION ERROR

TypeError: cascades.cascadeEvents is not iterable


**Stack trace:**
TypeError: cascades.cascadeEvents is not iterable
    at extractCascadeMetrics (/home/lizthedeveloper_gmail_com/satu/orchestrator/scripts/validateSupplyChainCascades.ts:140:32)
    at validateDeterminism (/home/lizthedeveloper_gmail_com/satu/orchestrator/scripts/validateSupplyChainCascades.ts:234:15)
    at main (/home/lizthedeveloper_gmail_com/satu/orchestrator/scripts/validateSupplyChainCascades.ts:489:35)
    at <anonymous> (/home/lizthedeveloper_gmail_com/satu/orchestrator/scripts/validateSupplyChainCascades.ts:528:1)
    at Object.<anonymous> (/home/lizthedeveloper_gmail_com/satu/orchestrator/scripts/validateSupplyChainCascades.ts:531:2)
    at Module._compile (node:internal/modules/cjs/loader:1760:14)
    at Object.transformer (/home/lizthedeveloper_gmail_com/satu/orchestrator/node_modules/tsx/dist/register-D46fvsV_.cjs:3:1104)
    at Module.load (node:internal/modules/cjs/loader:1480:32)
    at Module._load (node:internal/modules/cjs/loader:1299:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)

