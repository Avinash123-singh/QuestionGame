const SCORING = {
  correctGuess: 100,
  fooledPlayer: 50,
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildVotingOptions(players, submissions, realAnswer) {
  const options = [];

  players.forEach((player) => {
    const answer = submissions[player.id]?.trim();
    if (answer) {
      options.push({
        id: `player-${player.id}`,
        answer,
        playerId: player.id,
        isReal: false,
        isNoSubmit: false,
      });
    } else {
      options.push({
        id: `no-submit-${player.id}`,
        answer: `${player.name} did not submit`,
        playerId: player.id,
        isReal: false,
        isNoSubmit: true,
      });
    }
  });

  options.push({
    id: 'real',
    answer: realAnswer,
    playerId: null,
    isReal: true,
    isNoSubmit: false,
  });

  return shuffleArray(options);
}

function calculateRoundScores(players, actualSubmissions, votes, realAnswer) {
  const roundScores = {};
  players.forEach((player) => {
    roundScores[player.id] = 0;
  });

  Object.entries(votes).forEach(([playerId, votedAnswer]) => {
    if (votedAnswer === realAnswer) {
      roundScores[playerId] += SCORING.correctGuess;
    }
  });

  players.forEach((player) => {
    const fakeAnswer = actualSubmissions[player.id];
    if (!fakeAnswer?.trim()) return;

    Object.entries(votes).forEach(([voterId, votedAnswer]) => {
      if (voterId !== player.id && votedAnswer === fakeAnswer) {
        roundScores[player.id] += SCORING.fooledPlayer;
      }
    });
  });

  return roundScores;
}

function buildRoundResults(players, actualSubmissions, votes, realAnswer, roundScores) {
  const fooledBy = {};
  players.forEach((player) => {
    fooledBy[player.id] = [];
  });

  players.forEach((player) => {
    const fakeAnswer = actualSubmissions[player.id];
    if (!fakeAnswer?.trim()) return;

    Object.entries(votes).forEach(([voterId, votedAnswer]) => {
      if (voterId !== player.id && votedAnswer === fakeAnswer) {
        const voter = players.find((p) => p.id === voterId);
        fooledBy[player.id].push(voter?.name ?? 'Unknown');
      }
    });
  });

  const roundBreakdown = players.map((player) => {
    const points = roundScores[player.id] ?? 0;
    const didSubmit = Boolean(actualSubmissions[player.id]?.trim());
    const didVote = Boolean(votes[player.id]);
    const votedFor = didVote ? votes[player.id] : null;
    const submitted = didSubmit ? actualSubmissions[player.id] : null;
    const guessedCorrectly = didVote && votedFor === realAnswer;

    return {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      points,
      submitted,
      votedFor,
      didSubmit,
      didVote,
      guessedCorrectly,
      fooledPlayers: fooledBy[player.id],
      foolPoints: fooledBy[player.id].length * SCORING.fooledPlayer,
      guessPoints: guessedCorrectly ? SCORING.correctGuess : 0,
    };
  });

  return {
    realAnswer,
    roundBreakdown,
  };
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

module.exports = {
  SCORING,
  shuffleArray,
  buildVotingOptions,
  calculateRoundScores,
  buildRoundResults,
  generateRoomCode,
};
