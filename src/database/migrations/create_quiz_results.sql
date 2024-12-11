CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    quiz_type VARCHAR(10) NOT NULL,
    score INTEGER NOT NULL,
    answers JSONB NOT NULL,
    severity VARCHAR(50) NOT NULL,
    recommendations TEXT[],
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
    sleep_hours NUMERIC(4,2),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
