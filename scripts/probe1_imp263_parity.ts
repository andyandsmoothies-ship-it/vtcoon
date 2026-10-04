// Probe 1: Domain-Adaptive Wire-to-Core Closed-Loop Parity Probe for IMP-263
import {
  calculateStreetChaseCameraState,
  shouldTriggerCinematicCamera,
  calculateResponsiveStreetFov,
  resolvePawnTrackSide,
  resolveSideFromCoordinates,
  CINEMATIC_CHASE_CONFIG,
  CINEMATIC_EVENT_CELLS,
} from '../src/client/3d/cinematic_chase_camera';
import {
  calculateTargetCameraState,
  resolveCameraMode,
  CAMERA_CONFIG,
} from '../src/client/3d/camera_state_machine';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== RUNNING PROBE 1: DOMAIN-ADAPTIVE WIRE-TO-CORE CLOSED-LOOP PARITY ===\n');

let failedAssertions = 0;
function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  [PASS] ${desc}`);
  } else {
    console.error(`  [FAIL] ${desc}`);
    failedAssertions++;
  }
}

// 1. Verify 4-side tangent calculations
const p0 = calculateStreetChaseCameraState({ pawnPosition: [4, 0, 6], cellIndex: 5 });
assert(Math.abs(p0.position[0] - 7) < 0.001, 'Side 0 posX: px + 3.0');
assert(Math.abs(p0.position[1] - 2.8) < 0.001, 'Side 0 posY: py + 2.8');
assert(Math.abs(p0.position[2] - 8.2) < 0.001, 'Side 0 posZ: pz + 2.2');
assert(Math.abs(p0.target[0] - 3.0) < 0.001, 'Side 0 tarX: px - 1.0');
assert(Math.abs(p0.target[1] - 0.6) < 0.001, 'Side 0 tarY: py + 0.6');
assert(Math.abs(p0.target[2] - 5.5) < 0.001, 'Side 0 tarZ: pz - 0.5');

// Pitch angle ~ 24.5 - 25.0 deg
const dx0 = p0.target[0] - p0.position[0];
const dy0 = p0.target[1] - p0.position[1];
const dz0 = p0.target[2] - p0.position[2];
const pitch0 = (Math.atan2(-dy0, Math.hypot(dx0, dz0)) * 180) / Math.PI;
assert(pitch0 >= 24.5 && pitch0 <= 25.0, `Side 0 pitch angle: ${pitch0.toFixed(2)}° (expected ~24.5°-25.0°)`);

const p1 = calculateStreetChaseCameraState({ pawnPosition: [-6, 0, 2], cellIndex: 15 });
assert(Math.abs(p1.position[0] - (-8.2)) < 0.001, 'Side 1 posX: px - 2.2');
assert(Math.abs(p1.position[1] - 2.8) < 0.001, 'Side 1 posY: py + 2.8');
assert(Math.abs(p1.position[2] - 5.0) < 0.001, 'Side 1 posZ: pz + 3.0');
assert(Math.abs(p1.target[0] - (-5.5)) < 0.001, 'Side 1 tarX: px + 0.5');
assert(Math.abs(p1.target[1] - 0.6) < 0.001, 'Side 1 tarY: py + 0.6');
assert(Math.abs(p1.target[2] - 1.0) < 0.001, 'Side 1 tarZ: pz - 1.0');

const p2 = calculateStreetChaseCameraState({ pawnPosition: [-2, 0, -6], cellIndex: 25 });
assert(Math.abs(p2.position[0] - (-5.0)) < 0.001, 'Side 2 posX: px - 3.0');
assert(Math.abs(p2.position[1] - 2.8) < 0.001, 'Side 2 posY: py + 2.8');
assert(Math.abs(p2.position[2] - (-8.2)) < 0.001, 'Side 2 posZ: pz - 2.2');
assert(Math.abs(p2.target[0] - (-1.0)) < 0.001, 'Side 2 tarX: px + 1.0');
assert(Math.abs(p2.target[1] - 0.6) < 0.001, 'Side 2 tarY: py + 0.6');
assert(Math.abs(p2.target[2] - (-5.5)) < 0.001, 'Side 2 tarZ: pz + 0.5');

const p3 = calculateStreetChaseCameraState({ pawnPosition: [6, 0, -2], cellIndex: 35 });
assert(Math.abs(p3.position[0] - 8.2) < 0.001, 'Side 3 posX: px + 2.2');
assert(Math.abs(p3.position[1] - 2.8) < 0.001, 'Side 3 posY: py + 2.8');
assert(Math.abs(p3.position[2] - (-5.0)) < 0.001, 'Side 3 posZ: pz - 3.0');
assert(Math.abs(p3.target[0] - 5.5) < 0.001, 'Side 3 tarX: px - 0.5');
assert(Math.abs(p3.target[1] - 0.6) < 0.001, 'Side 3 tarY: py + 0.6');
assert(Math.abs(p3.target[2] - (-1.0)) < 0.001, 'Side 3 tarZ: pz + 1.0');

// 2. Corner synchronization (anti-whiplash)
assert(resolvePawnTrackSide([-2, 0, 8], 10) === 0, 'Corner cell 10 resolved to Side 0 via coordinate check');
assert(resolvePawnTrackSide([-8, 0, -2], 20) === 1, 'Corner cell 20 resolved to Side 1 via coordinate check');
assert(resolvePawnTrackSide([2, 0, -8], 30) === 2, 'Corner cell 30 resolved to Side 2 via coordinate check');
assert(resolvePawnTrackSide([8, 0, 2], 0) === 3, 'Corner cell 0 resolved to Side 3 via coordinate check');

// 3. Event-driven triggers
assert(shouldTriggerCinematicCamera({ isHighStakesRoll: true, cellIndex: 3 }) === true, 'High-stakes roll triggers cinematic camera');
assert(shouldTriggerCinematicCamera({ hasMonopolyRisk: true, cellIndex: 8 }) === true, 'Monopoly risk triggers cinematic camera');
assert(shouldTriggerCinematicCamera({ cellIndex: 5 }) === true, 'Cell 5 in CINEMATIC_EVENT_CELLS triggers cinematic camera');
assert(shouldTriggerCinematicCamera({ cellIndex: 10 }) === true, 'Cell 10 in CINEMATIC_EVENT_CELLS triggers cinematic camera');
assert(shouldTriggerCinematicCamera({ cellIndex: 15 }) === true, 'Cell 15 in CINEMATIC_EVENT_CELLS triggers cinematic camera');
assert(shouldTriggerCinematicCamera({ cellIndex: 20 }) === true, 'Cell 20 in CINEMATIC_EVENT_CELLS triggers cinematic camera');
assert(shouldTriggerCinematicCamera({ cellIndex: 25 }) === true, 'Cell 25 in CINEMATIC_EVENT_CELLS triggers cinematic camera');
assert(shouldTriggerCinematicCamera({ cellIndex: 35 }) === true, 'Cell 35 in CINEMATIC_EVENT_CELLS triggers cinematic camera');
assert(shouldTriggerCinematicCamera({ cellIndex: 7 }) === false, 'Ordinary cell 7 does NOT trigger cinematic camera');
assert(shouldTriggerCinematicCamera({ isJailFlight: true, cellIndex: 10 }) === false, 'Jail flight disables cinematic camera');

// 4. Wire-to-Core Camera State Machine Dispatch
const dispatchCinematic = calculateTargetCameraState('pawn_chase', [0, 0, 0], undefined, { cinematicChase: true, cellIndex: 5 });
assert(dispatchCinematic.position[0] === 3.0 && dispatchCinematic.position[1] === 2.8 && dispatchCinematic.position[2] === 2.2, 'Dispatch to StreetChase on cinematicChase: true');
assert(dispatchCinematic.fov === 42, 'Cinematic chase default FOV is 42');
assert(dispatchCinematic.speed === 5.8, 'Cinematic chase speed is 5.8');

const dispatchNonCinematic = calculateTargetCameraState('pawn_chase', [0, 0, 0], undefined, { cinematicChase: false });
assert(dispatchNonCinematic.position[0] === CAMERA_CONFIG.overview.position[0] &&
       dispatchNonCinematic.position[1] === CAMERA_CONFIG.overview.position[1] &&
       dispatchNonCinematic.position[2] === CAMERA_CONFIG.overview.position[2], 'Non-cinematic turn falls back to fast overview');
assert(dispatchNonCinematic.fov === CAMERA_CONFIG.overview.fov, 'Non-cinematic turn uses overview FOV');

// 5. Zero Broken Bindings Check
const repoRoot = process.cwd();
const canvasSrc = fs.readFileSync(path.join(repoRoot, 'src/client/game_canvas.tsx'), 'utf8');
const adaptiveCamSrc = fs.readFileSync(path.join(repoRoot, 'src/client/3d/adaptive_cinematic_camera.tsx'), 'utf8');
const stateMachineSrc = fs.readFileSync(path.join(repoRoot, 'src/client/3d/camera_state_machine.ts'), 'utf8');
const streetCamSrc = fs.readFileSync(path.join(repoRoot, 'src/client/3d/cinematic_chase_camera.ts'), 'utf8');

assert(canvasSrc.includes('AdaptiveCinematicCamera'), 'game_canvas.tsx mounts AdaptiveCinematicCamera');
assert(canvasSrc.includes('<AdaptiveCinematicCamera isPreMatch={true} />'), 'game_canvas.tsx mounts lobby camera');
assert(canvasSrc.includes('<AdaptiveCinematicCamera />'), 'game_canvas.tsx mounts game camera');
assert(adaptiveCamSrc.includes('shouldTriggerCinematicCamera'), 'adaptive_cinematic_camera.tsx imports shouldTriggerCinematicCamera');
assert(adaptiveCamSrc.includes('hasSkippedCurrentMoveRef'), 'adaptive_cinematic_camera.tsx implements Tap-to-Skip state latch');
assert(adaptiveCamSrc.includes('isSkippingCameraAnimRef'), 'adaptive_cinematic_camera.tsx implements skip trigger latch');
assert(stateMachineSrc.includes('calculateStreetChaseCameraState'), 'camera_state_machine.ts delegates to calculateStreetChaseCameraState');
assert(streetCamSrc.includes('calculateResponsiveStreetFov'), 'cinematic_chase_camera.ts exports responsive FOV calculator');

if (failedAssertions === 0) {
  console.log('\n✅ PROBE 1 PASSED: 100% Closed-Loop Parity verified with zero broken bindings.');
  process.exit(0);
} else {
  console.error(`\n❌ PROBE 1 FAILED: ${failedAssertions} assertions failed.`);
  process.exit(1);
}
