const DEFAULT_QUESTIONS = [
  { text: 'What is the national animal of Scotland?', realAnswer: 'Unicorn', category: 'trivia' },
  { text: 'Which country has a town named Batman?', realAnswer: 'Turkey', category: 'geography' },
  { text: 'Which fruit floats on water?', realAnswer: 'Apple', category: 'science' },
  { text: 'What was the original name of Google?', realAnswer: 'BackRub', category: 'trivia' },
  { text: 'Which animal fingerprints are nearly identical to humans?', realAnswer: 'Koala', category: 'science' },
  { text: 'What fictional city is the home of Batman?', realAnswer: 'Gotham', category: 'movies' },
  { text: 'In which year did the Titanic sink?', realAnswer: '1912', category: 'history' },
  { text: 'What is the chemical symbol for gold?', realAnswer: 'Au', category: 'science' },
  { text: 'Which movie features a DeLorean time machine?', realAnswer: 'Back to the Future', category: 'movies' },
  { text: 'What is the capital of Australia?', realAnswer: 'Canberra', category: 'geography' },
  { text: 'Who painted the Mona Lisa?', realAnswer: 'Leonardo da Vinci', category: 'history' },
  { text: 'What planet is known as the Red Planet?', realAnswer: 'Mars', category: 'science' },
];

let questionBank = [...DEFAULT_QUESTIONS];

function setQuestionBank(questions) {
  if (questions?.length) {
    questionBank = questions;
  }
}

function getQuestionsForGame(category, count) {
  let pool = questionBank;
  if (category && category !== 'all') {
    pool = questionBank.filter((q) => q.category === category);
    if (pool.length < count) {
      pool = [...questionBank];
    }
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => ({
    text: q.text,
    realAnswer: q.real_answer || q.realAnswer,
  }));
}

module.exports = {
  DEFAULT_QUESTIONS,
  setQuestionBank,
  getQuestionsForGame,
};
