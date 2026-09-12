// [UC-GAME-007/MSS] Quản lý lưu trữ reconnect token tại LocalStorage
// Khóa định dạng vtcoon_token_${roomCode}

export function saveReconnectToken(roomCode: string, token: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`vtcoon_token_${roomCode}`, token);
    } catch {
      /* safe-ignore: localStorage may be disabled or quota exceeded in private browsing */
    }
  }
}

export function getReconnectToken(roomCode: string): string | null {
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(`vtcoon_token_${roomCode}`);
    } catch {
      return null;
    }
  }
  return null;
}

export function clearReconnectToken(roomCode: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(`vtcoon_token_${roomCode}`);
    } catch {
      /* safe-ignore: localStorage may be disabled in private browsing */
    }
  }
}
