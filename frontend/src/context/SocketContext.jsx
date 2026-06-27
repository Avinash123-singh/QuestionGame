import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

function getSocketUrl() {
  if (typeof window === 'undefined') return undefined;
  const { hostname, port, origin } = window.location;
  const isViteDev = (hostname === 'localhost' || hostname === '127.0.0.1')
    && (port === '5173' || port === '5174');
  if (isViteDev) {
    return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return origin;
  }
  return origin;
}

function getApiUrl() {
  if (typeof window === 'undefined') return 'http://localhost:5002';
  const { hostname, port, origin } = window.location;
  const isViteDev = (hostname === 'localhost' || hostname === '127.0.0.1')
    && (port === '5173' || port === '5174');
  if (isViteDev) {
    return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5002';
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return origin;
  }
  return origin;
}

function applyRoomPayload(data, setters, getMyPlayerId) {
  if (data.roomId) setters.setRoomId(data.roomId);
  if (data.myPlayerId) setters.setMyPlayerId(data.myPlayerId);
  if (data.players) {
    setters.setPlayers(data.players);
    const playerId = data.myPlayerId ?? getMyPlayerId?.();
    const me = data.players.find((p) => p.id === playerId);
    if (me) setters.setIsHost(!!me.isHost);
  } else if (data.isHost !== undefined) {
    setters.setIsHost(data.isHost);
  }
  if (data.settings) setters.setSettings(data.settings);
  if (data.gamePhase) setters.setGamePhase(data.gamePhase);
  if (data.isRematchLobby !== undefined) setters.setIsRematchLobby(data.isRematchLobby);
  if (data.currentRound) setters.setCurrentRound(data.currentRound);
  if (data.totalRounds) setters.setTotalRounds(data.totalRounds);
  if (data.question) setters.setQuestion(data.question);
  if (data.questionMode !== undefined) setters.setQuestionMode(data.questionMode);
  if (data.questionImage !== undefined) setters.setQuestionImage(data.questionImage);
  if (data.votingOptions) setters.setVotingOptions(data.votingOptions);
  if (data.roundResults) setters.setRoundResults(data.roundResults);
  if (data.submittedCount !== undefined) setters.setSubmittedCount(data.submittedCount);
  if (data.leaderboard) setters.setLeaderboard(data.leaderboard);
  if (data.timeLeft !== undefined) setters.setTimeLeft(data.timeLeft);
  if (data.phaseEndsAt != null) setters.setPhaseEndsAt(data.phaseEndsAt);
}

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const myPlayerIdRef = useRef(null);
  const voiceHandlersRef = useRef(new Set());
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState({
    rounds: 3,
    timePerRound: 45,
    maxPlayers: 20,
    categoryMode: 'mixed',
    categories: [],
  });
  const [gamePhase, setGamePhase] = useState('waiting');
  const [isRematchLobby, setIsRematchLobby] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [question, setQuestion] = useState('');
  const [questionMode, setQuestionMode] = useState(null);
  const [questionImage, setQuestionImage] = useState(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [phaseEndsAt, setPhaseEndsAt] = useState(null);
  const [votingOptions, setVotingOptions] = useState([]);
  const [roundResults, setRoundResults] = useState(null);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    myPlayerIdRef.current = myPlayerId;
  }, [myPlayerId]);

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 15,
      timeout: 20000,
    });
    socketRef.current = socket;

    const setters = {
      setRoomId,
      setMyPlayerId,
      setIsHost,
      setPlayers,
      setSettings,
      setGamePhase,
      setIsRematchLobby,
      setCurrentRound,
      setTotalRounds,
      setQuestion,
      setQuestionMode,
      setQuestionImage,
      setVotingOptions,
      setRoundResults,
      setSubmittedCount,
      setLeaderboard,
      setTimeLeft,
      setPhaseEndsAt,
    };

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('room-created', (data) => {
      applyRoomPayload(data, setters, () => myPlayerIdRef.current);
      setGamePhase('waiting');
      setIsRematchLobby(false);
      setRoundResults(null);
      setLeaderboard([]);
      setError(null);
    });

    socket.on('join-success', (data) => {
      applyRoomPayload(data, setters, () => myPlayerIdRef.current);
      setError(null);
    });

    socket.on('join-error', (msg) => setError(msg));

    socket.on('players-update', (data) => {
      setPlayers(data.players);
      if (data.settings) setSettings(data.settings);
      if (data.isRematchLobby !== undefined) setIsRematchLobby(data.isRematchLobby);
      const me = data.players.find((p) => p.id === myPlayerIdRef.current);
      if (me) setIsHost(me.isHost);
    });

    socket.on('game-started', (data) => {
      setCurrentRound(data.round);
      setTotalRounds(data.totalRounds);
      setQuestion(data.question);
      setQuestionMode(data.questionMode || null);
      setQuestionImage(data.questionImage || null);
      setPlayers(data.players);
      if (data.settings) setSettings(data.settings);
      if (data.isRematchLobby !== undefined) setIsRematchLobby(data.isRematchLobby);
      setGamePhase('submit');
      setSubmittedCount(0);
      setRoundResults(null);
      setVotingOptions([]);
    });

    socket.on('phase-changed', (data) => {
      setGamePhase(data.phase);
      setCurrentRound(data.round);
      if (data.totalRounds) setTotalRounds(data.totalRounds);
      if (data.question) setQuestion(data.question);
      if (data.questionMode !== undefined) setQuestionMode(data.questionMode);
      if (data.questionImage !== undefined) setQuestionImage(data.questionImage);
      if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
      if (data.phaseEndsAt) setPhaseEndsAt(data.phaseEndsAt);
      if (data.players) setPlayers(data.players);
      if (data.votingOptions) setVotingOptions(data.votingOptions);
      if (data.submittedCount !== undefined) setSubmittedCount(data.submittedCount);
    });

    socket.on('timer-sync', (data) => {
      if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
      if (data.phaseEndsAt) setPhaseEndsAt(data.phaseEndsAt);
    });

    socket.on('submit-progress', (data) => {
      setSubmittedCount(data.submittedCount);
    });

    socket.on('round-results', (data) => {
      setGamePhase('results');
      setRoundResults(data.results);
      setPlayers(data.players);
      if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
      if (data.phaseEndsAt) setPhaseEndsAt(data.phaseEndsAt);
    });

    socket.on('game-over', (data) => {
      setGamePhase('finished');
      setLeaderboard(data.leaderboard);
    });

    socket.on('return-to-lobby', (data) => {
      applyRoomPayload(data, setters, () => myPlayerIdRef.current);
      setGamePhase('waiting');
      setRoundResults(null);
      setLeaderboard([]);
      setCurrentRound(1);
      setQuestion('');
      setVotingOptions([]);
      setSubmittedCount(0);
    });

    socket.on('game-sync', (data) => {
      applyRoomPayload(data, setters, () => myPlayerIdRef.current);
    });

    socket.on('chat-message', (msg) => {
      setChatMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
    });

    socket.on('voice-message', (data) => {
      voiceHandlersRef.current.forEach((fn) => fn(data));
    });

    socket.on('error', (msg) => setError(msg));

    return () => socket.disconnect();
  }, []);

  const createRoom = useCallback((playerName, avatar, gameSettings, playerProfileId) => {
    socketRef.current?.emit('create-room', {
      playerName,
      avatar,
      settings: gameSettings,
      playerProfileId,
    });
  }, []);

  const joinRoom = useCallback((code, playerName, avatar, playerProfileId) => {
    socketRef.current?.emit('join-room', {
      roomId: code.toUpperCase(),
      playerName,
      avatar,
      playerProfileId,
    });
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('start-game', { roomId });
  }, [roomId]);

  const submitAnswer = useCallback((answer) => {
    socketRef.current?.emit('submit-answer', { roomId, answer });
  }, [roomId]);

  const castVote = useCallback((votedAnswer) => {
    socketRef.current?.emit('cast-vote', { roomId, votedAnswer });
  }, [roomId]);

  const nextRound = useCallback(() => {
    socketRef.current?.emit('next-round', { roomId });
  }, [roomId]);

  const playAgain = useCallback(() => {
    socketRef.current?.emit('play-again', { roomId });
  }, [roomId]);

  const updateSettings = useCallback((updates) => {
    socketRef.current?.emit('update-settings', { roomId, ...updates });
    setSettings((prev) => ({ ...prev, ...updates }));
  }, [roomId]);

  const sendChat = useCallback((text) => {
    socketRef.current?.emit('chat-message', { roomId, text });
  }, [roomId]);

  const sendVoice = useCallback((audio, mimeType) => {
    socketRef.current?.emit('voice-message', { roomId, audio, mimeType });
  }, [roomId]);

  const subscribeVoice = useCallback((handler) => {
    voiceHandlersRef.current.add(handler);
    return () => voiceHandlersRef.current.delete(handler);
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leave-room');
    setRoomId(null);
    setMyPlayerId(null);
    setIsHost(false);
    setPlayers([]);
    setGamePhase('waiting');
    setIsRematchLobby(false);
    setRoundResults(null);
    setLeaderboard([]);
    setChatMessages([]);
    setPhaseEndsAt(null);
    setError(null);
  }, []);

  const value = {
    connected,
    roomId,
    myPlayerId,
    isHost,
    players,
    settings,
    isRematchLobby,
    gamePhase,
    currentRound,
    totalRounds,
    question,
    questionMode,
    questionImage,
    timeLeft,
    phaseEndsAt,
    votingOptions,
    roundResults,
    submittedCount,
    leaderboard,
    chatMessages,
    error,
    setError,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    castVote,
    nextRound,
    playAgain,
    updateSettings,
    sendChat,
    sendVoice,
    subscribeVoice,
    leaveRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
