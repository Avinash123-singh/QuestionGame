const { randomUUID } = require('crypto');
const { getPool } = require('./db');

async function getProfile(playerId) {
  const pool = getPool();
  if (!pool || !playerId) return null;

  const { rows } = await pool.query(
    'SELECT id, name, avatar, games_played, created_at, updated_at FROM player_profiles WHERE id = $1',
    [playerId]
  );
  return rows[0] || null;
}

async function upsertProfile({ playerId, name, avatar }) {
  const pool = getPool();
  if (!pool) return null;

  const id = playerId || randomUUID();
  const cleanName = (name || 'Player').trim().slice(0, 50);
  const cleanAvatar = (avatar || '😀').slice(0, 10);

  const { rows } = await pool.query(
    `INSERT INTO player_profiles (id, name, avatar)
     VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       avatar = EXCLUDED.avatar,
       updated_at = NOW()
     RETURNING id, name, avatar, games_played, created_at, updated_at`,
    [id, cleanName, cleanAvatar]
  );

  return rows[0];
}

async function updateProfile(playerId, { name, avatar }) {
  const pool = getPool();
  if (!pool || !playerId) return null;

  const updates = [];
  const params = [];
  let i = 1;

  if (name?.trim()) {
    updates.push(`name = $${i++}`);
    params.push(name.trim().slice(0, 50));
  }
  if (avatar) {
    updates.push(`avatar = $${i++}`);
    params.push(avatar.slice(0, 10));
  }

  if (updates.length === 0) return getProfile(playerId);

  updates.push('updated_at = NOW()');
  params.push(playerId);

  const { rows } = await pool.query(
    `UPDATE player_profiles SET ${updates.join(', ')} WHERE id = $${i}
     RETURNING id, name, avatar, games_played, created_at, updated_at`,
    params
  );

  return rows[0] || null;
}

module.exports = {
  getProfile,
  upsertProfile,
  updateProfile,
};
