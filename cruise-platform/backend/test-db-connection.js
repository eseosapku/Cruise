require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
    console.log('🔗 Testing database connection...\n');

    console.log('Environment variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'Not set');
    console.log('');

    // Try connection with DATABASE_URL
    if (process.env.DATABASE_URL) {
        console.log('Trying connection with DATABASE_URL...');
        try {
            const pool1 = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });

            const result1 = await pool1.query('SELECT NOW()');
            console.log('✅ DATABASE_URL connection successful!');
            console.log('Current time:', result1.rows[0].now);
            await pool1.end();
        } catch (error) {
            console.log('❌ DATABASE_URL connection failed:', error.message);
            console.log('Full error:', error);
        }
    }

    // Try connection with individual parameters
    console.log('\nTrying connection with individual parameters...');
    try {
        const pool2 = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT),
            ssl: { rejectUnauthorized: false }
        });

        const result2 = await pool2.query('SELECT NOW()');
        console.log('✅ Individual parameters connection successful!');
        console.log('Current time:', result2.rows[0].now);

        // Check if users table exists and get its structure
        console.log('\n📊 Checking users table structure...');
        try {
            const tableCheck = await pool2.query(`
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                ORDER BY ordinal_position
            `);

            if (tableCheck.rows.length > 0) {
                console.log('✅ Users table found with columns:');
                tableCheck.rows.forEach(row => {
                    console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
                });
            } else {
                console.log('❌ Users table not found!');

                // Check what tables exist
                const tablesResult = await pool2.query(`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name
                `);

                console.log('\n📋 Available tables:');
                tablesResult.rows.forEach(row => {
                    console.log(`  - ${row.table_name}`);
                });
            }
        } catch (schemaError) {
            console.log('❌ Error checking table structure:', schemaError.message);
        }

        await pool2.end();
    } catch (error) {
        console.log('❌ Individual parameters connection failed:', error.message);
        console.log('Full error:', error);
    }
}

testConnection().catch(console.error);
