-- Fake Answer Party — PostgreSQL schema (Supabase / Railway)
-- Run: psql $DATABASE_URL -f backend/db/schema.sql

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  real_answer TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'weird_facts',
  type VARCHAR(50),
  image_url TEXT,
  difficulty VARCHAR(20) DEFAULT 'medium',
  times_played INT NOT NULL DEFAULT 0,
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
  game_mode VARCHAR(20),
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_player_seen_player ON player_seen_questions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_seen_question ON player_seen_questions(player_id);

-- Migrate existing rows
UPDATE questions SET type = category WHERE type IS NULL;
