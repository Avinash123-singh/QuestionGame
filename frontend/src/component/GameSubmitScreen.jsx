import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function GameSubmitScreen({
  question,
  questionImage,
  submittedCount = 0,
  totalPlayers = 4,
  onSubmit,
}) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
      setSubmitted(true);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 bg-purple-900/50 rounded-xl p-4 md:p-6 mb-3 md:mb-4">
        <div className="text-white/60 text-xs md:text-sm mb-2">QUESTION</div>
        {questionImage && (
          <img src={questionImage} alt="" className="max-h-32 md:max-h-40 rounded-lg mb-3 mx-auto object-contain" />
        )}
        <div className="text-lg md:text-2xl font-bold text-white">{question}</div>
        <p className="text-white/40 text-sm mt-3">
          The real answer is hidden. Write a believable fake answer to fool others!
        </p>
      </div>

      {!submitted ? (
        <>
          <div className="flex-1 min-h-0 flex flex-col mb-4">
            <label className="text-white font-bold mb-2 block">
              Your Creative (Fake) Answer:
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Create a believable fake answer..."
              className="flex-1 min-h-[80px] w-full p-4 bg-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className={`game-btn-primary w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
              answer.trim()
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            <Send size={20} /> Submit Answer
          </button>

          <p className="shrink-0 mt-3 text-white/60 text-sm text-center">
            Fool others = +50 pts each · Correct guess = +100 pts
          </p>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-3" />
          <div className="text-green-400 text-2xl mb-2">Answer Submitted!</div>
          <div className="text-white/70 text-lg">Waiting for others to submit...</div>
          <div className="mt-4 bg-black/30 rounded-full px-5 py-2 text-white/80">
            {submittedCount}/{totalPlayers} players submitted
          </div>
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-yellow-400"
                style={{ animation: `waiting-dots 1.4s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
