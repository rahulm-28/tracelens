import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './db';
import express from 'express';

const app = express()
const port = 3000

async function startServer() {
    try {
        await migrate(db, { migrationsFolder: './src/db/migrations' });
        console.log('Migrations completed successfully');

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

startServer();
