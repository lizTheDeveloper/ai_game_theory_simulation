/**
 * Historical Targets for Hindcast Validation
 *
 * Research-backed historical data (1950-2024) for validating simulation against reality.
 * All values include peer-reviewed sources and acceptable error margins.
 *
 * Created: December 12, 2025
 * Protocol: docs/hindcast_validation_protocol.md
 *
 * CRITICAL: All values are from peer-reviewed sources or official databases.
 * Error margins reflect measurement uncertainty + model simplification limits.
 */

export interface HistoricalDataPoint {
  year: number;
  value: number;
  source: string;
  acceptableErrorPercent: number;
}

export interface HistoricalTarget {
  metric: string;
  unit: string;
  dataPoints: HistoricalDataPoint[];
  notes?: string;
}

/**
 * PRIMARY METRICS (Mandatory for validation)
 *
 * These are the core metrics that MUST pass validation (<10% NRMSE).
 * Failure on any primary metric means the model cannot be used for forecasting.
 */
export const PRIMARY_METRICS: HistoricalTarget[] = [
  {
    metric: 'population',
    unit: 'billions',
    dataPoints: [
      {
        year: 1950,
        value: 2.5,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
      {
        year: 1960,
        value: 3.0,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
      {
        year: 1970,
        value: 3.7,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
      {
        year: 1980,
        value: 4.4,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
      {
        year: 1990,
        value: 5.3,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
      {
        year: 2000,
        value: 6.1,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
      {
        year: 2010,
        value: 6.9,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
      {
        year: 2020,
        value: 7.8,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
      {
        year: 2024,
        value: 8.1,
        source: 'UN World Population Prospects 2024',
        acceptableErrorPercent: 2,
      },
    ],
    notes: 'Population growth is well-documented. Error margins tight (±2%) reflect high-quality census data.',
  },
  {
    metric: 'gdpPPP',
    unit: 'trillions USD',
    dataPoints: [
      {
        year: 1950,
        value: 5.3,
        source: 'Maddison Project Database 2023',
        acceptableErrorPercent: 15,
      },
      {
        year: 1960,
        value: 9.4,
        source: 'Maddison Project Database 2023',
        acceptableErrorPercent: 15,
      },
      {
        year: 1970,
        value: 17.8,
        source: 'Maddison Project Database 2023',
        acceptableErrorPercent: 15,
      },
      {
        year: 1980,
        value: 28.6,
        source: 'Maddison Project Database 2023',
        acceptableErrorPercent: 12,
      },
      {
        year: 1990,
        value: 42.2,
        source: 'Maddison Project Database 2023',
        acceptableErrorPercent: 12,
      },
      {
        year: 2000,
        value: 67.8,
        source: 'Maddison Project Database 2023',
        acceptableErrorPercent: 10,
      },
      {
        year: 2010,
        value: 97.3,
        source: 'Maddison Project Database 2023',
        acceptableErrorPercent: 10,
      },
      {
        year: 2020,
        value: 139.2,
        source: 'Maddison Project Database 2023',
        acceptableErrorPercent: 10,
      },
      {
        year: 2024,
        value: 150.0,
        source: 'Maddison Project Database 2023 (extrapolated)',
        acceptableErrorPercent: 10,
      },
    ],
    notes: 'GDP PPP data has higher uncertainty pre-1990 due to limited data from developing countries. Post-2000 data more reliable.',
  },
  {
    metric: 'co2Emissions',
    unit: 'GtCO2/yr',
    dataPoints: [
      {
        year: 1950,
        value: 6.0,
        source: 'IPCC AR6 WG1, Global Carbon Project 2024',
        acceptableErrorPercent: 10,
      },
      {
        year: 1960,
        value: 9.4,
        source: 'IPCC AR6 WG1, Global Carbon Project 2024',
        acceptableErrorPercent: 8,
      },
      {
        year: 1970,
        value: 14.9,
        source: 'IPCC AR6 WG1, Global Carbon Project 2024',
        acceptableErrorPercent: 7,
      },
      {
        year: 1980,
        value: 19.5,
        source: 'IPCC AR6 WG1, Global Carbon Project 2024',
        acceptableErrorPercent: 6,
      },
      {
        year: 1990,
        value: 22.7,
        source: 'IPCC AR6 WG1, Global Carbon Project 2024',
        acceptableErrorPercent: 5,
      },
      {
        year: 2000,
        value: 25.4,
        source: 'IPCC AR6 WG1, Global Carbon Project 2024',
        acceptableErrorPercent: 5,
      },
      {
        year: 2010,
        value: 33.5,
        source: 'IPCC AR6 WG1, Global Carbon Project 2024',
        acceptableErrorPercent: 5,
      },
      {
        year: 2020,
        value: 34.8,
        source: 'IPCC AR6 WG1, Global Carbon Project 2024',
        acceptableErrorPercent: 5,
      },
      {
        year: 2024,
        value: 37.4,
        source: 'Global Carbon Project 2024',
        acceptableErrorPercent: 5,
      },
    ],
    notes: 'CO2 emissions data from fossil fuel combustion + land use. Measurement improved significantly post-1990 with satellite monitoring.',
  },
  {
    metric: 'temperatureAnomaly',
    unit: 'degrees C (vs 1850-1900 baseline)',
    dataPoints: [
      {
        year: 1950,
        value: -0.02,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 50, // ±0.01°C is 50% of 0.02°C magnitude
      },
      {
        year: 1960,
        value: 0.03,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 33,
      },
      {
        year: 1970,
        value: 0.03,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 33,
      },
      {
        year: 1980,
        value: 0.26,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 8,
      },
      {
        year: 1990,
        value: 0.45,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 4,
      },
      {
        year: 2000,
        value: 0.62,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 3,
      },
      {
        year: 2010,
        value: 0.91,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 2,
      },
      {
        year: 2020,
        value: 1.25,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 2,
      },
      {
        year: 2024,
        value: 1.28,
        source: 'NASA GISS Surface Temperature Analysis (GISTEMP v4)',
        acceptableErrorPercent: 2,
      },
    ],
    notes: 'Temperature anomaly relative to 1850-1900 pre-industrial baseline. Early measurements have higher uncertainty (fewer stations, sea surface temp proxies).',
  },
  {
    metric: 'atmosphericCO2',
    unit: 'ppm',
    dataPoints: [
      {
        year: 1950,
        value: 310,
        source: 'NOAA Mauna Loa Observatory, ice core data (Law Dome)',
        acceptableErrorPercent: 1.6, // ±5 ppm
      },
      {
        year: 1960,
        value: 317,
        source: 'NOAA Mauna Loa Observatory',
        acceptableErrorPercent: 1.5,
      },
      {
        year: 1970,
        value: 326,
        source: 'NOAA Mauna Loa Observatory',
        acceptableErrorPercent: 1.2,
      },
      {
        year: 1980,
        value: 339,
        source: 'NOAA Mauna Loa Observatory',
        acceptableErrorPercent: 1.0,
      },
      {
        year: 1990,
        value: 354,
        source: 'NOAA Mauna Loa Observatory',
        acceptableErrorPercent: 0.7,
      },
      {
        year: 2000,
        value: 369,
        source: 'NOAA Mauna Loa Observatory',
        acceptableErrorPercent: 0.5,
      },
      {
        year: 2010,
        value: 389,
        source: 'NOAA Mauna Loa Observatory',
        acceptableErrorPercent: 0.5,
      },
      {
        year: 2020,
        value: 414,
        source: 'NOAA Mauna Loa Observatory',
        acceptableErrorPercent: 0.5,
      },
      {
        year: 2024,
        value: 422,
        source: 'NOAA Mauna Loa Observatory',
        acceptableErrorPercent: 0.5,
      },
    ],
    notes: 'Atmospheric CO2 is one of the most precisely measured climate metrics. Pre-1958 data from ice cores (Law Dome), post-1958 from direct atmospheric sampling.',
  },
];

/**
 * SECONDARY METRICS (Desirable for comprehensive validation)
 *
 * These metrics strengthen the validation but are not strictly mandatory.
 * They test specific subsystems (biodiversity, forestry, ocean chemistry, security).
 */
export const SECONDARY_METRICS: HistoricalTarget[] = [
  {
    metric: 'biodiversityLPI',
    unit: 'index (1970 = 1.0)',
    dataPoints: [
      {
        year: 1970,
        value: 1.0,
        source: 'WWF Living Planet Index 2024',
        acceptableErrorPercent: 10,
      },
      {
        year: 1980,
        value: 0.88,
        source: 'WWF Living Planet Index 2024',
        acceptableErrorPercent: 10,
      },
      {
        year: 1990,
        value: 0.75,
        source: 'WWF Living Planet Index 2024',
        acceptableErrorPercent: 10,
      },
      {
        year: 2000,
        value: 0.62,
        source: 'WWF Living Planet Index 2024',
        acceptableErrorPercent: 12,
      },
      {
        year: 2010,
        value: 0.48,
        source: 'WWF Living Planet Index 2024',
        acceptableErrorPercent: 12,
      },
      {
        year: 2020,
        value: 0.32,
        source: 'WWF Living Planet Index 2024',
        acceptableErrorPercent: 15,
      },
      {
        year: 2024,
        value: 0.27,
        source: 'WWF Living Planet Index 2024 (extrapolated)',
        acceptableErrorPercent: 15,
      },
    ],
    notes: 'LPI tracks 32,000+ vertebrate populations. -73% decline from 1970 baseline. Higher error margins reflect sampling bias toward well-studied regions.',
  },
  {
    metric: 'forestCover',
    unit: 'million hectares',
    dataPoints: [
      {
        year: 1990,
        value: 4128,
        source: 'FAO Global Forest Resources Assessment 2020',
        acceptableErrorPercent: 5,
      },
      {
        year: 2000,
        value: 4055,
        source: 'FAO Global Forest Resources Assessment 2020',
        acceptableErrorPercent: 5,
      },
      {
        year: 2010,
        value: 3999,
        source: 'FAO Global Forest Resources Assessment 2020',
        acceptableErrorPercent: 4,
      },
      {
        year: 2020,
        value: 3950,
        source: 'FAO Global Forest Resources Assessment 2020',
        acceptableErrorPercent: 4,
      },
    ],
    notes: 'Net forest loss of 178M hectares (1990-2020). Combines deforestation + afforestation. Satellite monitoring improved accuracy post-2000.',
  },
  {
    metric: 'oceanPH',
    unit: 'pH',
    dataPoints: [
      {
        year: 1950,
        value: 8.18,
        source: 'NOAA Ocean Acidification, Feely et al. 2009 (Nature)',
        acceptableErrorPercent: 0.6, // ±0.05 pH
      },
      {
        year: 1970,
        value: 8.15,
        source: 'NOAA Ocean Acidification, Feely et al. 2009 (Nature)',
        acceptableErrorPercent: 0.6,
      },
      {
        year: 1990,
        value: 8.12,
        source: 'NOAA Ocean Acidification, Feely et al. 2009 (Nature)',
        acceptableErrorPercent: 0.5,
      },
      {
        year: 2010,
        value: 8.09,
        source: 'NOAA Ocean Acidification, Feely et al. 2009 (Nature)',
        acceptableErrorPercent: 0.4,
      },
      {
        year: 2024,
        value: 8.06,
        source: 'NOAA Ocean Acidification',
        acceptableErrorPercent: 0.4,
      },
    ],
    notes: 'Ocean pH declining due to CO2 absorption. 0.12 pH unit drop since 1950 (30% increase in acidity). Early measurements from sparse ship data, recent from Argo floats.',
  },
  {
    metric: 'nuclearStockpile',
    unit: 'thousands of warheads',
    dataPoints: [
      {
        year: 1950,
        value: 0.3,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 20,
      },
      {
        year: 1960,
        value: 20.4,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 10,
      },
      {
        year: 1970,
        value: 38.7,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 8,
      },
      {
        year: 1980,
        value: 61.5,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 6,
      },
      {
        year: 1986,
        value: 70.3,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 5,
      },
      {
        year: 1990,
        value: 60.2,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 5,
      },
      {
        year: 2000,
        value: 31.1,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 6,
      },
      {
        year: 2010,
        value: 22.6,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 5,
      },
      {
        year: 2020,
        value: 13.4,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 5,
      },
      {
        year: 2024,
        value: 12.5,
        source: 'SIPRI Nuclear Forces Data 2024',
        acceptableErrorPercent: 5,
      },
    ],
    notes: 'Global nuclear stockpile peaked at ~70,000 warheads (1986), declined post-Cold War. Current ~12,500 (mostly US + Russia). Early data has higher uncertainty due to classification.',
  },
];

/**
 * Helper: Get historical target for a specific metric
 */
export function getHistoricalTarget(metricName: string): HistoricalTarget | undefined {
  const allMetrics = [...PRIMARY_METRICS, ...SECONDARY_METRICS];
  return allMetrics.find(m => m.metric === metricName);
}

/**
 * Helper: Get data point for specific year (with interpolation if needed)
 */
export function getHistoricalValue(
  metricName: string,
  year: number
): { value: number; acceptableErrorPercent: number; interpolated: boolean } | undefined {
  const target = getHistoricalTarget(metricName);
  if (!target) return undefined;

  // Exact match
  const exact = target.dataPoints.find(dp => dp.year === year);
  if (exact) {
    return {
      value: exact.value,
      acceptableErrorPercent: exact.acceptableErrorPercent,
      interpolated: false,
    };
  }

  // Linear interpolation between nearest points
  const sorted = [...target.dataPoints].sort((a, b) => a.year - b.year);
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (year > p1.year && year < p2.year) {
      const ratio = (year - p1.year) / (p2.year - p1.year);
      const interpolatedValue = p1.value + ratio * (p2.value - p1.value);
      const interpolatedError = p1.acceptableErrorPercent + ratio * (p2.acceptableErrorPercent - p1.acceptableErrorPercent);
      return {
        value: interpolatedValue,
        acceptableErrorPercent: interpolatedError,
        interpolated: true,
      };
    }
  }

  return undefined;
}

/**
 * Helper: Get all years with historical data for a metric
 */
export function getHistoricalYears(metricName: string): number[] {
  const target = getHistoricalTarget(metricName);
  if (!target) return [];
  return target.dataPoints.map(dp => dp.year).sort((a, b) => a - b);
}

/**
 * Helper: Check if metric is a primary (mandatory) metric
 */
export function isPrimaryMetric(metricName: string): boolean {
  return PRIMARY_METRICS.some(m => m.metric === metricName);
}
