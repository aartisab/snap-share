
const albumStore = new Map(); 

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export function createAlbum(name) {
  let code = generateJoinCode();
  while (albumStore.has(code)) code = generateJoinCode();
  const album = { code, name: name?.trim() || 'Untitled Album' };
  albumStore.set(code, album);
  return album;
}

export function getAlbum(code) {
  const key = (code || '').toUpperCase().trim();
  return albumStore.get(key) || null;
}

export function joinAlbum(code) {
  return getAlbum(code);
}

