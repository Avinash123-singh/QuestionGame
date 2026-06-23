-- Fake Answer Party — PostgreSQL schema (Supabase / Railway)
-- Run in SQL editor or: psql $DATABASE_URL -f db/schema.sql

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  real_answer TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'trivia',
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (text, real_answer)
);

CREATE TABLE IF NOT EXISTS player_profiles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  avatar VARCHAR(10) NOT NULL DEFAULT '😀',
  games_played INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks which questions each player has already seen (avoids repeats)
CREATE TABLE IF NOT EXISTS player_seen_questions (
  player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  seen_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (player_id, question_id)
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  room_code VARCHAR(10) NOT NULL,
  winner_name VARCHAR(100),
  player_count INT,
  total_rounds INT,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_player_seen_player ON player_seen_questions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_seen_question ON player_seen_questions(question_id);
