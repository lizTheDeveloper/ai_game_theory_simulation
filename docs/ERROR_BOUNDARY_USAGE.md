# Dashboard Error Boundary Usage Guide

## Philosophy: Fail Loudly

This is a research simulation tool. Errors should **fail loudly** for investigation, not be hidden behind graceful degradation.

- **No silent fallbacks** - Errors must be visible
- **Full context logging** - Every error includes complete debugging information
- **High-contrast visuals** - Red/black aesthetic makes failures unmissable
- **No defensive defaults** - Fix root causes, don't mask symptoms

## Basic Usage

### Wrapping Individual Dashboards

```tsx
import { DashboardErrorBoundary } from '@/components/DashboardErrorBoundary';
import { MyDashboard } from '@/components/dashboards/MyDashboard';

export default function MyPage() {
  return (
    <DashboardErrorBoundary dashboardName="My Dashboard">
      <MyDashboard />
    </DashboardErrorBoundary>
  );
}
```

### Using the HOC Pattern

```tsx
import { withDashboardErrorBoundary } from '@/components/dashboards/withErrorBoundary';
import { MyDashboard } from './MyDashboard';

// Create wrapped version
const SafeMyDashboard = withDashboardErrorBoundary(MyDashboard, 'My Dashboard');

// Use in component
export default function MyPage() {
  return <SafeMyDashboard />;
}
```

### With Lazy Loading

```tsx
import { Suspense } from 'react';
import { SafeAIAgentsDashboard, DashboardLoader } from '@/components/dashboards/withErrorBoundary';

export default function AIAgentsPage() {
  return (
    <Suspense fallback={<DashboardLoader dashboardName="AI Agents" />}>
      <SafeAIAgentsDashboard />
    </Suspense>
  );
}
```

## Error Display Features

When a dashboard fails, the error boundary displays:

1. **Dashboard name** - Which component failed
2. **Timestamp** - When the error occurred
3. **Error message** - What went wrong
4. **Data context** - Intelligent analysis of likely causes:
   - Missing GameState initialization
   - NaN/Infinity in calculations
   - Null/undefined property access
   - Array operation failures
5. **Stack trace** - Full JavaScript stack (collapsible)
6. **Component stack** - React component hierarchy (collapsible)
7. **Action buttons**:
   - **Copy Error Context** - Copies full error report to clipboard
   - **Attempt Retry** - Tries to re-render (useful for race conditions)

## Visual Design

The error boundary follows the far-future fail-loudly aesthetic:

```css
/* High-contrast error state */
- Background: Pure black (#000000)
- Border: 4px solid red (#FF0000)
- Glow effect: Red shadow with 40px blur
- Pulsing header for critical errors
- Monospace font for technical details
```

## Common Error Patterns

### Missing Data

```
ERROR: Cannot read properties of undefined (reading 'aiAgents')
CONTEXT: Missing required data - check if GameState is initialized
```

**Fix:** Ensure GameState is properly loaded before rendering

### NaN Values

```
ERROR: Invalid value NaN in capability calculation
CONTEXT: NaN values detected - check numerical calculations
```

**Fix:** Use assertion utilities to validate calculations:
```tsx
import { assertFinite } from '@/simulation/utils/assertions';

const value = assertFinite(calculatedValue, {
  location: 'AICapabilityChart',
  valueName: 'capability',
  month: state.currentMonth
});
```

### Division by Zero

```
ERROR: Result is Infinity
CONTEXT: Infinity values detected - check for division by zero
```

**Fix:** Guard against zero denominators:
```tsx
const ratio = denominator !== 0 ? numerator / denominator : 0;
```

## Integration with Assertion Utilities

The error boundary works best with assertion utilities:

```tsx
// In dashboard component
import { assertStateProperty, assertFinite } from '@/simulation/utils/assertions';

function MyDashboard({ gameState }: Props) {
  // This will throw with full context if missing
  const agents = assertStateProperty(gameState, 'aiAgents', {
    location: 'MyDashboard',
    month: gameState.currentMonth
  });

  // Process with confidence - errors will be caught and displayed
  return agents.map(agent => (
    <AgentCard key={agent.id} agent={agent} />
  ));
}
```

## Testing Error Boundaries

### Trigger Test Errors

```tsx
// Add to any dashboard for testing
if (process.env.NODE_ENV === 'development') {
  if (window.location.search.includes('test-error')) {
    throw new Error('Test error triggered via query param');
  }
}
```

Visit: `http://localhost:3000/dashboard?test-error=1`

### Simulate Data Issues

```tsx
// Test NaN handling
const testValue = parseFloat('not-a-number');
const result = assertFinite(testValue, {
  location: 'TestDashboard',
  valueName: 'testMetric'
});
```

## Best Practices

### DO

- ✅ Wrap every dashboard in an error boundary
- ✅ Include descriptive dashboard names
- ✅ Let errors bubble up to the boundary
- ✅ Use assertion utilities for validation
- ✅ Log additional context in catch blocks

### DON'T

- ❌ Catch and hide errors within dashboards
- ❌ Use try/catch with empty catch blocks
- ❌ Return fallback UI on error (let boundary handle it)
- ❌ Use defensive defaults that mask bugs
- ❌ Suppress error boundaries in production

## Migration Guide

To add error boundaries to existing dashboards:

1. **Option A: Minimal change** - Wrap in page component:
   ```tsx
   // In src/app/my-dashboard/page.tsx
   import { DashboardErrorBoundary } from '@/components/DashboardErrorBoundary';

   <DashboardErrorBoundary dashboardName="My Dashboard">
     <ExistingDashboard />
   </DashboardErrorBoundary>
   ```

2. **Option B: HOC pattern** - Create wrapped versions:
   ```tsx
   // In src/components/dashboards/withErrorBoundary.tsx
   export const SafeMyDashboard = withDashboardErrorBoundary(
     MyDashboard,
     'My Dashboard'
   );
   ```

3. **Option C: Lazy load with boundaries** - For code splitting:
   ```tsx
   export const SafeMyDashboard = withDashboardErrorBoundary(
     React.lazy(() => import('./MyDashboard')),
     'My Dashboard'
   );
   ```

## Performance Considerations

- Error boundaries have **zero performance impact** when no errors occur
- Error state is local to each boundary (doesn't affect siblings)
- Stack traces are only generated when errors actually happen
- Console logging happens asynchronously

## Future Enhancements

Potential improvements (not yet implemented):

1. **Error telemetry** - Send errors to monitoring service
2. **Error recovery strategies** - Auto-retry with exponential backoff
3. **Error categorization** - Different UI for different error types
4. **Session replay** - Capture user actions leading to error
5. **Error report generation** - Formatted reports for GitHub issues

---

Remember: This is a research tool. **Every error is a bug to fix**, not a edge case to handle gracefully. The error boundary ensures we see and fix problems rather than hiding them behind defensive code.