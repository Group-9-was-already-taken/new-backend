const db = require('../config/database');

async function resetExerciseLogs() {
    try {
        // Drop the existing table
        await db.query('DROP TABLE IF EXISTS exercise_logs;');
        console.log('Dropped existing exercise_logs table');

        // Create the table with the correct schema
        await db.query(`
            CREATE TABLE exercise_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                username VARCHAR(255) NOT NULL,
                date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                exercises JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created new exercise_logs table with correct schema');

    } catch (error) {
        console.error('Error resetting exercise_logs table:', error);
    } finally {
        process.exit();
    }
}

resetExerciseLogs();
