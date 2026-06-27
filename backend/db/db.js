const { DEFAULT_QUESTIONS } = require('../game/questions');

let pool = null;

function useSsl(connectionString) {
  if (process.env.DATABASE_SSL === 'true') return { rejectUnauthorized: false };
  if (process.env.DATABASE_SSL === 'false') return false;
  const local = /@(localhost|127\.0\.0\.1|postgres)(:|\/)/.test(connectionString);
  return process.env.NODE_ENV === 'production' && !local ? { rejectUnauthorized: false } : false;
}

async function initDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('ℹ️  No DATABASE_URL — using in-memory question bank');
    console.log('   For production (Google live): set DATABASE_URL on your host (Supabase/Railway)');
    return null;
  }

  try {
    const { Pool } = require('pg');
    pool = new Pool({
      connectionString,
      ssl: useSsl(connectionString),
    });

    await pool.query(`
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
      )
    `);

    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS type VARCHAR(50)`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium'`);
    await pool.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS times_played INT NOT NULL DEFAULT 0`);
    await pool.query(`UPDATE questions SET type = category WHERE type IS NULL`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_profiles (
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        avatar VARCHAR(10) NOT NULL DEFAULT '😀',
        games_played INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS player_seen_questions (
        player_id UUID NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
        question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        seen_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (player_id, question_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        room_code VARCHAR(10) NOT NULL,
        winner_name VARCHAR(100),
        player_count INT,
        total_rounds INT,
        played_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_player_seen_player ON player_seen_questions(player_id)');

    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM questions');
    if (rows[0].count === 0) {
      for (const q of DEFAULT_QUESTIONS) {
        const type = q.type || q.category || 'weird_facts';
        await pool.query(
          `INSERT INTO questions (text, real_answer, category, type, source)
           VALUES ($1, $2, $3, $3, 'seed') ON CONFLICT (text, real_answer) DO NOTHING`,
          [q.text, q.realAnswer, type]
        );
      }
      console.log(`✅ Seeded ${DEFAULT_QUESTIONS.length} party-mode questions into database`);
    }

    const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM questions');
    console.log(`✅ PostgreSQL connected — ${countResult.rows[0].count} questions in DB`);
    return pool;
  } catch (err) {
    console.warn('⚠️  Database connection failed, using in-memory fallback:', err.message);
    pool = null;
    return null;
  }
}

function getPool() {
  return pool;
}

function isDatabaseReady() {
  return pool !== null;
}

async function getQuestionCounts() {
  if (!pool) return null;
  const { rows } = await pool.query(
    `SELECT COALESCE(type, category) AS type, COUNT(*)::int AS count
     FROM questions GROUP BY COALESCE(type, category) ORDER BY type`
  );
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return { total, byType: rows, byCategory: rows };
}

async function saveGameSession({ roomCode, winnerName, playerCount, totalRounds, gameMode }) {
  if (!pool) return;
  try {
    await pool.query(
      'INSERT INTO game_sessions (room_code, winner_name, player_count, total_rounds, game_mode) VALUES ($1, $2, $3, $4, $5)',
      [roomCode, winnerName, playerCount, totalRounds, gameMode || null]
    );
  } catch (err) {
    console.warn('Failed to save game session:', err.message);
  }
}

module.exports = {
  initDatabase,
  getPool,
  isDatabaseReady,
  getQuestionCounts,
  saveGameSession,
};
