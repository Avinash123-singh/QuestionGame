#!/usr/bin/env node
/**
 * Import questions from JSON file into PostgreSQL.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/import-questions.js
 *   DATABASE_URL=... node scripts/import-questions.js path/to/questions.json
 *
 * JSON format: [{ "text": "...", "realAnswer": "...", "category": "trivia" }]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDatabase, getQuestionCounts } = require('../db/db');
const { bulkInsertQuestions } = require('../db/questionService');

async function main() {
  const filePath = process.argv[2]
    || path.join(__dirname, '../data/questions-export.json');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required. Add it to backend/.env');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.error('   Run first: node scripts/fetch-opentdb.js');
    process.exit(1);
  }

  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(questions) || questions.length === 0) {
    console.error('❌ JSON must be a non-empty array of questions');
    process.exit(1);
  }

  await initDatabase();
  console.log(`📥 Importing ${questions.length} questions from ${filePath}...`);

  const CHUNK = 200;
  let totalInserted = 0;
  let totalSkipped = 0;

  for (let i = 0; i < questions.length; i += CHUNK) {
    const chunk = questions.slice(i, i + CHUNK);
    const { inserted, skipped } = await bulkInsertQuestions(chunk, 'import');
    totalInserted += inserted;
    totalSkipped += skipped;
    process.stdout.write(`  ${Math.min(i + CHUNK, questions.length)}/${questions.length}\r`);
  }

  const counts = await getQuestionCounts();
  console.log(`\n✅ Done: ${totalInserted} inserted, ${totalSkipped} skipped`);
  console.log(`📊 Total in DB: ${counts.total}`);
  counts.byCategory.forEach((r) => console.log(`   ${r.category}: ${r.count}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
