#!/usr/bin/env node
/**
 * Generate questions for all game modes via Ollama.
 *
 * Usage:
 *   node scripts/generate-all-modes.js 100
 *   (generates 100 questions per mode = 700 total)
 */
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const { CATEGORY_IDS } = require('../game/categories');

const count = parseInt(process.argv[2] || '50', 10);
const script = path.join(__dirname, 'generate-questions-ollama.js');

async function runType(type) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [script, type, String(count)], { stdio: 'inherit' });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${type} failed`))));
  });
}

async function main() {
  console.log(`Generating ${count} questions per mode (${CATEGORY_IDS.length} modes)...\n`);
  for (const type of CATEGORY_IDS) {
    console.log(`\n━━━ ${type} ━━━`);
    await runType(type);
  }
  console.log('\n✅ All modes complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
