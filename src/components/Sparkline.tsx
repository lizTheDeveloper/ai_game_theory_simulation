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
  thresholdColor = '#FF6B00'
}) => {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return '';

    const padding = 2;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    // Find min and max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Generate SVG path
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * effectiveWidth;
      const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, width, height]);

  const areaPath = useMemo(() => {
    if (!showArea || !data || data.length < 2) return '';

    const padding = 2;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * effectiveWidth;
      const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
      return `${x},${y}`;
    });

    // Close the path to create an area
    const firstX = padding;
    const lastX = padding + effectiveWidth;
    const bottomY = padding + effectiveHeight;

    return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
  }, [data, width, height, showArea]);

  const thresholdY = useMemo(() => {
    if (threshold === undefined || !data || data.length === 0) return null;

    const padding = 2;
    const effectiveHeight = height - padding * 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    return padding + effectiveHeight - ((threshold - min) / range) * effectiveHeight;
  }, [threshold, data, height]);

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
      {data.length > 0 && (
        <circle
          cx={width - 2}
          cy={
            2 + (height - 4) -
            ((data[data.length - 1] - Math.min(...data)) /
              (Math.max(...data) - Math.min(...data) || 1)) *
              (height - 4)
          }
          r={2}
          fill={color}
          style={{
            filter: `drop-shadow(0 0 4px ${color})`
          }}
        />
      )}
    </svg>
  );
};

export default Sparkline;