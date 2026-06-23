const {
  buildVotingOptions,
  calculateRoundScores,
  buildRoundResults,
  generateRoomCode,
} = require('./gameLogic');
const { saveGameSession } = require('../db/db');
const { getQuestionsForGame: getQuestionsFromDb, markQuestionsSeen } = require('../db/questionService');
const { upsertProfile } = require('../db/playerService');

const VOTE_TIME = 30;
const RESULTS_TIME = 20;
const FINAL_ROUND_DELAY = 3000;

function createRoomManager(io) {
  const rooms = new Map();
  const socketToRoom = new Map();

  function getPublicPlayers(room) {
    return room.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      isHost: p.isHost,
    }));
  }

  function stopTimerSync(room) {
    if (room.timerSyncInterval) {
      clearInterval(room.timerSyncInterval);
      room.timerSyncInterval = null;
    }
  }

  function clearPhaseTimer(room) {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
      room.phaseTimer = null;
    }
    stopTimerSync(room);
  }

  function getRemainingTime(room) {
    if (!room.phaseEndsAt) return room.timeLeft || 0;
    return Math.max(0, Math.ceil((room.phaseEndsAt - Date.now()) / 1000));
  }

  function startTimerSync(room) {
    stopTimerSync(room);
    const tick = () => {
      if (!['submit', 'vote', 'results'].includes(room.phase)) {
        stopTimerSync(room);
        return;
      }
      emitToRoom(room.id, 'timer-sync', {
        timeLeft: getRemainingTime(room),
        phaseEndsAt: room.phaseEndsAt,
        phase: room.phase,
        round: room.currentRound,
      });
    };
    tick();
    room.timerSyncInterval = setInterval(tick, 1000);
  }

  function schedulePhaseEnd(room, seconds, onEnd) {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
      room.phaseTimer = null;
    }
    room.phaseEndsAt = Date.now() + seconds * 1000;
    room.timeLeft = seconds;
    room.phaseTimer = setTimeout(onEnd, seconds * 1000);
    startTimerSync(room);
  }

  function emitToRoom(roomId, event, data) {
    io.to(roomId).emit(event, data);
  }

  function emitRoomPersonalized(room, event) {
    room.players.forEach((player) => {
      io.to(player.id).emit(event, buildRoomPayload(room, player.id));
    });
  }

  function setHost(room, socketId) {
    room.players.forEach((p) => {
      p.isHost = p.id === socketId;
    });
    room.hostId = socketId;
  }

  function promoteTemporaryHost(room) {
    if (room.players.length === 0) return;
    setHost(room, room.players[0].id);
  }

  function restoreOriginalHost(room, socketId, playerName) {
    if (playerName.toLowerCase() !== room.originalHostName.toLowerCase()) return false;
    setHost(room, socketId);
    return true;
  }

  function getPlayerProfileIds(room) {
    return room.players.map((p) => p.profileId).filter(Boolean);
  }

  async function resolvePlayerProfile(playerId, playerName, avatar) {
    if (!playerId) return null;
    try {
      const profile = await upsertProfile({ playerId, name: playerName, avatar });
      return profile?.id || playerId;
    } catch {
      return playerId;
    }
  }

  function buildRoomPayload(room, socketId) {
    const me = room.players.find((p) => p.id === socketId);
    return {
      roomId: room.id,
      players: getPublicPlayers(room),
      settings: room.settings,
      myPlayerId: socketId,
      isHost: me?.isHost ?? false,
      gamePhase: room.phase,
      isRematchLobby: room.isRematchLobby,
      currentRound: room.currentRound,
      totalRounds: room.settings.rounds,
      question: room.currentQuestion?.text ?? null,
      votingOptions: room.phase === 'vote' ? room.votingOptions : [],
      roundResults: room.phase === 'results' ? room.roundResults : null,
      submittedCount: Object.keys(room.submissions).length,
      timeLeft: getRemainingTime(room),
      phaseEndsAt: room.phaseEndsAt,
      leaderboard: room.phase === 'finished'
        ? [...room.players].sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, rank: i + 1 }))
        : [],
    };
  }

  function syncGameState(socket, room) {
    const payload = buildRoomPayload(room, socket.id);

    if (room.phase === 'waiting') {
      if (room.isRematchLobby) {
        socket.emit('return-to-lobby', payload);
      }
      return;
    }

    if (room.phase === 'finished') {
      socket.emit('game-over', { leaderboard: payload.leaderboard });
      return;
    }

    socket.emit('game-sync', payload);

    const remaining = getRemainingTime(room);

    if (room.phase === 'submit') {
      socket.emit('phase-changed', {
        phase: 'submit',
        round: room.currentRound,
        totalRounds: room.settings.rounds,
        question: room.currentQuestion?.text,
        timeLeft: remaining,
        phaseEndsAt: room.phaseEndsAt,
        players: getPublicPlayers(room),
        submittedCount: Object.keys(room.submissions).length,
        totalPlayers: room.players.length,
      });
    } else if (room.phase === 'vote') {
      socket.emit('phase-changed', {
        phase: 'vote',
        round: room.currentRound,
        question: room.currentQuestion?.text,
        timeLeft: remaining,
        phaseEndsAt: room.phaseEndsAt,
        votingOptions: room.votingOptions,
        players: getPublicPlayers(room),
        submittedCount: room.players.length,
        totalPlayers: room.players.length,
      });
    } else if (room.phase === 'results') {
      socket.emit('round-results', {
        round: room.currentRound,
        totalRounds: room.settings.rounds,
        results: room.roundResults,
        players: getPublicPlayers(room),
        timeLeft: remaining,
        phaseEndsAt: room.phaseEndsAt,
        isLastRound: room.currentRound >= room.settings.rounds,
      });
    }
  }

  function broadcastPlayersUpdate(room) {
    emitToRoom(room.id, 'players-update', {
      players: getPublicPlayers(room),
      settings: room.settings,
      isRematchLobby: room.isRematchLobby,
    });
  }

  function startSubmitPhase(room) {
    room.phase = 'submit';
    room.submissions = {};
    room.actualSubmissions = {};
    room.votes = {};
    room.votingOptions = [];
    room.roundResults = null;

    const duration = room.settings.timePerRound;

    schedulePhaseEnd(room, duration, () => {
      if (room.phase === 'submit') startVotePhase(room);
    });

    emitToRoom(room.id, 'phase-changed', {
      phase: 'submit',
      round: room.currentRound,
      totalRounds: room.settings.rounds,
      question: room.currentQuestion.text,
      timeLeft: getRemainingTime(room),
      phaseEndsAt: room.phaseEndsAt,
      players: getPublicPlayers(room),
      submittedCount: 0,
      totalPlayers: room.players.length,
    });
  }

  function startVotePhase(room) {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
      room.phaseTimer = null;
    }
    stopTimerSync(room);

    room.phase = 'vote';
    room.actualSubmissions = { ...room.submissions };
    room.votingOptions = buildVotingOptions(
      room.players,
      room.actualSubmissions,
      room.currentQuestion.realAnswer
    );

    schedulePhaseEnd(room, VOTE_TIME, () => {
      if (room.phase === 'vote') finishVoting(room);
    });

    emitToRoom(room.id, 'phase-changed', {
      phase: 'vote',
      round: room.currentRound,
      question: room.currentQuestion.text,
      timeLeft: getRemainingTime(room),
      phaseEndsAt: room.phaseEndsAt,
      votingOptions: room.votingOptions,
      players: getPublicPlayers(room),
      submittedCount: room.players.length,
      totalPlayers: room.players.length,
    });
  }

  function finishVoting(room) {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
      room.phaseTimer = null;
    }
    stopTimerSync(room);

    room.phase = 'results';

    const votes = { ...room.votes };

    const roundScores = calculateRoundScores(
      room.players,
      room.actualSubmissions,
      votes,
      room.currentQuestion.realAnswer
    );

    room.players.forEach((p) => {
      p.score += roundScores[p.id] ?? 0;
    });

    room.roundResults = buildRoundResults(
      room.players,
      room.actualSubmissions,
      votes,
      room.currentQuestion.realAnswer,
      roundScores
    );

    const isLastRound = room.currentRound >= room.settings.rounds;
    const resultsDuration = isLastRound ? Math.ceil(FINAL_ROUND_DELAY / 1000) : RESULTS_TIME;

    if (isLastRound) {
      room.phaseEndsAt = Date.now() + FINAL_ROUND_DELAY;
      room.timeLeft = resultsDuration;
      startTimerSync(room);
      room.phaseTimer = setTimeout(() => {
        if (room.phase === 'results') endGame(room);
      }, FINAL_ROUND_DELAY);
    } else {
      schedulePhaseEnd(room, RESULTS_TIME, () => {
        if (room.phase === 'results') advanceRound(room);
      });
    }

    emitToRoom(room.id, 'round-results', {
      round: room.currentRound,
      totalRounds: room.settings.rounds,
      results: room.roundResults,
      players: getPublicPlayers(room),
      timeLeft: getRemainingTime(room),
      phaseEndsAt: room.phaseEndsAt,
      isLastRound,
    });
  }

  function advanceRound(room) {
    if (room.phaseTimer) {
      clearTimeout(room.phaseTimer);
      room.phaseTimer = null;
    }
    stopTimerSync(room);
    room.currentRound += 1;
    room.currentQuestion = room.questions[room.currentRound - 1];
    startSubmitPhase(room);
  }

  function endGame(room) {
    clearPhaseTimer(room);
    room.phase = 'finished';
    room.phaseEndsAt = null;

    const leaderboard = [...room.players]
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    emitToRoom(room.id, 'game-over', { leaderboard });

    saveGameSession({
      roomCode: room.id,
      winnerName: leaderboard[0]?.name,
      playerCount: room.players.length,
      totalRounds: room.settings.rounds,
    });

    markQuestionsSeen(getPlayerProfileIds(room), room.questionIds || []).catch(() => {});
  }

  function resetRoomForPlayAgain(room) {
    clearPhaseTimer(room);
    room.isRematchLobby = true;
    room.phase = 'waiting';
    room.phaseEndsAt = null;
    room.currentRound = 0;
    room.currentQuestion = null;
    room.questions = [];
    room.submissions = {};
    room.actualSubmissions = {};
    room.votes = {};
    room.votingOptions = [];
    room.roundResults = null;
    room.questionIds = [];
    room.timeLeft = 0;
    room.players.forEach((p) => {
      p.score = 0;
    });
  }

  async function handleCreateRoom(socket, { playerName, avatar, settings, playerProfileId }) {
    let roomId = generateRoomCode();
    while (rooms.has(roomId)) {
      roomId = generateRoomCode();
    }

    const profileId = await resolvePlayerProfile(playerProfileId, playerName, avatar);

    socket.join(roomId);
    socketToRoom.set(socket.id, roomId);

    const room = {
      id: roomId,
      hostId: socket.id,
      originalHostName: playerName,
      disconnectedPlayers: [],
      isRematchLobby: false,
      questionIds: [],
      players: [{
        id: socket.id,
        profileId,
        name: playerName,
        avatar,
        score: 0,
        isHost: true,
      }],
      settings: {
        rounds: settings?.rounds ?? 3,
        timePerRound: settings?.timePerRound ?? 45,
        maxPlayers: settings?.maxPlayers ?? 20,
        category: settings?.category ?? 'all',
      },
      phase: 'waiting',
      currentRound: 0,
      questions: [],
      currentQuestion: null,
      submissions: {},
      actualSubmissions: {},
      votes: {},
      votingOptions: [],
      roundResults: null,
      phaseTimer: null,
      phaseEndsAt: null,
      timeLeft: 0,
    };

    rooms.set(roomId, room);
    socket.emit('room-created', buildRoomPayload(room, socket.id));
  }

  async function handleJoinRoom(socket, { roomId, playerName, avatar, playerProfileId }) {
    const code = roomId?.toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      socket.emit('join-error', 'Room does not exist');
      return;
    }

    if (room.players.length >= room.settings.maxPlayers) {
      const returning = room.disconnectedPlayers.find(
        (p) => p.name.toLowerCase() === playerName.toLowerCase()
      );
      if (!returning) {
        socket.emit('join-error', 'Room is full');
        return;
      }
    }

    const activeDuplicate = room.players.some(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (activeDuplicate) {
      socket.emit('join-error', 'Name already taken in this room');
      return;
    }

    const profileId = await resolvePlayerProfile(playerProfileId, playerName, avatar);

    socket.join(code);
    socketToRoom.set(socket.id, code);

    const returning = room.disconnectedPlayers.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );

    let player;
    if (returning) {
      room.disconnectedPlayers = room.disconnectedPlayers.filter(
        (p) => p.name.toLowerCase() !== playerName.toLowerCase()
      );
      player = {
        id: socket.id,
        profileId: profileId || returning.profileId,
        name: returning.name,
        avatar: avatar || returning.avatar,
        score: returning.score,
        isHost: false,
      };
    } else {
      player = {
        id: socket.id,
        profileId,
        name: playerName,
        avatar,
        score: 0,
        isHost: false,
      };
    }

    room.players.push(player);
    restoreOriginalHost(room, socket.id, playerName);

    const payload = buildRoomPayload(room, socket.id);
    socket.emit('join-success', payload);
    broadcastPlayersUpdate(room);
    syncGameState(socket, room);

    if (returning && room.phase !== 'waiting') {
      emitToRoom(code, 'chat-message', {
        sender: 'System',
        text: `${player.name} rejoined the game`,
        playerId: 'system',
      });
    }
  }

  async function handleStartGame(socket, { roomId }) {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;
    if (room.phase !== 'waiting') return;
    if (room.players.length < 2) {
      socket.emit('error', 'Need at least 2 players to start');
      return;
    }

    room.isRematchLobby = false;

    const questions = await getQuestionsFromDb(
      room.settings.category,
      room.settings.rounds,
      getPlayerProfileIds(room)
    );

    if (questions.length < room.settings.rounds) {
      socket.emit('error', 'Not enough questions in database for this game. Import more questions.');
      return;
    }

    room.questions = questions;
    room.questionIds = questions.map((q) => q.id).filter(Boolean);
    room.currentRound = 1;
    room.currentQuestion = room.questions[0];

    emitToRoom(roomId, 'game-started', {
      round: room.currentRound,
      totalRounds: room.settings.rounds,
      question: room.currentQuestion.text,
      players: getPublicPlayers(room),
      settings: room.settings,
      isRematchLobby: false,
    });

    startSubmitPhase(room);
  }

  function handleSubmitAnswer(socket, { roomId, answer }) {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'submit') return;
    if (!answer?.trim()) return;
    if (!room.players.some((p) => p.id === socket.id)) return;

    room.submissions[socket.id] = answer.trim();

    emitToRoom(roomId, 'submit-progress', {
      submittedCount: Object.keys(room.submissions).length,
      totalPlayers: room.players.length,
      playerId: socket.id,
    });

    if (Object.keys(room.submissions).length >= room.players.length) {
      startVotePhase(room);
    }
  }

  function handleCastVote(socket, { roomId, votedAnswer }) {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'vote') return;
    if (room.actualSubmissions[socket.id] === votedAnswer) return;
    if (!room.players.some((p) => p.id === socket.id)) return;

    room.votes[socket.id] = votedAnswer;

    emitToRoom(roomId, 'vote-progress', {
      votedCount: Object.keys(room.votes).length,
      totalPlayers: room.players.length,
    });

    if (Object.keys(room.votes).length >= room.players.length) {
      finishVoting(room);
    }
  }

  function handleNextRound(socket, { roomId }) {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'results') return;
    if (!room.players.some((p) => p.id === socket.id)) return;

    clearPhaseTimer(room);

    if (room.currentRound >= room.settings.rounds) {
      endGame(room);
    } else {
      advanceRound(room);
    }
  }

  function handlePlayAgain(socket, { roomId }) {
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'finished') return;
    if (room.hostId !== socket.id) {
      socket.emit('error', 'Only host can start play again');
      return;
    }

    resetRoomForPlayAgain(room);

    emitRoomPersonalized(room, 'return-to-lobby');
  }

  function handleUpdateSettings(socket, { roomId, category, rounds, timePerRound, maxPlayers }) {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;
    if (room.phase !== 'waiting' || !room.isRematchLobby) return;

    if (category) room.settings.category = category;
    if (rounds) room.settings.rounds = rounds;
    if (timePerRound) room.settings.timePerRound = timePerRound;
    if (maxPlayers) room.settings.maxPlayers = maxPlayers;

    broadcastPlayersUpdate(room);
  }

  function handleChatMessage(socket, { roomId, text }) {
    const room = rooms.get(roomId);
    if (!room || !text?.trim()) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    emitToRoom(roomId, 'chat-message', {
      sender: player.name,
      text: text.trim(),
      playerId: socket.id,
    });
  }

  function handleVoiceMessage(socket, { roomId, audio, mimeType }) {
    const room = rooms.get(roomId);
    if (!room || !audio) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    socket.to(roomId).emit('voice-message', {
      audio,
      mimeType: mimeType || 'audio/webm',
      playerId: socket.id,
      playerName: player.name,
    });
  }

  function handleLeaveRoom(socket, isDisconnect = false) {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const leaving = room.players.find((p) => p.id === socket.id);
    if (!leaving) return;

    const wasHost = room.hostId === socket.id;

    room.disconnectedPlayers.push({
      name: leaving.name,
      avatar: leaving.avatar,
      score: leaving.score,
      profileId: leaving.profileId,
    });

    room.players = room.players.filter((p) => p.id !== socket.id);
    socketToRoom.delete(socket.id);
    socket.leave(roomId);

    if (room.players.length === 0) {
      clearPhaseTimer(room);
      rooms.delete(roomId);
      return;
    }

    if (wasHost) {
      promoteTemporaryHost(room);
    }

    broadcastPlayersUpdate(room);

    if (isDisconnect) {
      emitToRoom(roomId, 'chat-message', {
        sender: 'System',
        text: `${leaving.name} disconnected`,
        playerId: 'system',
      });
    }
  }

  function handleDisconnect(socket) {
    handleLeaveRoom(socket, true);
  }

  return {
    rooms,
    handleCreateRoom,
    handleJoinRoom,
    handleStartGame,
    handleSubmitAnswer,
    handleCastVote,
    handleNextRound,
    handlePlayAgain,
    handleUpdateSettings,
    handleChatMessage,
    handleVoiceMessage,
    handleLeaveRoom: (socket) => handleLeaveRoom(socket, false),
    handleDisconnect,
    getRoomIdForSocket: (socketId) => socketToRoom.get(socketId),
  };
}

module.exports = { createRoomManager };
