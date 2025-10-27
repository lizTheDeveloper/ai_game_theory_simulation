/**
 * Distribution Visualizer
 *
 * Small sparkline visualization showing probability distribution shapes
 * for threshold uncertainty sampling.
 *
 * Supports: Normal, Triangular, Uniform, Beta, Log-Normal
 */

interface DistributionVisualizerProps {
  type: 'normal' | 'triangular' | 'uniform' | 'beta' | 'lognormal';
  params: {
    min?: number;
    max?: number;
    mode?: number;
    mean?: number;
    stdDev?: number;
    alpha?: number;
    beta?: number;
  };
  width?: number;
  height?: number;
}

export function DistributionVisualizer({
  type,
  params,
  width = 80,
  height = 30
}: DistributionVisualizerProps) {
  const points = generateDistributionPoints(type, params, width);
  const pathData = pointsToSVGPath(points, width, height);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="distribution-sparkline"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Background grid (subtle) */}
      <line x1="0" y1={height} x2={width} y2={height} stroke="var(--white-10)" strokeWidth="1" />

      {/* Distribution curve */}
      <path
        d={pathData}
        fill="none"
        stroke="var(--blue)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Mode marker for triangular */}
      {type === 'triangular' && params.mode !== undefined && (
        <circle
          cx={(params.mode - (params.min || 0)) / ((params.max || 1) - (params.min || 0)) * width}
          cy={5}
          r={3}
          fill="var(--blue)"
        />
      )}

      {/* Mean marker for normal/lognormal */}
      {(type === 'normal' || type === 'lognormal') && params.mean !== undefined && (
        <circle
          cx={width / 2}
          cy={5}
          r={3}
          fill="var(--blue)"
        />
      )}
    </svg>
  );
}

/**
 * Generate points for distribution curve
 */
function generateDistributionPoints(
  type: string,
  params: DistributionVisualizerProps['params'],
  width: number
): Array<{ x: number; y: number }> {
  const numPoints = width;
  const points: Array<{ x: number; y: number }> = [];

  switch (type) {
    case 'triangular': {
      const min = params.min || 0;
      const max = params.max || 1;
      const mode = params.mode !== undefined ? params.mode : (min + max) / 2;

      for (let i = 0; i < numPoints; i++) {
        const x = i;
        const value = min + (i / numPoints) * (max - min);

        // Triangular PDF
        let pdf = 0;
        if (value < mode) {
          pdf = (2 * (value - min)) / ((max - min) * (mode - min));
        } else if (value === mode) {
          pdf = 2 / (max - min);
        } else {
          pdf = (2 * (max - value)) / ((max - min) * (max - mode));
        }

        points.push({ x, y: pdf });
      }
      break;
    }

    case 'uniform': {
      for (let i = 0; i < numPoints; i++) {
        points.push({ x: i, y: 1 });
      }
      break;
    }

    case 'normal': {
      const mean = params.mean || 0;
      const stdDev = params.stdDev || 1;
      const min = mean - 3 * stdDev;
      const max = mean + 3 * stdDev;

      for (let i = 0; i < numPoints; i++) {
        const x = i;
        const value = min + (i / numPoints) * (max - min);

        // Normal PDF
        const exponent = -0.5 * Math.pow((value - mean) / stdDev, 2);
        const pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

        points.push({ x, y: pdf });
      }
      break;
    }

    case 'lognormal': {
      const mean = params.mean || 0;
      const stdDev = params.stdDev || 1;

      for (let i = 0; i < numPoints; i++) {
        const x = i;
        const value = i / numPoints * 10; // 0 to 10 range for visualization

        if (value <= 0) {
          points.push({ x, y: 0 });
          continue;
        }

        // Log-normal PDF
        const exponent = -0.5 * Math.pow((Math.log(value) - mean) / stdDev, 2);
        const pdf = (1 / (value * stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

        points.push({ x, y: pdf });
      }
      break;
    }

    case 'beta': {
      const alpha = params.alpha || 2;
      const beta = params.beta || 2;

      for (let i = 0; i < numPoints; i++) {
        const x = i;
        const value = i / (numPoints - 1); // 0 to 1

        // Beta PDF (simplified - using approximation)
        let pdf = 0;
        if (value > 0 && value < 1) {
          pdf = Math.pow(value, alpha - 1) * Math.pow(1 - value, beta - 1);
        }

        points.push({ x, y: pdf });
      }
      break;
    }

    default:
      // Fallback to uniform
      for (let i = 0; i < numPoints; i++) {
        points.push({ x: i, y: 1 });
      }
  }

  return points;
}

/**
 * Convert points to SVG path data, normalizing Y values to fit height
 */
function pointsToSVGPath(
  points: Array<{ x: number; y: number }>,
  width: number,
  height: number
): string {
  if (points.length === 0) return '';

  // Normalize Y values to 0-1 range
  const maxY = Math.max(...points.map(p => p.y));
  const minY = Math.min(...points.map(p => p.y));
  const range = maxY - minY || 1;

  const normalizedPoints = points.map(p => ({
    x: p.x,
    y: height - ((p.y - minY) / range) * (height - 5) - 5 // 5px padding top/bottom
  }));

  // Start path
  let pathData = `M ${normalizedPoints[0].x} ${normalizedPoints[0].y}`;

  // Add smooth curve through points
  for (let i = 1; i < normalizedPoints.length; i++) {
    pathData += ` L ${normalizedPoints[i].x} ${normalizedPoints[i].y}`;
  }

  return pathData;
}
