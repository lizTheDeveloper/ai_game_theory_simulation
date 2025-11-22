/**
 * Process Registry Unit Tests
 *
 * Tests agent lifecycle tracking and zombie process cleanup.
 *
 * Author: Marcus (Platform Engineer)
 * Date: 2025-11-22
 */

import { spawn, ChildProcess } from 'child_process';
import { ProcessRegistry, ProcessState } from '../../utils/processRegistry';

describe('ProcessRegistry', () => {
  let registry: ProcessRegistry;
  let testProcesses: ChildProcess[] = [];

  beforeEach(() => {
    // Get fresh registry instance
    registry = ProcessRegistry.getInstance();

    // Clear any existing processes
    for (const metadata of registry.getAllProcesses().values()) {
      try {
        metadata.process.kill('SIGKILL');
      } catch (err) {
        // Ignore errors
      }
    }

    // Force unregister all
    for (const agentId of Array.from(registry.getAllProcesses().keys())) {
      registry['processes'].delete(agentId);
    }
  });

  afterEach(() => {
    // Cleanup test processes
    for (const process of testProcesses) {
      try {
        process.kill('SIGKILL');
      } catch (err) {
        // Ignore errors
      }
    }
    testProcesses = [];
  });

  afterAll(async () => {
    await registry.shutdown();
  });

  describe('register', () => {
    test('should register new process', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_001', process, 0);

      const metadata = registry.getProcess('agent_001');
      expect(metadata).toBeDefined();
      expect(metadata!.agentId).toBe('agent_001');
      expect(metadata!.pid).toBe(process.pid);
      expect(metadata!.state).toBe(ProcessState.SPAWNING);
      expect(metadata!.restartCount).toBe(0);

      process.kill('SIGTERM');
    });

    test('should track restart count', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_002', process, 3);

      const metadata = registry.getProcess('agent_002');
      expect(metadata!.restartCount).toBe(3);

      process.kill('SIGTERM');
    });

    test('should throw error if process has no PID', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      // Manually delete PID
      delete (process as any).pid;

      expect(() => {
        registry.register('agent_003', process, 0);
      }).toThrow(/Cannot register process without PID/);
    });

    test('should set up exit handler', (done) => {
      const process = spawn('sleep', ['0.1']); // Exit quickly
      testProcesses.push(process);

      registry.register('agent_004', process, 0);

      // Wait for process to exit
      setTimeout(() => {
        const metadata = registry.getProcess('agent_004');
        expect(metadata!.state).toBe(ProcessState.STOPPED);
        expect(metadata!.exitCode).toBe(0);
        done();
      }, 500);
    });
  });

  describe('updateState', () => {
    test('should update process state', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_005', process, 0);
      registry.updateState('agent_005', ProcessState.RUNNING);

      const metadata = registry.getProcess('agent_005');
      expect(metadata!.state).toBe(ProcessState.RUNNING);

      process.kill('SIGTERM');
    });

    test('should update lastSeenAlive when state is RUNNING', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_006', process, 0);

      const before = new Date();
      registry.updateState('agent_006', ProcessState.RUNNING);
      const after = new Date();

      const metadata = registry.getProcess('agent_006');
      expect(metadata!.lastSeenAlive.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(metadata!.lastSeenAlive.getTime()).toBeLessThanOrEqual(after.getTime());

      process.kill('SIGTERM');
    });

    test('should warn if updating unregistered process', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      registry.updateState('nonexistent', ProcessState.RUNNING);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot update state for unregistered process')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('markAlive', () => {
    test('should update lastSeenAlive timestamp', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_007', process, 0);

      const before = registry.getProcess('agent_007')!.lastSeenAlive;

      // Wait a bit
      setTimeout(() => {
        registry.markAlive('agent_007');

        const after = registry.getProcess('agent_007')!.lastSeenAlive;
        expect(after.getTime()).toBeGreaterThan(before.getTime());

        process.kill('SIGTERM');
      }, 100);
    });

    test('should recover zombie process', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_008', process, 0);
      registry.updateState('agent_008', ProcessState.ZOMBIE);

      registry.markAlive('agent_008');

      const metadata = registry.getProcess('agent_008');
      expect(metadata!.state).toBe(ProcessState.RUNNING);

      process.kill('SIGTERM');
    });

    test('should recover crashed process', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_009', process, 0);
      registry.updateState('agent_009', ProcessState.CRASHED);

      registry.markAlive('agent_009');

      const metadata = registry.getProcess('agent_009');
      expect(metadata!.state).toBe(ProcessState.RUNNING);

      process.kill('SIGTERM');
    });
  });

  describe('unregister', () => {
    test('should remove process from registry', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_010', process, 0);
      expect(registry.getProcess('agent_010')).toBeDefined();

      registry.unregister('agent_010');
      expect(registry.getProcess('agent_010')).toBeUndefined();

      process.kill('SIGTERM');
    });

    test('should handle unregistering non-existent process', () => {
      // Should not throw
      registry.unregister('nonexistent');
    });
  });

  describe('getProcessCount', () => {
    test('should return total count', () => {
      const process1 = spawn('sleep', ['10']);
      const process2 = spawn('sleep', ['10']);
      testProcesses.push(process1, process2);

      registry.register('agent_011', process1, 0);
      registry.register('agent_012', process2, 0);

      expect(registry.getProcessCount()).toBe(2);

      process1.kill('SIGTERM');
      process2.kill('SIGTERM');
    });

    test('should return count by state', () => {
      const process1 = spawn('sleep', ['10']);
      const process2 = spawn('sleep', ['10']);
      const process3 = spawn('sleep', ['10']);
      testProcesses.push(process1, process2, process3);

      registry.register('agent_013', process1, 0);
      registry.register('agent_014', process2, 0);
      registry.register('agent_015', process3, 0);

      registry.updateState('agent_013', ProcessState.RUNNING);
      registry.updateState('agent_014', ProcessState.RUNNING);
      registry.updateState('agent_015', ProcessState.STOPPED);

      expect(registry.getProcessCount(ProcessState.RUNNING)).toBe(2);
      expect(registry.getProcessCount(ProcessState.STOPPED)).toBe(1);
      expect(registry.getProcessCount(ProcessState.ZOMBIE)).toBe(0);

      process1.kill('SIGTERM');
      process2.kill('SIGTERM');
      process3.kill('SIGTERM');
    });
  });

  describe('zombie detection', () => {
    test('should detect zombie processes', (done) => {
      // Create a process that will become a zombie
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_016', process, 0);
      registry.updateState('agent_016', ProcessState.RUNNING);

      // Set zombieThresholdMs to a short value for testing
      registry['zombieThresholdMs'] = 500; // 0.5 seconds

      // Manually set lastSeenAlive to past
      const metadata = registry.getProcess('agent_016')!;
      metadata.lastSeenAlive = new Date(Date.now() - 1000); // 1 second ago

      // Trigger cleanup manually
      registry['detectAndCleanupZombies']();

      // Process should be marked as zombie
      setTimeout(() => {
        const updatedMetadata = registry.getProcess('agent_016');
        expect(updatedMetadata!.state).toBe(ProcessState.ZOMBIE);

        // Cleanup
        process.kill('SIGKILL');
        done();
      }, 100);
    }, 10000);

    test('should not detect healthy processes as zombies', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_017', process, 0);
      registry.updateState('agent_017', ProcessState.RUNNING);
      registry.markAlive('agent_017'); // Just marked alive

      // Trigger cleanup
      registry['detectAndCleanupZombies']();

      // Should still be running
      const metadata = registry.getProcess('agent_017');
      expect(metadata!.state).toBe(ProcessState.RUNNING);

      process.kill('SIGTERM');
    });

    test('should not cleanup processes in STOPPING state', () => {
      const process = spawn('sleep', ['10']);
      testProcesses.push(process);

      registry.register('agent_018', process, 0);
      registry.updateState('agent_018', ProcessState.STOPPING);

      // Set old lastSeenAlive
      const metadata = registry.getProcess('agent_018')!;
      metadata.lastSeenAlive = new Date(Date.now() - 10000); // 10 seconds ago

      registry['zombieThresholdMs'] = 500;

      // Trigger cleanup
      registry['detectAndCleanupZombies']();

      // Should still be STOPPING (not marked as zombie)
      const updatedMetadata = registry.getProcess('agent_018');
      expect(updatedMetadata!.state).toBe(ProcessState.STOPPING);

      process.kill('SIGTERM');
    });
  });

  describe('recordRestart', () => {
    test('should increment restart counter', () => {
      // This test just verifies the method doesn't throw
      // Actual metric verification would require mocking prom-client
      expect(() => {
        registry.recordRestart('agent_019');
      }).not.toThrow();
    });
  });

  describe('shutdown', () => {
    test('should cleanup all processes', async () => {
      const process1 = spawn('sleep', ['10']);
      const process2 = spawn('sleep', ['10']);
      testProcesses.push(process1, process2);

      registry.register('agent_020', process1, 0);
      registry.register('agent_021', process2, 0);

      expect(registry.getProcessCount()).toBe(2);

      await registry.shutdown();

      expect(registry.getProcessCount()).toBe(0);

      // Verify processes were killed
      expect(process1.killed || !process1.pid).toBe(true);
      expect(process2.killed || !process2.pid).toBe(true);
    }, 10000);

    test('should stop cleanup monitor', async () => {
      const stopSpy = jest.spyOn(registry, 'stopCleanupMonitor');

      await registry.shutdown();

      expect(stopSpy).toHaveBeenCalled();

      stopSpy.mockRestore();
    });
  });

  describe('singleton pattern', () => {
    test('should return same instance', () => {
      const instance1 = ProcessRegistry.getInstance();
      const instance2 = ProcessRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
