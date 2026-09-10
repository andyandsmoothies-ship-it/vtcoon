// [UC-GAME-001/MSS][UC-GAME-006/MSS][UC-GAME-007/MSS]
// SocketRegistry — Quản lý ánh xạ WebSocket <-> Room/Player và dọn dẹp kết nối
import { WebSocket } from 'ws';

export interface PlayerSocketInfo {
  readonly playerId: string;
  readonly roomCode: string;
}

export class SocketRegistry {
  private readonly roomSockets = new Map<string, Set<WebSocket>>();
  private readonly socketPlayers = new Map<WebSocket, PlayerSocketInfo>();
  private readonly playerSockets = new Map<string, WebSocket>();

  bind(roomCode: string, playerId: string, socket: WebSocket): void {
    let group = this.roomSockets.get(roomCode);
    if (!group) {
      group = new Set<WebSocket>();
      this.roomSockets.set(roomCode, group);
    }
    group.add(socket);
    this.socketPlayers.set(socket, { playerId, roomCode });
    this.playerSockets.set(`${roomCode}:${playerId}`, socket);
  }

  unregister(socket: WebSocket): PlayerSocketInfo | undefined {
    const info = this.socketPlayers.get(socket);
    this.socketPlayers.delete(socket);
    for (const [roomCode, group] of this.roomSockets.entries()) {
      if (group.delete(socket) && group.size === 0) {
        this.roomSockets.delete(roomCode);
      }
    }
    if (info) {
      const key = `${info.roomCode}:${info.playerId}`;
      if (this.playerSockets.get(key) === socket) {
        this.playerSockets.delete(key);
      }
    }
    return info;
  }

  getPlayerInfo(socket: WebSocket): PlayerSocketInfo | undefined {
    return this.socketPlayers.get(socket);
  }

  getPlayerSocket(roomCode: string, playerId: string): WebSocket | undefined {
    return this.playerSockets.get(`${roomCode}:${playerId}`);
  }

  getRoomSockets(roomCode: string): Set<WebSocket> | undefined {
    return this.roomSockets.get(roomCode);
  }

  getRoomSocketsMap(): Map<string, Set<WebSocket>> {
    return this.roomSockets;
  }

  getAllBoundSockets(): IterableIterator<[WebSocket, PlayerSocketInfo]> {
    return this.socketPlayers.entries();
  }

  replacePlayerSocket(roomCode: string, playerId: string, newSocket: WebSocket): void {
    const key = `${roomCode}:${playerId}`;
    const existing = this.playerSockets.get(key);
    if (existing && existing !== newSocket) {
      this.unregister(existing);
      try {
        existing.close(1000, 'SUPERSEDED_BY_RECONNECT');
      } catch {}
    }
    this.bind(roomCode, playerId, newSocket);
  }

  clearRoomSockets(roomCode: string): void {
    const sockets = this.roomSockets.get(roomCode);
    if (sockets) {
      for (const s of sockets) {
        s.removeAllListeners();
        s.on('error', () => {});
        this.socketPlayers.delete(s);
        try {
          s.close(1000, 'ROOM_CLOSED');
        } catch {}
      }
      this.roomSockets.delete(roomCode);
    }
    const prefix = `${roomCode}:`;
    for (const key of Array.from(this.playerSockets.keys())) {
      if (key.startsWith(prefix)) {
        this.playerSockets.delete(key);
      }
    }
  }
}
