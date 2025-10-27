'use client';

import { useState, useEffect, useRef } from 'react';
import { MonteCarloManager } from '@/lib/MonteCarloManager';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'started' | 'progress' | 'completed' | 'error';
}

export default function ParameterSweepTestPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState('Ready');
  const [progress, setProgress] = useState({ completed: 0, total: 6, percent: 0 });
  const [running, setRunning] = useState(0);
  const [queued, setQueued] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sweepGroups, setSweepGroups] = useState<any[]>([]);

  const managerRef = useRef<MonteCarloManager | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
    };
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const clearLogs = () => {
    setLogs([{ timestamp: new Date().toLocaleTimeString(), message: 'Log cleared.', type: 'info' }]);
  };

  const runTest = async () => {
    setIsRunning(true);
    addLog('=== Parameter Sweep Integration Test Started ===', 'started');
    addLog('Initializing MonteCarloManager...', 'progress');

    const manager = new MonteCarloManager();
    managerRef.current = manager;
    startTimeRef.current = Date.now();

    // Start elapsed timer
    elapsedIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(elapsed);
    }, 1000);

    // Setup event listeners
    manager.on('batchStarted', (batchId) => {
      addLog(`✅ Batch started: ${batchId}`, 'started');
      setStatus('Running');
    });

    manager.on('simulationStarted', (simId) => {
      addLog(`  ▶️  Simulation started: ${simId}`, 'started');
    });

    manager.on('simulationProgress', (simId, month) => {
      if (month % 3 === 0) {
        addLog(`  📊 ${simId}: Month ${month}`, 'progress');
      }
    });

    manager.on('simulationCompleted', (simId, result) => {
      addLog(`  ✅ ${simId} complete: ${result.summary.finalOutcome}`, 'completed');
    });

    manager.on('batchProgress', (progressData) => {
      const pct = Math.round(progressData.progress * 100);
      setProgress({
        completed: progressData.completedRuns,
        total: progressData.totalRuns,
        percent: pct
      });
      setRunning(progressData.activeSimulations);
      setQueued(progressData.queuedSimulations);

      addLog(
        `📈 Progress: ${progressData.completedRuns}/${progressData.totalRuns} (${pct}%) - Running: ${progressData.activeSimulations}, Queued: ${progressData.queuedSimulations}`,
        'progress'
      );
    });

    manager.on('batchCompleted', (batchId, results) => {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
      const totalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

      addLog(`✅ Batch ${batchId} COMPLETE!`, 'completed');
      addLog(`   Total time: ${totalElapsed}s`, 'completed');
      addLog(`   Total simulations: ${results.length}`, 'completed');

      // Show outcome distribution
      const outcomes = results.reduce((acc: Record<string, number>, r) => {
        const outcome = r.summary.finalOutcome;
        acc[outcome] = (acc[outcome] || 0) + 1;
        return acc;
      }, {});

      addLog('', 'completed');
      addLog('📊 Outcome Distribution:', 'completed');
      Object.entries(outcomes).forEach(([outcome, count]) => {
        const pct = Math.round((count / results.length) * 100);
        addLog(`   ${outcome}: ${count}/${results.length} (${pct}%)`, 'completed');
      });

      setStatus('Complete');
      setIsRunning(false);

      // Update sweep groups
      const groups = manager.getSweepResults(batchId);
      if (groups) {
        setSweepGroups(groups.filter(g =>
          g.parameterName === 'thresholdScenario' || g.parameterName === 'seed'
        ));
      }
    });

    manager.on('error', (error) => {
      addLog(`❌ Error: ${error.message}`, 'error');
      if (error.simulationId) {
        addLog(`   Simulation: ${error.simulationId}`, 'error');
      }
    });

    try {
      // Create parameter sweep
      addLog('Creating parameter sweep...', 'progress');
      const batchId = await manager.createParameterSweep({
        seeds: { start: 42000, count: 3 },
        sweepParameters: {
          thresholdScenarios: ['baseline', 'utopia']
        },
        fixedParameters: {
          scenario: 'historical',
          maxMonths: 12,
          updateInterval: 100
        },
        name: 'Browser Integration Test Sweep'
      });

      addLog(`Created batch: ${batchId}`, 'started');

      // Start execution
      addLog('Starting parameter sweep execution...', 'progress');
      await manager.startParameterSweep(batchId);

      addLog('', 'completed');
      addLog('=== Test Complete ===', 'completed');

    } catch (error: any) {
      addLog(`❌ Test failed: ${error.message}`, 'error');
      console.error(error);
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
      setStatus('Failed');
      setIsRunning(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'Monaco, "Courier New", monospace',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      background: '#0a0a0a',
      color: '#00ff00',
      minHeight: '100vh'
    }}>
      <h1 style={{ borderBottom: '2px solid #00ff00', paddingBottom: '10px' }}>
        Monte Carlo Parameter Sweep Integration Test
      </h1>

      <div style={{ padding: '10px', margin: '10px 0', border: '1px solid #00ff00', background: '#0f0f0f' }}>
        <h2>Test Configuration</h2>
        <p><strong>Seeds:</strong> 42000-42002 (3 seeds)</p>
        <p><strong>Threshold Scenarios:</strong> baseline, utopia (2 scenarios)</p>
        <p><strong>Fixed:</strong> historical scenario, 12 months</p>
        <p><strong>Total Simulations:</strong> 3 × 2 = 6</p>
        <p><strong>Expected Time:</strong> ~6-12 minutes</p>
      </div>

      <div>
        <button
          onClick={runTest}
          disabled={isRunning}
          style={{
            background: isRunning ? '#666' : '#00ff00',
            color: '#0a0a0a',
            border: 'none',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            margin: '5px',
            fontFamily: 'Monaco, monospace'
          }}
        >
          Start Parameter Sweep Test
        </button>
        <button
          onClick={clearLogs}
          style={{
            background: '#00ff00',
            color: '#0a0a0a',
            border: 'none',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '5px',
            fontFamily: 'Monaco, monospace'
          }}
        >
          Clear Log
        </button>
      </div>

      <div style={{ padding: '10px', margin: '10px 0', border: '1px solid #00ff00', background: '#0f0f0f' }}>
        <h2>Progress</h2>
        <div style={{ width: '100%', height: '30px', background: '#0f0f0f', border: '1px solid #00ff00', margin: '10px 0', position: 'relative' }}>
          <div style={{ height: '100%', background: '#00ff00', width: `${progress.percent}%`, transition: 'width 0.3s' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#0a0a0a', fontWeight: 'bold' }}>
            {progress.completed} / {progress.total} ({progress.percent}%)
          </div>
        </div>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Running:</strong> {running} | <strong>Queued:</strong> {queued}</p>
        <p><strong>Elapsed:</strong> {elapsed}s</p>
      </div>

      {sweepGroups.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', margin: '20px 0' }}>
          <h2 style={{ gridColumn: '1/-1' }}>Sweep Group Results</h2>
          {sweepGroups.map((group, idx) => {
            const outcomes = group.runs.reduce((acc: Record<string, number>, r: any) => {
              if (r.outcome) {
                acc[r.outcome] = (acc[r.outcome] || 0) + 1;
              }
              return acc;
            }, {});

            return (
              <div key={idx} style={{ border: '1px solid #00ff00', padding: '10px', background: '#0f0f0f' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#00aaff' }}>{group.label}</h3>
                <p><strong>Runs:</strong> {group.runs.length}</p>
                <p><strong>Parameters:</strong> {JSON.stringify(group.parameters)}</p>
                {Object.keys(outcomes).length > 0 && (
                  <>
                    <p><strong>Outcomes:</strong></p>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {Object.entries(outcomes).map(([outcome, count]) => (
                        <li key={outcome}>
                          {outcome}: {count}/{group.runs.length} ({Math.round((count as number) / group.runs.length * 100)}%)
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        background: '#0f0f0f',
        border: '1px solid #00ff00',
        padding: '15px',
        margin: '10px 0',
        maxHeight: '600px',
        overflowY: 'auto',
        fontSize: '12px',
        lineHeight: '1.4'
      }}>
        {logs.map((log, idx) => (
          <div
            key={idx}
            style={{
              margin: '2px 0',
              color: log.type === 'error' ? '#ff0000' :
                     log.type === 'started' ? '#00aaff' :
                     log.type === 'progress' ? '#ffaa00' :
                     log.type === 'completed' ? '#00ff00' : '#00ff00'
            }}
          >
            [{log.timestamp}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}
