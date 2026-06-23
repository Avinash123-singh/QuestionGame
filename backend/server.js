require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initDatabase, getQuestionCounts, isDatabaseReady } = require('./db/db');
const { getProfile, upsertProfile, updateProfile } = require('./db/playerService');
const { createRoomManager } = require('./game/gameEngine');

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'Fake Answer Party API',
    status: 'running',
    version: '1.0.0',
    database: isDatabaseReady(),
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), database: isDatabaseReady() });
});

app.get('/api/questions/stats', async (_req, res) => {
  const counts = await getQuestionCounts();
  if (!counts) {
    return res.json({ database: false, message: 'Set DATABASE_URL for question storage' });
  }
  res.json({ database: true, ...counts });
});

app.get('/api/players/:playerId', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ error: 'Profile storage requires DATABASE_URL' });
  }
  const profile = await getProfile(req.params.playerId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json({
    playerId: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    gamesPlayed: profile.games_played,
  });
});

app.post('/api/players', async (req, res) => {
  const { playerId, name, avatar } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!isDatabaseReady()) {
    return res.json({
      playerId: playerId || null,
      name: name.trim(),
      avatar: avatar || '😀',
      offline: true,
    });
  }
  const profile = await upsertProfile({ playerId, name, avatar });
  res.json({
    playerId: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    gamesPlayed: profile.games_played,
  });
});

app.patch('/api/players/:playerId', async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ error: 'Profile storage requires DATABASE_URL' });
  }
  const profile = await updateProfile(req.params.playerId, req.body || {});
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json({
    playerId: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    gamesPlayed: profile.games_played,
  });
});

async function startServer() {
  await initDatabase();

  const roomManager = createRoomManager(io);

  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('create-room', (data) => roomManager.handleCreateRoom(socket, data));
    socket.on('join-room', (data) => roomManager.handleJoinRoom(socket, data));
    socket.on('start-game', (data) => roomManager.handleStartGame(socket, data));
    socket.on('submit-answer', (data) => roomManager.handleSubmitAnswer(socket, data));
    socket.on('cast-vote', (data) => roomManager.handleCastVote(socket, data));
    socket.on('next-round', (data) => roomManager.handleNextRound(socket, data));
    socket.on('play-again', (data) => roomManager.handlePlayAgain(socket, data));
    socket.on('update-settings', (data) => roomManager.handleUpdateSettings(socket, data));
    socket.on('chat-message', (data) => roomManager.handleChatMessage(socket, data));
    socket.on('voice-message', (data) => roomManager.handleVoiceMessage(socket, data));
    socket.on('leave-room', () => roomManager.handleLeaveRoom(socket));
    socket.on('disconnect', () => roomManager.handleDisconnect(socket));
  });

  const PORT = process.env.PORT || 5002;
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Kill the process or use a different PORT.`);
      process.exit(1);
    }
    throw err;
  });
  server.listen(PORT, () => {
    console.log(`✅ Fake Answer Party Server running on port ${PORT}`);
    console.log(`🌐 CORS allowed: ${allowedOrigins.join(', ')}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
