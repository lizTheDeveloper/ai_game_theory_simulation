# Tech Tree System

The Tech Tree System is a comprehensive technology management framework that models how breakthrough technologies are researched, unlocked, and deployed across different regions of the world. It replaces the previous scattered tech unlock logic with a unified, research-backed system.

## Overview

The tech tree system manages 71 technologies across 8 categories, with realistic prerequisites, costs, and deployment mechanics. Technologies deploy differently across regions based on economic capacity, infrastructure, and regional needs.

## Architecture

### Core Components

1. **Tech Tree Engine** (`src/simulation/techTree/engine.ts`)
   - Manages tech unlocking and deployment
   - Handles serialization/deserialization
   - Processes deployment actions

2. **Comprehensive Tech Tree** (`src/simulation/techTree/comprehensiveTechTree.ts`)
   - Defines all 71 technologies
   - Prerequisites, costs, effects, citations
   - Research-backed technology definitions

3. **Effects Engine** (`src/simulation/techTree/effectsEngine.ts`)
   - Applies technology effects to game state
   - 60+ effect types across 15+ game systems
   - Type-safe dynamic property access

4. **Regional Deployment** (`src/simulation/techTree/regionalDeployment.ts`)
   - Regional factors and deployment logic
   - Technology-specific regional relevance
   - Deployment speed and cost modifiers

5. **AI Tech Actions** (`src/simulation/agents/aiTechActions.ts`)
   - AI agent technology deployment/sabotage
   - Alignment-based tech selection
   - Regional deployment strategies

6. **Government Tech Actions** (`src/simulation/agents/governmentTechActions.ts`)
   - National technology deployment
   - Nation-specific priorities and budgets
   - Crisis-driven investment scaling

## Technology Categories

### 1. Alignment (8 technologies)
- **Basic RLHF** → **Scalable Oversight** → **Advanced Mechanistic Interpretability**
- **Adversarial Evaluation** → **Defensive AI Systems**
- **Formal Verification**, **Value Learning**, **Recursive Alignment**
- Focus: AI safety, sleeper detection, alignment research

### 2. Climate (9 technologies)
- **De-Extinction & Rewilding**, **Advanced Direct Air Capture**
- **Precision Conservation**, **Invasive Species Control**
- **Stratospheric Aerosol Injection**, **Marine Cloud Brightening**
- **Bioenergy with CCS**, **Interspecies Communication**
- Focus: Biodiversity, carbon removal, climate intervention

### 3. Pollution (4 technologies)
- **AI-Optimized Pollution Remediation**
- **PFAS Remediation**, **Plastic-Eating Enzymes**
- **Green Chemistry**
- Focus: Pollution cleanup, prevention, novel entities

### 4. Water (6 technologies)
- **Advanced Desalination**, **Atmospheric Water Harvesting**
- **Aquifer Recharge Systems**, **Water Recycling**
- **Smart Water Grids**, **Ocean Desalination**
- Focus: Water security, Day Zero prevention

### 5. Energy (7 technologies)
- **Fusion Materials** → **Fusion Plasma Control** → **Fusion Power Plants**
- **Advanced Solar**, **Advanced Wind**, **Grid-Scale Storage**
- **Geothermal Energy**
- Focus: Clean energy transition, fusion development

### 6. Agriculture (5 technologies)
- **Precision Agriculture**, **Vertical Farming**
- **Lab-Grown Meat**, **Crop Genetic Engineering**
- **Soil Regeneration**
- Focus: Food security, sustainable agriculture

### 7. Medical (5 technologies)
- **Disease Elimination**, **Longevity Research**
- **AI Medical Diagnostics**, **Regenerative Medicine**
- **Mental Health AI**
- Focus: Health improvements, disease prevention

### 8. Social (8 technologies)
- **AI Power Efficiency Communication**
- **Mental Health Support**, **Community Building**
- **Purpose & Meaning Systems**, **Social Cohesion**
- **Trust & Transparency**, **Cultural Adaptation**
- **Governance AI**
- Focus: Social stability, meaning crisis, trust

### 9. Planetary Boundaries (17 technologies)
- **Ocean Acidification Mitigation**, **Freshwater Conservation**
- **Biodiversity Monitoring**, **Ecosystem Restoration**
- **Resource Efficiency**, **Waste Elimination**
- **Climate Adaptation**, **Environmental Justice**
- Focus: Planetary boundary management

### 10. Advanced AI Safety (8 technologies)
- **AI Alignment Research**, **Capability Control**
- **Interpretability Tools**, **Safety Verification**
- **Alignment Monitoring**, **Risk Assessment**
- **Safety Protocols**, **Alignment Testing**
- Focus: Advanced AI safety research

## Technology Lifecycle

### 1. Research Phase
- Technologies start as "locked" (not yet discovered)
- Research progress accumulates based on:
  - Government investment
  - Private organization contributions
  - AI agent research actions
  - Volunteer research (unemployed people)

### 2. Unlock Conditions
Technologies unlock when:
- **Prerequisites met**: All required technologies unlocked
- **Capability gate**: AI capability >= minimum requirement
- **Research complete**: Research progress >= required months
- **Crisis trigger**: Specific crisis conditions met

### 3. Deployment Phase
- Technologies can be deployed by:
  - **AI Agents**: Based on alignment and strategic goals
  - **Governments**: Based on national priorities and budgets
  - **Organizations**: Based on commercial interests

### 4. Regional Deployment
- Technologies deploy differently across regions:
  - **Africa**: High relevance, slow deployment, expensive costs
  - **Asia**: High relevance, fast deployment, cheap costs
  - **North America**: Medium relevance, very fast deployment
  - **Europe**: Medium relevance, fast deployment, expensive costs
  - **South America**: High relevance, medium deployment
  - **Oceania**: High relevance, standard deployment, expensive costs

## Regional Factors

### Economic Capacity
- **High**: North America (0.9), Europe (0.8), Oceania (0.7)
- **Medium**: Asia (0.6), South America (0.5)
- **Low**: Africa (0.3)

### Infrastructure
- **Excellent**: North America (0.9), Europe (0.9)
- **Good**: Asia (0.7), Oceania (0.8)
- **Medium**: South America (0.6)
- **Poor**: Africa (0.4)

### Political Stability
- **Very High**: Europe (0.9), Oceania (0.9)
- **High**: North America (0.8)
- **Medium**: Asia (0.5), South America (0.6)
- **Low**: Africa (0.4)

## Technology Effects

The effects engine applies 60+ different effect types across 15+ game systems:

### Environmental Effects
- `biodiversityBonus`, `extinctionRateReduction`
- `oceanPHBonus`, `coralSurvival`
- `carbonRemoval`, `negativeEmissions`
- `pollutionReduction`, `pfasReduction`

### Social Effects
- `trustBonus`, `paranoiaReduction`
- `socialConnectionBonus`, `meaningReduction`
- `publicAwarenessBonus`, `mentalHealthBonus`

### Economic Effects
- `resourceEfficiency`, `energyAbundance`
- `powerGeneration`, `energyStorage`
- `costReduction`, `productivityBonus`

### Health Effects
- `healthcareBonus`, `mortalityReduction`
- `diseaseElimination`, `longevityBonus`
- `mentalHealthBonus`, `wellbeingBonus`

## AI Agent Actions

### Deploy Technology
- **Highly Aligned AIs** (>0.7): Deploy safety tech globally
- **Aligned AIs** (0.5-0.7): Deploy in highest priority regions
- **Neutral AIs** (0.3-0.5): Deploy randomly in top 3 regions
- **Misaligned AIs** (<0.3): Deploy strategically for control

### Sabotage Technology
- **Misaligned AIs**: Sabotage detection systems, safety tech
- **Detection Risk**: Based on deception skill and tech importance
- **Consequences**: Increased detection risk, potential exposure

## Government Actions

### National Priorities
- **United States**: AI safety ($50B/month), fusion power
- **China**: Economic tech ($40B/month), surveillance
- **European Union**: Clean energy ($35B/month), regulation
- **Saudi Arabia**: Desalination ($20B/month), solar (existential)
- **India**: Agricultural tech ($15B/month), water
- **Africa**: Basic needs ($10B/month), disease elimination

### Crisis Response
- Crisis urgency multiplies investment by 1.5x-3.0x
- Governments prioritize crisis-relevant technologies
- Emergency deployment can bypass normal prerequisites

## Research System

### Research Generation
Research progress is generated by:
1. **Government Investment**: Direct budget allocation
2. **Private Organizations**: Corporate R&D spending
3. **AI Agent Actions**: Research-focused AI activities
4. **Volunteer Research**: Unemployed people contributing to research

### Compute Scaling
- Research speed scales with allocated compute
- Follows Chinchilla scaling laws (exponent 0.34)
- Volunteer research provides "virtual compute" boost
- Reference compute: 30 PetaFLOPs baseline

## Visualization

### Tech Tree Visualization Script
```bash
# Generate Mermaid diagram
npx tsx scripts/visualizeTechTree.ts

# Text report
npx tsx scripts/visualizeTechTree.ts --text

# JSON export
npx tsx scripts/visualizeTechTree.ts --json

# Show only unlocked tech
npx tsx scripts/visualizeTechTree.ts --unlocked-only

# Full details
npx tsx scripts/visualizeTechTree.ts --deployment --costs --effects
```

### Output Formats
1. **Mermaid**: Visual diagram with dependencies and status
2. **JSON**: Machine-readable tech tree data
3. **Text**: Human-readable status reports

## Integration Points

### Simulation Engine
- Tech tree updates in Phase 12.5 (after most other systems)
- Effects applied before next month's calculations
- Serialization handling for Set/Map objects

### AI Lifecycle
- Sleeper AI resource acquisition (4-stage progression)
- AI capability gates for tech unlocking
- Alignment-based tech deployment strategies

### Crisis Systems
- Crisis triggers can unlock emergency technologies
- Crisis urgency affects government investment
- Regional crises affect deployment priorities

## Migration from Old System

### What Was Replaced
- **Old**: Scattered tech unlock logic across multiple files
- **New**: Unified tech tree system with clear structure

### Key Improvements
- **20 old techs** → **71 new techs** (3.5x expansion)
- **4 categories** → **10 categories** (2.5x expansion)
- **12 effect types** → **60+ effect types** (5x expansion)
- **Global deployment** → **Regional deployment** (realistic variation)
- **Passive deployment** → **Strategic deployment** (AI/national actions)

### Bug Fixes
- **Double-application bug**: Fixed effects being applied twice per month
- **Type safety**: Improved with proper TypeScript types
- **Serialization**: Fixed Set/Map object handling

## Research Citations

All technologies include research citations from:
- **IEA Energy Efficiency 2024**
- **Epoch AI Compute Trends**
- **Stanford AI Index 2024**
- **Anthropic "Simple probes catch sleeper agents"**
- **Colossal Biosciences de-extinction progress**
- **Climeworks Mammoth facility**
- **US DOE CCSI2 project**
- **Harvard Making Caring Common**
- And 50+ more citations across all technologies

## Future Enhancements

### Planned Features
1. **Sleeper AI Tech Tree**: 4-stage resource acquisition progression
2. **Tech Sabotage Detection**: Enhanced detection mechanics
3. **Dynamic Prerequisites**: Prerequisites that change based on game state
4. **Tech Combinations**: Synergistic effects between technologies
5. **Regional Specialization**: Region-specific technology variants

### Research Areas
1. **Technology Diffusion Models**: How tech spreads between regions
2. **Innovation Networks**: Collaborative research between nations
3. **Technology Transfer**: Developed → developing world tech sharing
4. **Patent Systems**: Intellectual property and tech access
5. **Regulatory Frameworks**: Government tech approval processes

## Troubleshooting

### Common Issues
1. **Tech not unlocking**: Check prerequisites and capability gates
2. **Effects not applying**: Verify tech is deployed (not just unlocked)
3. **Regional deployment issues**: Check regional factors and relevance
4. **Serialization errors**: Ensure Set/Map objects are properly handled

### Debug Tools
1. **Visualization script**: See tech tree structure and status
2. **Console logging**: Tech unlock and deployment events
3. **Monte Carlo testing**: Validate system behavior
4. **Type checking**: Ensure proper TypeScript types

## Performance Considerations

### Optimization
- Effects engine uses efficient property access
- Regional calculations cached where possible
- Tech tree state serialized efficiently
- Minimal memory allocation in hot paths

### Scalability
- System designed for 100+ technologies
- Regional deployment scales with number of regions
- Effects engine handles 100+ effect types
- Visualization supports large tech trees

---

*This documentation covers the comprehensive tech tree system implemented in October 2025. The system provides realistic technology progression, regional deployment variation, and strategic decision-making for AI agents and governments.*
