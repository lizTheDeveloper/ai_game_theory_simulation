/**
 * God Mode Panel
 *
 * Far-future inspired control interface for manual simulation override.
 * Aesthetic: Black background, white/cyan glowing elements, ultra-clean geometry.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { godMode } from '@/simulation/godMode/GodModeController';
import { GameState } from '@/types/game';
import { GovernmentControls } from './tabs/GovernmentControls';
import { AIAgentControls } from './tabs/AIAgentControls';
import { SocietyControls } from './tabs/SocietyControls';
import { EnvironmentControls } from './tabs/EnvironmentControls';
import { TechnologyControls } from './tabs/TechnologyControls';
import { MetaControls } from './tabs/MetaControls';
import { AuditTrail } from './AuditTrail';

interface GodModePanelProps {
  gameState: GameState | null;
  onClose?: () => void;
  onApplyChanges?: () => void;
}

type TabId = 'government' | 'ai' | 'society' | 'environment' | 'technology' | 'meta' | 'audit';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'government', label: 'Government', icon: '🏛️' },
  { id: 'ai', label: 'AI Agents', icon: '🤖' },
  { id: 'society', label: 'Society', icon: '🤝' },
  { id: 'environment', label: 'Environment', icon: '🌍' },
  { id: 'technology', label: 'Technology', icon: '🔬' },
  { id: 'meta', label: 'Meta', icon: '⚙️' },
  { id: 'audit', label: 'Audit', icon: '📋' }
];

export function GodModePanel({ gameState, onClose, onApplyChanges }: GodModePanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('government');
  const [isEnabled, setIsEnabled] = useState(godMode.isEnabled());
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    // Check if God Mode is enabled on mount
    setIsEnabled(godMode.isEnabled());
  }, []);

  const handleToggleGodMode = useCallback(() => {
    if (isEnabled) {
      godMode.disable();
    } else {
      godMode.enable();
    }
    setIsEnabled(!isEnabled);
  }, [isEnabled]);

  const handleApplyChanges = useCallback(() => {
    if (gameState) {
      godMode.applyOverrides(gameState);
      setUnsavedChanges(false);
      onApplyChanges?.();
    }
  }, [gameState, onApplyChanges]);

  const handleExportConfig = useCallback(() => {
    const config = godMode.exportConfiguration();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'god-mode-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportConfig = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        godMode.importConfiguration(content);
        setIsEnabled(godMode.isEnabled());
      };
      reader.readAsText(file);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Main Container */}
      <div className="h-full flex flex-col">

        {/* Header */}
        <div className="border-b border-white/20 bg-black">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-light text-white tracking-wider">
                GOD MODE
              </h1>
              <div className={`text-xs uppercase tracking-widest px-3 py-1 rounded-sm
                ${isEnabled
                  ? 'text-cyan-400 border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'text-white/40 border border-white/20'}`}>
                {isEnabled ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Control Buttons */}
              <button
                onClick={handleToggleGodMode}
                className={`px-4 py-2 text-sm font-light uppercase tracking-wider
                  transition-all duration-300 rounded-sm
                  ${isEnabled
                    ? 'bg-red-500/20 text-red-400 border border-red-400/60 hover:bg-red-500/30 shadow-[0_0_15px_rgba(255,0,64,0.3)]'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/60 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                  }`}>
                {isEnabled ? 'DEACTIVATE' : 'ACTIVATE'}
              </button>

              {isEnabled && unsavedChanges && (
                <button
                  onClick={handleApplyChanges}
                  className="px-4 py-2 text-sm font-light uppercase tracking-wider
                    bg-green-500/20 text-green-400 border border-green-400/60
                    hover:bg-green-500/30 transition-all duration-300 rounded-sm
                    shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                  APPLY CHANGES
                </button>
              )}

              <button
                onClick={handleExportConfig}
                className="px-3 py-2 text-xs font-light uppercase tracking-wider
                  text-white/60 border border-white/20 hover:border-white/40
                  transition-all duration-300 rounded-sm">
                EXPORT
              </button>

              <label className="px-3 py-2 text-xs font-light uppercase tracking-wider
                text-white/60 border border-white/20 hover:border-white/40
                transition-all duration-300 rounded-sm cursor-pointer">
                IMPORT
                <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
              </label>

              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white/60 transition-colors duration-200">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-light tracking-wider
                  transition-all duration-300 border-b-2
                  ${activeTab === tab.id
                    ? 'text-cyan-400 border-cyan-400 shadow-[0_4px_15px_rgba(0,240,255,0.3)]'
                    : 'text-white/40 border-transparent hover:text-white/60 hover:border-white/20'
                  }`}>
                <span className="mr-2">{tab.icon}</span>
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {!isEnabled ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4 opacity-20">🎮</div>
                  <p className="text-white/40 text-lg font-light tracking-wider">
                    ACTIVATE GOD MODE TO ACCESS CONTROLS
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {activeTab === 'government' && (
                  <GovernmentControls
                    gameState={gameState}
                    onChangeDetected={() => setUnsavedChanges(true)}
                  />
                )}
                {activeTab === 'ai' && (
                  <AIAgentControls
                    gameState={gameState}
                    onChangeDetected={() => setUnsavedChanges(true)}
                  />
                )}
                {activeTab === 'society' && (
                  <SocietyControls
                    gameState={gameState}
                    onChangeDetected={() => setUnsavedChanges(true)}
                  />
                )}
                {activeTab === 'environment' && (
                  <EnvironmentControls
                    gameState={gameState}
                    onChangeDetected={() => setUnsavedChanges(true)}
                  />
                )}
                {activeTab === 'technology' && (
                  <TechnologyControls
                    gameState={gameState}
                    onChangeDetected={() => setUnsavedChanges(true)}
                  />
                )}
                {activeTab === 'meta' && (
                  <MetaControls
                    gameState={gameState}
                    onChangeDetected={() => setUnsavedChanges(true)}
                  />
                )}
                {activeTab === 'audit' && (
                  <AuditTrail />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        {isEnabled && (
          <div className="border-t border-white/20 bg-black px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/40 font-mono">
                {gameState ? `MONTH ${gameState.currentMonth} | YEAR ${Math.floor(gameState.currentMonth / 12) + 2025}` : 'NO SIMULATION'}
              </div>
              <div className="text-xs text-white/40">
                {unsavedChanges && <span className="text-amber-400 mr-4">● UNSAVED CHANGES</span>}
                <span className="text-white/20">OVERRIDES ACTIVE: {godMode['overrides'].size}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}