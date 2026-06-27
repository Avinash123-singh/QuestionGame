import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function HowToPlay({ onBack, backLabel = 'Back to Home' }) {
  return (
    <div className="w-full min-h-[100dvh] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="text-white/60 hover:text-white mb-4 md:mb-6 flex items-center gap-2">
          <ArrowLeft size={20} /> {backLabel}
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white text-center mb-6 md:mb-8">How to Play</h1>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-xl font-bold shrink-0">1</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Create or Join a Room</h3>
                  <p className="text-white/70">Host creates a room and shares the code. Friends join using the room code.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-xl font-bold shrink-0">2</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Submit Fake Answers</h3>
                  <p className="text-white/70">When a question appears, everyone submits a creative fake answer. The real answer stays hidden!</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-xl font-bold shrink-0">3</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Vote for the Truth</h3>
                  <p className="text-white/70">All answers are shuffled with the real one. Vote for what you think is REAL. You cannot vote for your own answer.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-xl font-bold shrink-0">4</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Earn Points</h3>
                  <p className="text-white/70">+100 points for guessing the real answer. +50 points for each player who picks your fake answer!</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-xl font-bold shrink-0">5</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Win the Game</h3>
                  <p className="text-white/70">After all rounds, the player with the highest score wins! The more convincing your fakes, the better.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-500/20 rounded-xl border border-yellow-500">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Sparkles size={20} />
              <span className="font-bold">Pro Tips</span>
            </div>
            <ul className="text-white/80 space-y-1 text-sm">
              <li>• Make your fake answers believable but slightly off</li>
              <li>• Study the question for clues about the real answer</li>
              <li>• The more votes your fake answer gets, the more points you earn!</li>
              <li>• Don&apos;t make it too obvious — subtle lies work best!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
