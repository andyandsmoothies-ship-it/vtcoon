// [TC-383/MSS][UC-IMP383] Diorama Mobile useFrame Purge & Continuity Contract Suite
// Verifies Headless Child FrameLoop Pattern, Mobile zero useSafeFrame registration,
// Dynamic layer visibility early return, delta clamping, and resume coordinate snap.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useRef } from 'react';
import { Group, Mesh, CatmullRomCurve3, Vector3 } from 'three';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils';

import { sharedR3FHarness } from '../helpers/r3f_test_harness';

// Standardized R3F test seam fixture
vi.mock('@react-three/fiber', async () => {
  const { createR3FMock, sharedR3FHarness } = await import('../helpers/r3f_test_harness');
  return createR3FMock(sharedR3FHarness);
});

vi.mock('@react-three/drei', () => ({
  ContactShadows: () => null,
  OrbitControls: () => null,
  Environment: () => null,
  RoundedBox: ({ children, ...props }: { readonly children?: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('group', props, children),
}));

import { GameBoard, type GameBoardProps } from '../../src/client/3d/board_layout';
import { MiniatureCityDiorama, type MiniatureCityDioramaProps } from '../../src/client/3d/miniature_city_diorama';
import {
  DioramaTraffic,
  DioramaTrafficFrameLoop,
  type DioramaTrafficFrameLoopProps,
} from '../../src/client/3d/diorama/diorama_traffic';
import {
  DioramaHarborCruiser,
  DioramaHarborCruiserFrameLoop,
  type DioramaHarborCruiserFrameLoopProps,
} from '../../src/client/3d/diorama/diorama_harbor_cruiser';
import {
  DioramaMicroLife,
  DioramaMicroLifeFrameLoop,
  type DioramaMicroLifeFrameLoopProps,
} from '../../src/client/3d/diorama/diorama_microlife';
import { useDiagnostic3DStore } from '../../src/client/3d/diagnostic_3d_store';

describe('IMP-383: Diorama Mobile useFrame Purge & Continuity Contract Suite', () => {
  beforeEach(() => {
    sharedR3FHarness.reset();
    useDiagnostic3DStore.setState({ isCityVisible: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('TC-383.01: [UC-IMP383/MSS] Given GameBoard với isCityVisible=false, When render cây GameBoard, Then MiniatureCityDiorama nhận prop isVisible=false từ call-site', () => {
    useDiagnostic3DStore.setState({ isCityVisible: false });
    const tree = captureTree<GameBoardProps>(GameBoard, { isMobile: false });
    const dioramaNode = findReactNode(tree, (n) => n.type === MiniatureCityDiorama);

    expect(dioramaNode).not.toBeNull();
    expect(dioramaNode?.props?.isVisible).toBe(false);
  });

  it('TC-383.02: [UC-IMP383/MSS] Given MiniatureCityDiorama với isMobile=true, When render cây sa bàn, Then DioramaTrafficFrameLoop không được mount và zero useSafeFrame callback được đăng ký trong scheduler', () => {
    const prevCount = sharedR3FHarness.getSubscriberCount();
    captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true, isVisible: true });
    const deltaCount = sharedR3FHarness.getSubscriberCount() - prevCount;

    // Headless Child FrameLoop Pattern mandates 0 loop callbacks for traffic/cruiser/microlife on mobile
    expect(deltaCount).toBe(0);
  });

  it('TC-383.03: [UC-IMP383/MSS] Given DioramaTraffic với isMobile=true, When captureTree component DioramaTraffic, Then cấu trúc cây trả về trực tiếp danh sách xe ở tọa độ tĩnh ban đầu bảo tồn hợp đồng living test TC-265.10', () => {
    const tree = captureTree<{ readonly isMobile?: boolean }>(DioramaTraffic, { isMobile: true });
    const busNode = findReactNode(tree, (n) => Boolean(n.key && n.key.includes('bus-yellow')));
    const frameLoopNode = findReactNode(tree, (n) => n.type === DioramaTrafficFrameLoop);

    expect(busNode).not.toBeNull();
    expect(busNode?.props?.position).toBeDefined();
    expect(frameLoopNode).toBeNull();
  });

  it('TC-383.04: [UC-IMP383/MSS] Given DioramaHarborCruiser với isMobile=true, When captureTree component DioramaHarborCruiser, Then thuyền tĩnh được trả về tại tọa độ bến y=-0.032 z=5.2 và DioramaHarborCruiserFrameLoop không được mount', () => {
    const tree = captureTree<{ readonly isMobile?: boolean }>(DioramaHarborCruiser, { isMobile: true });
    const frameLoopNode = findReactNode(tree, (n) => n.type === DioramaHarborCruiserFrameLoop);

    expect(tree?.props?.position).toEqual([0, -0.032, 5.2]);
    expect(frameLoopNode).toBeNull();
  });

  it('TC-383.05: [UC-IMP383/MSS] Given DioramaMicroLife với isMobile=true, When captureTree component DioramaMicroLife, Then mô hình tĩnh được trả về và DioramaMicroLifeFrameLoop không được mount', () => {
    const tree = captureTree<{ readonly isMobile?: boolean }>(DioramaMicroLife, { isMobile: true });
    const frameLoopNode = findReactNode(tree, (n) => n.type === DioramaMicroLifeFrameLoop);

    expect(tree).not.toBeNull();
    expect(frameLoopNode).toBeNull();
  });

  it('TC-383.06: [UC-IMP383/A1] Given DioramaTrafficFrameLoop khi isVisible=false, When useSafeFrame callback được gọi, Then hàm trả về sớm (early return) mà không làm tăng biến tích lũy delta progress', () => {
    const mockOuter = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(1, 0, 0)], true);
    const mockInner = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(0, 0, 1)], true);
    const mockVehicle = new (class extends Group {})();
    mockVehicle.position.set(10, 20, 30);
    const vehicleRefs: React.MutableRefObject<(Group | null)[]> = { current: [mockVehicle] };

    captureTree<DioramaTrafficFrameLoopProps>(DioramaTrafficFrameLoop, {
      isVisible: false,
      vehicleRefs,
      outerCurve: mockOuter,
      innerCurve: mockInner,
    });

    expect(sharedR3FHarness.getSubscriberCount()).toBe(1);

    sharedR3FHarness.advanceFrame(0.016);
    // Early return: position must NOT be mutated away from (10, 20, 30)
    expect(mockVehicle.position.x).toBe(10);
    expect(mockVehicle.position.y).toBe(20);
  });

  it('TC-383.07: [UC-IMP383/A2] Given DioramaHarborCruiserFrameLoop khi vừa phục hồi hiển thị (isVisible chuyển từ false sang true), When useSafeFrame nhận nhịp tick kế tiếp, Then vị trí thuyền được copy tức thì mà không bị trễ hình', () => {
    const mockBoat = new (class extends Group {})();
    mockBoat.position.set(99, 88, 77);
    const boatRef: React.RefObject<Group | null> = { current: mockBoat };

    // Phase 1: Khi ẩn (isVisible = false), nhịp tick không làm thay đổi tọa độ
    captureTree<DioramaHarborCruiserFrameLoopProps>(DioramaHarborCruiserFrameLoop, {
      isVisible: false,
      boatRef,
    });
    sharedR3FHarness.advanceFrame(0.016);
    expect(mockBoat.position.x).toBe(99);

    // Phase 2: Phục hồi sang hiển thị (isVisible = true), nhịp tick kế tiếp kích hoạt quỹ đạo di chuyển
    sharedR3FHarness.reset();
    captureTree<DioramaHarborCruiserFrameLoopProps>(DioramaHarborCruiserFrameLoop, {
      isVisible: true,
      boatRef,
    });
    sharedR3FHarness.advanceFrame(0.016);
    expect(mockBoat.position.x).toBeCloseTo(0.00123, 4);
    expect(mockBoat.position.z).toBeCloseTo(5.2, 2);
  });

  it('TC-383.08: [UC-IMP383/A3] Given DioramaTrafficFrameLoop nhận delta lớn sau khi resume tab (delta = 2.5s), When useSafeFrame xử lý, Then delta được kẹp tối đa 0.1s bảo vệ tính liên tục C0', () => {
    const mockOuter = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(1, 0, 0)], true);
    const mockInner = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(0, 0, 1)], true);
    const mockVehicle = new (class extends Group {})();
    const vehicleRefs: React.MutableRefObject<(Group | null)[]> = { current: [mockVehicle] };

    captureTree<DioramaTrafficFrameLoopProps>(DioramaTrafficFrameLoop, {
      isVisible: true,
      vehicleRefs,
      outerCurve: mockOuter,
      innerCurve: mockInner,
    });

    expect(sharedR3FHarness.getSubscriberCount()).toBe(1);

    // Large delta spike (2.5s) from tab switch clamped to 0.1s
    sharedR3FHarness.advanceFrame(2.5);
    expect(mockVehicle.position.x).toBeCloseTo(0.207, 2);
  });




  it('TC-383.09: [UC-IMP383/MSS] Given call-site tích hợp trong MiniatureCityDiorama, When kiểm tra truyền props, Then DioramaTraffic, DioramaHarborCruiser và DioramaMicroLife đều nhận đúng isMobile và isVisible', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: false, isVisible: false });
    const trafficNode = findReactNode(tree, (n) => n.type === DioramaTraffic);
    const cruiserNode = findReactNode(tree, (n) => n.type === DioramaHarborCruiser);
    const microLifeNode = findReactNode(tree, (n) => n.type === DioramaMicroLife);

    expect(trafficNode?.props?.isVisible).toBe(false);
    expect(cruiserNode?.props?.isVisible).toBe(false);
    expect(microLifeNode?.props?.isVisible).toBe(false);
  });
});
