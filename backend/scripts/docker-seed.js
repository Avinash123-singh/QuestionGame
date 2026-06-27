#!/usr/bin/env node
/** Import bulk JSON questions into PostgreSQL (runs once on Docker start). */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDatabase, getQuestionCounts } = require('../db/db');
const { bulkInsertQuestions } = require('../db/questionService');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL — skip seed');
    return;
  }

  await initDatabase();
  const pool = require('../db/db').getPool();

  if (process.env.FORCE_SEED === '1' && pool) {
    await pool.query('TRUNCATE questions RESTART IDENTITY CASCADE');
    console.log('🗑️  Cleared old questions for fresh easy seed');
  }

  const before = await getQuestionCounts();
  if (before && before.total >= 5000 && process.env.FORCE_SEED !== '1') {
    console.log(`✅ DB already has ${before.total} questions — skip seed`);
    return;
  }

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    console.log('No data/ folder — run generate-bulk first');
    return;
  }

  const files = fs.readdirSync(dataDir).filter((f) => f.startsWith('bulk-') && f.endsWith('.json'));
  console.log(`📥 Importing ${files.length} category files...`);

  let inserted = 0;
  let skipped = 0;

  for (const file of files) {
    const questions = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    const result = await bulkInsertQuestions(questions, 'docker-seed');
    inserted += result.inserted;
    skipped += result.skipped;
    process.stdout.write(`  ${file}: +${result.inserted}\n`);
  }

  const after = await getQuestionCounts();
  console.log(`✅ Seed done: ${inserted} inserted, ${skipped} skipped. Total in DB: ${after?.total}`);
}

main().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(0);
});
