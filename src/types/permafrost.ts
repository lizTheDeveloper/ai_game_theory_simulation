/**
 * Permafrost Carbon Feedback System Types (TIER 2, RD-1)
 *
 * Models positive feedback loop from thawing permafrost releasing CO2 and CH4.
 * Arctic amplification (3×) causes accelerated thaw, exposing ancient carbon.
 *
 * Research: Schuur et al. (2022) AREP, Turetsky et al. (2020) Nature Geoscience,
 *           IPCC AR6 WG1 (2021), McGuire et al. (2018) Nature
 *
 * Expected impact: +0.1-0.3°C warming by 2100 in baseline scenarios,
 *                  critical tipping point risk above 1.5°C warming
 */

export interface PermafrostSystem {
  /**
   * Current permafrost extent (km²)
   *
   * Starting value: 17.8M km² (Obu et al. 2019)
   * Range: 0 to 17.8M km²
   *
   * Physical meaning: Area of ground remaining continuously frozen for 2+ years
   */
  permafrostExtent: number;

  /**
   * Carbon stock remaining frozen (Gt C)
   *
   * Starting value: 1,700 Gt C (Hugelius et al. 2014, Schuur et al. 2022)
   * Range: 1,460-1,832 Gt C (uncertainty bounds)
   *
   * Physical meaning: Total organic carbon trapped in frozen soils
   */
  permafrostCarbon: number;

  /**
   * Annual thaw rate (km²/year)
   *
   * Depends on Arctic temperature anomaly
   * Formula: thawRate = arcticTempAnomaly * 3.5e6 (km²/°C)
   *
   * Physical meaning: Rate at which permafrost extent is decreasing
   */
  annualThawRate: number;

  /**
   * Annual total emissions from decomposition (Gt C/year)
   *
   * Depends on exposed carbon and decomposition rate
   * Sum of CO2 and CH4 emissions
   *
   * Physical meaning: Total carbon released to atmosphere from thawed permafrost
   */
  annualEmissions: number;

  /**
   * Annual CO2 emissions (Gt C/year)
   *
   * 90% of total emissions (aerobic decomposition)
   *
   * Physical meaning: Carbon released as carbon dioxide
   */
  co2Emissions: number;

  /**
   * Annual CH4 emissions (Gt C/year)
   *
   * 10% of total emissions (anaerobic decomposition)
   * CH4 has 28× GWP over 100 years
   *
   * Physical meaning: Carbon released as methane
   */
  ch4Emissions: number;
}
