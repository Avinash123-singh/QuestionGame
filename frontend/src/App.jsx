import React, { useState, useEffect } from 'react';
import HomeScreen from './component/HomeScreen';
import CreateRoomScreen from './component/CreateRoomScreen';
import JoinRoomScreen from './component/JoinRoomScreen';
import LobbyScreen from './component/LobbyScreen';
import GamePlayLayout from './component/GamePlayLayout';
import GameSubmitScreen from './component/GameSubmitScreen';
import GameVoteScreen from './component/GameVoteScreen';
import GameResultsScreen from './component/GameResultsScreen';
import FinalLeaderboardScreen from './component/FinalLeaderboardScreen';
import SettingsModal from './component/SettingsModal';
import HowToPlay from './component/HowToPlay';
import PrivacyPolicy from './component/PrivacyPolicy';
import FloatingBackgroundIcons from './component/FloatingBackgroundIcons';
import { useSocket } from './context/SocketContext';
import { useGameSettings } from './context/GameSettingsContext';
import { getPlayerProfile, savePlayerProfile, loadPlayerProfile } from './utils/playerStorage';
import { startMusic, stopMusic, resumeAudio } from './utils/audioEngine';
import { Settings } from 'lucide-react';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [gameplayOverlay, setGameplayOverlay] = useState(null);
  const [infoReturnScreen, setInfoReturnScreen] = useState('home');
  const [awaitingLobby, setAwaitingLobby] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [playerProfile, setPlayerProfile] = useState(() => getPlayerProfile());
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    loadPlayerProfile().then((profile) => {
      setPlayerProfile(profile);
      setProfileReady(true);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('code')?.trim().toUpperCase();
    const onJoinPath = window.location.pathname === '/join' || window.location.pathname.endsWith('/join');
    if (codeFromUrl) {
      setJoinRoomCode(codeFromUrl);
      setCurrentScreen('joinRoom');
    } else if (onJoinPath) {
      setCurrentScreen('joinRoom');
    }
  }, []);

  const { playSound, haptic, settings: gameSettings } = useGameSettings();

  const {
    connected,
    roomId,
    myPlayerId,
    isHost,
    players,
    settings,
    isRematchLobby,
    gamePhase,
    currentRound,
    totalRounds,
    question,
    timeLeft,
    phaseEndsAt,
    votingOptions,
    roundResults,
    submittedCount,
    leaderboard,
    chatMessages,
    error,
    setError,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    castVote,
    nextRound,
    playAgain,
    updateSettings,
    sendChat,
    sendVoice,
    subscribeVoice,
    leaveRoom,
  } = useSocket();

  const prevPhaseRef = React.useRef(null);
  const prevRoundRef = React.useRef(null);

  useEffect(() => {
    const inGameplay = currentScreen === 'gameplay';
    if (inGameplay && gameSettings.music) {
      resumeAudio().then(() => startMusic());
    } else {
      stopMusic();
    }
    return () => stopMusic();
  }, [currentScreen, gameSettings.music]);

  useEffect(() => {
    if (gamePhase !== prevPhaseRef.current) {
      if (gamePhase === 'vote') playSound('phaseChange');
      if (gamePhase === 'results') playSound('roundEnd');
      if (gamePhase === 'finished') playSound('gameOver');
      prevPhaseRef.current = gamePhase;
    }
  }, [gamePhase, playSound]);

  useEffect(() => {
    if (gamePhase === 'submit' && currentRound !== prevRoundRef.current && prevRoundRef.current != null) {
      playSound('phaseChange');
    }
    prevRoundRef.current = currentRound;
  }, [currentRound, gamePhase, playSound]);

  useEffect(() => {
    if (roomId && awaitingLobby) {
      if (gamePhase === 'finished') {
        setCurrentScreen('finalLeaderboard');
      } else if (gamePhase === 'waiting') {
        setCurrentScreen('lobby');
      } else {
        setCurrentScreen('gameplay');
      }
      setAwaitingLobby(false);
    }
  }, [roomId, awaitingLobby, gamePhase]);

  useEffect(() => {
    if (error && awaitingLobby) {
      setAwaitingLobby(false);
    }
  }, [error, awaitingLobby]);

  useEffect(() => {
    if (gamePhase === 'submit' && currentScreen === 'lobby') {
      setCurrentScreen('gameplay');
    }
  }, [gamePhase, currentScreen]);

  useEffect(() => {
    if (gamePhase === 'finished') {
      setCurrentScreen('finalLeaderboard');
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === 'waiting' && currentScreen === 'finalLeaderboard') {
      setCurrentScreen('lobby');
    }
  }, [gamePhase, currentScreen]);

  const roomData = {
    roomCode: roomId || '------',
    players,
    gameSettings: settings,
  };

  const openHowToPlay = (fromScreen) => {
    setInfoReturnScreen(fromScreen);
    setCurrentScreen('howToPlay');
  };

  const openPrivacyPolicy = (fromScreen) => {
    setInfoReturnScreen(fromScreen);
    setCurrentScreen('privacyPolicy');
  };

  const goBackFromInfo = () => setCurrentScreen(infoReturnScreen);
  const infoBackLabel = infoReturnScreen === 'gameplay' ? 'Back to Game' : 'Back to Home';

  const handleCreateRoom = async (gameSettings, playerName, avatar) => {
    const saved = await savePlayerProfile(playerName, avatar);
    setPlayerProfile(saved);
    setError(null);
    createRoom(playerName, avatar, gameSettings, saved.playerId || playerProfile.playerId);
    setAwaitingLobby(true);
  };

  const handleJoinRoom = async (code, playerName, avatar) => {
    const saved = await savePlayerProfile(playerName, avatar);
    setPlayerProfile(saved);
    setError(null);
    joinRoom(code, playerName, avatar, saved.playerId || playerProfile.playerId);
    setAwaitingLobby(true);
  };

  const handleLeave = () => {
    leaveRoom();
    setCurrentScreen('home');
  };

  const handlePlayAgain = () => {
    playAgain();
  };

  const handleSubmitAnswer = (answer) => {
    playSound('submit');
    haptic(25);
    submitAnswer(answer);
  };

  const handleCastVote = (votedAnswer) => {
    playSound('vote');
    haptic(20);
    castVote(votedAnswer);
  };

  const isTimerActive = gamePhase === 'submit' || gamePhase === 'vote' || gamePhase === 'results';

  const openSettings = () => setShowSettings(true);

  const handleSettingsHowToPlay = () => {
    setShowSettings(false);
    if (currentScreen === 'gameplay') {
      setGameplayOverlay('howToPlay');
    } else {
      openHowToPlay(currentScreen);
    }
  };

  const handleSettingsPrivacy = () => {
    setShowSettings(false);
    if (currentScreen === 'gameplay') {
      setGameplayOverlay('privacyPolicy');
    } else {
      openPrivacyPolicy(currentScreen);
    }
  };

  const showAppSettingsBtn = ['home', 'createRoom', 'joinRoom', 'lobby', 'finalLeaderboard'].includes(currentScreen);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {!connected && currentScreen !== 'home' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600/90 text-white text-center text-sm py-1">
          Connecting to server...
        </div>
      )}

      <FloatingBackgroundIcons screen={currentScreen} />

      {showAppSettingsBtn && (
        <button
          type="button"
          onClick={openSettings}
          className={`fixed top-5 z-30 flex items-center gap-2 bg-black/40 hover:bg-black/55 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold border border-white/15 transition ${
            currentScreen === 'home' ? 'left-5' : 'right-5'
          }`}
        >
          <Settings size={16} />
          Settings
        </button>
      )}

      <div className="relative z-[1]">
        {currentScreen === 'home' && (
          <HomeScreen
            onCreateRoom={() => setCurrentScreen('createRoom')}
            onJoinRoom={() => setCurrentScreen('joinRoom')}
            onHowToPlay={() => openHowToPlay('home')}
          />
        )}

        {currentScreen === 'createRoom' && profileReady && (
          <CreateRoomScreen
            initialProfile={playerProfile}
            onCreate={handleCreateRoom}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'joinRoom' && profileReady && (
          <JoinRoomScreen
            initialProfile={playerProfile}
            initialRoomCode={joinRoomCode}
            onJoin={handleJoinRoom}
            onBack={() => { setError(null); setCurrentScreen('home'); }}
            error={error}
          />
        )}

        {currentScreen === 'lobby' && roomId && (
          <LobbyScreen
            roomData={roomData}
            isHost={isHost}
            isRematchLobby={isRematchLobby}
            myPlayerId={myPlayerId}
            onStartGame={startGame}
            onUpdateSettings={updateSettings}
            onLeave={handleLeave}
          />
        )}

        {currentScreen === 'gameplay' && (
          <>
            <GamePlayLayout
              players={players}
              round={currentRound}
              totalRounds={totalRounds}
              timeLeft={timeLeft}
              phaseEndsAt={phaseEndsAt}
              isTimerActive={isTimerActive}
              gamePhase={gamePhase}
              myPlayerId={myPlayerId}
              chatMessages={chatMessages}
              onSendChat={sendChat}
              sendVoice={sendVoice}
              subscribeVoice={subscribeVoice}
              onSettingsClick={() => setShowSettings(true)}
            >
              {gamePhase === 'submit' && (
                <GameSubmitScreen
                  key={`submit-${currentRound}`}
                  question={question}
                  submittedCount={submittedCount}
                  totalPlayers={players.length}
                  onSubmit={handleSubmitAnswer}
                />
              )}

              {gamePhase === 'vote' && (
                <GameVoteScreen
                  key={`vote-${currentRound}`}
                  question={question}
                  answers={votingOptions}
                  currentPlayerId={myPlayerId}
                  onVote={handleCastVote}
                />
              )}

              {gamePhase === 'results' && (
                <GameResultsScreen
                  results={roundResults}
                  round={currentRound}
                  totalRounds={totalRounds}
                  timeLeft={timeLeft}
                  onNextRound={nextRound}
                />
              )}
            </GamePlayLayout>

            {gameplayOverlay === 'howToPlay' && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
                <HowToPlay onBack={() => setGameplayOverlay(null)} backLabel="Back to Game" />
              </div>
            )}

            {gameplayOverlay === 'privacyPolicy' && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
                <PrivacyPolicy onBack={() => setGameplayOverlay(null)} backLabel="Back to Game" />
              </div>
            )}
          </>
        )}

        {currentScreen === 'finalLeaderboard' && (
          <FinalLeaderboardScreen
            leaderboard={leaderboard}
            isHost={isHost}
            onPlayAgain={handlePlayAgain}
            onBackHome={() => { leaveRoom(); setCurrentScreen('home'); }}
          />
        )}

        {currentScreen === 'howToPlay' && (
          <HowToPlay onBack={goBackFromInfo} backLabel={infoBackLabel} />
        )}

        {currentScreen === 'privacyPolicy' && (
          <PrivacyPolicy onBack={goBackFromInfo} backLabel={infoBackLabel} />
        )}
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onHowToPlay={handleSettingsHowToPlay}
          onPrivacyPolicy={handleSettingsPrivacy}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
