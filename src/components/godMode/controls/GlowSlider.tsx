/**
 * Glow Slider Component
 *
 * Far-future inspired slider with glowing track and value display.
 */

'use client';

import { useCallback } from 'react';

interface GlowSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  displayValue?: (value: number) => string;
  severity?: 'normal' | 'warning' | 'critical' | 'success';
  disabled?: boolean;
}

export function GlowSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  displayValue,
  severity = 'normal',
  disabled = false
}: GlowSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  }, [onChange]);

  const getGlowColor = () => {
    switch (severity) {
      case 'warning':
        return {
          track: 'bg-amber-500',
          glow: 'shadow-[0_0_15px_rgba(255,176,0,0.5)]',
          text: 'text-amber-400'
        };
      case 'critical':
        return {
          track: 'bg-red-500',
          glow: 'shadow-[0_0_15px_rgba(255,0,64,0.5)]',
          text: 'text-red-400'
        };
      case 'success':
        return {
          track: 'bg-green-500',
          glow: 'shadow-[0_0_15px_rgba(0,255,136,0.5)]',
          text: 'text-green-400'
        };
      default:
        return {
          track: 'bg-cyan-500',
          glow: 'shadow-[0_0_15px_rgba(0,240,255,0.5)]',
          text: 'text-cyan-400'
        };
    }
  };

  const colors = getGlowColor();

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-40' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/60 uppercase tracking-wider">
          {label}
        </label>
        <span className={`text-lg font-light tabular-nums ${colors.text}`}>
          {displayValue ? displayValue(value) : value}
        </span>
      </div>

      <div className="relative">
        {/* Track Background */}
        <div className="absolute inset-0 h-1 bg-white/10 rounded-full top-2" />

        {/* Filled Track */}
        <div
          className={`absolute h-1 ${colors.track} rounded-full top-2 ${colors.glow} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />

        {/* Input Range (invisible but interactive) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-5 opacity-0 cursor-pointer relative z-10"
        />

        {/* Thumb Indicator */}
        <div
          className={`absolute w-4 h-4 ${colors.track} rounded-full ${colors.glow}
            -translate-x-1/2 top-0 pointer-events-none transition-all duration-300`}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-white/30 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}