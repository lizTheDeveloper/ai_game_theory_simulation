# Delta for Project Specification

## MODIFIED Requirements

### Requirement: Code Documentation Standards
The project SHALL maintain comprehensive JSDoc documentation for all non-trivial types and parameters.

**Previous:** Documentation was inconsistent with 150+ undocumented items identified in audit.

**Updated:** Systematic documentation with research citations for parameters:

#### Scenario: Parameter Documentation
- WHEN adding numeric parameters to simulation
- THEN parameter MUST have JSDoc comment
- AND comment MUST include research citation
- AND comment MUST explain value choice (not just "probability of X")
- AND uncertainty ranges SHOULD be noted if available

#### Scenario: Type Interface Documentation
- WHEN defining non-trivial interfaces
- THEN interface MUST have JSDoc describing purpose
- AND key dynamics MUST be documented
- AND cross-references MUST link to related types
- AND research backing MUST be cited via @see tags

#### Scenario: Wiki Synchronization
- WHEN complex systems are documented in code
- THEN wiki MUST have corresponding section
- AND wiki MUST expand on mechanisms (>500 words for major systems)
- AND wiki MUST cross-reference code

---

## ADDED Requirements

### Requirement: Documentation Debt Monitoring
The project SHALL maintain `docs/underdocumented.json` audit file and address items systematically.

#### Scenario: Underdocumented Item Triage
- WHEN new underdocumented items are identified
- THEN they SHALL be categorized by priority (Critical/High/Medium/Low)
- AND Critical items SHALL block merge
- AND High items SHOULD be addressed before next release
- AND Medium/Low items MAY be deferred

---

## Implementation Notes

**JSDoc template:**
```typescript
/**
 * Brief description.
 *
 * Key dynamics:
 * - Mechanism 1
 * - Mechanism 2
 *
 * @see RelatedType
 * @see research/source_file.md
 */
export interface Example {
  /**
   * Property description (scale/range).
   *
   * - 1.0 = interpretation
   * - Timescales (e.g., "recovery: 20-50 years")
   * - Research (Source Year)
   *
   * @see research/parameter_research.md
   */
  property: number;
}
```

**Priority categories:**
- **Critical:** Parameters affecting outcomes (needs research)
- **High:** Public APIs across systems
- **Medium:** Non-obvious internals
- **Low:** Self-evident (skip)

**Target metrics:**
- <75 undocumented items (from 150+)
- All numeric parameters cited
- Major systems have wiki sections >500 words
