// [TC-NAME-GEN/MSS] Name Generator Unit Tests — Quirky English Animal Names
import { describe, it, expect } from 'vitest';
import {
  generateRandomAnimalName,
  ANIMAL_ADJECTIVES,
  ANIMAL_NAMES,
} from '../../src/domain/name_generator.js';
import { doCreateRoom, doJoinRoom } from '../../src/server/room_manager_lifecycle.js';

describe('[TC-NAME-GEN] Quirky English Animal Name Generator', () => {
  it('xuất đủ từ điển tính từ và tên con vật (ít nhất 25 từ mỗi danh sách)', () => {
    expect(ANIMAL_ADJECTIVES.length).toBeGreaterThanOrEqual(25);
    expect(ANIMAL_NAMES.length).toBeGreaterThanOrEqual(25);
  });

  it('sinh tên gồm đúng 2 từ: [Tính từ] [Con vật] viết hoa chữ cái đầu', () => {
    for (let i = 0; i < 20; i++) {
      const name = generateRandomAnimalName();
      const parts = name.split(' ');
      expect(parts.length).toBe(2);
      expect(ANIMAL_ADJECTIVES as readonly string[]).toContain(parts[0]);
      expect(ANIMAL_NAMES as readonly string[]).toContain(parts[1]);
      // Độ dài tối đa 20 ký tự để an toàn trên mobile 360px
      expect(name.length).toBeLessThanOrEqual(20);
      expect(name.length).toBeGreaterThanOrEqual(6);
    }
  });

  it('tránh trùng lặp tên/con vật đã tồn tại trong cùng phòng', () => {
    const existing = ['Sleepy Panda', 'Sneaky Otter', 'Dapper Badger'];
    for (let i = 0; i < 20; i++) {
      const name = generateRandomAnimalName(existing);
      const animal = name.split(' ')[1];
      expect(['Panda', 'Otter', 'Badger']).not.toContain(animal);
    }
  });

  it('hỗ trợ seed xác định khi cần tái lập tên', () => {
    const name1 = generateRandomAnimalName([], 'room_123_p1');
    const name2 = generateRandomAnimalName([], 'room_123_p1');
    expect(name1).toBe(name2);

    const name3 = generateRandomAnimalName([], 'room_123_p2');
    // Khác seed thì ra tên khác nhau
    expect(name3).not.toBe(name1);
  });

  it('gán tên con vật tự động cho Host và các Guest khi tạo/vào phòng trên Server', () => {
    const rooms = new Map();
    const registries = new Map();
    const propertyStates = new Map();
    const rolledThisTurn = new Map();
    const auctions = new Map();
    const deckRng = () => 0.5;

    const room = doCreateRoom(rooms, registries, propertyStates, rolledThisTurn, auctions, deckRng, 'p1', 'VTAA11', () => {});
    const hostPlayer = room.players[0];
    expect(hostPlayer?.name).toBeDefined();
    const hostParts = hostPlayer?.name?.split(' ');
    expect(hostParts?.length).toBe(2);

    doJoinRoom(rooms, 'VTAA11', 'p2', () => {});
    doJoinRoom(rooms, 'VTAA11', 'p3', () => {});
    doJoinRoom(rooms, 'VTAA11', 'p4', () => {});

    expect(room.players.length).toBe(4);
    const names = room.players.map((p: { name?: string }) => p.name);
    // Cả 4 người đều có tên
    expect(names.every((n: string | undefined) => Boolean(n))).toBe(true);
    // 4 tên hoàn toàn khác nhau (không trùng lặp)
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(4);
  });
});
