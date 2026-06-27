const fs = require('fs');
const path = require('path');

const SEED_BY_TYPE = {
  weird_facts: [
    { text: 'Which country has a town named Batman?', realAnswer: 'Turkey' },
    { text: 'Which animal fingerprints are nearly identical to humans?', realAnswer: 'Koala' },
    { text: 'What fruit floats because it is 25% air?', realAnswer: 'Apple' },
    { text: 'What was Google originally called?', realAnswer: 'BackRub' },
    { text: 'Which country has more pyramids than Egypt?', realAnswer: 'Sudan' },
    { text: 'Honey never spoils — made by what insect?', realAnswer: 'Bees' },
    { text: 'Which planet rains diamonds?', realAnswer: 'Neptune' },
    { text: 'A group of flamingos is called a what?', realAnswer: 'Flamboyance' },
    { text: 'Which animal can hold breath 2 hours underwater?', realAnswer: 'Turtle' },
    { text: 'Scotland\'s national animal is what mythical creature?', realAnswer: 'Unicorn' },
  ],
  fake_news: [
    { text: 'Scientists trained which bird to spot cancer?', realAnswer: 'Pigeons' },
    { text: 'A town elected which animal as mayor?', realAnswer: 'Goat' },
    { text: 'Researchers taught which rodent hide-and-seek?', realAnswer: 'Rats' },
    { text: 'A bakery was fined for croissants being too what?', realAnswer: 'Straight' },
    { text: 'A man survived inside a supermarket what?', realAnswer: 'Roof' },
    { text: 'City installed piano what to encourage exercise?', realAnswer: 'Stairs' },
    { text: 'Hotel paid guests to stop using what at dinner?', realAnswer: 'Phones' },
    { text: 'Man changed his name to stop what?', realAnswer: 'Spam' },
  ],
  fake_products: [
    { text: 'Which real app matches dog owners?', realAnswer: 'Bark' },
    { text: 'Which app lets you rent homes?', realAnswer: 'Airbnb' },
    { text: 'Pet rock sold in which decade?', realAnswer: 'Seventies' },
    { text: 'Fidget spinner craze around which year?', realAnswer: '2017' },
    { text: 'Which company rents chickens to families?', realAnswer: 'Rentachicken' },
    { text: 'Potato messenger startup sends what vegetable?', realAnswer: 'Potato' },
    { text: 'Subscription what gets mailed monthly (socks)?', realAnswer: 'Socks' },
    { text: 'Dating app for farmers called Tinder for who?', realAnswer: 'Farmers' },
  ],
  logo_challenge: [
    { text: 'Which company uses a bitten apple logo?', realAnswer: 'Apple' },
    { text: 'Which brand has a swoosh logo?', realAnswer: 'Nike' },
    { text: 'Which company has a mermaid in its logo?', realAnswer: 'Starbucks' },
    { text: 'Which car brand has four interlocking rings?', realAnswer: 'Audi' },
    { text: 'Which social app uses a ghost logo?', realAnswer: 'Snapchat' },
    { text: 'Which browser has a fox logo?', realAnswer: 'Firefox' },
    { text: 'Which company has a yellow M arches logo?', realAnswer: 'McDonald\'s' },
    { text: 'Which brand uses a checkmark called the Swoosh?', realAnswer: 'Nike' },
  ],
  image_challenge: [
    { text: 'What landmark is shown? (Eiffel Tower photo round)', realAnswer: 'Paris' },
    { text: 'What animal is in the image clue? Black and white bear', realAnswer: 'Panda' },
    { text: 'What food is shown? Long yellow curved fruit', realAnswer: 'Banana' },
    { text: 'What vehicle? Red double-decker bus clue', realAnswer: 'London bus' },
    { text: 'What sport uses a round orange ball and hoops?', realAnswer: 'Basketball' },
    { text: 'What instrument has black and white keys?', realAnswer: 'Piano' },
    { text: 'What planet is known as the Red Planet?', realAnswer: 'Mars' },
    { text: 'What fruit is typically red and used in pies?', realAnswer: 'Apple' },
  ],
  world_trivia: [
    { text: 'What is the capital of Australia?', realAnswer: 'Canberra' },
    { text: 'Which country has the most natural lakes?', realAnswer: 'Canada' },
    { text: 'Mount Everest is located in which mountain range?', realAnswer: 'Himalayas' },
    { text: 'What is the smallest country in the world?', realAnswer: 'Vatican City' },
    { text: 'Which river is the longest in the world?', realAnswer: 'Nile' },
    { text: 'What is the capital of Japan?', realAnswer: 'Tokyo' },
    { text: 'Which desert is the largest hot desert?', realAnswer: 'Sahara' },
    { text: 'What country invented pizza as we know it?', realAnswer: 'Italy' },
  ],
  internet_culture: [
    { text: 'What does LOL stand for (one word)?', realAnswer: 'Laugh' },
    { text: 'Short dance video app?', realAnswer: 'TikTok' },
    { text: 'Distracted boyfriend meme — which app hosts memes?', realAnswer: 'Reddit' },
    { text: 'FOMO means fear of missing what?', realAnswer: 'Out' },
    { text: 'Catch creatures mobile game 2016?', realAnswer: 'Pokemon' },
    { text: 'Relatable meme word?', realAnswer: 'Same' },
    { text: 'Upvote downvote app?', realAnswer: 'Reddit' },
    { text: 'Ice bucket challenge was for charity — poured what?', realAnswer: 'Ice' },
  ],
};

const DEFAULT_QUESTIONS = Object.entries(SEED_BY_TYPE).flatMap(([type, items]) =>
  items.map((q) => ({ ...q, type, category: type }))
);

function loadBulkFromDisk() {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) return [];
  const all = [];
  for (const file of fs.readdirSync(dataDir)) {
    if (file.startsWith('bulk-') && file.endsWith('.json')) {
      try {
        const items = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
        if (Array.isArray(items)) all.push(...items.map((q) => ({ ...q, category: q.type || q.category })));
      } catch {
        // skip corrupt files
      }
    }
  }
  return all;
}

const BULK_QUESTIONS = loadBulkFromDisk();
let questionBank = BULK_QUESTIONS.length ? BULK_QUESTIONS : [...DEFAULT_QUESTIONS];

if (BULK_QUESTIONS.length) {
  console.log(`📚 Loaded ${BULK_QUESTIONS.length} bulk questions from data/`);
}

function setQuestionBank(questions) {
  if (questions?.length) questionBank = questions;
}

function getQuestionsForGame(settings, count, typesPerRound = []) {
  const pool = [...questionBank];
  const results = [];

  if (typesPerRound.length) {
    for (const type of typesPerRound) {
      const typed = pool.filter((q) => q.type === type);
      const pick = typed[Math.floor(Math.random() * typed.length)] || pool[Math.floor(Math.random() * pool.length)];
      if (pick) results.push({ ...pick, type: pick.type || type });
    }
    return results.slice(0, count);
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => ({
    id: null,
    text: q.text,
    realAnswer: q.realAnswer,
    type: q.type,
    category: q.type,
    imageUrl: q.imageUrl || null,
  }));
}

module.exports = {
  DEFAULT_QUESTIONS,
  SEED_BY_TYPE,
  setQuestionBank,
  getQuestionsForGame,
};
