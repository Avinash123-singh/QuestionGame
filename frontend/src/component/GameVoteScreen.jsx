import React, { useState } from 'react';
import { CheckCircle, Ban, Loader2, AlertCircle } from 'lucide-react';

export default function GameVoteScreen({
  question,
  answers,
  currentPlayerId,
  onVote,
}) {
  const [voted, setVoted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleVote = (answer) => {
    const isOwnFake = answer.playerId === currentPlayerId && !answer.isNoSubmit;
    if (!voted && !isOwnFake) {
      setSelectedAnswer(answer);
      setVoted(true);
      onVote(answer.answer);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 bg-purple-900/50 rounded-xl p-4 md:p-6 mb-3 md:mb-4">
        <div className="text-white/60 text-xs md:text-sm mb-2">QUESTION</div>
        <div className="text-base md:text-xl font-bold text-white">{question}</div>
      </div>

      <div className="shrink-0 mb-3">
        <div className="text-white font-bold text-lg">Vote for the Real Answer!</div>
        <p className="text-white/50 text-sm">
          Pick the real answer. &quot;Did not submit&quot; shows who skipped — no points for that pick.
        </p>
      </div>

      {!voted ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {answers.map((answer, idx) => {
            const isOwnFake = answer.playerId === currentPlayerId && !answer.isNoSubmit;
            const isNoSubmit = answer.isNoSubmit;

            return (
              <button
                key={answer.id ?? idx}
                onClick={() => handleVote(answer)}
                disabled={isOwnFake}
                className={`vote-option-enter w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                  isOwnFake
                    ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                    : isNoSubmit
                      ? 'bg-orange-900/30 hover:bg-orange-900/50 border border-orange-500/30 text-orange-100 hover:ring-2 hover:ring-orange-500/40'
                      : 'bg-white/10 hover:bg-white/20 hover:ring-2 hover:ring-yellow-500/50 text-white hover:scale-[1.01] active:scale-[0.99]'
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-white/50 text-sm shrink-0">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="text-lg truncate">{answer.answer}</span>
                </span>
                {isOwnFake && (
                  <span className="flex items-center gap-1 text-xs text-white/40 shrink-0 ml-2">
                    <Ban size={14} /> Your answer
                  </span>
                )}
                {isNoSubmit && !isOwnFake && (
                  <span className="flex items-center gap-1 text-xs text-orange-300/80 shrink-0 ml-2">
                    <AlertCircle size={14} /> No submit
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mb-3 result-card-enter" />
          <div className="text-green-400 text-xl mb-2">Vote Submitted!</div>
          <div className="text-white/60">
            You voted for: &quot;{selectedAnswer?.answer}&quot;
          </div>
          <Loader2 className="w-6 h-6 text-yellow-400 animate-spin mt-4" />
          <div className="text-white/40 text-sm mt-1">Calculating scores...</div>
        </div>
      )}

      {!voted && (
        <p className="shrink-0 mt-3 text-white/60 text-sm text-center">
          +100 correct guess · +50 per player fooled
        </p>
      )}
    </div>
  );
}
