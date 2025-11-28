/**
 * Permafrost Carbon Feedback System Initialization (TIER 2, RD-1)
 *
 * Models positive feedback loop from thawing permafrost releasing CO2 and CH4.
 * Arctic amplification causes polar regions to warm 3× faster than global average.
 *
 * Research:
 * - Schuur et al. (2022) Annual Review of Environment and Resources
 * - Turetsky et al. (2020) Nature Geoscience
 * - IPCC AR6 WG1 (2021) Chapter 5 (Carbon cycle feedbacks)
 * - McGuire et al. (2018) Nature
 * - Obu et al. (2019) Earth-Science Reviews (permafrost extent)
 * - Hugelius et al. (2014) The Cryosphere (carbon stocks)
 *
 * Validated Parameters:
 * - Carbon stock: 1,700 Gt C (range 1,460-1,832 Gt)
 * - Permafrost extent: 17.8M km²
 * - Arctic amplification: 3.0× (range 3.0-4.0×)
 * - Thaw sensitivity: 3.5M km²/°C
 * - Decomposition rate: 3.0%/year (range 1.0-5.0%/year)
 * - CO2 fraction: 90%, CH4 fraction: 10%
 */

import { PermafrostSystem } from '@/types/permafrost';

/**
 * Initialize permafrost carbon feedback system
 *
 * Starting conditions (2025 baseline):
 * - Permafrost extent: 17.8M km² (Obu et al. 2019)
 * - Carbon stock: 1,700 Gt C (Hugelius et al. 2014, Schuur et al. 2022)
 * - No emissions initially (thaw starts when temperature rises)
 */
export function initializePermafrostSystem(): PermafrostSystem {
  return {
    // Area of continuously frozen ground (2+ years)
    permafrostExtent: 17.8e6, // 17.8 million km²

    // Total organic carbon trapped in frozen soils
    permafrostCarbon: 1700, // 1,700 Gt C

    // Annual thaw rate (depends on temperature, initially zero)
    annualThawRate: 0,

    // Annual emissions from decomposition (initially zero)
    annualEmissions: 0,
    co2Emissions: 0,
    ch4Emissions: 0,
  };
}
