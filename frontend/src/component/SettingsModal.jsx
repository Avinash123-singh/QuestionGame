import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  Music,
  Smartphone,
  Globe,
  HelpCircle,
  Shield,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useGameSettings } from '../context/GameSettingsContext';
import { LANGUAGES } from '../utils/i18n';

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-green-500' : 'bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsModal({ onClose, onHowToPlay, onPrivacyPolicy }) {
  const { settings, update, t, languageLabel } = useGameSettings();
  const [showLanguages, setShowLanguages] = useState(false);

  if (showLanguages) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-md bg-[#0d1117]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden dark-panel">
          <div className="flex items-center px-4 py-4 border-b border-white/10">
            <button onClick={() => setShowLanguages(false)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white">
              <ArrowLeft size={18} />
            </button>
            <h2 className="flex-1 text-center text-white font-bold text-lg pr-9">{t('language')}</h2>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { update({ language: lang.code }); setShowLanguages(false); }}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 text-white border-b border-white/5"
              >
                <span>{lang.flag} {lang.label}</span>
                {settings.language === lang.code && <Check size={18} className="text-green-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-[#0d1117]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-settings-pop dark-panel">
        <div className="flex items-center px-4 py-4 border-b border-white/10">
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition">
            <ArrowLeft size={18} />
          </button>
          <h2 className="flex-1 text-center text-white font-bold text-lg tracking-wide pr-9">{t('settings')}</h2>
        </div>

        <div className="divide-y divide-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3 text-white">
              <Volume2 size={20} className="text-white/70" />
              <span className="font-medium">{t('soundEffects')}</span>
            </div>
            <Toggle enabled={settings.sound} onChange={(v) => update({ sound: v })} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3 text-white">
              <Music size={20} className="text-white/70" />
              <div>
                <span className="font-medium">{t('music')}</span>
                <p className="text-white/40 text-xs">{t('musicHint')}</p>
              </div>
            </div>
            <Toggle enabled={settings.music} onChange={(v) => update({ music: v })} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3 text-white">
              <Smartphone size={20} className="text-white/70" />
              <span className="font-medium">{t('vibration')}</span>
            </div>
            <Toggle enabled={settings.vibration} onChange={(v) => update({ vibration: v })} />
          </div>

          <button onClick={() => setShowLanguages(true)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition text-white">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-white/70" />
              <span className="font-medium">{t('language')}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50 text-sm">
              {languageLabel} <ChevronRight size={16} />
            </div>
          </button>

          <button onClick={onHowToPlay} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition text-white">
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-white/70" />
              <span className="font-medium">{t('howToPlay')}</span>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </button>

          <button onClick={onPrivacyPolicy} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition text-white">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-white/70" />
              <span className="font-medium">Privacy Policy</span>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </button>
        </div>
      </div>
    </div>
  );
}
