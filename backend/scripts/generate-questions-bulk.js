#!/usr/bin/env node
/**
 * Easy party questions — short ONE-WORD answers (fun, not KBC).
 * Usage: node scripts/generate-questions-bulk.js 500 --json-only
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDatabase, getPool } = require('../db/db');
const { bulkInsertQuestions } = require('../db/questionService');
const { CATEGORY_IDS } = require('../game/categories');

/** Universal easy party Q&A — answer is always 1 word (max 2) */
const EASY_PARTY = [
  { text: 'Which country has a town named Batman?', realAnswer: 'Turkey' },
  { text: 'What animal has blue blood?', realAnswer: 'Octopus' },
  { text: 'Scotland\'s national animal is a?', realAnswer: 'Unicorn' },
  { text: 'What fruit floats in water?', realAnswer: 'Apple' },
  { text: 'Google was originally called?', realAnswer: 'BackRub' },
  { text: 'Which planet rains diamonds?', realAnswer: 'Neptune' },
  { text: 'A baby kangaroo is called a?', realAnswer: 'Joey' },
  { text: 'Which animal never forgets?', realAnswer: 'Elephant' },
  { text: 'Capital of France?', realAnswer: 'Paris' },
  { text: 'Capital of Japan?', realAnswer: 'Tokyo' },
  { text: 'Which planet is the Red Planet?', realAnswer: 'Mars' },
  { text: 'How many legs does a spider have?', realAnswer: 'Eight' },
  { text: 'What color are school buses in the US?', realAnswer: 'Yellow' },
  { text: 'Which bird cannot fly but runs fast?', realAnswer: 'Ostrich' },
  { text: 'What do bees make?', realAnswer: 'Honey' },
  { text: 'Largest ocean on Earth?', realAnswer: 'Pacific' },
  { text: 'Which sport uses a puck?', realAnswer: 'Hockey' },
  { text: 'Frozen water is called?', realAnswer: 'Ice' },
  { text: 'Which company has a bitten apple logo?', realAnswer: 'Apple' },
  { text: 'Nike logo is called a?', realAnswer: 'Swoosh' },
  { text: 'Ghost logo belongs to?', realAnswer: 'Snapchat' },
  { text: 'Yellow M arches = which fast food?', realAnswer: 'McDonalds' },
  { text: 'What does LOL mean?', realAnswer: 'Laugh' },
  { text: 'Short dance video app?', realAnswer: 'TikTok' },
  { text: 'Upvote app called?', realAnswer: 'Reddit' },
  { text: 'Catch creatures game 2016?', realAnswer: 'Pokemon' },
  { text: 'A goat was elected mayor of a town — animal?', realAnswer: 'Goat' },
  { text: 'Scientists taught which rodent hide-and-seek?', realAnswer: 'Rats' },
  { text: 'Pigeons trained to spot what disease?', realAnswer: 'Cancer' },
  { text: 'Real startup: dating for dog owners?', realAnswer: 'Bark' },
  { text: 'Which app lets you rent homes?', realAnswer: 'Airbnb' },
  { text: 'Pet rock was sold in which decade?', realAnswer: 'Seventies' },
  { text: 'Fidget spinner craze year around?', realAnswer: '2017' },
  { text: 'Which animal laughs like a human?', realAnswer: 'Hyena' },
  { text: 'Fastest land animal?', realAnswer: 'Cheetah' },
  { text: 'Tallest animal?', realAnswer: 'Giraffe' },
  { text: 'Black and white bear from China?', realAnswer: 'Panda' },
  { text: 'King of the jungle (nickname)?', realAnswer: 'Lion' },
  { text: 'What animal is Shere Khan in Jungle Book?', realAnswer: 'Tiger' },
  { text: 'Harry Potter school name?', realAnswer: 'Hogwarts' },
  { text: 'Iron Man real name?', realAnswer: 'Stark' },
  { text: 'Batman\'s city?', realAnswer: 'Gotham' },
  { text: 'Spider-Man city?', realAnswer: 'Queens' },
  { text: 'Thanos snapped half of what?', realAnswer: 'Universe' },
  { text: 'Game of Thrones iron throne metal?', realAnswer: 'Iron' },
  { text: 'Stranger Things monster nickname?', realAnswer: 'Demogorgon' },
  { text: 'Bollywood city nickname?', realAnswer: 'Mumbai' },
  { text: 'Cricket world cup sport?', realAnswer: 'Cricket' },
  { text: 'IPL country?', realAnswer: 'India' },
  { text: 'Smallest country?', realAnswer: 'Vatican' },
  { text: 'Eiffel Tower city?', realAnswer: 'Paris' },
  { text: 'Big Ben city?', realAnswer: 'London' },
  { text: 'Statue of Liberty city?', realAnswer: 'NewYork' },
  { text: 'Taj Mahal country?', realAnswer: 'India' },
  { text: 'Pyramids country?', realAnswer: 'Egypt' },
  { text: 'Great Wall country?', realAnswer: 'China' },
  { text: 'Vikings came from which region?', realAnswer: 'Scandinavia' },
  { text: 'Samurai country?', realAnswer: 'Japan' },
  { text: 'Mummy country famous for?', realAnswer: 'Egypt' },
  { text: 'UFO stands for Unidentified Flying ___?', realAnswer: 'Object' },
  { text: 'Bermuda shape on map?', realAnswer: 'Triangle' },
  { text: 'Dinosaur extinction cause (rock)?', realAnswer: 'Asteroid' },
  { text: 'T-Rex diet type?', realAnswer: 'Carnivore' },
  { text: 'First man on moon?', realAnswer: 'Armstrong' },
  { text: 'Mars rover country (famous)?', realAnswer: 'NASA' },
  { text: 'Bitcoin creator nickname?', realAnswer: 'Satoshi' },
  { text: 'Elon Musk car company?', realAnswer: 'Tesla' },
  { text: 'Facebook renamed to?', realAnswer: 'Meta' },
  { text: 'iPhone maker?', realAnswer: 'Apple' },
  { text: 'Windows creator?', realAnswer: 'Microsoft' },
  { text: 'Android owner?', realAnswer: 'Google' },
  { text: 'ChatGPT maker?', realAnswer: 'OpenAI' },
  { text: 'Royal family country (famous)?', realAnswer: 'Britain' },
  { text: 'White House country?', realAnswer: 'America' },
  { text: 'Kremlin country?', realAnswer: 'Russia' },
  { text: 'Anime country of origin?', realAnswer: 'Japan' },
  { text: 'K-pop country?', realAnswer: 'Korea' },
  { text: 'Olympics symbol ring count?', realAnswer: 'Five' },
  { text: 'FIFA sport?', realAnswer: 'Football' },
  { text: 'NBA sport?', realAnswer: 'Basketball' },
  { text: 'Wimbledon sport?', realAnswer: 'Tennis' },
  { text: 'Formula 1 vehicle?', realAnswer: 'Car' },
  { text: 'Piano keys color pair?', realAnswer: 'Blackwhite' },
  { text: 'Guitar strings usually?', realAnswer: 'Six' },
  { text: 'Drum hit stick called?', realAnswer: 'Stick' },
  { text: 'Mickey Mouse pet dog?', realAnswer: 'Pluto' },
  { text: 'Donald Duck uncle?', realAnswer: 'Scrooge' },
  { text: 'SpongeBob lives in a?', realAnswer: 'Pineapple' },
  { text: 'Simpsons town?', realAnswer: 'Springfield' },
  { text: 'Friends coffee shop?', realAnswer: 'Central' },
  { text: 'Breaking Bad drug color?', realAnswer: 'Blue' },
  { text: 'Joker hair color?', realAnswer: 'Green' },
  { text: 'Hulk color when angry?', realAnswer: 'Green' },
  { text: 'Superman weakness stone?', realAnswer: 'Kryptonite' },
  { text: 'Wonder Woman weapon?', realAnswer: 'Lasso' },
  { text: 'Thor hammer name?', realAnswer: 'Mjolnir' },
  { text: 'Casino city nickname?', realAnswer: 'Vegas' },
  { text: 'Lottery is a game of?', realAnswer: 'Chance' },
  { text: 'Magic trick word often said?', realAnswer: 'Abracadabra' },
  { text: 'Circus tent shape?', realAnswer: 'Circle' },
  { text: 'Haunted house feeling?', realAnswer: 'Fear' },
  { text: 'Rainbow color count?', realAnswer: 'Seven' },
  { text: 'Thunder partner in storm?', realAnswer: 'Lightning' },
  { text: 'Snow frozen what?', realAnswer: 'Water' },
  { text: 'Earthquake measured on ___ scale?', realAnswer: 'Richter' },
  { text: 'Human heart chambers?', realAnswer: 'Four' },
  { text: 'Largest human organ?', realAnswer: 'Skin' },
  { text: 'Bones in adult human (approx)?', realAnswer: 'Twohundred' },
  { text: 'Brain thinking part nickname?', realAnswer: 'Graymatter' },
  { text: 'Eye color most common worldwide?', realAnswer: 'Brown' },
  { text: 'Tongue taste count (basic)?', realAnswer: 'Five' },
  { text: 'Prison escape tool in movies?', realAnswer: 'Spoon' },
  { text: 'World record book name?', realAnswer: 'Guinness' },
  { text: 'Magic illusion artist Blaine?', realAnswer: 'David' },
  { text: 'YouTube play button color (first)?', realAnswer: 'Silver' },
  { text: 'Netflix started as DVD by ___?', realAnswer: 'Mail' },
  { text: 'Tinder swipe direction for like?', realAnswer: 'Right' },
  { text: 'WhatsApp owner company?', realAnswer: 'Meta' },
  { text: 'Instagram photo shape default?', realAnswer: 'Square' },
  { text: 'Meme dog breed (Doge)?', realAnswer: 'Shiba' },
  { text: 'Pepe the ___ (frog meme)?', realAnswer: 'Frog' },
  { text: 'Among Us imposter color (iconic)?', realAnswer: 'Red' },
  { text: 'Minecraft block world made of?', realAnswer: 'Blocks' },
  { text: 'Fortnite dance emote genre?', realAnswer: 'Emote' },
  { text: 'Roblox player avatar called?', realAnswer: 'Avatar' },
  { text: 'GTA city most famous?', realAnswer: 'LosSantos' },
  { text: 'Zelda princess name?', realAnswer: 'Zelda' },
  { text: 'Mario brother green one?', realAnswer: 'Luigi' },
  { text: 'Pac-Man eats what dots?', realAnswer: 'Pellets' },
  { text: 'Conspiracy moon landing org?', realAnswer: 'NASA' },
  { text: 'Area 51 US state?', realAnswer: 'Nevada' },
  { text: 'Illuminati symbol eye on?', realAnswer: 'Pyramid' },
  { text: 'Bermuda Triangle ocean?', realAnswer: 'Atlantic' },
  { text: 'Stock market fear index nickname?', realAnswer: 'VIX' },
  { text: 'Billionaire Bezos company?', realAnswer: 'Amazon' },
  { text: 'Buffett nickname?', realAnswer: 'Oracle' },
  { text: 'Crypto dog coin name?', realAnswer: 'Doge' },
  { text: 'NFT stands for Non-Fungible ___?', realAnswer: 'Token' },
  { text: 'Weather frozen rain called?', realAnswer: 'Hail' },
  { text: 'Tornado nickname?', realAnswer: 'Twister' },
  { text: 'Hurricane another name?', realAnswer: 'Cyclone' },
  { text: 'India capital?', realAnswer: 'Delhi' },
  { text: 'USA capital?', realAnswer: 'Washington' },
  { text: 'UK capital?', realAnswer: 'London' },
  { text: 'Canada capital?', realAnswer: 'Ottawa' },
  { text: 'Australia capital?', realAnswer: 'Canberra' },
  { text: 'Brazil main language?', realAnswer: 'Portuguese' },
  { text: 'Mexico currency?', realAnswer: 'Peso' },
  { text: 'Japan currency?', realAnswer: 'Yen' },
  { text: 'UK currency?', realAnswer: 'Pound' },
  { text: 'Euro used in which continent mainly?', realAnswer: 'Europe' },
  { text: 'Sahara is a?', realAnswer: 'Desert' },
  { text: 'Amazon is a?', realAnswer: 'River' },
  { text: 'Everest is a?', realAnswer: 'Mountain' },
  { text: 'Nile is a?', realAnswer: 'River' },
  { text: 'Antarctica is a?', realAnswer: 'Continent' },
  { text: 'Pacific is an?', realAnswer: 'Ocean' },
  { text: 'Vatican is in which city?', realAnswer: 'Rome' },
  { text: 'Hollywood sign city?', realAnswer: 'LosAngeles' },
  { text: 'Bollywood film language mainly?', realAnswer: 'Hindi' },
  { text: 'Oscar award shape?', realAnswer: 'Statue' },
  { text: 'Grammy award for?', realAnswer: 'Music' },
  { text: 'Emmy award for?', realAnswer: 'Television' },
  { text: 'Coffee morning drink origin country famous?', realAnswer: 'Ethiopia' },
  { text: 'Pizza origin country?', realAnswer: 'Italy' },
  { text: 'Sushi origin country?', realAnswer: 'Japan' },
  { text: 'Taco origin country?', realAnswer: 'Mexico' },
  { text: 'Curry famous country?', realAnswer: 'India' },
  { text: 'Croissant origin country?', realAnswer: 'France' },
  { text: 'Baguette country?', realAnswer: 'France' },
  { text: 'Kimchi country?', realAnswer: 'Korea' },
  { text: 'Pho soup country?', realAnswer: 'Vietnam' },
  { text: 'Weird law: chewing gum banned in?', realAnswer: 'Singapore' },
  { text: 'Country with no mosquitoes (famous claim)?', realAnswer: 'Iceland' },
  { text: 'Kangaroo country?', realAnswer: 'Australia' },
  { text: 'Panda country?', realAnswer: 'China' },
  { text: 'Lion safari famous continent?', realAnswer: 'Africa' },
  { text: 'Polar bear habitat?', realAnswer: 'Arctic' },
  { text: 'Camel desert animal nickname?', realAnswer: 'Ship' },
  { text: 'Bat sleeps upside down — mammal type?', realAnswer: 'Mammal' },
  { text: 'Shark is a?', realAnswer: 'Fish' },
  { text: 'Dolphin is a?', realAnswer: 'Mammal' },
  { text: 'Whale is a?', realAnswer: 'Mammal' },
  { text: 'Jellyfish has how many brains?', realAnswer: 'Zero' },
  { text: 'Starfish arms usually?', realAnswer: 'Five' },
  { text: 'Snail home called?', realAnswer: 'Shell' },
  { text: 'Butterfly starts as?', realAnswer: 'Caterpillar' },
  { text: 'Frog young called?', realAnswer: 'Tadpole' },
  { text: 'Chicken egg hatches into?', realAnswer: 'Chick' },
  { text: 'Dog sound?', realAnswer: 'Bark' },
  { text: 'Cat sound?', realAnswer: 'Meow' },
  { text: 'Cow sound?', realAnswer: 'Moo' },
  { text: 'Sheep sound?', realAnswer: 'Baa' },
  { text: 'Rooster sound?', realAnswer: 'Crow' },
  { text: 'Owl sound?', realAnswer: 'Hoot' },
  { text: 'Bee home?', realAnswer: 'Hive' },
  { text: 'Ant colony home?', realAnswer: 'Anthill' },
  { text: 'Spider web material?', realAnswer: 'Silk' },
  { text: 'Snake movement type?', realAnswer: 'Slither' },
  { text: 'Horse baby?', realAnswer: 'Foal' },
  { text: 'Pig baby?', realAnswer: 'Piglet' },
  { text: 'Sheep baby?', realAnswer: 'Lamb' },
  { text: 'Deer antlers on which gender usually?', realAnswer: 'Male' },
  { text: 'Peacock is which gender (colorful)?', realAnswer: 'Male' },
  { text: 'Flamingo color from?', realAnswer: 'Shrimp' },
  { text: 'Chameleon changes?', realAnswer: 'Color' },
  { text: 'Octopus arms count?', realAnswer: 'Eight' },
  { text: 'Squid ink color?', realAnswer: 'Black' },
  { text: 'Crab walks sideways — direction?', realAnswer: 'Sideways' },
  { text: 'Lobster color when cooked?', realAnswer: 'Red' },
  { text: 'Shrimp size category food?', realAnswer: 'Seafood' },
  { text: 'Sushi fish often?', realAnswer: 'Salmon' },
  { text: 'Peanut is technically a?', realAnswer: 'Legume' },
  { text: 'Tomato is botanically a?', realAnswer: 'Fruit' },
  { text: 'Carrot color famous?', realAnswer: 'Orange' },
  { text: 'Banana peel color ripe?', realAnswer: 'Yellow' },
  { text: 'Grapes used to make?', realAnswer: 'Wine' },
  { text: 'Champagne country?', realAnswer: 'France' },
  { text: 'Beer ingredient grain?', realAnswer: 'Barley' },
  { text: 'Tea leaf plant?', realAnswer: 'Camellia' },
  { text: 'Cocoa makes?', realAnswer: 'Chocolate' },
  { text: 'Vanilla flavor plant?', realAnswer: 'Orchid' },
  { text: 'Cinnamon spice from?', realAnswer: 'Bark' },
  { text: 'Pepper spice color common?', realAnswer: 'Black' },
  { text: 'Salt chemical name short?', realAnswer: 'NaCl' },
  { text: 'Sugar sweet type from cane?', realAnswer: 'Sucrose' },
  { text: 'Ice cream cold treat stored in?', realAnswer: 'Freezer' },
  { text: 'Popcorn pops from which grain?', realAnswer: 'Corn' },
  { text: 'Pizza topping round meat?', realAnswer: 'Pepperoni' },
  { text: 'Burger patty meat usually?', realAnswer: 'Beef' },
  { text: 'Hot dog meat type often?', realAnswer: 'Pork' },
  { text: 'Nachos chip country origin?', realAnswer: 'Mexico' },
  { text: 'Donut hole shape?', realAnswer: 'Ring' },
  { text: 'Waffle grid from?', realAnswer: 'Iron' },
  { text: 'Pancake breakfast syrup tree?', realAnswer: 'Maple' },
  { text: 'Cereal eaten with?', realAnswer: 'Milk' },
  { text: 'Sandwich named after earl\'s title?', realAnswer: 'Sandwich' },
  { text: 'Salad main ingredient base?', realAnswer: 'Lettuce' },
  { text: 'Soup eaten with?', realAnswer: 'Spoon' },
  { text: 'Pizza cheese common?', realAnswer: 'Mozzarella' },
  { text: 'Pasta country famous?', realAnswer: 'Italy' },
  { text: 'Ramen noodle country?', realAnswer: 'Japan' },
  { text: 'Curry spice color often?', realAnswer: 'Yellow' },
  { text: 'Wasabi color?', realAnswer: 'Green' },
  { text: 'Ketchup main ingredient?', realAnswer: 'Tomato' },
  { text: 'Mustard seed color?', realAnswer: 'Yellow' },
  { text: 'Mayo main ingredient?', realAnswer: 'Egg' },
  { text: 'Butter made from?', realAnswer: 'Milk' },
  { text: 'Cheese aged product from?', realAnswer: 'Milk' },
  { text: 'Yogurt fermented?', realAnswer: 'Milk' },
  { text: 'Omelette main ingredient?', realAnswer: 'Egg' },
  { text: 'Bacon from which animal?', realAnswer: 'Pig' },
  { text: 'Steak from which animal?', realAnswer: 'Cow' },
  { text: 'Lamb meat animal?', realAnswer: 'Sheep' },
  { text: 'Turkey holiday (US)?', realAnswer: 'Thanksgiving' },
  { text: 'Christmas color pair?', realAnswer: 'Redgreen' },
  { text: 'Halloween month?', realAnswer: 'October' },
  { text: 'Valentine color?', realAnswer: 'Red' },
  { text: 'Easter animal symbol?', realAnswer: 'Bunny' },
  { text: 'Fireworks holiday (US)?', realAnswer: 'July' },
  { text: 'Diwali festival country?', realAnswer: 'India' },
  { text: 'Holi festival color?', realAnswer: 'Rainbow' },
  { text: 'Chinese New Year animal cycle?', realAnswer: 'Zodiac' },
];

function generateForCategory(type, count) {
  const questions = [];
  const seen = new Set();
  const offset = CATEGORY_IDS.indexOf(type) * 17;

  for (let i = 0; i < count; i += 1) {
    const base = EASY_PARTY[(offset + i) % EASY_PARTY.length];
    const text = base.text;
    const realAnswer = base.realAnswer;
    const key = `${type}::${text}::${realAnswer}`;
    if (!seen.has(key)) {
      seen.add(key);
      questions.push({ text, realAnswer, type, difficulty: 'easy' });
    }
  }

  let n = 0;
  while (questions.length < count && n < count * 3) {
    const base = EASY_PARTY[n % EASY_PARTY.length];
    const text = `${base.text}?`;
    const key = `${type}::${text}::${base.realAnswer}`;
    if (!seen.has(key)) {
      seen.add(key);
      questions.push({ text, realAnswer: base.realAnswer, type, difficulty: 'easy' });
    }
    n += 1;
  }

  return questions.slice(0, count);
}

async function main() {
  const args = process.argv.slice(2);
  let jsonOnly = args.includes('--json-only');
  const filtered = args.filter((a) => a !== '--json-only');
  const force = args.includes('--force');

  const arg1 = filtered.find((a) => a !== '--force');
  const arg2 = filtered.filter((a) => a !== '--force')[1];

  let perCategory = 500;
  let onlyType = null;

  if (arg2) {
    perCategory = parseInt(arg1, 10) || 500;
    onlyType = arg2;
  } else if (arg1 && !Number.isNaN(parseInt(arg1, 10))) {
    perCategory = parseInt(arg1, 10);
  } else if (arg1) {
    onlyType = arg1;
  }

  const types = onlyType ? [onlyType] : CATEGORY_IDS;

  if (!jsonOnly) {
    await initDatabase();
    if (!process.env.DATABASE_URL) jsonOnly = true;
    if (force && getPool()) {
      await getPool().query('TRUNCATE questions RESTART IDENTITY CASCADE');
      console.log('🗑️  Cleared old questions');
    }
  }

  console.log(`Generating ${perCategory} EASY questions × ${types.length} categories...`);
  const outDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let totalInserted = 0;

  for (const type of types) {
    const questions = generateForCategory(type, perCategory);
    const outFile = path.join(outDir, `bulk-${type}.json`);
    fs.writeFileSync(outFile, JSON.stringify(questions));

    if (!jsonOnly && process.env.DATABASE_URL) {
      const { inserted } = await bulkInsertQuestions(questions, 'bulk-easy');
      totalInserted += inserted;
      console.log(`  ${type}: +${inserted}`);
    } else {
      console.log(`  ${type}: ${questions.length} → saved`);
    }
  }

  console.log(`\n✅ Done! ${jsonOnly ? 'JSON files updated' : `${totalInserted} inserted into DB`}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
