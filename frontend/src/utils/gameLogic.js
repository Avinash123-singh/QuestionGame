export const ROUND_QUESTIONS = [
  {
    text: 'What is the national animal of Scotland?',
    realAnswer: 'Unicorn',
  },
  {
    text: 'Which country has a town named Batman?',
    realAnswer: 'Turkey',
  },
  {
    text: 'Which fruit floats on water?',
    realAnswer: 'Apple',
  },
];

export const SCORING = {
  correctGuess: 100,
  fooledPlayer: 50,
};

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getQuestionForRound(round) {
  return ROUND_QUESTIONS[round - 1] ?? ROUND_QUESTIONS[0];
}

const SIMULATED_FAKE_ANSWERS = {
  1: { 1: 'Dragon', 2: 'Polar Bear', 3: 'Eagle' },
  2: { 1: 'Canada', 2: 'Australia', 3: 'Germany' },
  3: { 1: 'Mango', 2: 'Banana', 3: 'Orange' },
};

const SIMULATED_VOTES = {
  1: { 1: 'Wolf', 2: null, 3: 'Dragon' },
  2: { 1: null, 2: 'Canada', 3: 'Brazil' },
  3: { 1: 'Mango', 2: null, 3: 'Grapes' },
};

export function buildSubmissions(players, currentPlayerId, currentPlayerAnswer, round) {
  const submissions = {};
  const presets = SIMULATED_FAKE_ANSWERS[round] ?? {};

  players.forEach((player) => {
    if (player.id === currentPlayerId) {
      submissions[player.id] = currentPlayerAnswer.trim();
    } else {
      submissions[player.id] = presets[player.id] ?? `Fake answer by ${player.name}`;
    }
  });

  return submissions;
}

export function buildVotingOptions(submissions, realAnswer) {
  const playerAnswers = Object.entries(submissions).map(([playerId, answer]) => ({
    id: `player-${playerId}`,
    answer,
    playerId: Number(playerId),
    isReal: false,
  }));

  const realOption = {
    id: 'real',
    answer: realAnswer,
    playerId: null,
    isReal: true,
  };

  return shuffleArray([...playerAnswers, realOption]);
}

function pickAlternateVote(submissions, realAnswer, playerId) {
  const ownAnswer = submissions[playerId];
  const options = [...Object.values(submissions), realAnswer].filter(
    (answer) => answer !== ownAnswer
  );
  return options[0];
}

export function buildVotes(players, currentPlayerId, userVote, submissions, realAnswer, round) {
  const votes = { [currentPlayerId]: userVote };
  const presets = SIMULATED_VOTES[round] ?? {};

  players.forEach((player) => {
    if (player.id === currentPlayerId) return;

    const preset = presets[player.id];
    let vote;

    if (preset === null) {
      vote = realAnswer;
    } else if (preset) {
      vote = preset;
    } else {
      vote = pickAlternateVote(submissions, realAnswer, player.id);
    }

    if (vote === submissions[player.id]) {
      vote = pickAlternateVote(submissions, realAnswer, player.id);
    }

    votes[player.id] = vote;
  });

  return votes;
}

export function calculateRoundScores(players, submissions, votes, realAnswer) {
  const roundScores = {};
  players.forEach((player) => {
    roundScores[player.id] = 0;
  });

  Object.entries(votes).forEach(([playerId, votedAnswer]) => {
    if (votedAnswer === realAnswer) {
      roundScores[Number(playerId)] += SCORING.correctGuess;
    }
  });

  players.forEach((player) => {
    const fakeAnswer = submissions[player.id];
    if (!fakeAnswer) return;

    Object.entries(votes).forEach(([voterId, votedAnswer]) => {
      if (
        Number(voterId) !== player.id &&
        votedAnswer === fakeAnswer
      ) {
        roundScores[player.id] += SCORING.fooledPlayer;
      }
    });
  });

  return roundScores;
}

export function buildRoundResults(players, submissions, votes, realAnswer, roundScores) {
  const fooledBy = {};
  players.forEach((player) => {
    fooledBy[player.id] = [];
  });

  players.forEach((player) => {
    const fakeAnswer = submissions[player.id];
    if (!fakeAnswer) return;

    Object.entries(votes).forEach(([voterId, votedAnswer]) => {
      if (Number(voterId) !== player.id && votedAnswer === fakeAnswer) {
        const voter = players.find((p) => p.id === Number(voterId));
        fooledBy[player.id].push(voter?.name ?? 'Unknown');
      }
    });
  });

  const roundBreakdown = players.map((player) => {
      const points = roundScores[player.id] ?? 0;
      const votedFor = votes[player.id];
      const submitted = submissions[player.id];
      const guessedCorrectly = votedFor === realAnswer;

      return {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        points,
        submitted,
        votedFor,
        guessedCorrectly,
        fooledPlayers: fooledBy[player.id],
        foolPoints: fooledBy[player.id].length * SCORING.fooledPlayer,
        guessPoints: guessedCorrectly ? SCORING.correctGuess : 0,
      };
    });

  return {
    realAnswer,
    roundBreakdown,
    votes: players.map((p) => ({
      name: p.name,
      votedFor: votes[p.id],
      submitted: submissions[p.id],
    })),
  };
}

export function getLeaderboard(players) {
  return [...players]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
}
