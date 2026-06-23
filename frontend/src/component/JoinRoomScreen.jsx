import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AVATARS, getPlayerProfile, savePlayerProfile } from '../utils/playerStorage';

function CharacterBlobs() {
  const chars = [
    { color: 'bg-purple-500', emoji: '🧙' },
    { color: 'bg-yellow-400', emoji: '😄' },
    { color: 'bg-green-400', emoji: '🤩' },
    { color: 'bg-pink-400', emoji: '🥳' },
  ];

  return (
    <div className="relative h-36 flex items-end justify-center gap-3 mb-6">
      {['🎊', '✨', '🎉', '⭐'].map((c, i) => (
        <span
          key={i}
          className="absolute text-lg opacity-70 animate-confetti-float"
          style={{ left: `${12 + i * 20}%`, top: `${10 + (i % 2) * 15}%`, animationDelay: `${i * 0.4}s` }}
        >
          {c}
        </span>
      ))}
      {chars.map((ch, i) => (
        <div
          key={i}
          className={`${ch.color} w-14 h-18 rounded-t-full rounded-b-2xl flex items-start justify-center pt-2 shadow-lg animate-blob-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <span className="text-xl">{ch.emoji}</span>
        </div>
      ))}
    </div>
  );
}

export default function JoinRoomScreen({ onJoin, onBack, error, initialProfile, initialRoomCode = '' }) {
  const profile = initialProfile || getPlayerProfile();
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [playerName, setPlayerName] = useState(profile.name || '');
  const [avatar, setAvatar] = useState(profile.avatar);

  const canJoin = roomCode.trim() && playerName.trim();

  const handleJoin = () => {
    if (canJoin) {
      savePlayerProfile(playerName, avatar);
      onJoin(roomCode.trim().toUpperCase(), playerName.trim(), avatar);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center text-white font-black text-xl tracking-widest pr-10">
            JOIN ROOM
          </h1>
        </div>

        <CharacterBlobs />

        <div className="mb-4">
          <label className="text-white/70 text-sm font-medium mb-2 block">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-white/70 text-sm font-medium mb-2 block">Pick Avatar</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`text-2xl w-10 h-10 rounded-lg transition ${
                  avatar === a ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-white/70 text-sm font-medium mb-2 block">Enter Room Code</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="e.g. X8KD29"
            maxLength={8}
            className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-4 text-white text-lg font-mono tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center uppercase"
          />
        </div>

        {error && (
          <div className="mb-4 text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">
            {error}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={!canJoin}
          className={`w-full py-4 rounded-xl font-black text-lg tracking-wider transition-all ${
            canJoin
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/40'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          JOIN ROOM
        </button>
      </div>
    </div>
  );
}
