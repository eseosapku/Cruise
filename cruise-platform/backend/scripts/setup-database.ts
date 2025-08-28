import { Pool } from 'pg';
import { environment } from '../src/config/environment';
import { logger } from '../src/utils/logger';
import fs from 'fs';
import path from 'path';

interface MigrationFile {
    filename: string;
    sql: string;
}

class DatabaseSetup {
    private pool: Pool;

    constructor() {
        // Use the same configuration as the main app
        const config = environment.DATABASE_URL
            ? {
                connectionString: environment.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            }
            : {
                user: environment.DB_USER,
                host: environment.DB_HOST,
                database: environment.DB_NAME,
                password: environment.DB_PASSWORD,
                port: environment.DB_PORT,
            };

        this.pool = new Pool(config);
    }

    async setupDatabase(): Promise<void> {
        try {
            logger.info('🚀 Starting database setup...');

            // Create migrations table if it doesn't exist
            await this.createMigrationsTable();

            // Get all migration files
            const migrations = await this.getMigrationFiles();

            // Run migrations
            for (const migration of migrations) {
                await this.runMigration(migration);
            }

            // Insert seed data
            await this.insertSeedData();

            logger.info('✅ Database setup completed successfully!');
        } catch (error) {
            logger.error('❌ Database setup failed:', error);
            throw error;
        }
    }

    private async createMigrationsTable(): Promise<void> {
        const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await this.pool.query(query);
        logger.info('📋 Migrations table ready');
    }

    private async getMigrationFiles(): Promise<MigrationFile[]> {
        const migrationsDir = path.join(__dirname, '../migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure proper order

        const migrations: MigrationFile[] = [];

        for (const filename of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf-8');
            migrations.push({ filename, sql });
        }

        return migrations;
    }

    private async runMigration(migration: MigrationFile): Promise<void> {
        // Check if migration already executed
        const checkQuery = 'SELECT 1 FROM migrations WHERE filename = $1';
        const checkResult = await this.pool.query(checkQuery, [migration.filename]);

        if (checkResult.rows.length > 0) {
            logger.info(`⏭️  Skipping migration ${migration.filename} (already executed)`);
            return;
        }

        // Execute migration
        logger.info(`🔧 Running migration: ${migration.filename}`);
        await this.pool.query(migration.sql);

        // Record migration as executed
        const recordQuery = 'INSERT INTO migrations (filename) VALUES ($1)';
        await this.pool.query(recordQuery, [migration.filename]);

        logger.info(`✅ Migration ${migration.filename} completed`);
    }

    private async insertSeedData(): Promise<void> {
        logger.info('🌱 Inserting seed data...');

        // Check if we already have users
        const userCheck = await this.pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(userCheck.rows[0].count);

        if (userCount > 0) {
            logger.info('👥 Users already exist, skipping seed data');
            return;
        }

        // Create test user with hashed password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('testpassword123', 10);

        const testUser = {
            username: 'testuser',
            email: 'test@cruise.com',
            password_hash: hashedPassword,
            first_name: 'Test',
            last_name: 'User',
            company: 'Cruise Platform',
            role: 'Developer',
            subscription_plan: 'pro',
            is_active: true,
            email_verified: true,
            preferences: JSON.stringify({
                theme: 'dark',
                notifications: true,
                autoSave: true
            })
        };

        const insertUserQuery = `
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, 
        company, role, subscription_plan, is_active, email_verified, preferences
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, username, email
    `;

        const userResult = await this.pool.query(insertUserQuery, [
            testUser.username,
            testUser.email,
            testUser.password_hash,
            testUser.first_name,
            testUser.last_name,
            testUser.company,
            testUser.role,
            testUser.subscription_plan,
            testUser.is_active,
            testUser.email_verified,
            testUser.preferences
        ]);

        const userId = userResult.rows[0].id;
        logger.info(`👤 Created test user: ${userResult.rows[0].username} (${userResult.rows[0].email})`);

        // Create sample project
        const projectQuery = `
      INSERT INTO projects (user_id, title, description)
      VALUES ($1, $2, $3)
      RETURNING id, title
    `;

        const projectResult = await this.pool.query(projectQuery, [
            userId,
            'Tesla Analysis Project',
            'Comprehensive analysis and pitch deck for Tesla Inc.'
        ]);

        logger.info(`📊 Created sample project: ${projectResult.rows[0].title}`);

        // Create sample conversation
        const conversationQuery = `
      INSERT INTO conversations (user_id, message)
      VALUES ($1, $2)
    `;

        await this.pool.query(conversationQuery, [
            userId,
            'Welcome to Cruise Platform! I can help you create amazing pitch decks with automated research and visual content.'
        ]);

        logger.info('💬 Created welcome conversation');

        logger.info('✅ Seed data inserted successfully!');
    }

    async testConnection(): Promise<void> {
        try {
            const result = await this.pool.query('SELECT NOW() as current_time, version() as db_version');
            logger.info('🔗 Database connection successful!');
            logger.info(`⏰ Current time: ${result.rows[0].current_time}`);
            logger.info(`🐘 PostgreSQL version: ${result.rows[0].db_version.split(',')[0]}`);
        } catch (error) {
            logger.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}

// Run setup if called directly
if (require.main === module) {
    const setup = new DatabaseSetup();

    setup.testConnection()
        .then(() => setup.setupDatabase())
        .then(() => {
            logger.info('🎉 Database setup completed! Test credentials:');
            logger.info('📧 Email: test@cruise.com');
            logger.info('🔑 Password: testpassword123');
        })
        .catch((error) => {
            logger.error('Setup failed:', error);
            process.exit(1);
        })
        .finally(() => {
            setup.close();
        });
}

export { DatabaseSetup };
