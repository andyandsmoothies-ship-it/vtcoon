import { generateRandomAnimalName } from '../../domain/name_generator.js';

export const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

export function generateRandomRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VT';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getInitialLobbyConfig(search?: string): {
  roomCode: string | null;
  playerId: string;
  isHost: boolean;
  playerName: string;
} {
  const loc = typeof window !== 'undefined' ? window.location : null;
  const searchStr = search ?? loc?.search ?? '';
  const hash = loc?.hash ?? '';

  if (searchStr.includes('admin=true') || hash.includes('admin') || hash.includes('/admin')) {
    return { roomCode: 'VTADMN', playerId: 'admin', isHost: false, playerName: 'Admin' };
  }

  const params = typeof URLSearchParams !== 'undefined'
    ? new URLSearchParams(searchStr || (typeof window !== 'undefined' ? window.location.search : ''))
    : null;
  const roomParam = params?.get('room');
  if (roomParam && /^[A-Z0-9]{6}$/i.test(roomParam)) {
    const code = roomParam.toUpperCase();
    const isStoredHost = typeof window !== 'undefined' && window.sessionStorage?.getItem(`vtcoon_host_${code}`) === 'true';
    const isHost = isStoredHost || params?.get('host') === 'true';
    const targetPid = isHost ? 'p1' : 'p2';
    return {
      roomCode: code,
      playerId: targetPid,
      isHost,
      playerName: generateRandomAnimalName([], `${code}_${targetPid}`),
    };
  }

  return { roomCode: null, playerId: '', isHost: false, playerName: '' };
}

export function createNewRoomConfig(isHost = true): {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  playerName: string;
} {
  const randomCode = generateRandomRoomCode();
  const targetPid = isHost ? 'p1' : 'p2';
  if (typeof window !== 'undefined') {
    window.sessionStorage?.setItem(`vtcoon_host_${randomCode}`, 'true');
    window.history?.replaceState(null, '', `?room=${randomCode}`);
  }
  return {
    roomCode: randomCode,
    playerId: targetPid,
    isHost,
    playerName: generateRandomAnimalName([], `${randomCode}_${targetPid}`),
  };
}
