CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quiz_type VARCHAR(10) NOT NULL CHECK (quiz_type IN ('PHQ9', 'GAD7')),
    score INTEGER NOT NULL,
    severity VARCHAR(20) NOT NULL,
    answers JSONB NOT NULL,
    recommendations TEXT[],
    notes TEXT,
    follow_up_date DATE,
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
    sleep_hours NUMERIC(3,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
