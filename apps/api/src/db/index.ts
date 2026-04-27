import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Add it to apps/api/.env before starting the API.');
}

const sql = postgres(databaseUrl);

export const db = drizzle(sql, { schema });