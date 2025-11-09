/**
 * Higher-Order Component to add God Mode to any dashboard
 *
 * Wraps a dashboard component with God Mode button and panel.
 */

'use client';

import { useState } from 'react';
import { GodModeButton } from './GodModeButton';
import { GodModePanel } from './GodModePanel';
import { GameState } from '@/types/game';

export interface WithGodModeProps {
  gameState?: GameState | null;
}

export function withGodMode<P extends WithGodModeProps>(
  Component: React.ComponentType<P>
) {
  return function WithGodModeComponent(props: P) {
    const [showGodMode, setShowGodMode] = useState(false);

    return (
      <>
        {/* Original Component */}
        <Component {...props} />

        {/* God Mode Button */}
        <GodModeButton onClick={() => setShowGodMode(true)} />

        {/* God Mode Panel */}
        {showGodMode && (
          <GodModePanel
            gameState={props.gameState || null}
            onClose={() => setShowGodMode(false)}
            onApplyChanges={() => {
              // Trigger re-render or state update
              // This would typically call a function passed from the parent
              console.log('God Mode changes applied');
            }}
          />
        )}
      </>
    );
  };
}

/**
 * Hook for using God Mode in functional components
 */
export function useGodMode(gameState: GameState | null) {
  const [showPanel, setShowPanel] = useState(false);

  const openGodMode = () => setShowPanel(true);
  const closeGodMode = () => setShowPanel(false);

  const GodModeWrapper = () => (
    <>
      <GodModeButton onClick={openGodMode} />
      {showPanel && (
        <GodModePanel
          gameState={gameState}
          onClose={closeGodMode}
          onApplyChanges={() => {
            console.log('God Mode changes applied');
          }}
        />
      )}
    </>
  );

  return {
    GodModeWrapper,
    openGodMode,
    closeGodMode,
    isOpen: showPanel
  };
}