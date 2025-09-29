# AI Alignment Game - Requirements

## Core Gameplay Requirements

### Simulation Timing and Progression
- **Real-time Day Progression**: Each day in the simulation should take exactly 1 second of real time
- **Accurate Month Duration**: Months with different day counts should reflect real calendar timing:
  - January (31 days) = 31 seconds
  - February (28/29 days) = 28/29 seconds  
  - March (31 days) = 31 seconds
  - April (30 days) = 30 seconds
  - etc.
- **Visual Month Progress**: Display a progress bar showing progression through the current month
- **Current Day Display**: Show the current day of the month prominently at the top of the interface
- **Immersive Experience**: Users should feel the passage of time and anticipation as months progress

### User Interface Requirements
- **Port Configuration**: Application must run on port 3333 by default
- **Real-time Updates**: All agent actions and state changes must be visible immediately in the UI
- **Action Tracking**: Display accurate counts of beneficial and harmful actions taken by each agent
- **Dynamic Metrics**: All charts and progress indicators must update in real-time as the simulation progresses

### Agent Behavior Requirements
- **Intelligent Decision Making**: Agents must make contextually appropriate decisions based on their state and the world situation
- **Proper State Persistence**: All agent actions must properly modify and persist state changes
- **Action Frequency**: 
  - AI Agents: 4 actions per month (weekly)
  - Society: 2 actions per month (bi-weekly)
  - Government: Configurable frequency (default 1 per month)

### Technical Requirements
- **State Management**: Use Zustand with Immer for immutable state management
- **Action System**: All agent state mutations must work correctly within the Immer context
- **Event System**: Dynamic events must trigger based on simulation state and agent actions
- **Performance**: Simulation must run smoothly at the specified timing without lag or stuttering

## User Experience Goals
- **Engagement**: The day-by-day progression should create anticipation and engagement
- **Clarity**: Users should always know where they are in the current month's progression
- **Immersion**: The timing should feel natural and create a sense of real passage of time
- **Responsiveness**: All UI elements should respond immediately to simulation state changes
