import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { sounds, stopMusic, resumeAudio } from '../utils/audioEngine';
import { getLanguageLabel, t as translate } from '../utils/i18n';

const STORAGE_KEY = 'fap_game_settings';

const defaults = {
  sound: true,
  music: true,
  vibration: true,
  language: 'en',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    const { darkMode: _removed, ...rest } = parsed;
    return { ...defaults, ...rest };
  } catch {
    return { ...defaults };
  }
}

const GameSettingsContext = createContext(null);

export function GameSettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const unlockAudio = async () => {
      await resumeAudio();
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('pointerdown', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    return () => {
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const update = useCallback((patch) => {
    if ('music' in patch && patch.music === false) stopMusic();
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const playSound = useCallback((name) => {
    if (!settingsRef.current.sound) return;
    resumeAudio();
    sounds[name]?.();
  }, []);

  const haptic = useCallback((pattern = 40) => {
    if (!settingsRef.current.vibration) return;
    if (navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const value = {
    settings,
    update,
    playSound,
    haptic,
    languageLabel: getLanguageLabel(settings.language),
    t: (key) => translate(settings.language, key),
  };

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings() {
  const ctx = useContext(GameSettingsContext);
  if (!ctx) throw new Error('useGameSettings must be used within GameSettingsProvider');
  return ctx;
}
