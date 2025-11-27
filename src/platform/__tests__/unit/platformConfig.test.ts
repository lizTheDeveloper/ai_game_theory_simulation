/**
 * Unit tests for Platform Configuration
 *
 * Tests configuration loading, validation, and edge cases
 *
 * @group unit
 */

import { loadConfiguration, getTestConfiguration, printConfigurationSummary, PlatformConfiguration } from '../../config/platformConfig';

describe('platformConfig', () => {
  // Store original environment
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('loadConfiguration', () => {
    it('should load configuration with all required env vars', () => {
      // Arrange
      process.env.DATABASE_HOST = 'db.example.com';
      process.env.DATABASE_NAME = 'marcus_prod';
      process.env.DATABASE_USER = 'marcus_user';
      process.env.DATABASE_PASSWORD = 'secure_password_123';
      process.env.REDIS_HOST = 'redis.example.com';
      process.env.JWT_SECRET = 'very_secure_jwt_secret_at_least_32_characters_long';

      // Act
      const config = loadConfiguration();

      // Assert
      expect(config.database.host).toBe('db.example.com');
      expect(config.database.database).toBe('marcus_prod');
      expect(config.redis.host).toBe('redis.example.com');
      expect(config.auth.jwtSecret).toBe('very_secure_jwt_secret_at_least_32_characters_long');
    });

    it('should throw error when required env vars are missing', () => {
      // Arrange - Clear all env vars
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_NAME;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.REDIS_HOST;
      delete process.env.JWT_SECRET;

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('Missing required environment variables');
    });

    it('should throw error when DATABASE_HOST is missing', () => {
      // Arrange
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'user';
      process.env.DATABASE_PASSWORD = 'pass';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      delete process.env.DATABASE_HOST;

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('DATABASE_HOST');
    });

    it('should use default values for optional parameters', () => {
      // Arrange - Set only required vars
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';

      // Delete optional vars to test defaults
      delete process.env.REDIS_DB;
      delete process.env.REDIS_MAX_RETRIES_PER_REQUEST;
      delete process.env.NUM_AGENTS;

      // Act
      const config = loadConfiguration();

      // Assert defaults
      expect(config.server.port).toBe(3000);
      expect(config.server.host).toBe('0.0.0.0');
      expect(config.database.port).toBe(5432);
      expect(config.database.max).toBe(20);
      expect(config.database.min).toBe(2);
      expect(config.redis.port).toBe(6379);
      expect(config.redis.db).toBe(0);
      expect(config.agents.numAgents).toBe(9);
      expect(config.agents.enabled).toBe(true);
      expect(config.rateLimiting.enabled).toBe(true);
    });

    it('should parse integer env vars correctly', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.PORT = '8080';
      process.env.DATABASE_PORT = '5433';
      process.env.DATABASE_POOL_MAX = '50';
      process.env.REDIS_PORT = '6380';
      process.env.NUM_AGENTS = '15';

      // Act
      const config = loadConfiguration();

      // Assert
      expect(config.server.port).toBe(8080);
      expect(config.database.port).toBe(5433);
      expect(config.database.max).toBe(50);
      expect(config.redis.port).toBe(6380);
      expect(config.agents.numAgents).toBe(15);
    });

    it('should parse CORS origins as array', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.CORS_ORIGINS = 'http://localhost:3000,https://app.example.com,https://www.example.com';

      // Act
      const config = loadConfiguration();

      // Assert
      expect(config.server.corsOrigins).toEqual([
        'http://localhost:3000',
        'https://app.example.com',
        'https://www.example.com'
      ]);
    });

    it('should use JWT_SECRET for refresh secret when JWT_REFRESH_SECRET not set', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';

      // Explicitly delete JWT_REFRESH_SECRET to test fallback behavior
      delete process.env.JWT_REFRESH_SECRET;

      // Act
      const config = loadConfiguration();

      // Assert
      expect(config.auth.jwtRefreshSecret).toBe(config.auth.jwtSecret);
    });

    it('should allow disabling agents with ENABLE_AGENTS=false', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.ENABLE_AGENTS = 'false';

      // Act
      const config = loadConfiguration();

      // Assert
      expect(config.agents.enabled).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    it('should reject invalid server port (too low)', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.PORT = '0';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('Invalid server port: 0');
    });

    it('should reject invalid server port (too high)', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.PORT = '70000';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('Invalid server port: 70000');
    });

    it('should reject JWT secret that is too short', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'too_short';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('JWT secret must be at least 32 characters');
    });

    it('should reject invalid database pool max', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.DATABASE_POOL_MAX = '0';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('Invalid database pool max: 0');
    });

    it('should reject pool min greater than pool max', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.DATABASE_POOL_MAX = '10';
      process.env.DATABASE_POOL_MIN = '20';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('pool min (20) cannot exceed max (10)');
    });

    it('should reject access token TTL less than 60 seconds', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.ACCESS_TOKEN_TTL = '30';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('Access token TTL must be at least 60 seconds');
    });

    it('should reject invalid number of agents (too low)', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.ENABLE_AGENTS = 'true';
      process.env.NUM_AGENTS = '0';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('Invalid number of agents: 0');
    });

    it('should reject invalid number of agents (too high)', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.ENABLE_AGENTS = 'true';
      process.env.NUM_AGENTS = '150';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('Invalid number of agents: 150');
    });

    it('should reject request timeout less than 1000ms', () => {
      // Arrange
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.REQUEST_TIMEOUT = '500';

      // Act & Assert
      expect(() => loadConfiguration()).toThrow('Request timeout must be at least 1000ms');
    });

    it('should warn when ANTHROPIC_API_KEY is missing but agents enabled', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.DATABASE_HOST = 'localhost';
      process.env.DATABASE_NAME = 'marcus';
      process.env.DATABASE_USER = 'marcus';
      process.env.DATABASE_PASSWORD = 'password';
      process.env.REDIS_HOST = 'localhost';
      process.env.JWT_SECRET = 'at_least_32_characters_for_security_purposes';
      process.env.ENABLE_AGENTS = 'true';
      delete process.env.ANTHROPIC_API_KEY;

      // Act
      loadConfiguration();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ANTHROPIC_API_KEY not set')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getTestConfiguration', () => {
    it('should return valid test configuration', () => {
      // Act
      const config = getTestConfiguration();

      // Assert
      expect(config.server.port).toBe(3001);
      expect(config.server.host).toBe('localhost');
      expect(config.database.database).toBe('marcus_test');
      expect(config.redis.db).toBe(1); // Different DB for tests
      expect(config.agents.enabled).toBe(false); // Disabled in tests
      expect(config.rateLimiting.enabled).toBe(false); // Disabled in tests
      expect(config.monitoring.logLevel).toBe('error'); // Quiet in tests
    });

    it('should have valid JWT secret length', () => {
      // Act
      const config = getTestConfiguration();

      // Assert
      expect(config.auth.jwtSecret.length).toBeGreaterThanOrEqual(32);
    });

    it('should have valid port ranges', () => {
      // Act
      const config = getTestConfiguration();

      // Assert
      expect(config.server.port).toBeGreaterThan(0);
      expect(config.server.port).toBeLessThanOrEqual(65535);
      expect(config.database.port).toBeGreaterThan(0);
      expect(config.database.port).toBeLessThanOrEqual(65535);
      expect(config.redis.port).toBeGreaterThan(0);
      expect(config.redis.port).toBeLessThanOrEqual(65535);
    });
  });

  describe('printConfigurationSummary', () => {
    it('should print configuration summary without revealing secrets', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const config = getTestConfiguration();

      // Act
      printConfigurationSummary(config);

      // Assert
      const output = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(output).toContain('MARCUS 3.0 Configuration Summary');
      expect(output).toContain('localhost:3001'); // Server
      expect(output).toContain('marcus@localhost:5432/marcus_test'); // Database
      expect(output).toContain('localhost:6379/1'); // Redis
      expect(output).toContain('JWT Secret: ****'); // Masked secret
      expect(output).not.toContain(config.auth.jwtSecret); // Secret not revealed
      expect(output).toContain('Disabled'); // Agents disabled
      expect(output).toContain('Log Level: error');

      consoleSpy.mockRestore();
    });
  });
});
