const { getPool } = require('./db');
const { getQuestionsForGame: getInMemoryQuestions } = require('../game/questions');
const {
  CATEGORY_IDS,
  isValidCategory,
  normalizeCategories,
  getTypesForRounds,
} = require('../game/categories');

function rowToQuestion(r) {
  const type = r.type || r.category;
  return {
    id: r.id,
    text: r.text,
    realAnswer: r.real_answer,
    type,
    category: type,
    imageUrl: r.image_url || null,
    difficulty: r.difficulty || 'medium',
  };
}

async function pickOneQuestion(type, playerProfileIds, excludeIds = []) {
  const pool = getPool();
  if (!pool) return null;

  const profileIds = playerProfileIds.filter(Boolean);
  const params = [type];
  let excludeClause = '';
  if (excludeIds.length) {
    params.push(excludeIds);
    excludeClause = ` AND q.id != ALL($${params.length}::int[])`;
  }

  let seenClause = '';
  if (profileIds.length) {
    params.push(profileIds);
    seenClause = ` AND q.id NOT IN (
      SELECT question_id FROM player_seen_questions WHERE player_id = ANY($${params.length}::uuid[])
    )`;
  }

  const sql = `
    SELECT q.id, q.text, q.real_answer, q.category, q.type, q.image_url, q.difficulty
    FROM questions q
    WHERE COALESCE(q.type, q.category) = $1
    ${excludeClause}${seenClause}
    ORDER BY RANDOM()
    LIMIT 1
  `;

  let { rows } = await pool.query(sql, params);

  if (!rows.length) {
    const fallbackParams = [type];
    let fbExclude = '';
    if (excludeIds.length) {
      fallbackParams.push(excludeIds);
      fbExclude = ` AND q.id != ALL($2::int[])`;
    }
    const fallback = await pool.query(
      `SELECT q.id, q.text, q.real_answer, q.category, q.type, q.image_url, q.difficulty
       FROM questions q
       WHERE COALESCE(q.type, q.category) = $1 ${fbExclude}
       ORDER BY RANDOM() LIMIT 1`,
      fallbackParams
    );
    rows = fallback.rows;
  }

  return rows[0] ? rowToQuestion(rows[0]) : null;
}

async function getQuestionsForGame(settings, rounds, playerProfileIds = []) {
  const typesPerRound = getTypesForRounds(rounds, settings);
  const pool = getPool();

  if (!pool) {
    return getInMemoryQuestions(settings, rounds, typesPerRound);
  }
  const questions = [];
  const usedIds = [];

  for (const type of typesPerRound) {
    const q = await pickOneQuestion(type, playerProfileIds, usedIds);
    if (q) {
      questions.push(q);
      if (q.id) usedIds.push(q.id);
    }
  }

  if (questions.length >= rounds) {
    return questions;
  }

  const fallback = getInMemoryQuestions(settings, rounds, typesPerRound);
  while (questions.length < rounds && fallback.length) {
    const next = fallback.shift();
    if (!questions.some((q) => q.text === next.text)) {
      questions.push(next);
    }
  }

  return questions.slice(0, rounds);
}

async function markQuestionsSeen(playerProfileIds, questionIds) {
  const pool = getPool();
  if (!pool || !questionIds?.length) return;

  const profiles = playerProfileIds.filter(Boolean);
  const qIds = questionIds.filter(Boolean);
  if (!profiles.length || !qIds.length) return;

  const values = [];
  const params = [];
  let i = 1;
  for (const pid of profiles) {
    for (const qid of qIds) {
      values.push(`($${i}, $${i + 1})`);
      params.push(pid, qid);
      i += 2;
    }
  }

  await pool.query(
    `INSERT INTO player_seen_questions (player_id, question_id) VALUES ${values.join(', ')}
     ON CONFLICT DO NOTHING`,
    params
  );

  await pool.query(
    `UPDATE questions SET times_played = times_played + 1 WHERE id = ANY($1::int[])`,
    [qIds]
  );

  await pool.query(
    `UPDATE player_profiles SET games_played = games_played + 1, updated_at = NOW()
     WHERE id = ANY($1::uuid[])`,
    [profiles]
  );
}

async function bulkInsertQuestions(questions, source = 'import') {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL required for bulk import');

  let inserted = 0;
  let skipped = 0;
  const CHUNK = 300;

  for (let i = 0; i < questions.length; i += CHUNK) {
    const chunk = questions.slice(i, i + CHUNK);
    const values = [];
    const params = [];
    let p = 1;

    for (const q of chunk) {
      const type = isValidCategory(q.type || q.category) ? (q.type || q.category) : 'weird_facts';
      values.push(`($${p}, $${p + 1}, $${p + 2}, $${p + 2}, $${p + 3}, $${p + 4}, $${p + 5})`);
      params.push(
        q.text.trim(),
        (q.realAnswer || q.answer || q.real_answer).trim(),
        type,
        q.imageUrl || q.image_url || null,
        q.difficulty || 'medium',
        source
      );
      p += 6;
    }

    const result = await pool.query(
      `INSERT INTO questions (text, real_answer, category, type, image_url, difficulty, source)
       VALUES ${values.join(', ')}
       ON CONFLICT (text, real_answer) DO NOTHING
       RETURNING id`,
      params
    );
    inserted += result.rowCount;
    skipped += chunk.length - result.rowCount;
  }

  return { inserted, skipped };
}

module.exports = {
  getQuestionsForGame,
  markQuestionsSeen,
  bulkInsertQuestions,
  CATEGORY_IDS,
};
