/**
 * Society agent actions and decision-making logic
 * 
 * Pure functions for human society responses to AI
 */

import { GameState, GameEvent } from '@/types/game';
import { GameAction, ActionResult } from './types';
import { getTrustInAI } from '../socialCohesion';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Society Actions
 */
export const SOCIETY_ACTIONS: GameAction[] = [
  {
    id: 'adapt_social_norms',
    name: 'Adapt Social Norms',
    description: 'Different population segments adapt to post-AI world',
    agentType: 'society',
    energyCost: 1,
    
    canExecute: (state) => {
      return state.society.socialAdaptation < 0.9;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const economicStage = Math.floor(newState.globalMetrics.economicTransitionStage);
      const unemploymentLevel = newState.society.unemploymentLevel;
      const trustLevel = getTrustInAI(newState.society); // Phase 2C: Use paranoia-derived trust
      const hasUBI = newState.government.activeRegulations.some(reg => reg.includes('UBI'));
      const hasRetraining = newState.government.activeRegulations.some(reg => 
        reg.includes('Retraining') || reg.includes('Training')
      );
      const baseRate = newState.config.socialAdaptationRate || 1.0;
      
      // Quartile-based adaptation with realistic time horizons
      let earlyAdopterGain = 0;
      let mediumAdopterGain = 0;
      let slowAdopterGain = 0;
      let resistantAdopterGain = 0;
      
      // Q1: Early Adopters (adapt in 6-12 months)
      if (unemploymentLevel > 0.2 || economicStage >= 1) {
        const monthlyRate = baseRate * 0.08;
        earlyAdopterGain = Math.min(1.0 - newState.society.earlyAdopters, 
          monthlyRate + (trustLevel * 0.02));
      }
      
      // Q2: Medium Adopters (2-5 year horizon)
      if (unemploymentLevel > 0.4 || (economicStage >= 2 && hasUBI)) {
        const monthlyRate = baseRate * 0.015;
        const policyBonus = hasUBI ? 0.01 : 0;
        mediumAdopterGain = Math.min(1.0 - newState.society.mediumAdopters, 
          monthlyRate + policyBonus);
      }
      
      // Q3: Slow Adopters (decade horizon)
      if (unemploymentLevel > 0.6 || (economicStage >= 3 && hasUBI)) {
        const monthlyRate = baseRate * 0.006;
        const crisisBonus = unemploymentLevel > 0.7 ? 0.003 : 0;
        slowAdopterGain = Math.min(1.0 - newState.society.slowAdopters, 
          monthlyRate + crisisBonus);
      }
      
      // Q4: Resistant Adopters (may never adapt)
      if (unemploymentLevel > 0.8 && economicStage >= 3 && hasUBI && trustLevel > 0.6) {
        const monthlyRate = baseRate * 0.002;
        resistantAdopterGain = Math.min(1.0 - newState.society.resistantAdopters, monthlyRate);
      }
      
      // Update quartile adoption levels
      newState.society.earlyAdopters = Math.min(1.0, 
        newState.society.earlyAdopters + earlyAdopterGain);
      newState.society.mediumAdopters = Math.min(1.0, 
        newState.society.mediumAdopters + mediumAdopterGain);
      newState.society.slowAdopters = Math.min(1.0, 
        newState.society.slowAdopters + slowAdopterGain);
      newState.society.resistantAdopters = Math.min(1.0, 
        newState.society.resistantAdopters + resistantAdopterGain);
      
      // Overall social adaptation is weighted average
      const newSocialAdaptation = (
        newState.society.earlyAdopters * 0.25 +
        newState.society.mediumAdopters * 0.25 +
        newState.society.slowAdopters * 0.25 +
        newState.society.resistantAdopters * 0.25
      );
      
      const adaptationGain = newSocialAdaptation - newState.society.socialAdaptation;
      newState.society.socialAdaptation = newSocialAdaptation;
      
      // Stability gain when multiple quartiles are adapting
      const stabilityGain = adaptationGain * (economicStage >= 3 ? 1.5 : 0.5);
      newState.globalMetrics.socialStability += stabilityGain;
      
      const adaptedQuartiles = [
        newState.society.earlyAdopters > 0.1 ? 'early adopters' : '',
        newState.society.mediumAdopters > 0.1 ? 'mainstream' : '',
        newState.society.slowAdopters > 0.1 ? 'traditionalists' : '',
        newState.society.resistantAdopters > 0.1 ? 'resisters' : ''
      ].filter(Boolean);
      
      return {
        success: true,
        newState,
        effects: { 
          social_adaptation: adaptationGain,
          stability_gain: stabilityGain
        },
        events: [{
          id: generateUniqueId('social_adaptation'),
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: adaptedQuartiles.length >= 2 ? 'constructive' : 'info',
          agent: 'Society',
          title: `Social Adaptation: ${adaptedQuartiles.join(', ')} adapting`,
          description: adaptedQuartiles.length >= 2 ?
            `Multiple population segments adapting: ${adaptedQuartiles.join(', ')}` :
            adaptedQuartiles.length === 1 ?
            `${adaptedQuartiles[0]} beginning to adapt` :
            'Adaptation pressure building',
          effects: { adaptation_progress: adaptationGain }
        }],
        message: `Social adaptation: ${(newState.society.socialAdaptation * 100).toFixed(1)}%`
      };
    }
  }
];

/**
 * Select which action society should take
 * Priority-based on unemployment, trust, and adaptation
 */
export function selectSocietyAction(
  state: GameState,
  random: () => number = Math.random
): GameAction | null {
  const availableActions = SOCIETY_ACTIONS.filter(action => 
    action.canExecute(state)
  );
  
  if (availableActions.length === 0) return null;
  
  const unemploymentStress = state.society.unemploymentLevel;
  const adaptationLevel = state.society.socialAdaptation;
  
  let selectedAction = availableActions[0];
  let highestPriority = 0;
  
  availableActions.forEach(action => {
    let priority = 1;
    
    switch (action.id) {
      case 'adapt_social_norms':
        // Higher priority when unemployment is high
        priority = unemploymentStress * 2 + (adaptationLevel < 0.5 ? 2 : 1);
        break;
    }
    
    if (priority > highestPriority) {
      highestPriority = priority;
      selectedAction = action;
    }
  });
  
  return selectedAction;
}

/**
 * Execute society actions for one month
 * Society takes 2 actions per month (bi-weekly)
 */
export function executeSocietyActions(
  state: GameState,
  random: () => number = Math.random
): ActionResult {
  let currentState = JSON.parse(JSON.stringify(state));
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];
  
  // Human Society: 2 actions per month (bi-weekly)
  for (let biweek = 0; biweek < 2; biweek++) {
    const selectedAction = selectSocietyAction(currentState, random);
    if (selectedAction) {
      const result = selectedAction.execute(currentState, undefined, random);
      if (result.success) {
        currentState = result.newState;
        allEvents.push(...result.events);
        Object.assign(allEffects, result.effects);
        messages.push(result.message);
      }
    }
  }
  
  return {
    success: true,
    newState: currentState,
    effects: allEffects,
    events: allEvents,
    message: `Society executed ${messages.length} actions`
  };
}

