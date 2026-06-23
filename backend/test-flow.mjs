import { io } from '../frontend/node_modules/socket.io-client/build/esm/index.js';

const URL = 'http://localhost:5002';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function connect() {
  return io(URL, { transports: ['websocket'], forceNew: true });
}

function once(socket, event, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${event}`)), timeoutMs);
    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

async function waitForPhase(socket, phase) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for phase ${phase}`)), 20000);
    const handler = (data) => {
      if (data.phase === phase) {
        clearTimeout(timer);
        socket.off('phase-changed', handler);
        resolve(data);
      }
    };
    socket.on('phase-changed', handler);
  });
}

async function createPlayer(name, avatar = '🦊', settings = { rounds: 1, timePerRound: 5, maxPlayers: 10, category: 'all' }) {
  const socket = connect();
  await once(socket, 'connect');
  socket.emit('create-room', { playerName: name, avatar, settings });
  const data = await once(socket, 'room-created');
  return { socket, ...data };
}

async function waitForPlayersUpdate(socket, predicate) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for players-update')), 10000);
    const handler = (data) => {
      if (predicate(data)) {
        clearTimeout(timer);
        socket.off('players-update', handler);
        resolve(data);
      }
    };
    socket.on('players-update', handler);
  });
}

async function joinPlayer(code, name, avatar = '🐱') {
  const socket = connect();
  await once(socket, 'connect');
  socket.emit('join-room', { roomId: code, playerName: name, avatar });
  const data = await once(socket, 'join-success');
  return { socket, ...data };
}

async function playOneRound(host, p2, roomId) {
  host.socket.emit('start-game', { roomId });
  await waitForPhase(host.socket, 'submit');
  await waitForPhase(p2.socket, 'submit');

  const resultsP = once(p2.socket, 'round-results');
  host.socket.emit('submit-answer', { roomId, answer: 'fake answer one' });
  p2.socket.emit('submit-answer', { roomId, answer: 'fake answer two' });
  await waitForPhase(p2.socket, 'vote');

  host.socket.emit('cast-vote', { roomId, votedAnswer: 'fake answer two' });
  p2.socket.emit('cast-vote', { roomId, votedAnswer: 'fake answer one' });
  return resultsP;
}

async function runTests() {
  const results = [];
  const pass = (name) => { results.push({ name, ok: true }); console.log(`✅ ${name}`); };
  const fail = (name, err) => { results.push({ name, ok: false, err: String(err) }); console.log(`❌ ${name}: ${err}`); };

  let host, p2, roomId;
  try {
    host = await createPlayer('HostAlice', '👑');
    roomId = host.roomId;
    p2 = await joinPlayer(roomId, 'Bob', '🎮');
    if (host.isHost && !p2.isHost && p2.players.length === 2) pass('Room create + join');
    else fail('Room create + join', 'unexpected host/player state');
  } catch (e) {
    fail('Room create + join', e);
    process.exit(1);
  }

  try {
    const roundResults = await playOneRound(host, p2, roomId);
    if (!roundResults.isLastRound) throw new Error('expected last round');
    const gameOverPromise = once(p2.socket, 'game-over');
    p2.socket.emit('next-round', { roomId });
    const gameOver = await gameOverPromise;
    if (gameOver.leaderboard?.length === 2) pass('Any player can advance to game over');
    else fail('Any player can advance to game over', 'no leaderboard');
    host.socket.disconnect();
    p2.socket.disconnect();
  } catch (e) {
    fail('Any player can advance to game over', e);
    host?.socket?.disconnect();
    p2?.socket?.disconnect();
  }

  try {
    await delay(300);

    const h2 = await createPlayer('AutoHost', '🌟');
    const code2 = h2.roomId;
    const p2b = await joinPlayer(code2, 'AutoP2', '🎯');

    await playOneRound(h2, p2b, code2);
    const autoGameOver = await Promise.race([
      once(p2b.socket, 'game-over'),
      delay(6000).then(() => { throw new Error('auto game-over did not fire in 6s'); }),
    ]);
    if (autoGameOver.leaderboard) pass('Auto game-over after final round');
    else fail('Auto game-over after final round', 'missing leaderboard');

    const lobbyPromises = Promise.all([
      once(h2.socket, 'return-to-lobby'),
      once(p2b.socket, 'return-to-lobby'),
    ]);
    h2.socket.emit('play-again', { roomId: code2 });
    const [lobbyHost, lobbyP2] = await lobbyPromises;
    if (lobbyHost.gamePhase === 'waiting' && lobbyP2.gamePhase === 'waiting' && lobbyHost.isRematchLobby) {
      pass('Play again sends all players to rematch lobby');
    } else {
      fail('Play again sends all players to lobby with new category', JSON.stringify({ lobbyHost, lobbyP2 }));
    }

    const hostLeftPromise = waitForPlayersUpdate(
      p2b.socket,
      (data) => data.players.length === 1 && data.players[0].name === 'AutoP2' && data.players[0].isHost
    );
    h2.socket.emit('leave-room');
    const hostLeftUpdate = await hostLeftPromise;
    const newHost = hostLeftUpdate.players.find((p) => p.isHost);
    if (newHost?.name === 'AutoP2') pass('Host leave promotes another player');
    else fail('Host leave promotes another player', JSON.stringify(hostLeftUpdate.players));

    const h2rejoin = await joinPlayer(code2, 'AutoHost', '🌟');
    if (h2rejoin.isHost) pass('Original host regains host on rejoin');
    else fail('Original host regains host on rejoin', JSON.stringify({ isHost: h2rejoin.isHost }));

    h2rejoin.socket.emit('start-game', { roomId: code2 });
    await waitForPhase(h2rejoin.socket, 'submit');
    p2b.socket.disconnect();
    await delay(300);
    const p2c = await joinPlayer(code2, 'AutoP2', '🎯');
    if (p2c.gamePhase === 'submit') pass('Mid-game rejoin allowed');
    else fail('Mid-game rejoin allowed', `phase=${p2c.gamePhase}`);

    h2.socket.disconnect();
    p2b.socket.disconnect();
    h2rejoin.socket.disconnect();
    p2c.socket.disconnect();
  } catch (e) {
    fail('Auto game-over / play again / host / rejoin', e);
  }

  const failed = results.filter((r) => !r.ok);
  console.log('\n--- Summary ---');
  console.log(`${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    failed.forEach((f) => console.log(`  FAIL: ${f.name} — ${f.err}`));
    process.exit(1);
  }
  console.log('All tests passed!');
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
