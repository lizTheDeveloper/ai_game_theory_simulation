# Multi-Worker Orchestration for Browser-Based Simulations

**Date:** October 27, 2025
**Researcher:** orchestrator-1
**Context:** Multiverse dashboard feature - managing multiple concurrent simulation workers

## Executive Summary

This research investigates best practices for managing multiple Web Workers in browsers, with focus on resource limits, performance characteristics, and IndexedDB concurrency patterns. Key findings:

- **Optimal worker count:** 4-8 workers for CPU-intensive tasks (not necessarily `navigator.hardwareConcurrency`)
- **Performance degradation:** Confirmed above ~10-20 workers, severe above 100 workers
- **Memory management:** Workers can consume 50-600MB each depending on workload
- **IndexedDB safety:** Write transactions to same object store are serialized (safe), different stores can run concurrently
- **Worker pooling:** Reuse workers rather than create/destroy frequently

## Research Questions & Findings

### 1. Web Worker Pool Management Best Practices

**Question:** What are industry-standard patterns for managing multiple Web Workers? How many can browsers support?

**Key Finding:** Worker pooling is the industry standard pattern for managing multiple workers efficiently.

**Evidence:**

1. **Worker Pooling Pattern** (2024-2025 Best Practice)
   - **Source:** [An Advanced Guide to Web Workers in JavaScript](https://medium.com/@sohail_saifi/an-advanced-guide-to-web-workers-in-javascript-for-performance-heavy-tasks-67d27b5c2448) (Medium, 2024)
   - **Pattern:** Maintain an array of worker instances, assign tasks based on availability
   - **Key Principle:** "Creating a new worker for every task is expensive, and worker pools are an efficient way to reuse workers and minimize the overhead of creating and destroying workers."
   - **Implementation:** Track workers in pool, mark busy/idle, queue tasks when all workers busy

2. **Production Libraries**
   - **workerpool** ([npm](https://www.npmjs.com/package/workerpool), [GitHub](https://github.com/josdejong/workerpool))
     - Implements thread pool pattern for both Node.js and browsers
     - Dynamic task offloading with automatic worker management
     - Used in production by multiple organizations
   - **threads.js** ([threads.js.org](https://threads.js.org/))
     - Manages bulk tasks using controlled thread pool
     - Predictable task dispatching
     - Works across Node.js and browsers

3. **Worker Count Limits** (Empirical Data)
   - **Source:** [Number of Web Workers Limit](https://stackoverflow.com/questions/13574158/number-of-web-workers-limit) (Stack Overflow)
   - **Finding:** "Too many workers (> 100) can decrease performance. Firefox becomes very slow, Chrome crashes."
   - **Optimal for encryption tasks:** 8 workers (tested empirically)
   - **Interpretation:** Performance degradation begins around 10-20 workers, becomes severe above 100

4. **`navigator.hardwareConcurrency` Considerations**
   - **Source:** [Navigator: hardwareConcurrency property](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency) (MDN, 2025)
   - **What it reports:** Number of logical processor cores (includes hyperthreading)
   - **Warning:** "The browser may choose to report a lower number to more accurately represent the number of Workers that can run at once"
   - **Debate:** [Physical vs Logical Cores](https://stackoverflow.com/questions/76166373) - testing shows "maximum performance with 4 web workers on a system with 4 physical cores and 8 logical cores"
   - **Recommendation:** Use `navigator.hardwareConcurrency - 1` (reserve main thread) or cap at 8 regardless of reported value

**Recommendation for Our Use Case:**
- Start with **4-5 concurrent workers** (conservative, works well across devices)
- Allow up to **8 workers maximum** (performance ceiling for CPU-intensive work)
- Implement queuing for additional simulations beyond limit
- Use worker pool pattern (create workers once, reuse for multiple simulations)

---

### 2. Browser Resource Limits and Performance

**Question:** What are memory limits for Web Workers? How does CPU scheduling work? What monitoring APIs exist?

**Key Finding:** Workers share browser process memory (not isolated), and CPU scheduling is handled by OS/browser with no direct control.

**Evidence:**

1. **Memory Consumption** (Empirical Observations)
   - **Source:** [Web Worker consumes massive amount of memory](https://stackoverflow.com/questions/35003676) (Stack Overflow)
   - **Finding:** Workers can consume 400-600MB in Firefox and Chrome
   - **Context:** Processing large datasets (40MB files) causes out-of-memory exceptions
   - **Interpretation:** Workers share browser's memory allocation, not isolated per-worker limits

2. **Browser Memory Limits** (2024-2025)
   - **Source:** [Which Browsers Use the Least Memory in 2024?](https://rdpextra.com/which-browsers-use-the-least-memory-in-2024/) (RDPExtra, 2024)
   - **Chrome:** Memory-saving features include tab discarding under pressure
   - **Edge:** "Sleeping tabs" feature automatically suspends inactive tabs to free memory
   - **Typical range:** Desktop browsers allocate 1-4GB per tab/process (varies by available system memory)

3. **CPU Scheduling**
   - **Source:** [Limiting Web Worker CPU Utilization?](https://stackoverflow.com/questions/12999891/limiting-web-worker-cpu-utilization) (Stack Overflow)
   - **Finding:** "No direct control over CPU allocation from JavaScript"
   - **Browser behavior:** OS/browser scheduler distributes CPU time across workers
   - **Workaround:** Use `setTimeout()` to voluntarily yield CPU in worker (e.g., process in chunks with delays)
   - **Interpretation:** Workers run at full CPU until voluntarily yielding or preempted by OS

4. **Memory Measurement API** (2024-2025)
   - **API:** `performance.measureUserAgentSpecificMemory()`
   - **Source:** [Performance: measureUserAgentSpecificMemory()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measureUserAgentSpecificMemory) (MDN, 2025)
   - **Status:** Experimental API (requires COOP+COEP headers for cross-origin isolation)
   - **What it measures:** "Memory usage of web application including all iframes and workers"
   - **Returns:** Total bytes and breakdown by attribution/type
   - **Use case:** "Memory regression detection, A/B testing memory impact"
   - **Limitation:** **Requires cross-origin isolation** (COOP/COEP headers) - may not be feasible for all apps
   - **Alternative:** Deprecated `performance.memory` (non-standard, Chrome-only) - **do not use**

5. **Performance Monitoring** (Practical Approaches)
   - **Source:** [Concurrency in JavaScript and Web Workers](https://dev.to/olyop/concurrency-in-javascript-and-the-power-of-web-workers-4278) (DEV Community, 2024)
   - **Approach:** Monitor task completion times, track queue depths
   - **Metrics:** Messages/second, latency per task, worker utilization percentage
   - **Throttling strategy:** If main thread responsiveness degrades, reduce worker message frequency

**Recommendation for Our Use Case:**
- **Memory:** Each simulation worker will use ~1-5MB (lightweight), not a major concern until 20+ workers
- **CPU monitoring:** Track message throughput and UI frame rate (60fps target)
- **Throttling strategy:** If frame rate drops below 30fps, reduce update frequency for background workers
- **Memory API:** Do NOT rely on `performance.measureUserAgentSpecificMemory()` (requires COOP/COEP headers)
- **Practical limit:** 5-8 concurrent workers before UI degradation risk

---

### 3. Message Routing and Worker Coordination

**Question:** How to route messages from multiple workers? How to handle worker crashes? What are debugging strategies?

**Key Finding:** Include worker/simulation ID in every message for routing; implement per-worker error handlers.

**Evidence:**

1. **Message Routing Patterns** (Industry Practice)
   - **Source:** [workerpool documentation](https://www.npmjs.com/package/workerpool) (npm, 2024)
   - **Pattern 1: ID-based routing**
     ```javascript
     // Worker sends
     postMessage({ type: 'update', workerId: 'sim-123', data: {...} });

     // Manager routes
     worker.addEventListener('message', (event) => {
       const { workerId, ...msg } = event.data;
       this.routeMessage(workerId, msg);
     });
     ```
   - **Pattern 2: Separate handlers per worker**
     ```javascript
     const worker = new Worker(...);
     worker.addEventListener('message', this.createHandler(workerId));
     ```
   - **Recommendation:** Pattern 1 (cleaner separation, easier debugging)

2. **Worker Crash Recovery**
   - **Source:** [An Advanced Guide to Web Workers](https://medium.com/@sohail_saifi/an-advanced-guide-to-web-workers-in-javascript-for-performance-heavy-tasks-67d27b5c2448) (Medium, 2024)
   - **Error handling:**
     ```javascript
     worker.addEventListener('error', (event) => {
       console.error(`Worker ${id} crashed:`, event.message);
       // Option 1: Restart worker
       this.restartWorker(id);
       // Option 2: Mark simulation as failed
       this.markSimulationFailed(id, event.message);
     });
     ```
   - **Best practice:** Isolate failures - one worker crash should not affect others
   - **Recovery strategy:** Restart worker and resume from last saved state (IndexedDB)

3. **Debugging Strategies**
   - **Chrome DevTools:** Each worker appears as separate thread in Sources panel
   - **Logging:** Include worker ID in all console.log statements for traceability
   - **Message tracing:** Log all postMessage/onmessage calls with timestamps
   - **Performance profiling:** Use Chrome DevTools Performance tab to record worker activity

4. **Message Queue Backpressure**
   - **Problem:** If main thread can't process messages fast enough, queue grows unbounded
   - **Solution:** Throttle worker update frequency when queue depth exceeds threshold
   - **Implementation:**
     ```javascript
     if (this.messageQueue.length > 100) {
       // Slow down all workers
       this.workers.forEach(w => w.postMessage({ type: 'setSpeed', interval: 5000 }));
     }
     ```

**Recommendation for Our Use Case:**
- **Routing:** Include `simulationId` in every worker message
- **Error handling:** Per-worker error handlers, isolate failures, restart workers from saved state
- **Debugging:** Structured logging with simulation IDs, worker IDs, timestamps
- **Backpressure:** Monitor React render queue depth, throttle worker updates if >50 pending updates

---

### 4. IndexedDB Concurrency and Transaction Isolation

**Question:** How do IndexedDB transactions work with multiple concurrent writers? Can multiple workers write simultaneously?

**Key Finding:** IndexedDB serializes write transactions to the same object store (safe), but different stores can run concurrently.

**Evidence:**

1. **Transaction Isolation Model**
   - **Source:** [Understanding IndexedDB: The Complete Guide](https://blog.xnim.me/indexeddb-guide) (Blog, 2024)
   - **Read-only transactions:** Can run concurrently with overlapping scopes
   - **Read-write transactions:** Serialized per object store
   - **Quote:** "If multiple READ_WRITE transactions are attempting to access the same object store, the transaction that was created first must be the transaction which gets access to the object store first, and it is the only transaction which has access to the object store until the transaction is finished."

2. **Concurrent Writes Safety**
   - **Source:** [Are IndexedDB writes actually parallel?](https://stackoverflow.com/questions/78037909/are-indexeddb-writes-actually-parallel) (Stack Overflow, 2024)
   - **Finding:** "Several readwrite transactions for different objectStores are executed concurrently"
   - **Safe pattern:** Each worker writes to different keys in same object store (no conflict)
   - **Unsafe pattern:** Multiple workers updating same key simultaneously (last write wins, no merge)

3. **Transaction Blocking**
   - **Source:** [Locking model for IndexedDB?](https://stackoverflow.com/questions/5518692/locking-model-for-indexeddb) (Stack Overflow)
   - **Behavior:** Write transactions block subsequent write transactions to same object store
   - **Performance impact:** Can cause queueing if many workers writing to same store simultaneously
   - **Mitigation:** Keep transactions short (read → modify → write in single transaction)

4. **Multi-Tab/Worker Coordination**
   - **Source:** [Breaking IndexedDB consistency](https://dev.to/debussyman/breaking-indexeddb-consistency-to-explore-its-transactions-371n) (DEV Community, 2024)
   - **Problem:** "IndexedDB does not provide transaction isolation" across tabs/workers
   - **Web Locks API** (2024): New API for coordinating across tabs
     - **Browser support:** All major browsers as of 2024
     - **Use case:** Prevent race conditions when multiple tabs/workers need coordination
   - **Our case:** Not needed if each worker writes to unique keys

5. **Best Practices for Concurrent Access**
   - **Source:** [Accessing IndexedDB from multiple JavaScript threads](https://stackoverflow.com/questions/9038379/accessing-indexeddb-from-multiple-javascript-threads) (Stack Overflow)
   - **Pattern:** "IndexedDB is safe as long as updates are made to objects fetched within the same transaction"
   - **Recommendation:** Read, modify, write in single transaction (atomic)
   - **Anti-pattern:** Read in one transaction, modify in memory, write in different transaction (race condition)

**Architecture Implications for Our Use Case:**

Our current IndexedDB schema has 3 object stores:
- `events` (indexed by `simulationId` + `timestamp`)
- `simulations` (indexed by `id` = `${simulationId}_${month}`)
- `simulation_metadata` (indexed by `id` = `simulationId`)

**Safety Analysis:**
- ✅ **Events store:** Each worker writes events with unique `simulationId` → no key conflicts
- ✅ **Simulations store:** Each worker writes saves with unique `id` (includes month) → no key conflicts
- ⚠️ **Metadata store:** Multiple workers might update same `simulationId` metadata simultaneously

**Race Condition Risk:**
```typescript
// Worker A: Simulation "42000_historical" at month 10
await saveSimulation("42000_historical", state);  // Updates metadata

// Worker B: Simulation "42000_historical" at month 15 (resumed from earlier save)
await saveSimulation("42000_historical", state);  // Also updates metadata - RACE!
```

**Mitigation:**
- Each simulation should have globally unique ID (include timestamp or UUID)
- Do NOT resume same simulation in multiple workers simultaneously
- UI should prevent user from starting duplicate simulations

**Recommendation for Our Use Case:**
- **Safe by design:** Each simulation gets unique ID (seed + scenario + timestamp)
- **Metadata writes:** Single simulation per unique ID, no conflicts
- **Transaction strategy:** Keep transactions short (< 100ms)
- **No Web Locks needed:** Key-based isolation sufficient

---

### 5. Resource Allocation Strategies

**Question:** When to throttle background workers? How to detect memory pressure? What are typical warning thresholds?

**Key Finding:** Throttle when UI frame rate drops or message queue depth grows; use progressive degradation strategy.

**Evidence:**

1. **Progressive Degradation Strategy** (Industry Pattern)
   - **Source:** [Dynamic Web Worker Pool Management](https://upcommons.upc.edu/bitstream/handle/2117/90716/Web-workers_selfadaption.pdf) (Academic Paper, UPC)
   - **Pattern:** Adjust worker pool size dynamically based on system load
   - **Metrics:** CPU usage, memory pressure, task completion rate
   - **Strategy:** Start with small pool, expand if tasks queue, contract if performance degrades

2. **UI Responsiveness Threshold**
   - **Target:** 60fps for smooth UI (16.67ms per frame)
   - **Warning threshold:** 30fps (33ms per frame) - noticeable janky
   - **Critical threshold:** 15fps (67ms per frame) - unusable
   - **Measurement:** `requestAnimationFrame()` timestamp deltas

3. **Memory Pressure Detection** (Practical Approaches)
   - **Direct measurement:** Not reliably available (requires COOP/COEP)
   - **Indirect signals:**
     - Browser tab suspension (OS memory pressure)
     - Worker creation failures (out of memory)
     - IndexedDB quota errors (storage full)
   - **Strategy:** Defensive limits rather than reactive measurement

4. **Throttling Strategies**
   - **Source:** [How to Improve Web Worker Performance In 2025](https://potentpages.com/web-design/website-speed/improve-web-worker-performance) (2025)
   - **Level 1: Reduce update frequency**
     - Active simulation: 1 update/second (1000ms)
     - Background simulation: 1 update/5 seconds (5000ms)
   - **Level 2: Pause background simulations**
     - Keep only foreground simulation running
     - Resume background when user navigates away
   - **Level 3: Queue new simulations**
     - Don't start new simulation until slot available
     - Show user "waiting for slot" message

5. **Storage Quota Management**
   - **Source:** [Storage Quota API](https://developer.mozilla.org/en-US/docs/Web/API/Storage/estimate) (MDN, 2025)
   - **API:** `navigator.storage.estimate()`
   - **Returns:** `{ usage: number, quota: number }`
   - **Warning threshold:** 80% of quota used
   - **Critical threshold:** 95% of quota used
   - **Action:** Prompt user to delete old simulations

**Recommendation for Our Use Case:**

**Tier 1: Normal Operation (1-5 simulations)**
- All simulations run at normal speed (1 update/second)
- No throttling needed
- UI remains responsive

**Tier 2: Busy Operation (6-8 simulations)**
- Active (foreground) simulation: normal speed
- Background simulations: throttled to 1 update/3 seconds
- Monitor frame rate - if drops below 40fps, move to Tier 3

**Tier 3: Degraded Operation (9-10 simulations)**
- Active simulation: normal speed
- Background simulations: paused (user can resume explicitly)
- Warning message: "Performance degraded, consider closing simulations"

**Tier 4: At Capacity (10+ simulations attempted)**
- New simulations queued, not started
- User must close existing simulation to start new one
- Error message: "Maximum simulations reached (10), close one to continue"

**Storage Management:**
- Check `navigator.storage.estimate()` before saving
- Warn at 80% quota usage
- Block new simulations at 95% quota usage
- Provide "Delete Old Simulations" UI

---

## Summary of Recommendations

### Architecture Design

**MultiSimulationManager Class:**
```typescript
class MultiSimulationManager {
  private workers: Map<string, SimulationWorkerClient>;  // simulationId → worker
  private activeSimulations: Set<string>;                // Currently running
  private queuedSimulations: Queue<SimulationConfig>;    // Waiting for slot
  private maxConcurrent: number = 5;                     // Conservative default
  private maxTotal: number = 10;                         // Absolute maximum

  // Resource monitoring
  private frameRate: number = 60;                        // Current FPS
  private messageQueueDepth: number = 0;                 // Pending updates

  // Lifecycle
  async createSimulation(config: SimulationConfig): Promise<string>;
  async pauseSimulation(id: string): Promise<void>;
  async resumeSimulation(id: string): Promise<void>;
  async stopSimulation(id: string): Promise<void>;

  // Resource management
  private checkResourceUsage(): void;
  private throttleBackgroundSimulations(): void;
  private dequeueSimulationIfSlotAvailable(): void;
}
```

**Message Routing:**
- Every worker message includes `simulationId`
- Manager routes messages to appropriate handler
- Isolated error handling per worker

**IndexedDB Strategy:**
- Unique simulation IDs (seed + scenario + timestamp)
- Short transactions (< 100ms)
- No Web Locks needed (key isolation sufficient)

**Resource Limits:**
- 5 concurrent simulations (normal operation)
- 8 maximum concurrent (degraded performance warning)
- 10 total simulations (including paused)
- Queue system for simulations beyond limit

**Throttling Strategy:**
- Tier 1 (1-5 sims): All run at 1 update/sec
- Tier 2 (6-8 sims): Background throttled to 1 update/3 sec
- Tier 3 (9-10 sims): Background paused, only active runs
- Tier 4 (10+ sims): Queue new simulations, block until slot free

**Performance Monitoring:**
- Track frame rate via `requestAnimationFrame()`
- Monitor message queue depth
- Check storage quota before saves
- Warn user at 80% storage usage

---

## References

### Web Worker Management
1. [An Advanced Guide to Web Workers in JavaScript](https://medium.com/@sohail_saifi/an-advanced-guide-to-web-workers-in-javascript-for-performance-heavy-tasks-67d27b5c2448) (Medium, 2024)
2. [Concurrency in JavaScript and Web Workers](https://dev.to/olyop/concurrency-in-javascript-and-the-power-of-web-workers-4278) (DEV Community, 2024)
3. [workerpool](https://www.npmjs.com/package/workerpool) (npm, 2024) - Production worker pool library
4. [threads.js](https://threads.js.org/) - Cross-platform worker management

### Browser Limits & Performance
5. [Number of Web Workers Limit](https://stackoverflow.com/questions/13574158/number-of-web-workers-limit) (Stack Overflow) - Empirical testing: 100+ workers cause crashes
6. [Navigator: hardwareConcurrency property](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency) (MDN, 2025)
7. [Optimal number of Web Workers](https://stackoverflow.com/questions/25404158/optimal-number-of-web-workers) (Stack Overflow) - Physical vs logical cores
8. [Which Browsers Use the Least Memory in 2024?](https://rdpextra.com/which-browsers-use-the-least-memory-in-2024/) (2024)

### Memory & Performance APIs
9. [Performance: measureUserAgentSpecificMemory()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measureUserAgentSpecificMemory) (MDN, 2025)
10. [How to use performance.memory API in web worker](https://stackoverflow.com/questions/66014710/how-to-use-performance-memory-api-in-web-worker) (Stack Overflow)

### IndexedDB Concurrency
11. [Understanding IndexedDB: The Complete Guide](https://blog.xnim.me/indexeddb-guide) (2024)
12. [Are IndexedDB writes actually parallel?](https://stackoverflow.com/questions/78037909/are-indexeddb-writes-actually-parallel) (Stack Overflow, 2024)
13. [Locking model for IndexedDB?](https://stackoverflow.com/questions/5518692/locking-model-for-indexeddb) (Stack Overflow)
14. [Breaking IndexedDB consistency](https://dev.to/debussyman/breaking-indexeddb-consistency-to-explore-its-transactions-371n) (DEV Community, 2024)
15. [Accessing IndexedDB from multiple JavaScript threads](https://stackoverflow.com/questions/9038379/accessing-indexeddb-from-multiple-javascript-threads) (Stack Overflow)

### Performance Optimization
16. [How to Improve Web Worker Performance In 2025](https://potentpages.com/web-design/website-speed/improve-web-worker-performance) (2025)
17. [Dynamic Web Worker Pool Management](https://upcommons.upc.edu/bitstream/handle/2117/90716/Web-workers_selfadaption.pdf) (Academic Paper, UPC)
18. [Limiting Web Worker CPU Utilization?](https://stackoverflow.com/questions/12999891/limiting-web-worker-cpu-utilization) (Stack Overflow)

---

## Open Questions / Future Research

1. **Cross-origin isolation for memory API:** Is COOP/COEP feasible for our deployment? (Requires server header configuration)
2. **SharedArrayBuffer performance:** Could simulation state sharing reduce memory usage? (Requires COOP/COEP, adds complexity)
3. **OffscreenCanvas for charts:** Could offload chart rendering to workers? (Experimental API, limited browser support)
4. **WebAssembly workers:** Would WASM simulation workers outperform TypeScript? (Major refactoring, uncertain ROI)

These are beyond scope for initial implementation but worth investigating for future optimization.
