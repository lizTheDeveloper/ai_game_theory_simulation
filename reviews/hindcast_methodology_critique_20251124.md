# Hindcasting Methodology Critique

**Date:** November 24, 2025
**Reviewer:** Research Skeptic (Sylvia)
**Document Under Review:** `research/hindcast_baseline_data_20251124.md`
**Priority:** CRITICAL (Quality Gate 1)

## Executive Assessment

**Grade: B+ (CONDITIONAL PASS)**

The research document provides high-quality data sources but underestimates methodological challenges in hindcasting validation. Pass with conditions.

---

## Summary of Concerns

### CRITICAL Issues (Must Address)

1. **Tuning Circularity Risk** - The simulation has already been developed with knowledge of 2024 outcomes
2. **Non-Modeled Event Handling** - COVID-19, 2008 crisis treatment needs explicit protocol

### HIGH Priority Issues (Strongly Recommend)

3. **Overfitting Detection** - No protocol to distinguish genuine predictive power from parameter fitting
4. **Structural vs. Parameter Uncertainty** - Conflating good parameters with correct mechanisms

### MEDIUM Priority Issues (Suggested)

5. **AI Bootstrap Assumptions** - Arbitrary emergence timeline lacks justification
6. **Gini Data Quality** - Global aggregation methodology uncertain

---

## Detailed Critique

### 1. CRITICAL: Tuning Circularity Risk

**The Problem:**
> "Modelers try to make their models realistic by adjusting climate parameters until hindcasts match historical temperature changes." - [Carbon Brief](https://www.carbonbrief.org/analysis-how-well-have-climate-models-projected-global-warming/)

This simulation was developed in 2024-2025 with full knowledge of historical outcomes. Any hindcast "validation" risks circular reasoning:
- We know CO2 reached 424 ppm in 2024
- We know global temperature rose 1.28C
- We know population hit 8.1 billion

**The Risk:**
Parameters may have been unconsciously (or consciously) selected because they reproduce known history, not because they capture underlying mechanisms.

**Mitigation Required:**
1. **Document pre-hindcast parameters** - Lock all parameters BEFORE running hindcast
2. **Independent validation set** - Hold out 2020-2024 data; train only on 1990-2019
3. **Blind evaluation** - Have different team member run/evaluate results
4. **Cross-validation** - Train on 1990-2010, test on 2010-2024; then reverse

**Status:** CRITICAL - Must implement parameter lockdown protocol

---

### 2. CRITICAL: Non-Modeled Event Handling

**The Problem:**
The research acknowledges COVID-19 and 2008 financial crisis but proposes only to "flag deviation spikes" and report "adjusted metrics excluding event years."

This is methodologically unsound. If we exclude years that don't fit, we're hiding model failures:

**COVID-19 (2020):**
- 7+ million excess deaths
- GDP drop of ~3.4%
- Gini spike (largest since 1990)
- HDI decline (first since tracking began)

**2008 Financial Crisis:**
- Global recession
- 25% GDP contraction in some countries
- Cascading effects through 2012

**The Risk:**
Excluding these years cherry-picks "good" performance. The model's inability to predict discontinuities IS the finding.

**Mitigation Required:**
1. **Scenario branching** - Run hindcast WITH and WITHOUT event shocks
2. **Shock injection** - Model COVID as exogenous mortality/GDP shock at month 361 (March 2020)
3. **Report both** - Primary: full 1990-2024 including shocks. Secondary: "baseline trajectory" excluding shocks
4. **Evaluate recovery** - Does model capture post-shock recovery dynamics correctly?

**Status:** CRITICAL - Must define explicit shock handling protocol

---

### 3. HIGH: Overfitting Detection

**The Problem:**
> "Cycle-seeking statistical analyses commonly violate the fundamental principle of avoiding backtest overfitting: 'A backtest which does not report the number of trials N used to produce the selected configuration makes it impossible to assess the risk of overfitting.'" - [Backtesting Wikipedia](https://en.wikipedia.org/wiki/Backtesting)

The research proposes R2 >= 0.70 as success criterion. But high R2 on training data means nothing without:
- Number of free parameters
- Number of data points
- Cross-validation on held-out data

**The Risk:**
With 50+ tunable parameters and 34 annual data points, overfitting is trivially achievable. Even random models can achieve high R2 with enough parameters.

**Mitigation Required:**
1. **Report degrees of freedom** - Parameters vs data points ratio
2. **Use adjusted R2** - Penalizes parameter count
3. **Implement k-fold cross-validation** - 5-fold minimum
4. **Report out-of-sample metrics** - Only these indicate true predictive power

**Status:** HIGH - Strongly recommend implementing before claiming validation success

---

### 4. HIGH: Structural vs. Parameter Uncertainty

**The Problem:**
> "You can be arbitrarily close to the correct equations (model structure), but still not be close to the correct solutions (future trajectories)." - Hawkmoth Effect

The hindcast tests parameters, not mechanisms. A model can:
- Match history perfectly
- Use completely wrong mechanisms
- Fail catastrophically on novel futures

**Example:**
A model using "population drives CO2" could hindcast well (correlation exists) but fail when:
- Decoupling occurs (efficiency gains)
- New technologies emerge
- Policy interventions change dynamics

**The Risk:**
Good hindcast performance creates false confidence in forecasting ability.

**Mitigation Required:**
1. **Mechanism validation** - Separately test that each subsystem mechanism matches empirical research
2. **Sensitivity analysis** - Which parameters can change 10x without breaking hindcast?
3. **Ensemble comparison** - Compare against other models (IPCC scenarios, UN projections)
4. **Document structural assumptions** - Explicit list of which mechanisms are verified vs. assumed

**Status:** HIGH - Critical for research integrity; recommend mechanism audits continue in parallel

---

### 5. MEDIUM: AI Bootstrap Assumptions

**The Problem:**
The AI emergence timeline is presented as factual:
- 2018: 1 agent (GPT-1)
- 2020: 2 agents (GPT-3)
- 2022: 5 agents (ChatGPT)
- 2024: 10+ agents

**Issues:**
1. **No research citation** - Timeline is assertion, not peer-reviewed
2. **Capability mapping unclear** - What makes GPT-1 "1 agent" vs GPT-3 "2 agents"?
3. **Arbitrary quantification** - Why 5 agents in 2022? Why not 3 or 15?

**The Risk:**
AI dynamics are a core simulation mechanism. Arbitrary bootstrap = untested AI subsystem.

**Mitigation:**
1. **Cite AI capability benchmarks** - MMLU, HellaSwag emergence dates
2. **Define "agent" operationally** - What capability threshold = 1 agent?
3. **Sensitivity test** - Run hindcast with 0 AI agents through 2024 (counterfactual)

**Status:** MEDIUM - Addressable, not blocking

---

### 6. MEDIUM: Gini Data Quality Concerns

**The Problem:**
Global Gini is presented as:
- 1990: ~70
- 2024: ~63

**Issues:**
1. **"~" notation** - These are estimates with substantial uncertainty
2. **Aggregation methodology** - How are country Ginis combined into global?
3. **Data gaps** - Many countries lack Gini data before 2000
4. **Survey comparability** - Income vs. consumption Ginis differ

**The Risk:**
Validating against uncertain data produces uncertain validation.

**Mitigation:**
1. **Report confidence intervals** - Gini 70 ± 5, not just 70
2. **Document methodology** - Which global Gini estimate? (World Bank PIP? WID?)
3. **Weight by uncertainty** - Downweight Gini in composite validation score

**Status:** MEDIUM - Document limitations, proceed with caution

---

## Contradictory Research Findings

### IAM Validation Limitations

> "Past performance is not a reliable indicator of model quality, because the future may not be like the past. Alternatively, a series of model errors can compensate for each other, leading to an apparently accurate projection." - [MDPI Review of IAM Criticisms](https://www.mdpi.com/1996-1073/12/9/1747)

**Implication:** Even perfect hindcast match doesn't validate forecasting capability.

### Transparency Requirements

> "IAMs should be seen as one value-laden tool in assessing feasibility, and other methodologies must also be considered." - [Wiley Climate Change](https://wires.onlinelibrary.wiley.com/doi/10.1002/wcc.727)

**Implication:** Hindcast results should be contextualized, not presented as definitive validation.

### Behavioral Realism

> "Real behaviour in human societies is different, participants have limited knowledge, diverse information, interests and motivations and systems are emergent, organic and evolving." - [STEPS Centre](https://steps-centre.org/blog/five-problems-with-integrated-assesment-models-and-what-to-do-about-them/)

**Implication:** Social/economic dynamics (Gini, governance) are fundamentally harder to validate than physical dynamics (CO2, temperature).

---

## Revised Success Criteria

The original criteria are necessary but not sufficient:

| Original Criterion | Revised Criterion |
|-------------------|-------------------|
| R2 >= 0.70 | Adjusted R2 >= 0.60 on held-out validation set |
| NRMSE <= 0.30 | NRMSE <= 0.30 with k-fold cross-validation |
| Systematic bias < 10% | Systematic bias < 10% AND mechanism-consistent |

**Additional Required Criteria:**
1. **Parameter lockdown documented** - Pre-hindcast parameter snapshot archived
2. **Out-of-sample tested** - At least one temporal cross-validation split
3. **Shock handling explicit** - COVID/2008 treatment documented and justified
4. **Mechanism validation parallel** - Subsystem audits continue independently

---

## Verdict

### CONDITIONAL PASS

**Pass Conditions:**

1. [ ] **CRITICAL:** Implement parameter lockdown before running hindcast
2. [ ] **CRITICAL:** Define explicit shock handling protocol (include or inject, document choice)
3. [ ] **HIGH:** Add cross-validation to success criteria
4. [ ] **HIGH:** Document that hindcast tests parameters, not mechanisms

**If conditions met:** Proceed to implementation
**If conditions not met:** Return to research phase

---

## Recommendations to Implementation Team

1. **Create `config/hindcast_parameters_locked_20251124.json`** - Snapshot all tunable parameters BEFORE running hindcast. Any post-hoc changes must be documented.

2. **Design shock injection system** - Add optional `exogenousShocks` parameter to initialization that can inject COVID-like mortality/GDP shocks at specified months.

3. **Implement temporal cross-validation** - Training set: 1990-2015. Validation set: 2016-2024. Report both.

4. **Keep expectations realistic** - Hindcast is a necessary condition for model validity, not sufficient. Even perfect R2 doesn't prove forecasting capability.

---

## References

1. Hausfather, Z. et al. (2020). Evaluating the Performance of Past Climate Model Projections. Geophysical Research Letters. https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2019GL085378

2. Carbon Brief. (2017). How well have climate models projected global warming? https://www.carbonbrief.org/analysis-how-well-have-climate-models-projected-global-warming/

3. Skea, J. et al. (2021). Transparency and integrated assessment modeling. WIREs Climate Change. https://wires.onlinelibrary.wiley.com/doi/10.1002/wcc.727

4. MDPI. (2019). A Review of Criticisms of Integrated Assessment Models. https://www.mdpi.com/1996-1073/12/9/1747

5. STEPS Centre. (2018). Five problems with integrated assessment models. https://steps-centre.org/blog/five-problems-with-integrated-assesment-models-and-what-to-do-about-them/

---

**Reviewer:** Sylvia (Research Skeptic)
**Status:** CONDITIONAL PASS
**Quality Gate 1:** PASSED WITH CONDITIONS
