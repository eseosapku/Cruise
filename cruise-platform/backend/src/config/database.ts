import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { environment } from './environment';
import { logger } from '../utils/logger';

interface DatabaseConfig {
  user?: string;
  host?: string;
  database?: string;
  password?: string;
  port?: number;
  connectionString?: string;
  max: number; // Maximum number of clients in the pool
  idleTimeoutMillis: number; // Close idle clients after this time
  connectionTimeoutMillis: number; // Return an error if connection takes longer than this
  ssl?: {
    rejectUnauthorized: boolean;
  };
}

class DatabaseService {
  private pool: Pool;
  private isConnected: boolean = false;

  constructor() {
    // Check if DATABASE_URL is available (Supabase connection string)
    const config: DatabaseConfig = environment.DATABASE_URL
      ? {
        connectionString: environment.DATABASE_URL,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Longer timeout for Supabase
        ssl: {
          rejectUnauthorized: false // Required for Supabase connections
        }
      }
      : {
        user: environment.DB_USER,
        host: environment.DB_HOST,
        database: environment.DB_NAME,
        password: environment.DB_PASSWORD,
        port: environment.DB_PORT,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
      };

    this.pool = new Pool(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Event listener for successful connections
    this.pool.on('connect', (client: PoolClient) => {
      logger.info('New database client connected to Supabase');
    });

    // Event listener for client errors
    this.pool.on('error', (err: Error, client: PoolClient) => {
      logger.error('Unexpected error on idle client:', err);
    });

    // Event listener for client removal
    this.pool.on('remove', (client: PoolClient) => {
      logger.info('Database client removed');
    });
  }

  /**
   * Connect to the database and test the connection
   */
  public async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      logger.info(`Connected to PostgreSQL database: ${environment.DB_NAME}`);
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  /**
   * Execute a query with optional parameters
   */
  public async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      const start = Date.now();
      const result = await client.query<T>(text, params);
      const duration = Date.now() - start;

      logger.debug('Query executed', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration,
        rows: result.rowCount
      });

      return result;
    } catch (error) {
      logger.error('Database query error:', { text, params, error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client from the pool for manual transaction management
   */
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Close all connections in the pool
   */
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Error closing database connection pool:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get pool statistics
   */
  public getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }

  /**
   * Health check query
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.rows[0]?.health === 1;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

// Export the service instance and methods
export { databaseService };
export const query = databaseService.query.bind(databaseService);
export const transaction = databaseService.transaction.bind(databaseService);
export const connectToDatabase = databaseService.connect.bind(databaseService);
export const closeDatabaseConnection = databaseService.close.bind(databaseService);

export default databaseService;