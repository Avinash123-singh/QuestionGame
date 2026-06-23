const AVATARS = ['😀', '😎', '🤩', '🥳', '👑', '⭐', '🦊', '🐯', '🦄', '🎮', '👩', '🧑'];

const PLAYER_ID_KEY = 'fap_player_id';
const LEGACY_NAME_KEY = 'fap_player_name';
const LEGACY_AVATAR_KEY = 'fap_player_avatar';

const API_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5002';

function cleanName(name) {
  if (!name || name === 'undefined' || name === 'null') return '';
  return String(name).replace(/^undefined/, '').trim();
}

function generatePlayerId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getOrCreatePlayerId() {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = generatePlayerId();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

/** Sync read — use cached/local values (instant UI). */
export function getPlayerProfile() {
  return {
    playerId: getOrCreatePlayerId(),
    name: cleanName(localStorage.getItem(LEGACY_NAME_KEY)),
    avatar: localStorage.getItem(LEGACY_AVATAR_KEY) || '😀',
  };
}

function cacheProfileLocally({ playerId, name, avatar }) {
  if (playerId) localStorage.setItem(PLAYER_ID_KEY, playerId);
  if (name) localStorage.setItem(LEGACY_NAME_KEY, cleanName(name));
  if (avatar) localStorage.setItem(LEGACY_AVATAR_KEY, avatar);
}

/**
 * Load profile from server (PostgreSQL). Falls back to local cache if offline.
 * Call once on app start so name/avatar auto-fill without re-typing.
 */
export async function loadPlayerProfile() {
  const playerId = getOrCreatePlayerId();
  const local = getPlayerProfile();

  try {
    const res = await fetch(`${API_URL}/api/players/${playerId}`);
    if (res.ok) {
      const data = await res.json();
      cacheProfileLocally({
        playerId: data.playerId,
        name: data.name,
        avatar: data.avatar,
      });
      return {
        playerId: data.playerId,
        name: data.name,
        avatar: data.avatar,
        fromServer: true,
      };
    }
  } catch {
    // offline or no database — use local cache
  }

  return { ...local, fromServer: false };
}

/** Save name/avatar to server + local cache (~50 bytes in localStorage). */
export async function savePlayerProfile(name, avatar) {
  const playerId = getOrCreatePlayerId();
  const clean = cleanName(name);
  cacheProfileLocally({ playerId, name: clean, avatar });

  try {
    const res = await fetch(`${API_URL}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, name: clean, avatar }),
    });
    if (res.ok) {
      const data = await res.json();
      cacheProfileLocally({
        playerId: data.playerId || playerId,
        name: data.name,
        avatar: data.avatar,
      });
      return data;
    }
  } catch {
    // saved locally only
  }

  return { playerId, name: clean, avatar };
}

export { AVATARS };
