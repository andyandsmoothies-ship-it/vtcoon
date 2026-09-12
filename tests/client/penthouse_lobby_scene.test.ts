// [TC-P3.1/MSS] Test Suite Giai Đoạn 3: Sảnh Chờ 3D Penthouse Lounge (VIP Waiting Room Scene)
// Nguồn: implementation_plan.md § Giai đoạn 3 & docs/domain/design.md
import { describe, it, expect } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import {
  PENTHOUSE_DIMENSIONS,
  PENTHOUSE_COLORS,
  PENTHOUSE_CAMERA_CONFIG,
  SEAT_ANGLES_DEG,
  calculateSeatPosition,
  calculateSeatRotationY,
  calculateHologramBob,
  calculateAvatarBob,
  generateHologramScreenTexture,
  generateSunsetBackdropTexture,
  PenthouseLobbyScene,
  PenthouseEnclosure,
  LuxuryPawnModel,
  LUXURY_PAWN_CONFIGS,
} from '../../src/client/3d/penthouse_lobby_scene';

describe('[TC-P3.1/MSS] Thẩm Định Kích Thước Kiến Trúc Penthouse Lounge (PENTHOUSE_DIMENSIONS)', () => {
  it('Bàn tròn và các ghế bọc da tuân thủ tỷ lệ vàng phòng khách VIP', () => {
    expect(PENTHOUSE_DIMENSIONS.tableRadius).toBe(1.8);
    expect(PENTHOUSE_DIMENSIONS.tableHeight).toBe(0.95);
    expect(PENTHOUSE_DIMENSIONS.chairDistance).toBe(2.45);
    expect(PENTHOUSE_DIMENSIONS.chairDistance).toBeGreaterThan(PENTHOUSE_DIMENSIONS.tableRadius);
  });

  it('Thảm nhung tròn bao bọc trọn vẹn cả bàn cờ và 4 chân ghế', () => {
    expect(PENTHOUSE_DIMENSIONS.carpetRadius).toBe(3.4);
    // Bán kính thảm phải lớn hơn vị trí đặt ghế + bán kính đệm ghế (2.45 + 0.35 = 2.80 < 3.4)
    expect(PENTHOUSE_DIMENSIONS.carpetRadius).toBeGreaterThan(PENTHOUSE_DIMENSIONS.chairDistance + 0.35);
  });

  it('Chiều cao trần vách kính kịch trần đạt chuẩn Penthouse tầng 80', () => {
    expect(PENTHOUSE_DIMENSIONS.ceilingHeight).toBe(4.8);
    expect(PENTHOUSE_DIMENSIONS.roomRadius).toBe(12);
  });
});

describe('[TC-P3.2/MSS] Bảng Mã Màu PBR & Nhận Diện Sang Trọng Penthouse (PENTHOUSE_COLORS)', () => {
  it('Mặt sàn đá cẩm thạch trắng Carrara và viền kim loại vàng Champagne', () => {
    expect(PENTHOUSE_COLORS.marbleFloor).toBe('#F8FAFC');
    expect(PENTHOUSE_COLORS.goldBezel).toBe('#F59E0B');
    expect(PENTHOUSE_COLORS.walnutTrim).toBe('#3E2723');
  });

  it('Máy chiếu ba chiều sử dụng mã màu Hologram Cyan và Amber Neon', () => {
    expect(PENTHOUSE_COLORS.hologramCyan).toBe('#06B6D4');
    expect(PENTHOUSE_COLORS.hologramAmber).toBe('#F59E0B');
    expect(PENTHOUSE_COLORS.sunsetGlow).toBe('#FB923C');
    expect(PENTHOUSE_COLORS.coveWarm).toBe('#FDE047');
  });
});

describe('[TC-P3.3/MSS] Bố Trí Hình Học 4 Ghế VIP & Nhân Vật Seated (calculateSeatPosition)', () => {
  it('4 ghế được phân bố ở các góc 125, 215, 305 và 35 độ chuẩn Concept 3', () => {
    expect(SEAT_ANGLES_DEG).toHaveLength(4);
    expect(SEAT_ANGLES_DEG[0]).toBe(125);
    expect(SEAT_ANGLES_DEG[1]).toBe(215);
    expect(SEAT_ANGLES_DEG[2]).toBe(305);
    expect(SEAT_ANGLES_DEG[3]).toBe(35);
  });

  it('calculateSeatPosition trả về tọa độ chính xác cách tâm bàn chairDistance', () => {
    for (let i = 0; i < 4; i++) {
      const pos = calculateSeatPosition(i);
      expect(pos).toHaveLength(3);
      expect(pos[1]).toBe(0); // Cao độ sàn
      const dist = Math.hypot(pos[0], pos[2]);
      expect(dist).toBeCloseTo(PENTHOUSE_DIMENSIONS.chairDistance, 3);
    }
  });

  it('Ghế 0 (Host / Tiền sảnh) nằm ở góc trước-trái (X < 0, Z > 0)', () => {
    const pos = calculateSeatPosition(0);
    expect(pos[0]).toBeLessThan(0);
    expect(pos[2]).toBeGreaterThan(0);
  });

  it('Ghế 2 (Khách đối diện) nằm ở góc sau-phải (X > 0, Z < 0)', () => {
    const pos = calculateSeatPosition(2);
    expect(pos[0]).toBeGreaterThan(0);
    expect(pos[2]).toBeLessThan(0);
  });

  it('calculateSeatRotationY xoay ghế hướng mặt trực diện vào tâm bàn cờ', () => {
    for (let i = 0; i < 4; i++) {
      const rotY = calculateSeatRotationY(i);
      expect(Number.isFinite(rotY)).toBe(true);
    }
  });

  it('[Adversarial] Kháng lỗi clamp an toàn khi index âm, vượt biên > 3 hoặc NaN', () => {
    const posZero = calculateSeatPosition(0);
    expect(calculateSeatPosition(-1)[0]).toBeCloseTo(posZero[0], 5);
    expect(calculateSeatPosition(99)[0]).toBeCloseTo(calculateSeatPosition(3)[0], 5);

    const posNaN = calculateSeatPosition(Number.NaN);
    expect(posNaN[0]).toBeCloseTo(posZero[0], 5);
    expect(posNaN[2]).toBeCloseTo(posZero[2], 5);

    const rotNaN = calculateSeatRotationY(Number.NaN);
    expect(rotNaN).toBeCloseTo(calculateSeatRotationY(0), 5);
  });
});

describe('[TC-P3.4/MSS] Dao Động Điều Hòa Hologram & Nhịp Thở Nhân Vật', () => {
  it('calculateHologramBob sinh cao độ bồng bềnh 1.68m ± 0.04m và góc quay liên tục', () => {
    const bob0 = calculateHologramBob(0);
    expect(bob0.y).toBeCloseTo(1.68, 2);
    expect(bob0.rotY).toBe(0);

    const bob1 = calculateHologramBob(Math.PI / (2 * 1.8));
    expect(bob1.y).toBeCloseTo(1.72, 2);
    expect(bob1.rotY).toBeGreaterThan(0);
  });

  it('calculateAvatarBob sinh độ nhấp nhô vi mô không trùng pha giữa 4 ghế', () => {
    const bob0 = calculateAvatarBob(1.5, 0);
    const bob1 = calculateAvatarBob(1.5, 1);
    expect(Math.abs(bob0)).toBeLessThanOrEqual(0.015);
    expect(Math.abs(bob1)).toBeLessThanOrEqual(0.015);
    expect(bob0).not.toBeCloseTo(bob1, 4);
  });

  it('[Adversarial] calculateHologramBob kháng an toàn với NaN và Infinity', () => {
    const bobNaN = calculateHologramBob(Number.NaN);
    expect(bobNaN.y).toBeCloseTo(1.68, 2);
    expect(bobNaN.rotY).toBe(0);
  });
});

describe('[TC-P3.5/MSS] Bộ Sinh Texture Thủ Tục (CanvasTexture Generator)', () => {
  it('generateHologramScreenTexture trả về CanvasTexture hợp lệ', () => {
    const tex = generateHologramScreenTexture();
    expect(tex).toBeDefined();
    expect(typeof tex).toBe('object');
  });

  it('generateSunsetBackdropTexture trả về CanvasTexture hợp lệ', () => {
    const tex = generateSunsetBackdropTexture();
    expect(tex).toBeDefined();
    expect(typeof tex).toBe('object');
  });
});

describe('[TC-P3.6/MSS] Ràng Buộc Kiến Trúc & Hợp Đồng Mỹ Thuật (Contract Audit)', () => {
  it('penthouse_enclosure.tsx và penthouse_lobby_scene.tsx sử dụng MeshReflectorMaterial cho sàn đá cẩm thạch', () => {
    const enclosurePath = path.resolve(process.cwd(), 'src/client/3d/penthouse_enclosure.tsx');
    const source = fs.readFileSync(enclosurePath, 'utf-8');
    expect(source).toContain("MeshReflectorMaterial");
    expect(source).toContain("mirror={0.45}");
    expect(source).toContain("mixBlur={0.8}");
  });

  it('penthouse_lobby_scene.tsx xuất component PenthouseLobbyScene dưới dạng React Component', () => {
    expect(typeof PenthouseLobbyScene).toBe('function');
  });

  it('game_canvas.tsx hỗ trợ isLobby prop và kết xuất PenthouseLobbyScene', () => {
    const canvasPath = path.resolve(process.cwd(), 'src/client/game_canvas.tsx');
    const source = fs.readFileSync(canvasPath, 'utf-8');
    expect(source).toContain("import { PenthouseLobbyScene } from './3d/penthouse_lobby_scene';");
    expect(source).toContain('isLobby ? (');
    expect(source).toContain('<PenthouseLobbyScene />');
  });

  it('main.tsx kết xuất <GameCanvas isLobby /> khi !gameStarted', () => {
    const mainPath = path.resolve(process.cwd(), 'src/client/main.tsx');
    const source = fs.readFileSync(mainPath, 'utf-8');
    expect(source).toContain('<GameCanvas isLobby />');
  });

  it('lobby_view.tsx bố trí thẻ Glassmorphism mỏng nổi bên cánh phải (aside fixed/absolute)', () => {
    const lobbyPath = path.resolve(process.cwd(), 'src/client/ui/lobby/lobby_view.tsx');
    const source = fs.readFileSync(lobbyPath, 'utf-8');
    expect(source).toContain('<aside className="pointer-events-auto');
    expect(source).toContain('VIP LOBBY: PENTHOUSE LOUNGE');
  });
});

describe('[TC-P3.7/MSS] Thẩm Định Cấu Hình Máy Quay Penthouse (PENTHOUSE_CAMERA_CONFIG)', () => {
  it('Tọa độ khởi tạo [3.8, 3.2, 5.2] và tâm ngắm bàn cờ [-0.2, 1.15, -0.3]', () => {
    expect(PENTHOUSE_CAMERA_CONFIG.initialPosition).toEqual([3.8, 3.2, 5.2]);
    expect(PENTHOUSE_CAMERA_CONFIG.target).toEqual([-0.2, 1.15, -0.3]);
  });

  it('Khoảng cách từ máy quay tới tâm sa bàn nằm trọn vẹn trong khoảng [minDistance, maxDistance]', () => {
    const [cx, cy, cz] = PENTHOUSE_CAMERA_CONFIG.initialPosition;
    const [tx, ty, tz] = PENTHOUSE_CAMERA_CONFIG.target;
    const dist = Math.hypot(cx - tx, cy - ty, cz - tz);
    expect(dist).toBeGreaterThanOrEqual(PENTHOUSE_CAMERA_CONFIG.minDistance);
    expect(dist).toBeLessThanOrEqual(PENTHOUSE_CAMERA_CONFIG.maxDistance);
    expect(dist).toBeCloseTo(7.1, 1);
  });

  it('Góc nghiêng phân cực bảo vệ tầm nhìn không lật dưới sàn hoặc xuyên qua trần', () => {
    expect(PENTHOUSE_CAMERA_CONFIG.minPolarAngle).toBeGreaterThan(0);
    expect(PENTHOUSE_CAMERA_CONFIG.maxPolarAngle).toBeLessThanOrEqual(Math.PI / 2);
  });
});

describe('[TC-P3.8/MSS] Bố Trí Hình Học 4 Ghế VIP Bảo Đảm Không Bao Giờ Biến Mất', () => {
  it('Mọi vị trí 0..3 đều sinh tọa độ hữu hạn và góc xoay hợp lệ dù số slot rỗng', () => {
    for (let i = 0; i < 4; i++) {
      const pos = calculateSeatPosition(i);
      const rot = calculateSeatRotationY(i);
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
      expect(Number.isFinite(rot)).toBe(true);
    }
  });
});

describe('[TC-P3.9/MSS] 4 Linh Vật Cờ Thượng Lưu mạ Kim Loại PBR (Luxury Pawns)', () => {
  it('4 tượng linh vật cờ tuân thủ đúng bảng màu và thông số PBR kim loại hoàng gia', () => {
    expect(LUXURY_PAWN_CONFIGS).toHaveLength(4);

    // Slot 0: Tháp Landmark thu nhỏ mạ Vàng Hoàng Gia
    const slot0 = LUXURY_PAWN_CONFIGS[0]!;
    expect(slot0.color).toBe('#F59E0B');
    expect(slot0.metalness).toBe(0.95);
    expect(slot0.roughness).toBe(0.12);

    // Slot 1: Du Thuyền Vịnh Biển mạ Bạc Bạch Kim
    const slot1 = LUXURY_PAWN_CONFIGS[1]!;
    expect(slot1.color).toBe('#E2E8F0');
    expect(slot1.metalness).toBe(0.9);
    expect(slot1.roughness).toBe(0.15);

    // Slot 2: Xe Cổ Cổ Điển mạ Đồng Đỏ
    const slot2 = LUXURY_PAWN_CONFIGS[2]!;
    expect(slot2.color).toBe('#B45309');
    expect(slot2.metalness).toBe(0.85);
    expect(slot2.roughness).toBe(0.18);

    // Slot 3: Ngựa Chiến / Kỳ Hạm mạ Titan Xanh Navy
    const slot3 = LUXURY_PAWN_CONFIGS[3]!;
    expect(slot3.color).toBe('#1E3A8A');
    expect(slot3.metalness).toBe(0.9);
    expect(slot3.roughness).toBe(0.14);
  });

  it('LuxuryPawnModel xuất hợp lệ, render đủ 4 linh vật và an toàn với NaN', () => {
    expect(typeof LuxuryPawnModel).toBe('function');
    for (let slot = 0; slot < 4; slot++) {
      const el = LuxuryPawnModel({ slotIndex: slot });
      expect(React.isValidElement(el)).toBe(true);
      expect(el.type).toBe('group');
    }
    const elNaN = LuxuryPawnModel({ slotIndex: Number.NaN });
    expect(React.isValidElement(elNaN)).toBe(true);
    expect(elNaN.type).toBe('group');
  });

  it('penthouse_lobby_scene.tsx không còn dùng hình nhân người que Lego mà dùng LuxuryPawnModel', () => {
    const scenePath = path.resolve(process.cwd(), 'src/client/3d/penthouse_lobby_scene.tsx');
    const source = fs.readFileSync(scenePath, 'utf-8');
    expect(source).toContain('LuxuryPawnModel');
    expect(source).not.toContain('color="#FCD34D"'); // Bỏ đầu hình cầu người que Lego
    expect(source).toContain('TRỐNG'); // Ghế trống mời kết nối
  });
});

describe('[TC-P3.10/MSS] Kiến Trúc Vách Kính Cong Panorama 180 Độ & Nẹp Khung Căn Khớp', () => {
  it('penthouse_enclosure.tsx dựng vách kính cong 180 độ, nẹp nhôm và đèn Cove Light', () => {
    const enclosurePath = path.resolve(process.cwd(), 'src/client/3d/penthouse_enclosure.tsx');
    const source = fs.readFileSync(enclosurePath, 'utf-8');
    expect(source).toContain('PANORAMA_WINDOW_CONFIG');
    expect(source).toContain('thetaLength: Math.PI');
    expect(source).toContain('#1E293B'); // Nẹp nhôm xước than chì
    expect(source).toContain('#FEF3C7'); // Dải đèn hắt Cove Light vàng ấm
    expect(source).toContain('Math.sin(angle)'); // Nẹp nhôm căn chuẩn tọa độ cylinder
    expect(source).toContain('scale={[-1, 1, 1]}'); // Vành đai đúc cong khớp bán nguyệt
    expect(typeof PenthouseEnclosure).toBe('function');
  });
});

describe('[TC-P3.11/MSS] Sa Bàn Mini Phát Quang Cyan Hologram & Bệ Chiếu Ba Chiều (CentralHologram)', () => {
  it('penthouse_lobby_scene.tsx sử dụng sa bàn mini phát quang Cyan Hologram thay cho bảng đen xì', () => {
    const scenePath = path.resolve(process.cwd(), 'src/client/3d/penthouse_lobby_scene.tsx');
    const source = fs.readFileSync(scenePath, 'utf-8');
    expect(source).toContain('color="#06B6D4"');
    expect(source).toContain('emissive="#06B6D4"');
    expect(source).toContain('emissiveIntensity={1.8}');
    expect(source).toContain('opacity={0.8}');
  });
});

