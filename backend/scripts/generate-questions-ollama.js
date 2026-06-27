#!/usr/bin/env node
/**
 * Generate questions with local Ollama and save to PostgreSQL.
 *
 * Prerequisites:
 *   1. Install Ollama: https://ollama.com
 *   2. ollama pull llama3
 *   3. Set DATABASE_URL in backend/.env
 *
 * Usage:
 *   cd backend
 *   node scripts/generate-questions-ollama.js weird_facts 50
 *   node scripts/generate-questions-ollama.js fake_news 100
 *
 * Types: weird_facts, fake_news, fake_products, logo_challenge,
 *        image_challenge, world_trivia, internet_culture
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDatabase } = require('../db/db');
const { bulkInsertQuestions } = require('../db/questionService');
const { CATEGORY_IDS } = require('../game/categories');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'llama3';

const PROMPTS = {
  weird_facts: 'Generate bizarre but TRUE trivia facts. Each item must be surprising and verifiable.',
  fake_news: 'Generate bizarre but believable REAL news headlines that actually happened (not satire).',
  fake_products: 'Generate questions where the answer is a REAL quirky startup, product, or app that exists.',
  logo_challenge: 'Generate brand/logo trivia questions about famous companies.',
  image_challenge: 'Generate visual description trivia (describe what to show, answer is the object/place).',
  world_trivia: 'Generate world geography, culture, and travel trivia.',
  internet_culture: 'Generate meme, viral trend, and internet culture trivia.',
};

async function callOllama(prompt, count) {
  const body = {
    model: MODEL,
    prompt: `${prompt}

Return ONLY a JSON array of exactly ${count} objects with keys "text" and "realAnswer".
No markdown. Example:
[{"text":"Which country has a town named Batman?","realAnswer":"Turkey"}]`,
    stream: false,
    options: { temperature: 0.9 },
  };

  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  const raw = data.response || '';

  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array in Ollama response');
  return JSON.parse(raw.slice(start, end + 1));
}

async function main() {
  const type = process.argv[2] || 'weird_facts';
  const count = parseInt(process.argv[3] || '20', 10);

  if (!CATEGORY_IDS.includes(type)) {
    console.error(`Invalid type. Use: ${CATEGORY_IDS.join(', ')}`);
    process.exit(1);
  }

  await initDatabase();
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL required in backend/.env');
    process.exit(1);
  }

  console.log(`Generating ${count} "${type}" questions via Ollama (${MODEL})...`);
  const items = await callOllama(PROMPTS[type], count);

  const questions = items.map((q) => ({
    text: q.text,
    realAnswer: q.realAnswer || q.answer,
    type,
    difficulty: 'medium',
  }));

  const outDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `generated-${type}-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(questions, null, 2));

  const { inserted, skipped } = await bulkInsertQuestions(questions, 'ollama');
  console.log(`✅ Saved ${inserted} questions (${skipped} duplicates skipped)`);
  console.log(`📄 Backup: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
