#!/bin/bash

# Check oldest sources in actively-used research files
FILES=(
  "research/ai_collective_evolution_validation_20251024.md"
  "research/ai_coordination_transition_mechanics_VALIDATED_20251121.md"
  "research/ai_scaling_laws_2025_REVISED_20251211.md"
  "research/alignment_faking_anthropic_2024.md"
  "research/baseline_mortality_skeptical_review_20251124.md"
  "research/bifurcation_empirical_validation_20251112.md"
  "research/biodiversity_temporal_analysis_HIGH11_20251128.md"
  "research/carbon_sinks_1990_2025_20251126.md"
  "research/climate-mortality-biosphere-multiparadigm-framework_20251028.md"
  "research/climate_deployment_timescales_20251113.md"
  "research/climate_hindcast_data_20251126.md"
  "research/climate_self_limiting_mechanisms_20251125.md"
  "research/climate_stability_mechanisms_2024_2025_update.md"
  "research/climate_tech_deployment_timescales_20251112.md"
  "research/climate_tipping_timescales_20251106.md"
  "research/de_extinction_capabilities_timelines_20251022.md"
  "research/death_attribution_methodology_20251018.md"
  "research/demographics_1990_calibration_20251126.md"
  "research/energy_budget_constraints_20251209.md"
  "research/gaming-sleeper-detection_20251017.md"
  "research/mortality_caps_historical_data_20251027.md"
  "research/nitrogen_food_coupling_20251115.md"
  "research/ocean_acidification_cascades_REVISED_20251128.md"
  "research/planetary_boundary_reversibility_empirical_20251020.md"
  "research/threshold_tier2_historical_ranges_20251026.md"
  "research/threshold_tier3_scenarios_20251026.md"
  "research/water_scarcity_migration_immobility_20251020.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    oldest=$(grep -iE "^(oldest_source|Oldest source|oldest:)" "$file" | head -1 || echo "N/A")
    echo "=== $(basename $file) ==="
    echo "  $oldest"
    echo ""
  fi
done
