/** 56 party game categories — fun modes, not boring school subjects */
const CATEGORIES = [
  { id: 'weird_facts', label: 'Weird Facts', emoji: '😂' },
  { id: 'fake_news', label: 'Fake News', emoji: '📰' },
  { id: 'fake_products', label: 'Fake Products', emoji: '🚀' },
  { id: 'logo_challenge', label: 'Logo Challenge', emoji: '🏢' },
  { id: 'image_challenge', label: 'Image Challenge', emoji: '🖼️' },
  { id: 'world_trivia', label: 'World Trivia', emoji: '🌍' },
  { id: 'internet_culture', label: 'Internet Culture', emoji: '🔥' },
  { id: 'celebrity_chaos', label: 'Celebrity Chaos', emoji: '⭐' },
  { id: 'food_bizarre', label: 'Bizarre Food', emoji: '🍕' },
  { id: 'animal_wtf', label: 'Animal WTF', emoji: '🦁' },
  { id: 'sports_odd', label: 'Sports Oddities', emoji: '⚽' },
  { id: 'movie_madness', label: 'Movie Madness', emoji: '🎬' },
  { id: 'music_viral', label: 'Music & Viral Hits', emoji: '🎵' },
  { id: 'tech_startups', label: 'Tech & Startups', emoji: '💻' },
  { id: 'conspiracy_real', label: 'Real Conspiracies', emoji: '🔍' },
  { id: 'history_bizarre', label: 'Bizarre History', emoji: '📜' },
  { id: 'science_mindblown', label: 'Science Mind-Blown', emoji: '🔬' },
  { id: 'geography_odd', label: 'Odd Geography', emoji: '🗺️' },
  { id: 'meme_origins', label: 'Meme Origins', emoji: '😹' },
  { id: 'tiktok_trends', label: 'TikTok Trends', emoji: '📱' },
  { id: 'reddit_stories', label: 'Reddit Stories', emoji: '🤖' },
  { id: 'gaming_lore', label: 'Gaming Lore', emoji: '🎮' },
  { id: 'anime_facts', label: 'Anime Facts', emoji: '🎌' },
  { id: 'bollywood_bizarre', label: 'Bollywood Bizarre', emoji: '🎭' },
  { id: 'cricket_craze', label: 'Cricket Craze', emoji: '🏏' },
  { id: 'space_wtf', label: 'Space WTF', emoji: '🛸' },
  { id: 'ocean_deep', label: 'Deep Ocean', emoji: '🌊' },
  { id: 'crime_bizarre', label: 'True Crime Bizarre', emoji: '🔪' },
  { id: 'law_weird', label: 'Weird Laws', emoji: '⚖️' },
  { id: 'psychology_tricks', label: 'Psychology Tricks', emoji: '🧠' },
  { id: 'body_facts', label: 'Body Facts', emoji: '🫀' },
  { id: 'royal_weird', label: 'Royal Family Weird', emoji: '👑' },
  { id: 'prison_escape', label: 'Prison & Escape', emoji: '🏚️' },
  { id: 'world_records', label: 'World Records', emoji: '🏆' },
  { id: 'olympics_bizarre', label: 'Olympics Bizarre', emoji: '🥇' },
  { id: 'haunted_real', label: 'Haunted Places', emoji: '👻' },
  { id: 'ufo_sightings', label: 'UFO Sightings', emoji: '🛸' },
  { id: 'ancient_mysteries', label: 'Ancient Mysteries', emoji: '🏛️' },
  { id: 'viking_samurai', label: 'Vikings & Samurai', emoji: '⚔️' },
  { id: 'egypt_pyramids', label: 'Egypt & Pyramids', emoji: '🔺' },
  { id: 'wizard_world', label: 'Wizard World Facts', emoji: '🪄' },
  { id: 'marvel_dc', label: 'Marvel vs DC', emoji: '🦸' },
  { id: 'netflix_binge', label: 'Netflix & Streaming', emoji: '📺' },
  { id: 'youtube_viral', label: 'YouTube Viral', emoji: '📹' },
  { id: 'dating_apps', label: 'Dating App Facts', emoji: '💘' },
  { id: 'billionaire_odd', label: 'Billionaire Odd', emoji: '💰' },
  { id: 'crypto_nft', label: 'Crypto & NFT', emoji: '🪙' },
  { id: 'stock_market', label: 'Stock Market Stories', emoji: '📈' },
  { id: 'casino_lottery', label: 'Casino & Lottery', emoji: '🎰' },
  { id: 'magic_illusions', label: 'Magic & Illusions', emoji: '🎩' },
  { id: 'carnival_circus', label: 'Carnival & Circus', emoji: '🎪' },
  { id: 'weather_bizarre', label: 'Bizarre Weather', emoji: '⛈️' },
  { id: 'dinosaur_evolution', label: 'Dinosaurs & Evolution', emoji: '🦖' },
  { id: 'ai_robots', label: 'AI & Robots', emoji: '🤖' },
  { id: 'tech_ceos', label: 'Tech CEOs', emoji: '🧑‍🚀' },
  { id: 'india_bizarre', label: 'India Bizarre', emoji: '🇮🇳' },
  { id: 'usa_bizarre', label: 'USA Bizarre', emoji: '🇺🇸' },
  { id: 'uk_europe', label: 'UK & Europe', emoji: '🇬🇧' },
];

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

const CATEGORY_META = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, { label: c.label, emoji: c.emoji }])
);

CATEGORY_META.mixed = { label: 'Mixed Mode', emoji: '🎲' };

function isValidCategory(id) {
  return CATEGORY_IDS.includes(id);
}

function normalizeCategories(settings = {}) {
  // Legacy: gameMode/mode
  if (settings.categoryMode === 'mixed' || settings.gameMode === 'mixed' || settings.category === 'all') {
    return { categoryMode: 'mixed', categories: [] };
  }

  let cats = settings.categories;
  if (!Array.isArray(cats) || cats.length === 0) {
    if (settings.mode && isValidCategory(settings.mode)) {
      cats = [settings.mode];
    } else if (settings.category && isValidCategory(settings.category)) {
      cats = [settings.category];
    } else {
      return { categoryMode: 'mixed', categories: [] };
    }
  }

  const valid = [...new Set(cats.filter(isValidCategory))];
  if (valid.length === 0) {
    return { categoryMode: 'mixed', categories: [] };
  }
  return { categoryMode: 'custom', categories: valid };
}

/** Pick one type per round from pool (mixed = all 56, custom = host selection) */
function getTypesForRounds(rounds, settings) {
  const { categoryMode, categories } = normalizeCategories(settings);
  const pool = categoryMode === 'mixed'
    ? [...CATEGORY_IDS].sort(() => Math.random() - 0.5)
    : [...categories].sort(() => Math.random() - 0.5);

  const types = [];
  for (let i = 0; i < rounds; i += 1) {
    types.push(pool[i % pool.length]);
  }
  return types;
}

function getCategoryLabel(id) {
  if (id === 'mixed') return CATEGORY_META.mixed.label;
  return CATEGORY_META[id]?.label || id;
}

function getCategoryEmoji(id) {
  if (id === 'mixed') return CATEGORY_META.mixed.emoji;
  return CATEGORY_META[id]?.emoji || '🎮';
}

module.exports = {
  CATEGORIES,
  CATEGORY_IDS,
  CATEGORY_META,
  isValidCategory,
  normalizeCategories,
  getTypesForRounds,
  getCategoryLabel,
  getCategoryEmoji,
};
