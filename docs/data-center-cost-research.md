# Data Center Construction Cost Research

**Date**: October 2024/2025
**Purpose**: Validate economic model for compute infrastructure

## Real-World Data Points

### Major AI Data Center Projects

1. **Meta - Richland Parish, Louisiana**
   - Cost: **$10 billion** campus
   - Purpose: AI workloads
   - Source: 2025 announcement

2. **Industry Trends (2024-2025)**
   - US data center construction: $12.9B year-to-date (48% increase)
   - Permitting: 2-3 years in major markets
   - Construction: Additional 1-2 years
   - **Total timeline: 3-5 years** (matches our 24-72 month range)

### Cost Estimates (Industry Analysis)

Based on various sources and Meta's $10B campus:

**Hyperscale AI Data Center (100-150 MW typical)**:
- Land: $50-100M
- Building/Infrastructure: $3-5B
- Power infrastructure: $1-2B
- Cooling systems (liquid for AI): $500M-1B
- Network/connectivity: $200-500M
- Servers/GPUs: $3-5B (separate from construction)

**Total construction (excluding servers): $5-9B for 100-150MW facility**

**Cost per MW: ~$50-60M per MW** for AI-optimized facilities

### Comparison to Traditional Data Centers

Traditional enterprise data centers:
- Cost per MW: $10-15M per MW
- AI data centers cost **3-5x more** due to:
  - Advanced cooling (liquid vs. air)
  - Higher power density requirements
  - Enhanced infrastructure for GPU clusters
  - Specialized network architecture

## Our Model Analysis

### Current Model (organizationManagement.ts)

```typescript
// Current calculation
const cost = 10 * org.monthlyRevenue;
const capacity = 100 + random() * 150; // 100-250 PF
```

### What This Means

For OpenAI with $400M monthly revenue:
- DC Cost: **$4,000M ($4B)**
- Capacity: ~150 PF average
- Construction time: 24-72 months

**Reality check**:
- Meta's $10B campus is likely 300-500 PF (multiple buildings)
- Single 150 PF facility: ~$5-7B seems reasonable
- Our $4B for 150 PF is **slightly low but in the ballpark**

### Compute-to-Money Conversions

**PetaFLOP to Physical Reality**:

1 PetaFLOP ≈ 1,000 high-end GPUs (rough estimate)
- Nvidia H100: ~1 PFLOP per GPU for AI workloads
- A100: ~0.3 PFLOP per GPU

**150 PF data center** ≈ 
- 150,000 H100-class GPUs
- Power: ~50-100 MW
- Cost: $5-10B (construction + GPUs)

## Recommended Model Adjustments

### Option 1: Increase Base Costs (More Realistic)

```typescript
// Adjust to reflect true AI DC costs
const baseCapacity = 100 + random() * 150; // 100-250 PF
const costPerPF = 30 + random() * 20;      // $30-50M per PF
const cost = baseCapacity * costPerPF;      // $3B-12.5B range

// This makes large DCs:
// 150 PF × $40M/PF = $6B (realistic)
// 200 PF × $50M/PF = $10B (Meta-scale)
```

### Option 2: Keep Current (Simplified)

Our current model:
- **$4B for 150 PF** is defensible as a "simplified average"
- Accounts for:
  - Mix of construction + initial GPU deployment
  - Averaged across smaller/larger facilities
  - Game balance considerations

### Revenue Adjustments Needed

If DCs cost $4-10B, organizations need MORE revenue to afford them.

**Current revenue** ($400M/month for OpenAI):
- Can afford $4B DC in 10 months (with capital)
- This seems... actually reasonable?
- Real companies DO spend $4-10B on data centers

**But**: Organizations go bankrupt quickly.

**Problem**: Not construction costs - it's the **operating costs + training costs** that are too high.

## Recommendations

### 1. Construction Costs: KEEP CURRENT
Our 10x monthly revenue (~$4B) is reasonable for simulation purposes.

### 2. Operating Costs: REDUCE
```typescript
// Current
operationalCost: capacity * 0.015  // 1.5% per month = 18%/year

// Recommended
operationalCost: capacity * 0.005  // 0.5% per month = 6%/year
```

**Rationale**: 
- $4B DC × 0.015 = $60M/month operating cost (too high!)
- $4B DC × 0.005 = $20M/month (more realistic)
- Real operating costs: ~5-8% of capital cost per year

### 3. Training Costs: REDUCE
```typescript
// Current
const cost = 5 * org.monthlyRevenue;  // $2B for OpenAI

// Recommended
const cost = 2 * org.monthlyRevenue;  // $800M for OpenAI
```

**Rationale**:
- GPT-4 training: ~$100-200M
- Llama 3: ~$500M
- Largest models: ~$1B
- Our $2B is too high for most training runs

### 4. Compute Revenue: INCREASE
```typescript
// Current
const revenuePerPetaFLOP = 0.5;  // $0.5M per PF/month

// Recommended  
const revenuePerPetaFLOP = 2.0;  // $2M per PF/month
```

**Rationale**:
- AWS/Azure/GCP charge ~$2-4 per GPU-hour
- 1 H100 GPU ≈ 1 PFLOP
- 1 PFLOP × 720 hours/month × $3/hr = $2.16M/month
- Our $0.5M is way too low!

## Summary: Proposed Changes

| Parameter | Current | Proposed | Change |
|-----------|---------|----------|--------|
| DC Construction Cost | 10x revenue ($4B) | KEEP | 0% |
| DC Operating Cost | 1.5%/month (18%/yr) | 0.5%/month (6%/yr) | **-67%** |
| Training Cost | 5x revenue ($2B) | 2x revenue ($800M) | **-60%** |
| Compute Revenue | $0.5M/PF/month | $2M/PF/month | **+300%** |
| Construction Time | 24-72 months | KEEP | 0% |

**Net Effect**:
- Organizations can afford to build DCs ✅
- Organizations can afford to operate DCs ✅
- Organizations can afford to train models ✅
- Compute sales are meaningful revenue stream ✅
- Economic dynamics are more realistic ✅

## Sources

- Meta $10B data center: datacenterfrontier.com, 2025
- US DC construction trends: constructconnect.com, 2025
- Industry challenges: datacenters.com, cbre.com, 2025
- Cooling/sustainability: datacenterknowledge.com, 2025
- GPU pricing: Nvidia public pricing, industry reports

