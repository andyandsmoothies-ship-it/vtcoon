# Plan IMP-356: Diorama Hollow Rim, Physical Flat Dice Landing & Bot Action Camera Restoration (Ticket IMP-356)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope (Uncommitted)**:
  - Clean working tree after IMP-355 (`4cc2384`).
- **Auto-Slicing Protocol & Roadmap**:
  - **Ticket IMP-356 (current)**: Subsystem `client-3d` — 3D graphics & presentation convergence:
    1. Hollow perimeter rim rails in `miniature_city_diorama.tsx` eliminating Android 16-bit depth buffer Z-fighting.
    2. Physical flat landing `<group rotation={[0, 0, 0]}>` and turn-boundary unmount cleanup in `dice_tray.tsx`.
    3. Restoration of cinematic action camera angles for bot turns (`dice_pan`, `pawn_chase`, `tile_focus`) in `camera_state_machine.ts`.
  - **Ticket IMP-357 (next)**: Subsystem `client-state` — Canvas WebGL logarithmic depth buffer & frustum tightening in `game_canvas.tsx`.
- **Problem Statement (Physical Evidence from Real Devices)**:
  1. **Background / Board Strobing & Patchiness (Android Only)**:
     - On Android Chrome, the 3D board background strobes continuously between white, cyan, and brown (`chớp trắng xanh nâu như ảnh, loang lổ và chớp liên tục`), with diagonal slicing artifacts across the diorama terrain.
     - Device Discrepancy: Occurs **only on Android**, while **iPhone Chrome renders cleanly without strobing**.
     - Physical Root Cause: In `miniature_city_diorama.tsx`, `DioramaBoardRim` was implemented as a **solid $18.4\text{m} \times 18.4\text{m}$ slab** at $Y = -0.08$ with height $0.06$ (top face $Y = -0.050$, oak wood `#78350F`) and brass rim at top face $Y = -0.043$ (`#D97706`). The difference between brass and wood is only $7\text{mm}$, and it sits directly at the Saigon riverbed height ($Y = -0.050$) and terrain base ($Y = 0.000$).
     - In a 16-bit depth buffer at 43m, all these surfaces fall into the same depth integer, causing catastrophic polygon Z-fighting that rapidly flashes between White (`#FFFFFF`), Cyan (`#06B6D4`), Brown (`#78350F`), and Gold (`#D97706`).
     - On iPhone (Metal 24/32-bit depth buffer), $>16.7\text{M}$ levels distinguish $7\text{mm}$ easily, which is why iPhone did not exhibit the strobe.
  2. **Dice Stuck & Tilted Bug (Both iOS and Android)**:
     - When rolling, the dice jump up, fall down, and then abruptly freeze tilted at an unnatural diagonal angle on edge (`bị nằm yên 1 chỗ xéo như ảnh chứ không hoàn thành hành trình rơi như bình thường`), clipping into the central fountain, and lingering into subsequent turns (e.g. Turn 2, Bot AI 2's turn).
     - Physical Root Cause: In `src/client/3d/dice_tray.tsx` line 226: `<group rotation={!isRolling ? [0.35, 0, -0.35] : [0, 0, 0]}>`. When `isRolling` finishes, the parent group snaps to a 20-degree Euler tilt `[0.35, 0, -0.35]`, rotating around $X = 0$. Because the dice sit at $X = -0.65$ and $X = +0.65$, this rotation levers die 2 downward into the fountain geometry (clipping and turning pale/pink) and levers die 1 upward into the air on edge.
     - The fadeout/unmount lifecycle lacked turn-boundary awareness (`currentTurnPlayerId`), allowing dice from Turn 1 to persist frozen into Turn 2.
  3. **Bot Turn Camera Freezing at Default Screen Position (Both iOS and Android)**:
     - During Bot turns, the camera remains frozen at the static overview position (`[24.6, 25.3, 24.6]`), no longer panning to dice, chasing the moving bot pawn, or focusing on the landed destination tile (`chỉ đứng yên tại vị trí màn hình mặc định, không còn camera góc quay như trước`).
     - Physical Root Cause: In IMP-354, `resolveCameraMode` forced `overview` for all bot pawn moves on non-human tiles (`if ((params.isBotTurn || params.isAnimatingPawnBot) && params.isTargetOwnedByHuman === false ...) return 'overview'`) and `calculateTargetCameraState` explicitly blocked dice panning for bots via `!options?.isBotTurn`.
- **Adversarial Gate Decisions & Remediation ([PLAN_CHALLENGE_IMP-356.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_CHALLENGE_IMP-356.md))**:
  - ADV-01 (Brass Rails Perimeter Alignment): Align brass rail centerlines to $\pm 9.145\text{m}$ ($\pm (9.22 - 0.15/2)$) flush with wood rails at $\pm 8.90\text{m}$, eliminating $24.5\text{cm}$ overhanging cross-hair spurs at all 4 corners.
  - ADV-02 (Store State Desync & Invisible Roll Guard): When `currentTurnPlayerId` changes while `isRolling` is active, call `setIsRolling(false)` so store state resets cleanly and subsequent rolls trigger proper `false -> true` transitions.
  - ADV-03 (Component-Level Timer Refs): Elevate fade and hide timeouts to component refs (`fadeTimerRef`, `hideTimerRef`), explicitly cancelling pending timers on turn transition and unmount.
  - ADV-04 (Doubles Spin Randomization): Track `lastDiceSeq` via `prevDiceSeqRef` so doubles re-rolls generate fresh dynamic 3D spin offsets.
  - ADV-05 (Living Test Parity Guard): Preserve East/West rails with depth $18.4\text{m}$ ($\ge 18.2\text{m}$) satisfying `tests/client/urban_density_and_craft.test.ts`.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-356`
- **Subsystem**: `client-3d` (Tier 1 Dice Tray / Camera State Machine & Tier 2 Miniature City Diorama)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/3d/miniature_city_diorama.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/dice_tray.tsx` (Refactor)
  - **Target physical file**: `src/client/3d/camera_state_machine.ts` (Refactor)
  - **Target physical file**: `tests/client/imp356_android_depth_and_dice_landing.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/3d/board_layout.tsx`
  - `src/client/3d/coastal_island_environment.tsx`
  - `tests/client/urban_density_and_craft.test.ts`
  - `tests/contracts/bridge_craft_and_dice_settle_contract.test.ts`
  - `tests/client/imp354_bot_camera_stabilization.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/3d/miniature_city_diorama.tsx` | Tier 2 (UI/3D/Views) | 323 | 347 | +24 | <= 500 | Safe |
| `src/client/3d/dice_tray.tsx` | Tier 1 (Domain/Server/Logic) | 250 | 276 | +26 | <= 400 | Safe |
| `src/client/3d/camera_state_machine.ts` | Tier 1 (Domain/Server/Logic) | 305 | 299 | -6 | <= 400 | Safe |
| `tests/client/imp356_android_depth_and_dice_landing.test.ts` | Living Test | 0 | 200 | +200 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp356_android_depth_and_dice_landing.test.ts`:
  - TC-356.01 [UC-RIM-PERIMETER/MSS]: Given DioramaBoardRim rendered in markup, When inspecting outer dimensions, Then widthX >= 18.2, depthZ >= 18.2, and heightY > 0, satisfying urban density contract.
  - TC-356.02 [UC-RIM-HOLLOW/MSS]: Given DioramaBoardRim rendered in markup, When inspecting interior region, Then no solid slab spans across the center (X in [-8, 8] and Z in [-8, 8]), preventing river burial and Z-fighting.
  - TC-356.03 [UC-RIM-FLUSH-CORNERS/MSS]: Given DioramaBoardRim perimeter rails, When evaluating rail extents, Then no geometry extends beyond outer perimeter [-9.22, 9.22], preventing ADV-01 cross-hair overhangs.
  - TC-356.04 [UC-DICE-FLAT/MSS]: Given DiceTray rendered in rested state (isRolling = false), When inspecting dice group rotation, Then rotation is [0, 0, 0] without unnatural 20-degree tilt.
  - TC-356.05 [UC-DICE-UNMOUNT/MSS]: Given DiceTray rendered after roll completion, When active turn advances to another player, Then cancels timers and unmounts dice cleanly without lingering into subsequent turns.
  - TC-356.06 [UC-DICE-PRESERVATION/MSS]: Given DiceTray idle state, When rendering static markup, Then preserves zero ruby dice when idle, satisfying TC-IMP53.10 contract.
  - TC-356.07 [UC-CAM-BOT-ACTION/MSS]: Given Bot turn with pawn animating, When calling resolveCameraMode, Then returns 'pawn_chase' following the bot across the board.
  - TC-356.08 [UC-CAM-BOT-PAN/MSS]: Given Bot turn in rolling state, When calling calculateTargetCameraState in overview mode, Then activates calculateDicePanCameraState without blocking on isBotTurn.

### Station 2: Implementation (GREEN)

#### Task 1: Hollow Perimeter Rails in `src/client/3d/miniature_city_diorama.tsx`
**Target physical file**: `src/client/3d/miniature_city_diorama.tsx` (Refactor)
```typescript
<<<<
export function DioramaBoardRim(): React.ReactElement {
  return (
    <group position={[0, -0.08, 0]} data-testid="diorama-board-rim">
      {/* Khung viền ngoài gỗ óc chó ôm trọn chu vi bàn cờ */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[18.4, 0.06, 18.4]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Gờ viền trang trí bo cạnh hoàng kim đồng thau */}
      <mesh receiveShadow position={[0, 0.032, 0]}>
        <boxGeometry args={[18.44, 0.01, 18.44]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}
====
export function DioramaBoardRim(): React.ReactElement {
  return (
    <group position={[0, -0.08, 0]} data-testid="diorama-board-rim">
      {/* Khung viền 4 cạnh gỗ óc chó rỗng ruột ôm khít mép bàn cờ [-9.20, +9.20] */}
      <mesh receiveShadow position={[0, 0, -8.9]}>
        <boxGeometry args={[18.4, 0.06, 0.6]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh receiveShadow position={[0, 0, 8.9]}>
        <boxGeometry args={[18.4, 0.06, 0.6]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh receiveShadow position={[-8.9, 0, 0]}>
        <boxGeometry args={[0.6, 0.06, 18.4]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh receiveShadow position={[8.9, 0, 0]}>
        <boxGeometry args={[0.6, 0.06, 18.4]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Gờ viền trang trí bo cạnh hoàng kim đồng thau flush mép ngoài [-9.22, +9.22] (ADV-01) */}
      <mesh receiveShadow position={[0, 0.032, -9.145]}>
        <boxGeometry args={[18.44, 0.01, 0.15]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh receiveShadow position={[0, 0.032, 9.145]}>
        <boxGeometry args={[18.44, 0.01, 0.15]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh receiveShadow position={[-9.145, 0.032, 0]}>
        <boxGeometry args={[0.15, 0.01, 18.44]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh receiveShadow position={[9.145, 0.032, 0]}>
        <boxGeometry args={[0.15, 0.01, 18.44]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}
>>>>
```

#### Task 2: Robust Turn Lifecycle & Timer Coordination in `src/client/3d/dice_tray.tsx`
**Target physical file**: `src/client/3d/dice_tray.tsx` (Refactor)
```typescript
<<<<
  const isRolling = ssrState ? ssrState.isRolling : isRollingStore;

  const prevRollingRef = useRef(false);
  const [fadeOpacity, setFadeOpacity] = useState(1.0);
  const [isVisible, setIsVisible] = useState(Boolean(isRolling));

  const spinOffsetsRef = useRef<
    readonly [readonly [number, number, number], readonly [number, number, number]]
  >([
    [Math.PI * 6, Math.PI * 8, Math.PI * 6],
    [-Math.PI * 8, Math.PI * 6, -Math.PI * 8],
  ]);

  if (isRolling && !prevRollingRef.current) {
    spinOffsetsRef.current = [generateRandomDiceSpin(), generateRandomDiceSpin()];
  }

  useEffect(() => {
    if (isRolling) {
      setIsVisible(true);
      setFadeOpacity(1.0);
      AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    } else if (!isRolling && prevRollingRef.current) {
      // Dừng quay -> chờ 1.5s rồi mờ dần trong 300ms
      let hideTimer: ReturnType<typeof setTimeout> | undefined;
      const timer = setTimeout(() => {
        setFadeOpacity(0);
        hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 300);
      }, 1500);
      return () => {
        clearTimeout(timer);
        if (hideTimer) clearTimeout(hideTimer);
      };
    }
    prevRollingRef.current = isRolling;
  }, [isRolling]);

  const lastDiceSeqStore = useGameStore((s) => s.lastDiceSeq);
  const lastDiceSeq = ssrState ? ssrState.lastDiceSeq : lastDiceSeqStore;
====
  const isRolling = ssrState ? ssrState.isRolling : isRollingStore;
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const lastDiceSeqStore = useGameStore((s) => s.lastDiceSeq);
  const lastDiceSeq = ssrState ? ssrState.lastDiceSeq : lastDiceSeqStore;

  const prevRollingRef = useRef(false);
  const prevDiceSeqRef = useRef<number | undefined>(lastDiceSeq);
  const prevTurnPlayerIdRef = useRef(currentTurnPlayerId);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fadeOpacity, setFadeOpacity] = useState(1.0);
  const [isVisible, setIsVisible] = useState(Boolean(isRolling));

  const spinOffsetsRef = useRef<
    readonly [readonly [number, number, number], readonly [number, number, number]]
  >([
    [Math.PI * 6, Math.PI * 8, Math.PI * 6],
    [-Math.PI * 8, Math.PI * 6, -Math.PI * 8],
  ]);

  const isNewRoll = isRolling && (!prevRollingRef.current || (lastDiceSeq !== undefined && lastDiceSeq !== prevDiceSeqRef.current));
  if (isNewRoll) {
    spinOffsetsRef.current = [generateRandomDiceSpin(), generateRandomDiceSpin()];
    prevDiceSeqRef.current = lastDiceSeq;
  }

  // ADV-02 & ADV-03: Turn transition reset & orphaned timer cancellation
  useEffect(() => {
    if (prevTurnPlayerIdRef.current !== currentTurnPlayerId) {
      prevTurnPlayerIdRef.current = currentTurnPlayerId;
      if (fadeTimerRef.current) { clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null; }
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      if (isRolling) {
        setIsRolling(false);
      }
      setIsVisible(false);
      setFadeOpacity(0);
    }
  }, [currentTurnPlayerId, isRolling, setIsRolling]);

  useEffect(() => {
    if (isRolling) {
      if (fadeTimerRef.current) { clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null; }
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      setIsVisible(true);
      setFadeOpacity(1.0);
      AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    } else if (!isRolling && prevRollingRef.current) {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        setFadeOpacity(0);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 300);
      }, 1500);
    }
    prevRollingRef.current = isRolling;
  }, [isRolling]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);
>>>>
```

```typescript
<<<<
      {/* 2 Xúc xắc 3D đỏ Ruby chỉ render khi đang quay hoặc mờ dần */}
      {Boolean(isRolling || (isVisible && fadeOpacity > 0)) && (
        <group rotation={!isRolling ? [0.35, 0, -0.35] : [0, 0, 0]}>
====
      {/* 2 Xúc xắc 3D đỏ Ruby chỉ render khi đang quay hoặc mờ dần */}
      {Boolean(isRolling || (isVisible && fadeOpacity > 0)) && (
        <group rotation={[0, 0, 0]}>
>>>>
```

#### Task 3: Restore Bot Action Angles & Dice Pan in `src/client/3d/camera_state_machine.ts`
**Target physical file**: `src/client/3d/camera_state_machine.ts` (Refactor)
```typescript
<<<<
  // 2. Quân cờ đang di chuyển: Bám đuổi theo quân cờ
  if (params.isPawnAnimating) {
    if ((params.isBotTurn || params.isAnimatingPawnBot) && params.isTargetOwnedByHuman === false && !params.isHighStakesRoll && params.activeModal === null) {
      return 'overview';
    }
    return 'pawn_chase';
  }
  // 3. Mở modal tương tác hoặc dừng chân tại ô đất sau khi di chuyển
  if (params.activeModal !== null || params.hasTargetTile || params.hasRolledThisTurn) {
    if ((params.isBotTurn || params.isAnimatingPawnBot) && params.isTargetOwnedByHuman === false && params.activeModal === null) {
      return 'overview';
    }
    return 'tile_focus';
  }
====
  // 2. Quân cờ đang di chuyển: Bám đuổi theo quân cờ
  if (params.isPawnAnimating) {
    return 'pawn_chase';
  }
  // 3. Mở modal tương tác hoặc dừng chân tại ô đất sau khi di chuyển
  if (params.activeModal !== null || params.hasTargetTile || params.hasRolledThisTurn) {
    return 'tile_focus';
  }
>>>>
```

```typescript
<<<<
      if (options?.isRolling && !options?.isHighStakesRoll && !options?.isBotTurn) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
====
      if (options?.isRolling && !options?.isHighStakesRoll) {
        return calculateDicePanCameraState(options?.rollingPlayerPos, options?.aspect);
      }
>>>>
```

### Station 3: Pre-Filter & Mechanical Gates
- Run Fast Pre-Filter:
  `npm run prefilter -- src/client/3d/miniature_city_diorama.tsx src/client/3d/dice_tray.tsx src/client/3d/camera_state_machine.ts tests/client/imp356_android_depth_and_dice_landing.test.ts`
- Run Scope Confinement:
  `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_356_ANDROID_DEPTH_AND_DICE_LANDING.md`
- In-action visual capture:
  `node scripts/visual_capture/capture_dual_viewport.mjs --scenario dice_rolling`

### Station 4: Sentinel & Evidence
- Create Sentinel probe `scripts/sentinel_probes/IMP-356.json`.
- Run `npm run sentinel -- --ticket IMP-356 --test tests/client/imp356_android_depth_and_dice_landing.test.ts`.
- Run `node scripts/check_evidence.mjs IMP-356`.
- Run `npm run report -- IMP-356`.
- Deliver comprehensive Vietnamese report to User.
