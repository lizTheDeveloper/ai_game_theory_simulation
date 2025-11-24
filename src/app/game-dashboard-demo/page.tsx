'use client';

import React, { useState } from 'react';
import { GameDashboard } from '@/components/dashboards/game';

/**
 * Demo page for the Game Dashboard
 * Shows the far-future aesthetic game interface
 */
export default function GameDashboardDemo() {
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState('overview');

  const handleAdvanceMonth = () => {
    console.log('Advancing to next month...');
    // In real implementation, this would trigger simulation step
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    console.log(`Simulation speed changed to: ${newSpeed}`);
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    console.log(`Action mode changed to: ${newMode}`);
  };

  const handleDecisionSelect = (decisionId: string) => {
    console.log(`Decision selected: ${decisionId}`);
    // In real implementation, this would open decision modal
  };

  return (
    <div style={{ height: '100vh', background: '#000' }}>
      <GameDashboard
        onAdvanceMonth={handleAdvanceMonth}
        onSpeedChange={handleSpeedChange}
        onModeChange={handleModeChange}
        onDecisionSelect={handleDecisionSelect}
      />
    </div>
  );
}