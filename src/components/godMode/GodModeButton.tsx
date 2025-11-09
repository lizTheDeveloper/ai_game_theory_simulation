/**
 * God Mode Button
 *
 * Floating action button to open God Mode panel.
 * Glows when God Mode is active.
 */

'use client';

import { useState, useEffect } from 'react';
import { godMode } from '@/simulation/godMode/GodModeController';

interface GodModeButtonProps {
  onClick: () => void;
}

export function GodModeButton({ onClick }: GodModeButtonProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check God Mode status periodically
    const checkStatus = () => {
      setIsEnabled(godMode.isEnabled());
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full
        flex items-center justify-center
        transition-all duration-300 transform
        ${isHovered ? 'scale-110' : 'scale-100'}
        ${isEnabled
          ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.5)]'
          : 'bg-black/80 border border-white/30 hover:border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
        }`}
      aria-label="Toggle God Mode"
    >
      {/* Icon */}
      <span className={`text-2xl ${isEnabled ? 'animate-pulse' : ''}`}>
        🎮
      </span>

      {/* Status Indicator */}
      {isEnabled && (
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <div className="w-full h-full bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute inset-0 w-full h-full bg-cyan-400 rounded-full" />
        </div>
      )}

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1
          bg-black/90 border border-white/20 rounded-sm
          text-xs text-white/80 whitespace-nowrap
          shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          {isEnabled ? 'GOD MODE ACTIVE' : 'OPEN GOD MODE'}
        </div>
      )}
    </button>
  );
}