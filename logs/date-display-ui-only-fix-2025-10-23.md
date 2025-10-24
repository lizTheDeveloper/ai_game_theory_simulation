# Date Display UI-Only Fix - October 23, 2025

## Problem
The date display was affecting the simulation state:
- Simulation was starting at month 9, day 23 (October 23) instead of month 0, day 1
- The year was still being lost
- The date tracking was embedded in the simulation logic instead of being UI-only

## User Requirement
> "It's just a UI element. We could keep today's date and then in the UI, every time a day goes by, we take up by one. But it's in the front end only, not in the simulation."

**Key points:**
- Simulation should always start at month 0, day 1
- The date display should be PURELY a UI element
- The UI should show today's real-world date and increment it
- Date tracking should NOT affect simulation state

## Solution

### 1. **Reverted Worker State Changes**
Removed code that was setting simulation state to today's date:

**Before (WRONG):**
```typescript
state.currentYear = startDate.getFullYear();
state.currentMonth = startDate.getMonth();
state.currentDay = startDate.getDate();
```

**After (CORRECT):**
```typescript
// Simulation state always starts at month 0, day 1 (not today's date)
// The actual calendar date is tracked separately for UI display only
```

### 2. **Added UI-Only Date Tracking in Frontend**
Created separate state in `SimulationWorkerContext.tsx`:

```typescript
// Simulation state (actual month/day in the simulation)
const [simulationMonth, setSimulationMonth] = useState(0)
const [simulationDay, setSimulationDay] = useState(1)

// UI-only date display (doesn't affect simulation state)
const [displayDate, setDisplayDate] = useState<Date>(new Date())
```

### 3. **Date Initialization from Worker**
The worker sends today's date in the `initialized` message:

```typescript
client.on('initialized', (snapshot: InitialStateSnapshot, startDate?: string) => {
  setSimulationMonth(snapshot.currentMonth) // Will be 0

  // Set UI display date to today's real-world date
  if (startDate) {
    setDisplayDate(new Date(startDate))
  } else {
    setDisplayDate(new Date())
  }
})
```

### 4. **Date Increment on Day Change**
Each time the simulation advances a day, the UI display date increments:

```typescript
client.on('dayUpdate', (currentDay: number) => {
  setSimulationDay(currentDay)

  // Increment UI display date by 1 day (purely cosmetic)
  setDisplayDate(prevDate => {
    const newDate = new Date(prevDate)
    newDate.setDate(newDate.getDate() + 1)
    return newDate
  })
})
```

### 5. **Computed Display Values**
The context computes display values from `displayDate`:

```typescript
const displayYear = displayDate.getFullYear()
const displayMonth = displayDate.getMonth() // 0-based (0 = January)
const displayDay = displayDate.getDate()
```

### 6. **Updated Context Interface**
Exposed both simulation state and display values:

```typescript
interface SimulationWorkerContextValue {
  month: number           // UI display month (for formatted date)
  day: number             // UI display day (for formatted date)
  year: number            // UI display year (for formatted date)
  simulationMonth: number // Actual simulation month (0, 1, 2...)
  simulationDay: number   // Actual simulation day (1-30)
  ...
}
```

### 7. **Updated Navigation Component**
Split the display to show both:

```typescript
// Formatted date at top (uses UI display values)
{formatSimulationDate(year, month, day)}  // e.g., "October 23, 2025"

// Status section (uses simulation values)
<span>Month: {simulationMonth}</span>  // e.g., "0"
<span>Day: {simulationDay}</span>      // e.g., "1"
```

## Result

### Simulation Behavior (Internal State)
- **Always starts at:** Month 0, Day 1
- **Advances normally:** Month 0→1→2... as simulation progresses
- **No calendar date tracking** in the simulation logic

### UI Display (Frontend Only)
- **Shows at top:** "October 23, 2025" (today's real date)
- **Increments daily:** "October 24, 2025", "October 25, 2025", etc.
- **Status section shows:** "Month: 0, Day: 1" (actual simulation state)

## Files Modified

1. **`src/workers/simulationWorker.ts`**
   - Reverted initialization to NOT set state to today's date (line 275-282)
   - Keeps sending `startDate` to frontend for UI display

2. **`src/lib/contexts/SimulationWorkerContext.tsx`**
   - Added `displayDate` state for UI-only date tracking (line 60)
   - Split `month`/`day` into simulation state vs display state (lines 53-54)
   - Updated `initialized` listener to set display date (lines 75-87)
   - Updated `dayUpdate` listener to increment display date (lines 99-108)
   - Compute display values from `displayDate` (lines 189-193)
   - Expose both `simulationMonth`/`simulationDay` and `month`/`day`/`year` (lines 200-206)

3. **`src/components/core/Navigation.tsx`**
   - Destructure both simulation and display values (line 36)
   - Use `simulationMonth`/`simulationDay` in status section (lines 138, 142)
   - Use `year`/`month`/`day` for formatted date (line 119)

## Key Insight

The date is now **purely a UI concern**, completely decoupled from simulation logic:

- **Simulation**: Runs on abstract "months" and "days" (0, 1, 2...)
- **UI Display**: Maps these to real calendar dates for human readability

This maintains simulation purity while providing intuitive date displays to users.
