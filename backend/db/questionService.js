const { getPool } = require('./db');
const { getQuestionsForGame: getInMemoryQuestions } = require('../game/questions');

const VALID_CATEGORIES = ['trivia', 'movies', 'history', 'science', 'geography'];

async function pickQuestionsFromDb(category, count, playerProfileIds = []) {
  const pool = getPool();
  if (!pool) return null;

  const profileIds = playerProfileIds.filter(Boolean);
  const cat = category && category !== 'all' && VALID_CATEGORIES.includes(category) ? category : null;

  const baseWhere = cat ? 'WHERE q.category = $1' : 'WHERE TRUE';
  const baseParams = cat ? [cat] : [];

  let excludeClause = '';
  if (profileIds.length > 0) {
    const idParam = cat ? 2 : 1;
    excludeClause = ` AND q.id NOT IN (
      SELECT question_id FROM player_seen_questions WHERE player_id = ANY($${idParam}::uuid[])
    )`;
    baseParams.push(profileIds);
  }

  const limitParam = baseParams.length + 1;
  const sql = `
    SELECT q.id, q.text, q.real_answer, q.category
    FROM questions q
    ${baseWhere}${excludeClause}
    ORDER BY RANDOM()
    LIMIT $${limitParam}
  `;
  baseParams.push(count);

  let { rows } = await pool.query(sql, baseParams);

  if (rows.length < count) {
    const fallbackParams = cat ? [cat, count] : [count];
    const fallbackWhere = cat ? 'WHERE q.category = $1' : '';
    const fallbackLimit = cat ? '$2' : '$1';
    const fallbackSql = `
      SELECT q.id, q.text, q.real_answer, q.category
      FROM questions q
      ${fallbackWhere}
      ORDER BY RANDOM()
      LIMIT ${fallbackLimit}
    `;
    const fallback = await pool.query(fallbackSql, fallbackParams);
    const seen = new Set(rows.map((r) => r.id));
    for (const row of fallback.rows) {
      if (rows.length >= count) break;
      if (!seen.has(row.id)) {
        rows.push(row);
        seen.add(row.id);
      }
    }
  }

  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    realAnswer: r.real_answer,
    category: r.category,
  }));
}

async function getQuestionsForGame(category, count, playerProfileIds = []) {
  const fromDb = await pickQuestionsFromDb(category, count, playerProfileIds);
  if (fromDb?.length) {
    return fromDb.slice(0, count);
  }

  return getInMemoryQuestions(category, count).map((q, i) => ({
    id: null,
    text: q.text,
    realAnswer: q.realAnswer,
    category: category || 'all',
  }));
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

  for (const q of questions) {
    const category = VALID_CATEGORIES.includes(q.category) ? q.category : 'trivia';
    const result = await pool.query(
      `INSERT INTO questions (text, real_answer, category, source)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (text, real_answer) DO NOTHING
       RETURNING id`,
      [q.text.trim(), q.realAnswer.trim(), category, source]
    );
    if (result.rowCount > 0) inserted += 1;
    else skipped += 1;
  }

  return { inserted, skipped };
}

module.exports = {
  getQuestionsForGame,
  markQuestionsSeen,
  bulkInsertQuestions,
  VALID_CATEGORIES,
};
