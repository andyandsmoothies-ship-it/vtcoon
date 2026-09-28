// [TC-FIXED-COLOR/MSS][UI-S02/MSS][BR-UI-002]
// Contract Test Suite: Fixed 4-Color Player Token Palette (Đỏ, Xanh Dương, Vàng, Xanh Lá Cây)
import { describe, it, expect } from 'vitest';
import { PLAYER_TOKEN_PALETTE } from '../../src/domain/theme';
import { assignRandomPlayerPawns } from '../../src/domain/pawn_assignment';
import { createEmptySlot, createDefaultSlots } from '../../src/client/store/lobby_types';

describe('[IMP-FIXED-COLORS] Fixed 4-Color Player Token Palette Contract', () => {
  it('[TC-COLOR.01/MSS] PLAYER_TOKEN_PALETTE chứa chính xác 4 màu nhận diện chuẩn: Đỏ, Xanh Dương, Vàng, Xanh Lá', () => {
    expect(PLAYER_TOKEN_PALETTE).toHaveLength(4);
    expect(PLAYER_TOKEN_PALETTE[0]).toBe('#DC2626'); // Đỏ (Red)
    expect(PLAYER_TOKEN_PALETTE[1]).toBe('#2563EB'); // Xanh Dương (Blue)
    expect(PLAYER_TOKEN_PALETTE[2]).toBe('#F59E0B'); // Vàng (Yellow)
    expect(PLAYER_TOKEN_PALETTE[3]).toBe('#16A34A'); // Xanh Lá Cây (Green)
  });

  it('[TC-COLOR.02/MSS] createEmptySlot gán màu cố định cho 4 slot sảnh chờ theo đúng thứ tự', () => {
    expect(createEmptySlot(0).tokenColor).toBe('#DC2626');
    expect(createEmptySlot(1).tokenColor).toBe('#2563EB');
    expect(createEmptySlot(2).tokenColor).toBe('#F59E0B');
    expect(createEmptySlot(3).tokenColor).toBe('#16A34A');
  });

  it('[TC-COLOR.03/MSS] createDefaultSlots khởi tạo 4 vị trí sảnh với đúng 4 màu cố định', () => {
    const slots = createDefaultSlots();
    expect(slots[0]?.tokenColor).toBe('#DC2626');
    expect(slots[1]?.tokenColor).toBe('#2563EB');
    expect(slots[2]?.tokenColor).toBe('#F59E0B');
    expect(slots[3]?.tokenColor).toBe('#16A34A');
  });

  it('[TC-COLOR.04/MSS] assignRandomPlayerPawns gán màu cố định theo vị trí slot, không bao giờ bị random theo roomCode/seed', () => {
    const players = ['p1', 'p2', 'p3', 'p4'];
    const resA = assignRandomPlayerPawns(players, 'ROOM_ALPHA_123');
    const resB = assignRandomPlayerPawns(players, 'ROOM_BETA_999');
    const resC = assignRandomPlayerPawns(players, 'ROOM_GAMMA_888');

    // Màu của 4 người chơi luôn cố định tuyệt đối không phụ thuộc vào seed xáo trộn
    expect(resA.map((r: any) => r.tokenColor)).toEqual(['#DC2626', '#2563EB', '#F59E0B', '#16A34A']);
    expect(resB.map((r: any) => r.tokenColor)).toEqual(['#DC2626', '#2563EB', '#F59E0B', '#16A34A']);
    expect(resC.map((r: any) => r.tokenColor)).toEqual(['#DC2626', '#2563EB', '#F59E0B', '#16A34A']);
  });

  it('[TC-COLOR.05/MSS] 4 người chơi luôn nhận 4 màu độc nhất không trùng lặp', () => {
    const players = ['user_1', 'user_2', 'user_3', 'user_4'];
    const results = assignRandomPlayerPawns(players, 'ROOM_CHECK_UNIQUE');
    const colors = results.map((r: any) => r.tokenColor);
    expect(new Set(colors).size).toBe(4);
    expect(colors).toEqual(['#DC2626', '#2563EB', '#F59E0B', '#16A34A']);
  });
});
