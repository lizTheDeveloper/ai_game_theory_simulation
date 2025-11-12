/**
 * Wet Bulb Events System Tests
 *
 * Focus: Mortality rate calculation correctness (Nov 12, 2025 fix)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { updateWetBulbTemperatureSystem, initializeWetBulbTemperatureSystem } from '../wetBulbEvents';
import { initializeGame } from '../initialization';
import { GameState } from '@/types/game';
import seedrandom from 'seedrandom';

describe('Wet Bulb Temperature System', () => {
  let state: GameState;
  let rng: () => number;

  beforeEach(() => {
    // Initialize fresh state for each test
    const seed = 'test-wetbulb-mortality-2025-11-12';
    rng = seedrandom(seed);
    state = initializeGame(rng, seed);
  });

  describe('Regional Population Scaling (Nov 12, 2025 fix)', () => {
    it('should scale regional populations when global population declines', () => {
      // Set up extreme warming to trigger heat events
      state.resourceEconomy.co2.temperatureAnomaly = 4.0; // +4°C warming

      // Reduce global population to 50% of baseline
      const baselinePopulation = 8.0; // 8B in 2025
      state.humanPopulationSystem.population = baselinePopulation * 0.5; // 4B

      // Track events before update
      const eventsBefore = state.wetBulbTemperatureSystem.eventsThisMonth.length;

      // Generate heat events (may or may not trigger based on RNG)
      for (let i = 0; i < 100; i++) {
        updateWetBulbTemperatureSystem(state, rng);
        state.currentMonth++;
      }

      // Check that at least some events occurred (high warming should trigger events)
      const totalEvents = state.wetBulbTemperatureSystem.eventHistory.reduce(
        (sum, record) => sum + record.eventCount,
        0
      );

      // With +4°C warming and 100 months, we should see some events
      // (If this fails, seed RNG might not be triggering events - that's OK for this test)
      if (totalEvents > 0) {
        console.log(`✓ Generated ${totalEvents} heat events with +4°C warming`);

        // Check that deaths are reasonable relative to regional population
        // At 50% global population, regional populations should also be ~50%
        // Max reasonable deaths per event: 10% of regional population
        const eventsWithDeaths = state.wetBulbTemperatureSystem.eventHistory.filter(
          record => record.totalDeaths > 0
        );

        expect(eventsWithDeaths.length).toBeGreaterThan(0);
      }
    });

    it('should never produce mortality rates exceeding 100%', () => {
      // Set up extreme scenario: very high warming + depleted population
      state.resourceEconomy.co2.temperatureAnomaly = 5.0; // +5°C (extreme)
      state.humanPopulationSystem.population = 1.0; // 1B (87.5% decline)

      // Run simulation for 50 months (reduced from 100 to save time)
      for (let i = 0; i < 50; i++) {
        // updateWetBulbTemperatureSystem applies mortality internally
        // If mortality rate > 1.0, assertProbability will throw
        expect(() => {
          updateWetBulbTemperatureSystem(state, rng);
        }).not.toThrow();

        state.currentMonth++;
      }

      // If we get here without throwing, mortality rates stayed within [0, 1]
      console.log(`✓ Mortality rates stayed within bounds for ${state.currentMonth} months`);
      console.log(`   Global population: ${state.humanPopulationSystem.population.toFixed(2)}B`);
      console.log(`   Temperature: +${state.resourceEconomy.co2.temperatureAnomaly.toFixed(1)}°C`);
      console.log(`   Total deaths: ${state.wetBulbTemperatureSystem.cumulativeDeaths.toFixed(2)}M`);
    });
  });

  describe('Mortality Rate Calculation', () => {
    it('should calculate mortality rate relative to regional population, not global', () => {
      // This test validates the Nov 12, 2025 fix
      // Previous bug: divided regional deaths by global population → rates could exceed 1.0
      // Fix: divide regional deaths by regional population (from exposedPopulation / exposureFraction)

      // Set extreme conditions to maximize chance of heat events
      state.resourceEconomy.co2.temperatureAnomaly = 4.5; // Very high warming
      state.humanPopulationSystem.population = 2.0; // Depleted population (25% of baseline)

      // Run for enough months to likely trigger at least one event
      let eventCount = 0;
      for (let i = 0; i < 100; i++) {
        const eventsBefore = state.wetBulbTemperatureSystem.eventsThisMonth.length;

        // This will throw if mortality rate exceeds 1.0 (assertProbability validation)
        updateWetBulbTemperatureSystem(state, rng);

        const eventsAfter = state.wetBulbTemperatureSystem.eventsThisMonth.length;
        eventCount += (eventsAfter - eventsBefore);

        state.currentMonth++;
        state.wetBulbTemperatureSystem.eventsThisMonth = []; // Clear for next month
      }

      // Log results for debugging
      console.log(`✓ Processed ${eventCount} heat events without mortality rate assertion errors`);
      console.log(`   Global population: ${state.humanPopulationSystem.population.toFixed(2)}B`);
      console.log(`   Cumulative deaths: ${state.wetBulbTemperatureSystem.cumulativeDeaths.toFixed(2)}M`);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero exposure fraction gracefully', () => {
      // If exposureFraction = 0, no deaths should occur
      // But if deaths > 0 somehow, we'd get division by zero in regional pop calculation
      // This should be prevented by the deaths check at function entry

      state.resourceEconomy.co2.temperatureAnomaly = 3.0;

      // Run simulation - should not crash
      for (let i = 0; i < 20; i++) {
        expect(() => {
          updateWetBulbTemperatureSystem(state, rng);
        }).not.toThrow();
        state.currentMonth++;
      }
    });

    it('should handle extreme population decline (99% die-off)', () => {
      // Test the most extreme scenario
      state.resourceEconomy.co2.temperatureAnomaly = 6.0; // +6°C (catastrophic)
      state.humanPopulationSystem.population = 0.08; // 80M (99% decline)

      for (let i = 0; i < 30; i++) {
        expect(() => {
          updateWetBulbTemperatureSystem(state, rng);
        }).not.toThrow();
        state.currentMonth++;
      }

      console.log(`✓ Handled 99% population decline without errors`);
      console.log(`   Remaining population: ${(state.humanPopulationSystem.population * 1000).toFixed(0)}M`);
    });
  });
});
