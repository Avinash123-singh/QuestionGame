import React from 'react';
import { Crown } from 'lucide-react';

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 5) % 100}%`,
    delay: `${(i * 0.3) % 3}s`,
    color: ['#f5c518', '#e91e8c', '#4fc3f7', '#66bb6a', '#ff7043'][i % 5],
    size: 4 + (i % 3) * 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall rounded-sm"
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: `${2.5 + (p.id % 3)}s`,
          }}
        />
      ))}
    </div>
  );
}

function PodiumPlayer({ player, rank, height, borderColor, badgeColor, showCrown }) {
  if (!player) return <div className="w-28" />;

  return (
    <div className="flex flex-col items-center" style={{ animationDelay: `${rank * 0.15}s` }}>
      <div className="relative mb-2 animate-podium-rise">
        {showCrown && (
          <Crown
            size={28}
            className="absolute -top-7 left-1/2 -translate-x-1/2 text-yellow-400 animate-logo-float"
            fill="#f5c518"
          />
        )}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 ${borderColor} bg-gray-800 shadow-lg`}
        >
          {player.avatar}
        </div>
        <div
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${badgeColor} flex items-center justify-center text-white text-xs font-black shadow`}
        >
          {rank}
        </div>
      </div>

      <div
        className={`w-28 ${height} bg-gradient-to-t from-gray-800 to-gray-700 rounded-t-xl flex flex-col items-center justify-end pb-3 border border-white/10 shadow-xl animate-podium-rise`}
        style={{ animationDelay: `${rank * 0.1 + 0.2}s` }}
      >
        <p className="text-white font-bold text-sm truncate max-w-[100px] px-1">{player.name}</p>
        <p className="text-yellow-400 font-black text-sm">{player.score} pts</p>
      </div>
    </div>
  );
}

export default function FinalLeaderboardScreen({
  leaderboard,
  isHost,
  onPlayAgain,
  onBackHome,
}) {
  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <Confetti />

      <div className="relative z-10 text-center w-full max-w-lg phase-enter">
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-3xl">🎉</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-wide">
            GAME OVER!
          </h1>
          <span className="text-3xl">🎉</span>
        </div>
        <p className="text-white/60 text-lg mb-10">Thanks for playing!</p>

        <div className="flex items-end justify-center gap-3 mb-10">
          <PodiumPlayer
            player={second}
            rank={2}
            height="h-28"
            borderColor="border-blue-400"
            badgeColor="bg-blue-500"
          />
          <PodiumPlayer
            player={first}
            rank={1}
            height="h-36"
            borderColor="border-purple-400 shadow-purple-500/30"
            badgeColor="bg-yellow-500"
            showCrown
          />
          <PodiumPlayer
            player={third}
            rank={3}
            height="h-24"
            borderColor="border-orange-400"
            badgeColor="bg-orange-500"
          />
        </div>

        {leaderboard.length > 3 && (
          <div className="bg-white/5 rounded-xl p-3 mb-6 space-y-1.5 max-w-sm mx-auto">
            {leaderboard.slice(3).map((player, idx) => (
              <div key={player.id} className="flex items-center justify-between text-sm px-2">
                <span className="text-white/60 font-mono w-6">#{idx + 4}</span>
                <span className="text-white flex-1 text-left ml-2">
                  {player.avatar} {player.name}
                </span>
                <span className="text-yellow-400 font-bold">{player.score} pts</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
          {isHost ? (
            <button
              onClick={onPlayAgain}
              className="game-btn-primary flex-1 py-4 rounded-xl font-black text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-lg"
            >
              PLAY AGAIN
            </button>
          ) : (
            <div className="flex-1 py-4 rounded-xl font-bold text-white/60 bg-white/5 border border-white/10 flex items-center justify-center">
              Waiting for host to play again...
            </div>
          )}
          <button
            onClick={onBackHome}
            className="game-btn-primary flex-1 py-4 rounded-xl font-black text-white border-2 border-white/30 hover:bg-white/10 transition"
          >
            LEAVE GAME
          </button>
        </div>
      </div>
    </div>
  );
}
