import { Pool } from 'pg';
import { environment } from '../config/environment';

const pool = new Pool({
  connectionString: environment.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export const releaseClient = (client: any) => {
  client.release();
};

export const closePool = async () => {
  await pool.end();
};