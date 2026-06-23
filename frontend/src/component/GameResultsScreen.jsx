import React from 'react';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';

function ResultRow({ item, index, compact }) {
  return (
    <div
      className="result-card-enter bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 flex items-center gap-2"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className="text-base shrink-0">{item.avatar}</span>
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold text-xs truncate">{item.name}</div>
        {!compact && (
          <div className="text-white/40 text-[10px] truncate">
            {item.didSubmit === false
              ? 'No answer submitted'
              : item.didVote === false
                ? `"${item.submitted}" → did not vote`
                : `"${item.submitted}" → "${item.votedFor}"`}
          </div>
        )}
        <div className="flex gap-1 flex-wrap">
          {item.guessedCorrectly && (
            <span className="text-[9px] bg-green-500/20 text-green-400 px-1 rounded font-bold">+100</span>
          )}
          {item.foolPoints > 0 && (
            <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1 rounded font-bold">
              +{item.foolPoints} fooled
            </span>
          )}
          {item.points === 0 && (
            <span className="text-[9px] bg-white/10 text-white/40 px-1 rounded">0</span>
          )}
        </div>
      </div>
      <span className={`font-bold text-sm shrink-0 ${item.points > 0 ? 'text-yellow-400' : 'text-white/40'}`}>
        +{item.points}
      </span>
    </div>
  );
}

export default function GameResultsScreen({
  results,
  round,
  totalRounds,
  timeLeft = 20,
  onNextRound,
}) {
  const isLastRound = round === totalRounds;
  const allResults = results?.roundBreakdown ?? [];
  const playerCount = allResults.length;
  const useCompact = playerCount > 6;
  const gridCols = playerCount > 8 ? 'grid-cols-3' : playerCount > 4 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 text-center mb-2">
        <div className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase mb-1">
          <Sparkles size={12} />
          {`Round ${round} Complete`}
        </div>
        <h2 className="text-white font-bold text-xl">Round Results</h2>
        <div className="inline-flex items-center gap-1.5 text-white/50 text-xs mt-1">
          <Clock size={12} />
          {isLastRound
            ? `Auto final scores in ${timeLeft}s`
            : `Next round in ${timeLeft}s`}
        </div>
      </div>

      {results?.realAnswer && (
        <div className="shrink-0 bg-green-900/50 border border-green-500/40 rounded-xl px-3 py-2 text-center mb-2">
          <span className="text-white/60 text-xs uppercase">Real Answer: </span>
          <span className="text-green-400 font-bold text-xl">{results.realAnswer}</span>
        </div>
      )}

      <div className={`flex-1 min-h-0 grid ${gridCols} gap-1.5 content-start auto-rows-min overflow-hidden`}>
        {allResults.map((item, idx) => (
          <ResultRow key={item.id} item={item} index={idx} compact={useCompact} />
        ))}
      </div>

      <button
        onClick={onNextRound}
        className="game-btn-primary shrink-0 mt-2 w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
      >
        {isLastRound ? `View Final Scores (${timeLeft}s)` : `Start Round ${round + 1} (${timeLeft}s)`}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
