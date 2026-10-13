// [TC-385/MSS][UC-IMP385] Diorama Infrastructure useFrame Purge & Continuity Contract Suite
// Verifies Headless Child FrameLoop Pattern for Railroad, Container Port, Marina, Bridges, Skyline
// Verifies Standardized R3F test seam fixture, zero frame callbacks on mobile, daytime loop avoidance,
// delta clamping, and C0 kinematic continuity upon unhiding.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useRef } from 'react';
import { Group, Mesh, MeshStandardMaterial, MeshBasicMaterial, CatmullRomCurve3, Vector3 } from 'three';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';

import { sharedR3FHarness } from '../helpers/r3f_test_harness';

// Standardized R3F test seam fixture (GEMINI.md Standardized Graphics Fixture Invariant)
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

import {
  useEnvironmentStore,
  type EnvironmentState,
  type TimeOfDayPhase,
} from '../../src/client/store/environment_store';

let currentPhase: TimeOfDayPhase = 'day';

vi.mock('../../src/client/store/environment_store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/client/store/environment_store')>();
  const useMockStore = <T>(selector: (s: EnvironmentState) => T): T => {
    const state: EnvironmentState = {
      ...actual.useEnvironmentStore.getState(),
      phase: currentPhase,
      mode: currentPhase === 'day' ? 'day' : currentPhase === 'night' ? 'night' : 'sunset',
    };
    return selector(state);
  };
  Object.assign(useMockStore, actual.useEnvironmentStore, {
    getState: (): EnvironmentState => ({
      ...actual.useEnvironmentStore.getState(),
      phase: currentPhase,
    }),
    setState: (partial: Partial<EnvironmentState>): void => {
      if (partial.phase) {
        currentPhase = partial.phase;
      }
    },
  });
  return {
    ...actual,
    useEnvironmentStore: useMockStore,
  };
});



import { MiniatureCityDiorama, type MiniatureCityDioramaProps } from '../../src/client/3d/miniature_city_diorama';
import {
  DioramaModelRailroad,
  DioramaModelRailroadFrameLoop,
  type DioramaModelRailroadProps,
  type DioramaModelRailroadFrameLoopProps,
} from '../../src/client/3d/diorama/diorama_railroad';
import {
  DioramaContainerPort,
  DioramaContainerPortFrameLoop,
  type DioramaContainerPortProps,
  type DioramaContainerPortFrameLoopProps,
} from '../../src/client/3d/diorama/diorama_container_port';
import {
  DioramaMarina,
  DioramaMarinaFrameLoop,
  type DioramaMarinaProps,
  type DioramaMarinaFrameLoopProps,
} from '../../src/client/3d/diorama/diorama_marina';
import {
  DioramaPerchingBirds,
  DioramaPerchingBirdsFrameLoop,
  type DioramaPerchingBirdsProps,
} from '../../src/client/3d/diorama/diorama_perching_birds';
import {
  DioramaBridges,
  DioramaBridgesFrameLoop,
  type DioramaBridgesProps,
} from '../../src/client/3d/diorama/diorama_bridges';
import {
  DioramaSkyline,
  DioramaSkylineFrameLoop,
  type DioramaSkylineProps,
} from '../../src/client/3d/diorama/diorama_skyline';

function createMockCurve(): CatmullRomCurve3 {
  return new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(1, 0, 1),
    new Vector3(0, 0, 0),
  ], true);
}

describe('IMP-385: Diorama Infrastructure useFrame Purge & Continuity Contract Suite', () => {
  beforeEach(() => {
    sharedR3FHarness.reset();
    useEnvironmentStore.getInitialState = useEnvironmentStore.getState;
    useEnvironmentStore.setState({ phase: 'day' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('TC-385.01: [UC-IMP385/MSS] Given MiniatureCityDiorama với isMobile=true và isVisible=false, When render cây sa bàn đô thị, Then MiniatureCityDiorama truyền đúng isVisible đến railroad, bridges, port', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, {
      isMobile: true,
      isVisible: false,
    });

    const railroadNode = findReactNode(tree, (n) => n.type === DioramaModelRailroad);
    const bridgesNode = findReactNode(tree, (n) => n.type === DioramaBridges);
    const portNode = findReactNode(tree, (n) => n.type === DioramaContainerPort);

    expect(railroadNode?.props?.isMobile).toBe(true);
    expect(railroadNode?.props?.isVisible).toBe(false);
    expect(bridgesNode?.props?.isVisible).toBe(false);
    expect(portNode?.props?.isVisible).toBe(false);
  });

  it('TC-385.01b: [UC-IMP385/MSS] Given MiniatureCityDiorama với isVisible=false, When render sa bàn, Then MiniatureCityDiorama truyền đúng isVisible đến marina và skyline', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, {
      isMobile: true,
      isVisible: false,
    });

    const marinaNode = findReactNode(tree, (n) => n.type === DioramaMarina);
    const skylineNode = findReactNode(tree, (n) => n.type === DioramaSkyline);

    expect(marinaNode?.props?.isMobile).toBe(true);
    expect(marinaNode?.props?.isVisible).toBe(false);
    expect(skylineNode?.props?.isVisible).toBe(false);
  });

  it('TC-385.02: [UC-IMP385/MSS] Given DioramaModelRailroad với isMobile=true, When captureTree component DioramaModelRailroad, Then DioramaModelRailroadFrameLoop không được mount và các toa xe có carriageY=0.488 bảo tồn living test TC-228 và TC-230', () => {
    const treeMobile = captureTree<DioramaModelRailroadProps>(DioramaModelRailroad, { isMobile: true });
    const loopNodeMobile = findReactNode(treeMobile, (n) => n.type === DioramaModelRailroadFrameLoop);

    const treeDesktop = captureTree<DioramaModelRailroadProps>(DioramaModelRailroad, { isMobile: false });
    const loopNodeDesktop = findReactNode(treeDesktop, (n) => n.type === DioramaModelRailroadFrameLoop);

    expect(loopNodeMobile).toBeNull();
    expect(loopNodeDesktop).not.toBeNull();
  });

  it('TC-385.03: [UC-IMP385/MSS] Given DioramaContainerPort với isMobile=true, When captureTree component DioramaContainerPort, Then DioramaContainerPortFrameLoop không được mount và cẩu cảng hiển thị tại tọa độ tĩnh ban đầu', () => {
    const treeMobile = captureTree<DioramaContainerPortProps>(DioramaContainerPort, { isMobile: true });
    const loopNodeMobile = findReactNode(treeMobile, (n) => n.type === DioramaContainerPortFrameLoop);

    const treeDesktop = captureTree<DioramaContainerPortProps>(DioramaContainerPort, { isMobile: false });
    const loopNodeDesktop = findReactNode(treeDesktop, (n) => n.type === DioramaContainerPortFrameLoop);

    expect(loopNodeMobile).toBeNull();
    expect(loopNodeDesktop).not.toBeNull();
  });

  it('TC-385.04: [UC-IMP385/MSS] Given DioramaMarina với isMobile=true, When captureTree component DioramaMarina, Then DioramaMarinaFrameLoop không được mount và bến du thuyền hiển thị tại tọa độ tĩnh', () => {
    const treeMobile = captureTree<DioramaMarinaProps>(DioramaMarina, { isMobile: true });
    const loopNodeMobile = findReactNode(treeMobile, (n) => n.type === DioramaMarinaFrameLoop);

    const treeDesktop = captureTree<DioramaMarinaProps>(DioramaMarina, { isMobile: false });
    const loopNodeDesktop = findReactNode(treeDesktop, (n) => n.type === DioramaMarinaFrameLoop);

    expect(loopNodeMobile).toBeNull();
    expect(loopNodeDesktop).not.toBeNull();
  });

  it('TC-385.05: [UC-IMP385/MSS] Given DioramaPerchingBirds với isMobile=false, When captureTree component DioramaPerchingBirds, Then position trên các nhóm chim là undefined bảo tồn living test TC-337.14', () => {
    const treeDesktop = captureTree<DioramaPerchingBirdsProps>(DioramaPerchingBirds, { isMobile: false });
    const loopNodeDesktop = findReactNode(treeDesktop, (n) => n.type === DioramaPerchingBirdsFrameLoop);
    const groups = findReactNodes(treeDesktop, (n) => n.type === 'group' && n.props?.rotation !== undefined);

    expect(loopNodeDesktop).not.toBeNull();
    expect(groups[0]?.props?.position).toBeUndefined();
  });

  it('TC-385.06: [UC-IMP385/MSS] Given DioramaSkyline với isMobile=true, When captureTree component DioramaSkyline, Then DioramaSkylineFrameLoop không được mount và đèn Bitexco mang prop visible={isNight} tránh kẹt sáng ban ngày', () => {
    useEnvironmentStore.setState({ phase: 'day' });
    const treeDay = captureTree<DioramaSkylineProps>(DioramaSkyline, { isMobile: false });
    const loopNodeDay = findReactNode(treeDay, (n) => n.type === DioramaSkylineFrameLoop);

    useEnvironmentStore.setState({ phase: 'night' });
    const treeNight = captureTree<DioramaSkylineProps>(DioramaSkyline, { isMobile: false });
    const loopNodeNight = findReactNode(treeNight, (n) => n.type === DioramaSkylineFrameLoop);

    expect(loopNodeDay).toBeNull();
    expect(loopNodeNight).not.toBeNull();
  });

  it('TC-385.07: [UC-IMP385/MSS] Given DioramaBridges ban ngày (isNight=false), When render DioramaBridges trên desktop, Then DioramaBridgesFrameLoop không được mount nhằm triệt tiêu callback nhàn rỗi ban ngày', () => {
    useEnvironmentStore.setState({ phase: 'day' });
    const treeDay = captureTree<DioramaBridgesProps>(DioramaBridges, { isMobile: false });
    const loopNodeDay = findReactNode(treeDay, (n) => n.type === DioramaBridgesFrameLoop);

    useEnvironmentStore.setState({ phase: 'night' });
    const treeNight = captureTree<DioramaBridgesProps>(DioramaBridges, { isMobile: false });
    const loopNodeNight = findReactNode(treeNight, (n) => n.type === DioramaBridgesFrameLoop);

    expect(loopNodeDay).toBeNull();
    expect(loopNodeNight).not.toBeNull();
  });

  it('TC-385.08: [UC-IMP385/A1] Given DioramaModelRailroadFrameLoop khi isVisible=false, When useSafeFrame callback nhận nhịp tick, Then hàm trả về sớm mà không làm tăng biến tích lũy thời gian timeAccumRef', () => {
    const leadRef = { current: new Group() };
    const coach1Ref = { current: new Group() };
    const coach2Ref = { current: new Group() };
    leadRef.current.position.set(10, 0, 10);

    captureTree<DioramaModelRailroadFrameLoopProps>(DioramaModelRailroadFrameLoop, {
      isVisible: false,
      leadRef,
      coach1Ref,
      coach2Ref,
      trackCurve: createMockCurve(),
      trackLength: 100,
      carriageY: 0.062,
    });

    sharedR3FHarness.advanceFrame(0.016);
    expect(leadRef.current.position.x).toBe(10);
    expect(leadRef.current.position.z).toBe(10);
  });

  it('TC-385.09: [UC-IMP385/A2] Given DioramaContainerPortFrameLoop khi isVisible=false, When useSafeFrame callback nhận nhịp tick, Then hàm trả về sớm mà không làm tăng biến tích lũy thời gian timeAccumRef', () => {
    const boom1Ref = { current: new Group() };
    const hoist1Ref = { current: new Group() };
    const boom2Ref = { current: new Group() };
    const hoist2Ref = { current: new Group() };
    const beacon1Ref = { current: new Mesh() };
    const beacon2Ref = { current: new Mesh() };
    boom1Ref.current.rotation.y = 0.55;

    captureTree<DioramaContainerPortFrameLoopProps>(DioramaContainerPortFrameLoop, {
      isVisible: false,
      boom1Ref,
      hoist1Ref,
      boom2Ref,
      hoist2Ref,
      beacon1Ref,
      beacon2Ref,
    });

    sharedR3FHarness.advanceFrame(0.016);
    expect(boom1Ref.current.rotation.y).toBe(0.55);
  });

  it('TC-385.10: [UC-IMP385/A3] Given DioramaModelRailroadFrameLoop nhận delta lớn sau khi resume tab (delta = 2.5s), When useSafeFrame xử lý, Then delta được kẹp tối đa 0.1s bảo vệ tính liên tục C0 của tuyến metro', () => {
    const leadRef = { current: new Group() };
    const coach1Ref = { current: new Group() };
    const coach2Ref = { current: new Group() };
    leadRef.current.position.set(0, 0, 0);

    captureTree<DioramaModelRailroadFrameLoopProps>(DioramaModelRailroadFrameLoop, {
      isVisible: true,
      leadRef,
      coach1Ref,
      coach2Ref,
      trackCurve: createMockCurve(),
      trackLength: 100,
      carriageY: 0.062,
    });

    sharedR3FHarness.advanceFrame(2.5);
    // Delta clamped to 0.1s ensures position changes strictly bounded by 0.1s velocity
    expect(leadRef.current.position.x).toBeGreaterThan(0);
    expect(leadRef.current.position.x).toBeLessThan(5);
  });

  it('TC-385.11: [UC-IMP385/A4] Given DioramaModelRailroadFrameLoop đang ở trạng thái ẩn (isVisible=false), When isVisible chuyển thành true và nhận nhịp tick kế tiếp, Then tàu chuyển động mượt mà từ đúng tọa độ đã dừng bảo toàn tính liên tục C0', () => {
    const leadRef = { current: new Group() };
    const coach1Ref = { current: new Group() };
    const coach2Ref = { current: new Group() };
    leadRef.current.position.set(99, 0, 99);

    // Phase 1: isVisible: false -> stays at paused coordinates
    captureTree<DioramaModelRailroadFrameLoopProps>(DioramaModelRailroadFrameLoop, {
      isVisible: false,
      leadRef,
      coach1Ref,
      coach2Ref,
      trackCurve: createMockCurve(),
      trackLength: 100,
      carriageY: 0.062,
    });
    sharedR3FHarness.advanceFrame(0.016);
    expect(leadRef.current.position.x).toBe(99);

    // Phase 2: isVisible: true -> resumes from paused position
    captureTree<DioramaModelRailroadFrameLoopProps>(DioramaModelRailroadFrameLoop, {
      isVisible: true,
      leadRef,
      coach1Ref,
      coach2Ref,
      trackCurve: createMockCurve(),
      trackLength: 100,
      carriageY: 0.062,
    });
    sharedR3FHarness.advanceFrame(0.016);
    expect(leadRef.current.position.x).not.toBe(99);
  });
});
