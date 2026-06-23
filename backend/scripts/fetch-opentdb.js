#!/usr/bin/env node
/**
 * Fetch thousands of trivia questions from Open Trivia DB and save to JSON.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/fetch-opentdb.js
 *   PER_CATEGORY=500 node scripts/fetch-opentdb.js   (default 500 per category)
 *   PER_CATEGORY=5000 node scripts/fetch-opentdb.js  (for production scale)
 *
 * Maps OpenTDB categories → our game categories:
 *   trivia, movies, history, science, geography
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('../db/db');
const { bulkInsertQuestions } = require('../db/questionService');

const PER_CATEGORY = parseInt(process.env.PER_CATEGORY || '500', 10);
const BATCH_SIZE = 50;
const DELAY_MS = 1200;

const OPENTDB_MAP = [
  { ourCategory: 'trivia', opentdbId: 9, label: 'General Knowledge' },
  { ourCategory: 'movies', opentdbId: 11, label: 'Film & TV' },
  { ourCategory: 'history', opentdbId: 23, label: 'History' },
  { ourCategory: 'science', opentdbId: 17, label: 'Science & Nature' },
  { ourCategory: 'geography', opentdbId: 22, label: 'Geography' },
];

function decodeHtml(html) {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é')
    .replace(/&uuml;/g, 'ü')
    .replace(/&ouml;/g, 'ö')
    .replace(/&aacute;/g, 'á')
    .replace(/&iacute;/g, 'í')
    .replace(/&ntilde;/g, 'ñ');
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchBatch(categoryId, amount) {
  const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&type=multiple`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.response_code !== 0) {
    throw new Error(`OpenTDB error code ${data.response_code} for category ${categoryId}`);
  }
  return data.results;
}

async function fetchCategory(ourCategory, opentdbId, label, target) {
  const collected = [];
  const seen = new Set();
  const batches = Math.ceil(target / BATCH_SIZE);

  console.log(`\n📥 ${label} → ${ourCategory} (target: ${target})`);

  for (let b = 0; b < batches && collected.length < target; b += 1) {
    const need = Math.min(BATCH_SIZE, target - collected.length);
    try {
      const results = await fetchBatch(opentdbId, need);
      for (const r of results) {
        const text = decodeHtml(r.question).trim();
        const realAnswer = decodeHtml(r.correct_answer).trim();
        const key = `${text}::${realAnswer}`;
        if (!seen.has(key) && text.length > 10 && realAnswer.length > 0) {
          seen.add(key);
          collected.push({ text, realAnswer, category: ourCategory });
        }
      }
      process.stdout.write(`  batch ${b + 1}/${batches} — ${collected.length} unique\r`);
      await sleep(DELAY_MS);
    } catch (err) {
      console.warn(`\n  ⚠️ batch failed: ${err.message}, retrying...`);
      await sleep(3000);
      b -= 1;
    }
  }

  console.log(`\n  ✅ ${collected.length} questions for ${ourCategory}`);
  return collected;
}

async function main() {
  const allQuestions = [];

  for (const { ourCategory, opentdbId, label } of OPENTDB_MAP) {
    const qs = await fetchCategory(ourCategory, opentdbId, label, PER_CATEGORY);
    allQuestions.push(...qs);
  }

  const outPath = path.join(__dirname, '../data/questions-export.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(allQuestions, null, 2));
  console.log(`\n💾 Saved ${allQuestions.length} questions to ${outPath}`);

  if (process.env.DATABASE_URL) {
    await initDatabase();
    const { inserted, skipped } = await bulkInsertQuestions(allQuestions, 'opentdb');
    console.log(`📚 Database: ${inserted} inserted, ${skipped} duplicates skipped`);
  } else {
    console.log('\nℹ️  Set DATABASE_URL to import directly into PostgreSQL');
    console.log('   Or run: DATABASE_URL=... node scripts/import-questions.js');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
