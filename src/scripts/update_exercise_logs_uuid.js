const db = require('../config/database');

async function updateExerciseLogsSchema() {
    try {
        // Drop the existing table
        await db.query('DROP TABLE IF EXISTS exercise_logs;');
        console.log('Dropped existing exercise_logs table');

        // Create the table with UUID for user_id
        await db.query(`
            CREATE TABLE exercise_logs (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL,
                username VARCHAR(255) NOT NULL,
                date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                exercises JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created new exercise_logs table with UUID user_id');

    } catch (error) {
        console.error('Error updating exercise_logs table:', error);
    } finally {
        process.exit();
    }
}

updateExerciseLogsSchema();
