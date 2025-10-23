'use client';

import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  showArea?: boolean;
  threshold?: number;
  thresholdColor?: string;
  minValue?: number;  // Optional fixed min for Y-axis
  maxValue?: number;  // Optional fixed max for Y-axis
  maxDataPoints?: number;  // Max expected data points (for progressive reveal)
}

/**
 * Minimal sparkline component for visualizing trends in real-time data.
 * Inspired by Bloomberg Terminal and Elysium UI - clean, high-contrast, informative.
 */
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 30,
  color = '#00F0FF',
  strokeWidth = 1.5,
  className = '',
  showArea = false,
  threshold,
  thresholdColor = '#FF6B00',
  minValue,
  maxValue,
  maxDataPoints
}) => {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return '';

    const padding = 2;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    // Use provided min/max or calculate from data
    const min = minValue !== undefined ? minValue : Math.min(...data);
    const max = maxValue !== undefined ? maxValue : Math.max(...data);
    const range = max - min || 1;

    // Use maxDataPoints for X-axis if provided (for progressive reveal)
    // Otherwise use data.length for normal auto-scaling behavior
    const totalPoints = maxDataPoints !== undefined ? maxDataPoints : data.length;

    // Generate SVG path
    const points = data.map((value, index) => {
      const x = padding + (index / (totalPoints - 1)) * effectiveWidth;
      const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, width, height, minValue, maxValue, maxDataPoints]);

  const areaPath = useMemo(() => {
    if (!showArea || !data || data.length < 2) return '';

    const padding = 2;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    // Use provided min/max or calculate from data
    const min = minValue !== undefined ? minValue : Math.min(...data);
    const max = maxValue !== undefined ? maxValue : Math.max(...data);
    const range = max - min || 1;

    // Use maxDataPoints for X-axis if provided
    const totalPoints = maxDataPoints !== undefined ? maxDataPoints : data.length;

    const points = data.map((value, index) => {
      const x = padding + (index / (totalPoints - 1)) * effectiveWidth;
      const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
      return `${x},${y}`;
    });

    // Close the path to create an area
    const firstX = padding;
    const lastX = points[points.length - 1].split(',')[0]; // Last point's X position
    const bottomY = padding + effectiveHeight;

    return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
  }, [data, width, height, showArea, minValue, maxValue, maxDataPoints]);

  const thresholdY = useMemo(() => {
    if (threshold === undefined || !data || data.length === 0) return null;

    const padding = 2;
    const effectiveHeight = height - padding * 2;

    // Use provided min/max or calculate from data
    const min = minValue !== undefined ? minValue : Math.min(...data);
    const max = maxValue !== undefined ? maxValue : Math.max(...data);
    const range = max - min || 1;

    return padding + effectiveHeight - ((threshold - min) / range) * effectiveHeight;
  }, [threshold, data, height, minValue, maxValue]);

  if (!data || data.length < 2) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-white/20 text-xs">No data</span>
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={`inline-block ${className}`}
      style={{ minWidth: width }}
    >
      {/* Area fill (optional) */}
      {showArea && areaPath && (
        <path
          d={areaPath}
          fill={color}
          opacity={0.1}
        />
      )}

      {/* Threshold line (optional) */}
      {thresholdY !== null && (
        <line
          x1={2}
          y1={thresholdY}
          x2={width - 2}
          y2={thresholdY}
          stroke={thresholdColor}
          strokeWidth={1}
          strokeDasharray="2,2"
          opacity={0.5}
        />
      )}

      {/* Main line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `drop-shadow(0 0 3px ${color}40)` // Subtle glow effect
        }}
      />

      {/* Current value indicator (last point) */}
      {data.length > 0 && (() => {
        const padding = 2;
        const effectiveWidth = width - padding * 2;
        const effectiveHeight = height - padding * 2;
        const min = minValue !== undefined ? minValue : Math.min(...data);
        const max = maxValue !== undefined ? maxValue : Math.max(...data);
        const range = max - min || 1;
        const totalPoints = maxDataPoints !== undefined ? maxDataPoints : data.length;
        const lastIndex = data.length - 1;

        // Calculate X position based on actual last index and maxDataPoints
        const cx = padding + (lastIndex / (totalPoints - 1)) * effectiveWidth;
        const cy = padding + effectiveHeight - ((data[lastIndex] - min) / range) * effectiveHeight;

        return (
          <circle
            cx={cx}
            cy={cy}
            r={2}
            fill={color}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`
            }}
          />
        );
      })()}
    </svg>
  );
};

export default Sparkline;