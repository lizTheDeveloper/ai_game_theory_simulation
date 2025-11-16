/**
 * PostgreSQL Database Client
 *
 * Production-ready database client with:
 * - Connection pooling (pg-pool)
 * - Query builder integration
 * - Transaction support
 * - Health checks
 * - Retry logic
 * - Metrics instrumentation
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

export interface DBConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // Max connections in pool
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  ssl?: boolean | { rejectUnauthorized: boolean; ca?: string };
}

export interface QueryOptions {
  name?: string; // Prepared statement name
  timeout?: number; // Query timeout in ms
  retries?: number; // Retry count for transient errors
}

export interface TransactionOptions {
  isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
  readOnly?: boolean;
  timeout?: number;
}

export class DatabaseClient {
  private pool: Pool;
  private queryCount = 0;
  private errorCount = 0;
  private slowQueryThresholdMs = 1000;

  constructor(config: DBConfig) {
    const poolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max ?? 20, // Default: 20 connections
      idleTimeoutMillis: config.idleTimeoutMillis ?? 30000, // 30s
      connectionTimeoutMillis: config.connectionTimeoutMillis ?? 5000, // 5s
      ssl: config.ssl ?? false,
    };

    this.pool = new Pool(poolConfig);

    // Error handling
    this.pool.on('error', (err, client) => {
      console.error('🚨 Unexpected database error:', err);
      this.errorCount++;
    });

    this.pool.on('connect', (client) => {
      console.log('🔗 New database connection established');
    });

    this.pool.on('remove', (client) => {
      console.log('🔌 Database connection removed from pool');
    });
  }

  /**
   * Execute a query with automatic retry on transient errors
   */
  async query<T extends QueryResultRow = any>(
    sql: string,
    params?: any[],
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const { name, timeout, retries = 3 } = options;
    const startTime = Date.now();

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        this.queryCount++;

        const result = await this.pool.query<T>({
          text: sql,
          values: params,
          name,
          ...(timeout && { statement_timeout: timeout }),
        });

        const duration = Date.now() - startTime;

        // Log slow queries
        if (duration > this.slowQueryThresholdMs) {
          console.warn(
            `⚠️  Slow query (${duration}ms): ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`
          );
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        this.errorCount++;

        // Retry on transient errors
        const isTransient = this.isTransientError(error);
        const shouldRetry = isTransient && attempt < retries;

        if (shouldRetry) {
          const backoffMs = Math.min(100 * Math.pow(2, attempt), 1000);
          console.warn(
            `⚠️  Query failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${backoffMs}ms...`
          );
          await this.sleep(backoffMs);
          continue;
        }

        // Non-retriable error or max retries exceeded
        console.error('❌ Query failed:', {
          sql: sql.substring(0, 200),
          params,
          error: (error as Error).message,
          attempt: attempt + 1,
          duration: Date.now() - startTime,
        });

        throw error;
      }
    }

    throw lastError!;
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const { isolationLevel = 'READ COMMITTED', readOnly = false, timeout } = options;

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      if (isolationLevel !== 'READ COMMITTED') {
        await client.query(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
      }

      if (readOnly) {
        await client.query('SET TRANSACTION READ ONLY');
      }

      if (timeout) {
        await client.query(`SET LOCAL statement_timeout = ${timeout}`);
      }

      const result = await callback(client);

      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latencyMs: number;
    poolSize: number;
    idleConnections: number;
    waitingClients: number;
  }> {
    const startTime = Date.now();

    try {
      await this.query('SELECT 1');
      const latencyMs = Date.now() - startTime;

      return {
        healthy: true,
        latencyMs,
        poolSize: this.pool.totalCount,
        idleConnections: this.pool.idleCount,
        waitingClients: this.pool.waitingCount,
      };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - startTime,
        poolSize: this.pool.totalCount,
        idleConnections: this.pool.idleCount,
        waitingClients: this.pool.waitingCount,
      };
    }
  }

  /**
   * Get connection pool metrics
   */
  getMetrics() {
    return {
      queryCount: this.queryCount,
      errorCount: this.errorCount,
      errorRate: this.queryCount > 0 ? this.errorCount / this.queryCount : 0,
      poolSize: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingClients: this.pool.waitingCount,
    };
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    console.log('🔌 Closing database connection pool...');
    await this.pool.end();
    console.log('✅ Database connection pool closed');
  }

  /**
   * Check if error is transient (retriable)
   */
  private isTransientError(error: any): boolean {
    const transientCodes = [
      '40001', // serialization_failure
      '40P01', // deadlock_detected
      '53300', // too_many_connections
      '57P03', // cannot_connect_now
      '08006', // connection_failure
      '08003', // connection_does_not_exist
    ];

    return transientCodes.includes(error?.code);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Singleton database client
 */
let dbClient: DatabaseClient | null = null;

export function getDBClient(config?: DBConfig): DatabaseClient {
  if (!dbClient) {
    if (!config) {
      // Default config from environment
      config = {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432'),
        database: process.env.PGDATABASE || 'citation_platform',
        user: process.env.PGUSER || 'citation_platform',
        password: process.env.PGPASSWORD || 'changeme',
        max: parseInt(process.env.PGPOOL_MAX || '20'),
        ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      };
    }

    dbClient = new DatabaseClient(config);
  }

  return dbClient;
}

/**
 * Close singleton client
 */
export async function closeDBClient(): Promise<void> {
  if (dbClient) {
    await dbClient.close();
    dbClient = null;
  }
}

/**
 * Query builder helpers
 */

export interface WhereCondition {
  [key: string]: any;
}

export class QueryBuilder {
  private table: string;
  private selectFields: string[] = ['*'];
  private whereConditions: string[] = [];
  private whereParams: any[] = [];
  private orderByClause: string | null = null;
  private limitValue: number | null = null;
  private offsetValue: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  where(conditions: WhereCondition): this {
    Object.entries(conditions).forEach(([key, value]) => {
      this.whereParams.push(value);
      this.whereConditions.push(`${key} = $${this.whereParams.length}`);
    });
    return this;
  }

  whereRaw(sql: string, params: any[]): this {
    const startIndex = this.whereParams.length + 1;
    this.whereConditions.push(
      sql.replace(/\$(\d+)/g, (_, num) => `$${startIndex + parseInt(num) - 1}`)
    );
    this.whereParams.push(...params);
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByClause = `${column} ${direction}`;
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  build(): { sql: string; params: any[] } {
    let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.table}`;

    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }

    if (this.orderByClause) {
      sql += ` ORDER BY ${this.orderByClause}`;
    }

    if (this.limitValue !== null) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue !== null) {
      sql += ` OFFSET ${this.offsetValue}`;
    }

    return { sql, params: this.whereParams };
  }

  async execute<T = any>(client?: DatabaseClient): Promise<QueryResult<T>> {
    const { sql, params } = this.build();
    const db = client || getDBClient();
    return db.query<T>(sql, params);
  }
}

/**
 * Repository base class
 */
export abstract class Repository<T> {
  protected db: DatabaseClient;
  protected tableName: string;

  constructor(tableName: string, db?: DatabaseClient) {
    this.tableName = tableName;
    this.db = db || getDBClient();
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db.query<T>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findAll(options: { limit?: number; offset?: number } = {}): Promise<T[]> {
    const { limit = 100, offset = 0 } = options;
    const result = await this.db.query<T>(
      `SELECT * FROM ${this.tableName} LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await this.db.query<T>(
      `INSERT INTO ${this.tableName} (${keys.join(', ')})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

    const result = await this.db.query<T>(
      `UPDATE ${this.tableName}
       SET ${setClause}
       WHERE id = $1
       RETURNING *`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  query(): QueryBuilder {
    return new QueryBuilder(this.tableName);
  }
}
