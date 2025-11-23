/**
 * Uncertainty Propagation Module
 *
 * Provides research-backed parameter sampling for climate and tipping point thresholds.
 * Parameters are sampled ONCE at initialization and propagated through the simulation.
 *
 * This enables Monte Carlo to vary not just events, but also underlying parameters,
 * increasing outcome variance to reflect epistemic uncertainty in physical systems.
 *
 * Research foundations:
 * - IPCC AR6 WG1 (2021): Climate sensitivity distributions
 * - Westen et al. JGR (2024): AMOC collapse thresholds
 * - Nature (2023): Ice sheet thresholds
 * - Frontiers in Public Health (2025): Amazon dieback thresholds
 *
 * See: research/uncertainty_propagation_climate_parameters_20251120.md
 */

export {
  sampleUncertaintyParameters,
  logUncertaintyParameters,
  type UncertaintyParameters
} from './sampleUncertaintyParameters';
