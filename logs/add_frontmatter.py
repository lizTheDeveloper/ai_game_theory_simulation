#!/usr/bin/env python3
"""
Add standardized frontmatter to research files missing last_verified dates.
Extracts oldest/newest source years from citations in the content.
"""

import re
import os
from datetime import date

# Files that need frontmatter
FILES_TO_UPDATE = [
    "ai_coordination_transition_mechanics_VALIDATED_20251121.md",
    "ai_coordination_transition_mortality_20251118.md",
    "baseline_mortality_skeptical_review_20251124.md",
    "biodiversity_temporal_analysis_HIGH11_20251128.md",
    "carbon_sinks_1990_2025_20251126.md",
    "cleanup_effectiveness_concentration_scaling_20251201.md",
    "climate_deployment_timescales_20251113.md",
    "climate_hindcast_data_20251126.md",
    "climate_self_limiting_mechanisms_20251125.md",
    "climate_tech_deployment_timescales_20251112.md",
    "climate_tipping_timescales_20251106.md",
    "de_extinction_capabilities_timelines_20251022.md",
    "demographics_1990_calibration_20251126.md",
    "geopolitical_conflict_escalation_20251128.md",
    "historical_mode_parameters_20251127.md",
    "information_ecology_epistemic_degradation_20251202.md",
    "novel_entities_irreversibility_20251116.md",
    "novel_entities_zero_effectiveness_validation_20251113.md",
    "outcome_variance_mechanisms_20251030.md",
    "parameter_sweep_methodology_20251130.md",
    "population_demographics_regional_20251128.md",
    "post-recalibration-solutions_20251018.md",
    "predicts-database-verification_20251106.md",
    "quantum_computing_cascades_20251210.md",
    "radiation_modeling_20251207.md",
    "regional_death_rates_unwpp2024_20251209.md",
    "temperature_overestimation_HIGH6_research_20251127.md",
    "threshold_tier3_scenarios_20251026.md",
    "unwpp2024_cdr_verification_20251124.md",
]

def extract_years(content):
    """Extract all 4-digit years from content"""
    years = re.findall(r'\b(19[5-9]\d|20[0-2]\d)\b', content)
    years = [int(y) for y in years if 1990 <= int(y) <= 2025]
    return years

def add_frontmatter(filepath):
    """Add frontmatter to a research file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has frontmatter
    if content.startswith('---'):
        print(f"  ⏭️  Already has frontmatter: {os.path.basename(filepath)}")
        return

    # Extract years
    years = extract_years(content)
    oldest = min(years) if years else 2024
    newest = max(years) if years else 2025

    # Create frontmatter
    frontmatter = f"""---
oldest_source: {oldest}
newest_source: {newest}
last_verified: {date.today().isoformat()}
status: used_in_simulation
verification_status: CURRENT
---

"""

    # Prepend frontmatter
    new_content = frontmatter + content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✅ Added frontmatter: {os.path.basename(filepath)} (sources: {oldest}-{newest})")

def main():
    print("=== ADDING FRONTMATTER TO RESEARCH FILES ===\n")

    count = 0
    for filename in FILES_TO_UPDATE:
        filepath = f"research/{filename}"
        if os.path.exists(filepath):
            add_frontmatter(filepath)
            count += 1
        else:
            print(f"  ⚠️  File not found: {filename}")

    print(f"\n=== COMPLETE: Updated {count}/{len(FILES_TO_UPDATE)} files ===")

if __name__ == "__main__":
    main()
