import React, { useState, useEffect } from 'react';
import { Clock, Settings, Send, Users, Mic, MicOff, VolumeX, Volume2 } from 'lucide-react';
import GameLogo from './GameLogo';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { useGameSettings } from '../context/GameSettingsContext';

function useSyncedTimer({ phaseEndsAt, timeLeft, isTimerActive }) {
  const [displayTime, setDisplayTime] = useState(timeLeft);

  useEffect(() => {
    if (!isTimerActive) {
      setDisplayTime(timeLeft);
      return undefined;
    }

    const update = () => {
      if (phaseEndsAt) {
        setDisplayTime(Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000)));
      } else {
        setDisplayTime(timeLeft);
      }
    };

    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [phaseEndsAt, timeLeft, isTimerActive]);

  return displayTime;
}

export default function GamePlayLayout({
  players,
  round,
  totalRounds,
  timeLeft,
  phaseEndsAt,
  isTimerActive = true,
  gamePhase = 'submit',
  myPlayerId,
  chatMessages = [],
  onSendChat,
  sendVoice,
  subscribeVoice,
  onSettingsClick,
  children,
}) {
  const displayTime = useSyncedTimer({ phaseEndsAt, timeLeft, isTimerActive });
  const [chatInput, setChatInput] = useState('');
  const [incomingMuted, setIncomingMuted] = useState(false);
  const { t } = useGameSettings();

  const {
    micMuted,
    setMicMuted,
    isRecording,
    micError,
    startTalking,
    stopTalking,
  } = useVoiceChat({ sendVoice, subscribeVoice, myPlayerId, incomingMuted });

  const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const isUrgent = displayTime <= 10 && isTimerActive;

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !onSendChat) return;
    onSendChat(chatInput.trim());
    setChatInput('');
  };

  const phaseLabel =
    gamePhase === 'submit' ? 'Submit Phase' : gamePhase === 'vote' ? 'Voting Phase' : 'Round Results';

  return (
    <div className="h-screen w-full flex flex-col p-4 gap-3">
      <div className="shrink-0 text-center">
        <GameLogo size="sm" />
      </div>

      <header className="flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-xl px-6 py-3 shrink-0">
        <div className={`flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full min-w-[120px] ${isUrgent ? 'timer-urgent' : ''}`}>
          <Clock size={18} className={isUrgent ? 'text-red-400' : 'text-orange-400'} />
          <span className={`font-mono text-xl font-bold ${isUrgent ? 'text-red-400' : 'text-white'}`}>
            {displayTime}s
          </span>
        </div>

        <div className="text-center">
          <div className="text-white font-bold text-lg">Round {round} of {totalRounds}</div>
          <div className="text-white/50 text-xs uppercase tracking-wider">{phaseLabel}</div>
        </div>

        <button
          onClick={onSettingsClick}
          className="flex items-center gap-2 bg-black/30 hover:bg-black/40 px-4 py-2 rounded-full text-white transition min-w-[120px] justify-center"
        >
          <Settings size={18} />
          <span className="font-semibold">Settings</span>
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] gap-3 min-h-0">
        <aside className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <Users size={18} className="text-white" />
            <h2 className="text-white font-bold">Players</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {sortedPlayers.map((player, idx) => {
              const isYou = player.id === myPlayerId;
              return (
                <div
                  key={player.id ?? idx}
                  className={`rounded-lg p-3 transition-all ${isYou ? 'player-row-you-dark' : 'bg-black/20'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs font-mono w-5">#{idx + 1}</span>
                    <span className="text-lg">{player.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">
                        {player.name}
                        {isYou && <span className="text-yellow-400 text-xs ml-1">(You)</span>}
                        {player.isHost && <span className="ml-1">👑</span>}
                      </div>
                      <div className="text-yellow-400 font-bold text-xs">{player.score ?? 0} pts</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="bg-white/10 backdrop-blur-lg rounded-xl flex flex-col min-h-0 overflow-hidden">
          <div key={`${gamePhase}-${round}`} className="flex-1 min-h-0 p-6 phase-enter overflow-hidden">
            {children}
          </div>
        </main>

        <aside className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex flex-col min-h-0 overflow-hidden">
          <h2 className="text-white font-bold mb-3 shrink-0">Chat Box</h2>
          <div className="flex-1 bg-black/20 rounded-lg p-3 overflow-y-auto mb-3 space-y-2 min-h-0">
            {chatMessages.length === 0 ? (
              <p className="text-white/40 text-sm text-center mt-4">No messages yet</p>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  {msg.playerId === 'system' ? (
                    <span className="text-cyan-400/90 italic text-xs">{msg.text}</span>
                  ) : (
                    <>
                      <span className="text-yellow-400 font-semibold">{msg.sender}: </span>
                      <span className="text-white/80">{msg.text}</span>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-1.5 mb-2 shrink-0">
            <button
              type="button"
              title={micMuted ? t('micMuted') : t('pushToTalk')}
              onMouseDown={startTalking}
              onMouseUp={stopTalking}
              onMouseLeave={stopTalking}
              onTouchStart={(e) => { e.preventDefault(); startTalking(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopTalking(); }}
              disabled={micMuted}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : micMuted
                    ? 'bg-white/10 text-white/40'
                    : 'bg-green-600/80 hover:bg-green-500 text-white'
              }`}
            >
              {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
              {isRecording ? 'Talking...' : t('pushToTalk')}
            </button>
            <button
              type="button"
              title={micMuted ? 'Unmute mic' : t('micMuted')}
              onClick={() => setMicMuted((m) => !m)}
              className={`p-2 rounded-lg transition ${micMuted ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              <MicOff size={16} />
            </button>
            <button
              type="button"
              title={incomingMuted ? 'Unmute others' : t('muteOthers')}
              onClick={() => setIncomingMuted((m) => !m)}
              className={`p-2 rounded-lg transition ${incomingMuted ? 'bg-orange-500/30 text-orange-300' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              {incomingMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
          {micError && <p className="text-red-400 text-xs mb-2">{micError}</p>}

          <form onSubmit={handleSendChat} className="shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type Here..."
                className="flex-1 bg-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="game-btn-primary bg-yellow-500 hover:bg-yellow-600 disabled:bg-white/20 text-black disabled:text-white/50 p-2 rounded-lg"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
