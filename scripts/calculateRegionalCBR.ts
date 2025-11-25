/**
 * Calculate Regional CBR from TFR Data
 *
 * Converts Total Fertility Rate (TFR) to Crude Birth Rate (CBR) using
 * age structure factors.
 *
 * Formula: CBR ≈ TFR × age_structure_factor
 * Where age_structure_factor depends on median age of population:
 * - Younger populations: ~24 (more women in childbearing years)
 * - Older populations: ~17 (fewer women in childbearing years)
 */

// UN WPP 2024 data: Total Fertility Rate (children per woman)
const REGIONAL_TFR_DATA: Record<number, Record<string, number>> = {
  1990: {
    'East Asia': 2.03,
    'South Asia': 4.11,
    'Sub-Saharan Africa': 6.30,
    'Europe': 1.70,
    'North America': 2.05,
    'Latin America': 3.11,
    'Middle East & North Africa': 4.60,
  },
  2000: {
    'East Asia': 1.69,
    'South Asia': 3.32,
    'Sub-Saharan Africa': 5.80,
    'Europe': 1.43,
    'North America': 2.04,
    'Latin America': 2.58,
    'Middle East & North Africa': 3.48,
  },
  2010: {
    'East Asia': 1.54,
    'South Asia': 2.82,
    'Sub-Saharan Africa': 5.45,
    'Europe': 1.57,
    'North America': 2.04,
    'Latin America': 2.23,
    'Middle East & North Africa': 3.17,
  },
  2020: {
    'East Asia': 1.27,
    'South Asia': 2.28,
    'Sub-Saharan Africa': 4.60,
    'Europe': 1.53,
    'North America': 1.64,
    'Latin America': 1.91,
    'Middle East & North Africa': 2.88,
  },
};

// Age structure factors (empirical - younger populations have higher CBR/TFR ratios)
const AGE_STRUCTURE_FACTORS: Record<string, number> = {
  'East Asia': 18.5,  // Older population (median age ~39)
  'South Asia': 22.0,  // Young-middle (median age ~28)
  'Sub-Saharan Africa': 24.0,  // Very young (median age ~19)
  'Europe': 17.0,  // Very old (median age ~43)
  'North America': 18.0,  // Older (median age ~38)
  'Latin America': 20.0,  // Middle (median age ~31)
  'Middle East & North Africa': 22.0,  // Young (median age ~27)
};

console.log('=== REGIONAL CBR ESTIMATES (per 1000) ===\\n');
console.log('Region                        | 1990  | 2000  | 2010  | 2020  | Decline 2010-2020');
console.log('------------------------------|-------|-------|-------|-------|------------------');

const regions = Object.keys(REGIONAL_TFR_DATA[1990]);
for (const region of regions) {
  const factor = AGE_STRUCTURE_FACTORS[region];
  const cbr1990 = (REGIONAL_TFR_DATA[1990][region] * factor).toFixed(1);
  const cbr2000 = (REGIONAL_TFR_DATA[2000][region] * factor).toFixed(1);
  const cbr2010 = (REGIONAL_TFR_DATA[2010][region] * factor).toFixed(1);
  const cbr2020 = (REGIONAL_TFR_DATA[2020][region] * factor).toFixed(1);

  const decline = (((parseFloat(cbr2010) - parseFloat(cbr2020)) / parseFloat(cbr2010)) * 100).toFixed(1);

  const regionPadded = region.padEnd(30);
  const cbr1990Padded = cbr1990.padStart(5);
  const cbr2000Padded = cbr2000.padStart(5);
  const cbr2010Padded = cbr2010.padStart(5);
  const cbr2020Padded = cbr2020.padStart(5);
  const declinePadded = decline.padStart(6);

  console.log(`${regionPadded}| ${cbr1990Padded} | ${cbr2000Padded} | ${cbr2010Padded} | ${cbr2020Padded} | ${declinePadded}%`);
}

console.log('\\n=== VALIDATION AGAINST GLOBAL CBR ===');
const global2010 = 19.5;
const global2020 = 17.7;
console.log(`Global 2010: ${global2010}/1000`);
console.log(`Global 2020: ${global2020}/1000`);
console.log(`Global decline: ${((global2010 - global2020) / global2010 * 100).toFixed(1)}%`);
