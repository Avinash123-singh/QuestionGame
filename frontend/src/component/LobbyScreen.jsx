import React from 'react';
import { Copy, Users, Crown, Settings, Play, ArrowLeft, Share2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'trivia', label: 'Trivia' },
  { value: 'movies', label: 'Movies' },
  { value: 'history', label: 'History' },
  { value: 'science', label: 'Science' },
  { value: 'geography', label: 'Geography' },
];

const ROUND_OPTIONS = [3, 5, 7, 10];
const TIME_OPTIONS = [30, 45, 60, 90];

function getCategoryLabel(category) {
  return CATEGORIES.find((c) => c.value === category)?.label || 'All Categories';
}

function OptionPills({ options, value, onChange, disabled, suffix = '', compact = false }) {
  return (
    <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-2'}`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt)}
          className={`rounded-xl font-bold transition ${
            compact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'
          } ${
            value === opt
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900'
              : 'bg-white/10 text-white hover:bg-white/20'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {opt}{suffix}
        </button>
      ))}
    </div>
  );
}

function SettingsReadOnlyDisplay({ settings, playerCount }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-black/30 p-3 rounded-lg text-center">
        <div className="text-white/60 text-xs uppercase">Rounds</div>
        <div className="text-white text-2xl font-bold">{settings.rounds}</div>
      </div>
      <div className="bg-black/30 p-3 rounded-lg text-center">
        <div className="text-white/60 text-xs uppercase">Time</div>
        <div className="text-white text-2xl font-bold">{settings.timePerRound}s</div>
      </div>
      <div className="bg-black/30 p-3 rounded-lg text-center">
        <div className="text-white/60 text-xs uppercase">Category</div>
        <div className="text-white text-xl font-bold truncate">
          {getCategoryLabel(settings.category)}
        </div>
      </div>
      <div className="bg-black/30 p-3 rounded-lg text-center">
        <div className="text-white/60 text-xs uppercase">Players</div>
        <div className="text-white text-2xl font-bold">{playerCount}/{settings.maxPlayers}</div>
      </div>
    </div>
  );
}

function RematchSettingsRow({ settings, isHost, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="min-w-0">
        <div className="text-white/60 text-xs font-semibold mb-1.5 uppercase">Rounds</div>
        {isHost ? (
          <OptionPills
            options={ROUND_OPTIONS}
            value={settings.rounds}
            onChange={(rounds) => onChange({ rounds })}
            compact
          />
        ) : (
          <div className="text-white font-bold text-lg">{settings.rounds}</div>
        )}
      </div>

      <div className="min-w-0">
        <div className="text-white/60 text-xs font-semibold mb-1.5 uppercase">Time</div>
        {isHost ? (
          <OptionPills
            options={TIME_OPTIONS}
            value={settings.timePerRound}
            onChange={(timePerRound) => onChange({ timePerRound })}
            suffix="s"
            compact
          />
        ) : (
          <div className="text-white font-bold text-lg">{settings.timePerRound}s</div>
        )}
      </div>

      <div className="min-w-0">
        <div className="text-white/60 text-xs font-semibold mb-1.5 uppercase">Category</div>
        {isHost ? (
          <select
            value={settings.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-yellow-400"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-gray-900">
                {cat.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-white font-bold text-sm">{getCategoryLabel(settings.category)}</div>
        )}
      </div>
    </div>
  );
}

export default function LobbyScreen({
  roomData,
  isHost,
  isRematchLobby,
  myPlayerId,
  onStartGame,
  onUpdateSettings,
  onLeave,
}) {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomData.roomCode);
    alert('Room code copied!');
  };

  const copyInviteLink = () => {
    const base = window.location.origin;
    const link = `${base}/join?code=${roomData.roomCode}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied!');
  };

  const handleSettingsChange = (updates) => {
    if (isHost && isRematchLobby) {
      onUpdateSettings(updates);
    }
  };

  return (
    <div className="w-full min-h-screen p-6 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onLeave} className="text-white/60 hover:text-white flex items-center gap-2">
            <ArrowLeft size={20} /> Leave
          </button>
          <div className="text-white/80 font-bold">Fake Answer Party</div>
          <div className="w-20" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{isRematchLobby ? '🔄' : '🎉'}</div>
              <h2 className="text-3xl font-bold text-white">
                {isRematchLobby ? (isHost ? 'PLAY AGAIN' : 'REMATCH LOBBY') : 'ROOM CREATED!'}
              </h2>
              <p className="text-white/60 text-sm mt-1">
                {isRematchLobby
                  ? isHost
                    ? 'Change settings below and start the next game'
                    : 'Host will update settings and start the next game'
                  : 'Share the link or code with your friends'}
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-6 mb-4 text-center">
              <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Room Code</div>
              <div className="text-5xl font-mono font-bold text-white tracking-widest">
                {roomData.roomCode}
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-6 text-center">
              <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Invite Link</div>
              <div className="text-white/80 text-sm font-mono break-all">
                fakeanswer.party/join?code={roomData.roomCode}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyInviteLink}
                className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition"
              >
                <Copy size={18} /> COPY LINK
              </button>
              <button
                onClick={copyRoomCode}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition"
              >
                <Share2 size={18} /> SHARE
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users size={24} /> PLAYERS ({roomData.players.length}/{roomData.gameSettings.maxPlayers})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-2 pb-2">
                {roomData.players.map((player) => (
                  <div key={player.id} className="bg-white/10 p-3 rounded-lg flex items-center gap-3 hover:bg-white/20 transition flex-shrink-0">
                    <span className="text-3xl">{player.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold flex items-center gap-2">
                        {player.name}
                        {player.isHost && <Crown size={16} className="text-yellow-400 flex-shrink-0" />}
                      </div>
                      <div className="text-white/60 text-sm">
                        {player.isHost ? 'Host' : 'Ready'}
                      </div>
                    </div>
                    {player.id === myPlayerId && (
                      <span className="text-xs bg-blue-500 px-3 py-1 rounded-full font-bold flex-shrink-0">You</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isRematchLobby ? (
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={18} className="text-white" />
              <h3 className="text-white font-bold">Game Settings</h3>
            </div>
            <RematchSettingsRow
              settings={roomData.gameSettings}
              isHost={isHost}
              onChange={handleSettingsChange}
            />
            {!isHost && (
              <p className="text-yellow-400/80 text-sm mt-3 text-center">
                Waiting for host to update settings and start the game...
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-white" />
              <h3 className="text-white font-bold">Game Settings</h3>
            </div>
            <SettingsReadOnlyDisplay
              settings={roomData.gameSettings}
              playerCount={roomData.players.length}
            />
          </div>
        )}

        <div className="mt-6">
          {isHost ? (
            <button
              onClick={onStartGame}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 rounded-xl font-bold text-white text-xl flex items-center justify-center gap-2 transition"
            >
              <Play size={24} /> {isRematchLobby ? 'START NEW GAME' : 'START GAME'}
            </button>
          ) : (
            <div className="text-center text-yellow-400 py-4 bg-white/5 rounded-xl border border-white/10">
              {isRematchLobby
                ? 'Waiting for host to start again...'
                : 'Waiting for host to start the game...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
