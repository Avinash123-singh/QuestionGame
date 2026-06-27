/** @deprecated use categories.js — kept for backward compatibility */
const categories = require('./categories');

module.exports = {
  QUESTION_TYPES: categories.CATEGORY_IDS,
  CATEGORIES: categories.CATEGORIES,
  CATEGORY_IDS: categories.CATEGORY_IDS,
  MODE_META: categories.CATEGORY_META,
  isValidQuestionType: categories.isValidCategory,
  isValidCategory: categories.isValidCategory,
  normalizeGameSettings: categories.normalizeCategories,
  normalizeCategories: categories.normalizeCategories,
  getTypesForRounds: categories.getTypesForRounds,
  getModeLabel: categories.getCategoryLabel,
  getCategoryLabel: categories.getCategoryLabel,
  getCategoryEmoji: categories.getCategoryEmoji,
};
