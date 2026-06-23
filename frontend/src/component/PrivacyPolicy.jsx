import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

const sections = [
  {
    title: '1. Introduction',
    content:
      'Welcome to Fake Answer Party ("we", "our", or "us"). This Privacy Policy explains how we collect, use, and protect your information when you use our online multiplayer bluffing game. By playing our game, you agree to the practices described in this policy.',
  },
  {
    title: '2. Information We Collect',
    content: null,
    list: [
      'Display name or nickname you choose when joining a room',
      'Room codes and game session data (scores, answers, votes)',
      'Device type, browser version, and general usage analytics',
      'Chat messages sent during gameplay within a room',
      'Optional account information if you sign in (email, profile photo)',
    ],
  },
  {
    title: '3. How We Use Your Information',
    content: null,
    list: [
      'To run multiplayer game sessions and sync scores in real time',
      'To match you with rooms and other players',
      'To improve game performance, fix bugs, and add new features',
      'To enforce fair play and community guidelines',
      'To send important service updates (not marketing spam)',
    ],
  },
  {
    title: '4. Data Sharing',
    content:
      'We do not sell your personal data. We may share limited information with trusted service providers (such as hosting and analytics partners) who help us operate the game. These partners are bound by confidentiality agreements and may only use data as instructed by us.',
  },
  {
    title: '5. Cookies & Local Storage',
    content:
      'We use cookies and browser local storage to remember your preferences (language, sound settings), keep you signed in, and store temporary game state. You can disable cookies in your browser, but some features may not work correctly.',
  },
  {
    title: '6. Children\'s Privacy',
    content:
      'Fake Answer Party is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe a child has provided us data, please contact us and we will delete it promptly.',
  },
  {
    title: '7. Data Retention & Security',
    content:
      'Game session data is retained only as long as needed for gameplay and leaderboard purposes. We use industry-standard encryption (HTTPS) and secure servers to protect your data. No method of transmission over the internet is 100% secure, but we take reasonable measures to safeguard your information.',
  },
  {
    title: '8. Your Rights',
    content: null,
    list: [
      'Request access to the personal data we hold about you',
      'Request correction or deletion of your data',
      'Opt out of non-essential analytics',
      'Withdraw consent for optional features at any time',
    ],
  },
  {
    title: '9. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. We will notify players of significant changes via an in-game notice or on our website. Continued use of the game after changes means you accept the updated policy.',
  },
  {
    title: '10. Contact Us',
    content:
      'If you have questions about this Privacy Policy or your data, contact us at: privacy@fakeanswerparty.com',
  },
];

export default function PrivacyPolicy({ onBack, backLabel = 'Back to Home' }) {
  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="text-white/60 hover:text-white mb-6 flex items-center gap-2">
          <ArrowLeft size={20} /> {backLabel}
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield size={32} className="text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-white/50 text-sm text-center mb-8">Last updated: June 18, 2026</p>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-white font-bold text-lg mb-2">{section.title}</h2>
                {section.content && (
                  <p className="text-white/70 text-sm leading-relaxed">{section.content}</p>
                )}
                {section.list && (
                  <ul className="text-white/70 text-sm leading-relaxed space-y-1.5 mt-1">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-yellow-400 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
