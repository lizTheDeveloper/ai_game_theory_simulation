/**
 * Health Check Module for MARCUS Platform
 *
 * Provides comprehensive health checks for:
 * - Database connectivity
 * - Redis connectivity
 * - System resources (disk, memory)
 * - Agent availability
 *
 * Implements Kubernetes-compatible endpoints:
 * - /health - Overall health status
 * - /ready - Readiness probe (can accept traffic)
 * - /live - Liveness probe (should be restarted if failing)
 */

import { Pool } from 'pg';
import { Redis } from 'ioredis';
import * as os from 'os';
import * as fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// ============================================================================
// Type Definitions
// ============================================================================

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: ComponentHealth;
    redis: ComponentHealth;
    disk: ComponentHealth;
    memory: ComponentHealth;
    agents?: ComponentHealth;
  };
}

export interface ComponentHealth {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  responseTime?: number;
  details?: Record<string, any>;
}

export interface ReadinessCheckResult {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    redis: boolean;
    diskSpace: boolean;
  };
  message?: string;
}

export interface LivenessCheckResult {
  alive: boolean;
  timestamp: string;
  uptime: number;
}

// ============================================================================
// Health Check Class
// ============================================================================

export class HealthCheckService {
  private readonly pool: Pool;
  private readonly redis: Redis;
  private readonly startTime: number;
  private readonly diskThresholdPercent: number = 10; // Minimum 10% free
  private readonly memoryThresholdPercent: number = 90; // Maximum 90% used

  constructor(pool: Pool, redis: Redis) {
    this.pool = pool;
    this.redis = redis;
    this.startTime = Date.now();
  }

  /**
   * Get comprehensive health status
   * Used by /health endpoint
   */
  async getHealthStatus(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const [database, redisCheck, disk, memory] = await Promise.all([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkDiskSpace(),
        this.checkMemory(),
      ]);

      // Determine overall status
      const checks = { database, redis: redisCheck, disk, memory };
      const overallStatus = this.determineOverallStatus(checks);

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        checks,
      };
    } catch (err) {
      console.error('❌ Health check error:', err);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        checks: {
          database: { status: 'fail', message: 'Error during health check' },
          redis: { status: 'fail', message: 'Error during health check' },
          disk: { status: 'fail', message: 'Error during health check' },
          memory: { status: 'fail', message: 'Error during health check' },
        },
      };
    }
  }

  /**
   * Check readiness to accept traffic
   * Used by /ready endpoint (Kubernetes readiness probe)
   */
  async getReadinessStatus(): Promise<ReadinessCheckResult> {
    try {
      // Check critical dependencies only
      const [dbHealthy, redisHealthy, diskHealthy] = await Promise.all([
        this.isDatabaseHealthy(),
        this.isRedisHealthy(),
        this.isDiskHealthy(),
      ]);

      const ready = dbHealthy && redisHealthy && diskHealthy;

      return {
        ready,
        timestamp: new Date().toISOString(),
        checks: {
          database: dbHealthy,
          redis: redisHealthy,
          diskSpace: diskHealthy,
        },
        message: ready ? 'Service is ready' : 'Service not ready - critical dependencies failing',
      };
    } catch (err) {
      console.error('❌ Readiness check error:', err);
      return {
        ready: false,
        timestamp: new Date().toISOString(),
        checks: {
          database: false,
          redis: false,
          diskSpace: false,
        },
        message: 'Readiness check failed',
      };
    }
  }

  /**
   * Check if process is alive
   * Used by /live endpoint (Kubernetes liveness probe)
   */
  getLivenessStatus(): LivenessCheckResult {
    // Simple liveness check - if we can respond, we're alive
    return {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  // ==========================================================================
  // Component Health Checks
  // ==========================================================================

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      // Test query
      const result = await this.pool.query('SELECT 1 as test, NOW() as timestamp');
      const responseTime = Date.now() - startTime;

      // Get connection pool stats
      const poolSize = this.pool.totalCount;
      const idleConnections = this.pool.idleCount;
      const waitingClients = this.pool.waitingCount;

      // Note: Prometheus metrics are updated by MetricsCollector
      // (avoids duplicate updates on every health check)

      // Determine status
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Database is healthy';

      if (responseTime > 1000) {
        status = 'warn';
        message = 'Database response time high';
      }

      if (waitingClients > 0) {
        status = 'warn';
        message = 'Database connections under pressure';
      }

      return {
        status,
        message,
        responseTime,
        details: {
          poolSize,
          idleConnections,
          waitingClients,
        },
      };
    } catch (err) {
      return {
        status: 'fail',
        message: `Database connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check Redis connectivity and performance
   */
  private async checkRedis(): Promise<ComponentHealth> {
    const startTime = Date.now();
    try {
      // Ping test
      const response = await this.redis.ping();
      const responseTime = Date.now() - startTime;

      if (response !== 'PONG') {
        return {
          status: 'fail',
          message: `Redis ping failed: expected PONG, got ${response}`,
          responseTime,
        };
      }

      // Get Redis info
      const info = await this.redis.info('memory');
      const usedMemory = this.parseRedisInfo(info, 'used_memory_human');

      // Determine status
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = 'Redis is healthy';

      if (responseTime > 500) {
        status = 'warn';
        message = 'Redis response time high';
      }

      return {
        status,
        message,
        responseTime,
        details: {
          usedMemory,
        },
      };
    } catch (err) {
      return {
        status: 'fail',
        message: `Redis connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Check disk space
   */
  private async checkDiskSpace(): Promise<ComponentHealth> {
    try {
      // Get disk space for current directory
      const { stdout } = await execAsync("df -h . | tail -1 | awk '{print $5}'");
      const usedPercent = parseInt(stdout.trim().replace('%', ''));
      const freePercent = 100 - usedPercent;

      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = `Disk space: ${freePercent}% free`;

      if (freePercent < this.diskThresholdPercent) {
        status = 'fail';
        message = `Disk space critical: only ${freePercent}% free`;
      } else if (freePercent < 20) {
        status = 'warn';
        message = `Disk space low: ${freePercent}% free`;
      }

      return {
        status,
        message,
        details: {
          usedPercent,
          freePercent,
          threshold: this.diskThresholdPercent,
        },
      };
    } catch (err) {
      return {
        status: 'warn',
        message: `Could not check disk space: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<ComponentHealth> {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const usedPercent = Math.round((usedMemory / totalMemory) * 100);

      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = `Memory usage: ${usedPercent}%`;

      if (usedPercent >= this.memoryThresholdPercent) {
        status = 'fail';
        message = `Memory usage critical: ${usedPercent}%`;
      } else if (usedPercent >= 80) {
        status = 'warn';
        message = `Memory usage high: ${usedPercent}%`;
      }

      return {
        status,
        message,
        details: {
          totalMemoryMB: Math.round(totalMemory / 1024 / 1024),
          freeMemoryMB: Math.round(freeMemory / 1024 / 1024),
          usedPercent,
          threshold: this.memoryThresholdPercent,
        },
      };
    } catch (err) {
      return {
        status: 'warn',
        message: `Could not check memory: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  }

  // ==========================================================================
  // Simple Boolean Health Checks (for readiness)
  // ==========================================================================

  private async isDatabaseHealthy(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private async isRedisHealthy(): Promise<boolean> {
    try {
      const response = await this.redis.ping();
      return response === 'PONG';
    } catch {
      return false;
    }
  }

  private async isDiskHealthy(): Promise<boolean> {
    try {
      const { stdout } = await execAsync("df -h . | tail -1 | awk '{print $5}'");
      const usedPercent = parseInt(stdout.trim().replace('%', ''));
      const freePercent = 100 - usedPercent;
      return freePercent >= this.diskThresholdPercent;
    } catch {
      return true; // Don't block on disk check failure
    }
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Determine overall health status from component checks
   */
  private determineOverallStatus(checks: {
    database: ComponentHealth;
    redis: ComponentHealth;
    disk: ComponentHealth;
    memory: ComponentHealth;
  }): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = Object.values(checks).map((c) => c.status);

    // If any component failed, system is unhealthy
    if (statuses.includes('fail')) {
      return 'unhealthy';
    }

    // If any component warned, system is degraded
    if (statuses.includes('warn')) {
      return 'degraded';
    }

    // All components passed
    return 'healthy';
  }

  /**
   * Parse Redis INFO output
   */
  private parseRedisInfo(info: string, key: string): string {
    const lines = info.split('\n');
    for (const line of lines) {
      if (line.startsWith(key + ':')) {
        return line.split(':')[1].trim();
      }
    }
    return 'unknown';
  }
}
