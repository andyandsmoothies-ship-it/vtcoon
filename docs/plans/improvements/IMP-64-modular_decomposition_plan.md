# IMP-64 — Modular Decomposition: 5 Core Files LOC Budget

**Muc tieu**: Dua 5 tep cot loi vuot nguong ve nguong an toan bang cach boc tach mo-dun con.
**Nguyen tac**: ZERO LOGIC CHANGE - ZERO CODE GOLF - Facade re-export 100% public API cu.

---

## 1. HIEN TRANG & MUC TIEU LOC

| Tep | LOC Hien tai | Tran cho phep | Muc tieu sau phan ra | Rui ro |
|-----|-------------|--------------|---------------------|--------|
| src/server/network/wss_server.ts | 414 | 300 (Logic) | <= 280 | Slice-Bound |
| src/server/room_manager.ts | 402 | 300 (Logic) | <= 280 | Systemic |
| src/client/network/apply_delta.ts | 432 | 300 (Logic) | <= 250 | Isolated |
| src/client/main.tsx | 480 (App: 425) | 400 (UI) | App <= 150 | Slice-Bound |
| src/client/3d/auction_3d_stage.tsx | 497 | 400 (UI) | <= 250 | Isolated |

---

## 2. BLAST RADIUS AUDIT

### 2.1 wss_server.ts — Consumers
Public exports: WssServer (class), WssServerConfig (re-export)
Consumers: src/server/index.ts (production) + 17 test files.
Rui ro: Slice-Bound — WssServer la facade duy nhat.

### 2.2 room_manager.ts — Consumers
Public exports: RoomManager (class), RollResult (interface), AuctionSession (re-export), PlayerIntent (re-export)
Consumers: 50+ files (src/server/network/*, src/client/*, 40+ test files).
Rui ro: Systemic — core dependency nhat du an.

### 2.3 apply_delta.ts — Consumers
Public exports: applyDeltaToStore, isGameRunningDelta, applyPlayerDeltas, applyCellDeltas, applyPhaseAndTimerDeltas
Consumers: use_game_ws.ts, ws_message_handler.ts, 12 test files.

### 2.4 main.tsx — Consumers
Public exports: App, GameCanvas (lazy re-export)
Consumers: tests/client/ops02_bundle_perf.test.ts (import GameCanvas).
Note: App chi render noi bo, khong duoc import tu ben ngoai.

### 2.5 auction_3d_stage.tsx — Consumers
Public exports: Auction3DStage, generateAuctionDeedTexture (re-export), CARD_DIMENSIONS, AUCTION_COLORS,
THEATRICAL_LIGHTING_CONFIG, GoldParticle, Auction3DStageProps, AuctionAnimationRefs,
calculateTheatricalAmbientIntensity, calculateParallaxTilt, calculateUrgentAuraColor,
calculateCardSpringRecoil, createInitialParticles, updateParticles, useAuctionCardAnimation.
Consumers: tests/client/auction_3d_stage.test.ts, src/client/3d/time_of_day_lighting.tsx.

---

## 3. PHAN TICH & DUONG CAT MO-DUN

### 3.1 wss_server.ts (414 LOC -> <= 280 LOC)

Phan tich noi bo:
- constructor (L60-L138, ~78 LOC) — wiring sub-services
- Accessor getters (L140-L158, ~18 LOC) — 14 getter methods
- sendSafe / handleConnection / bindSocket / sendSessionInit (L159-L222, ~64 LOC)
- lobbyContext getter (L224-L239, ~16 LOC)
- route() (L241-L275, ~35 LOC)
- handleReconnect() (L277-L308, ~32 LOC)
- handleIntent() (L310-L338, ~29 LOC)
- syncRoomStateAfterIntent / scheduleBotTurn (L340-L353, ~14 LOC)
- broadcastGameOver / closeRoom (L355-L391, ~37 LOC)
- broadcast / close (L393-L413, ~21 LOC)

Duong cat:
- Tach wss_connection_handler.ts (tep moi): handleConnection, bindSocket, sendSessionInit — ~50 LOC
- Tach wss_intent_handler.ts (tep moi): handleIntent, handleReconnect, syncRoomStateAfterIntent — ~80 LOC
- File goc giu lai: constructor + getters + route + broadcastGameOver + closeRoom + broadcast + close -> ~280 LOC

Tep can tao moi:
- src/server/network/wss_connection_handler.ts (~50 LOC)
- src/server/network/wss_intent_handler.ts (~80 LOC)

### 3.2 room_manager.ts (402 LOC -> <= 280 LOC)

Phan tich noi bo:
- Fields + constructor (L46-L72, ~58 LOC)
- Room lifecycle (L74-L135, ~62 LOC): createRoom, joinRoom, startGame, addBot/removeBot, setBotPersonality/getBotPersonality
- Turn action handlers (L137-L265, ~130 LOC): handleTurnStart, handleBailOut, handleRollDice, handleBuyProperty, handleDecline, handleAuction*, handleUpgrade*, handleHose*, handlePlayerIntent, handle(Mortgage/Redeem/Downgrade/Liquidate/Trade/Bankruptcy), handleEndTurn
- Bot delegation (L284-L296, ~13 LOC): resolveAuctionBots, runBotTurn, stepBotTurn
- Query methods (L298-L337, ~40 LOC): getRoom, getRegistry, getPropertyStates, auctionsMap, getPropertyOwner, getPropertyState, getPropertyRent, getRankings, createDelta
- Timer management (L339-L355, ~17 LOC): registerTimer, clearRoomTimers, getActiveTimers
- Room management (L357-L401, ~45 LOC): touchActivity, getLastActivity, getAllRoomCodes, getRoomCount, hasRoom, onCloseRoom, closeRoom

Duong cat (refactor noi bo - RoomManager van la class duy nhat):
- Tach room_manager_queries.ts: standalone pure functions calcPropertyRent, calcRankings, buildDelta — ~60 LOC
- Tach room_manager_lifecycle.ts: lifecycle pure functions doCloseRoom, doTouchActivity, timer ops — ~75 LOC
- RoomManager goi cac ham nay thay vi inline. Public API KHONG THAY DOI.

Tep can tao moi:
- src/server/room_manager_queries.ts (~60 LOC)
- src/server/room_manager_lifecycle.ts (~75 LOC)

### 3.3 apply_delta.ts (432 LOC -> <= 140 LOC)

Phan tich noi bo:
- isGameRunningDelta (L17-L24, ~8 LOC) — export
- Player section (L26-L184, ~159 LOC): 12 private helpers + applyPlayerDeltas export
- Cell section (L186-L318, ~133 LOC): 9 private helpers + applyCellDeltas export
- Phase/Timer section (L320-L432, ~113 LOC): 9 private helpers + applyPhaseAndTimerDeltas + applyDeltaToStore exports

Duong cat tu nhien (3 sections da tach biet hoan toan):
- Tach apply_delta_players.ts: player section hoan toan — ~160 LOC
- Tach apply_delta_cells.ts: cell section hoan toan — ~133 LOC
- File goc chi giu: imports + phase/timer section + re-export applyPlayerDeltas va applyCellDeltas + applyDeltaToStore -> ~140 LOC

Facade Strategy: apply_delta.ts re-export applyPlayerDeltas va applyCellDeltas tu tep con. Zero thay doi cho consumers.

Tep can tao moi:
- src/client/network/apply_delta_players.ts (~160 LOC)
- src/client/network/apply_delta_cells.ts (~133 LOC)

### 3.4 main.tsx (480 LOC -> <= 130 LOC)

Phan tich noi bo:
- Module-level setup (L1-L41, ~41 LOC): imports, GameCanvas lazy, store globals
- App component (L43-L468, ~425 LOC):
  - Admin routing (L44-L58, ~15 LOC)
  - Store selectors (L60-L89, ~30 LOC)
  - State/Refs (L68-L73)
  - effectivePlayers memo (L91-L125, ~35 LOC)
  - handleError callback (L127-L153, ~27 LOC)
  - handleDelta callback (L162-L186, ~25 LOC)
  - WS event callbacks (L203-L240): handleRoomStarted, handleReconnected, handleGameOver, handleEmote, handleSessionInit
  - useGameWs hook call (L242-L255)
  - AudioEngine init effect (L257-L264)
  - gameInitialized sync effect (L266-L309, ~44 LOC)
  - turn timer effect (L312-L318)
  - handleRollDice/EndTurn callbacks (L320-L338)
  - AFK timer effect (L342-L355)
  - handleSendEmote/LeaveRoom callbacks (L357-L408)
  - JSX render (L410-L467, ~58 LOC)
- ReactDOM.createRoot (L470-L479)

Duong cat toi uu:
- Tach use_app_session.ts (custom hook): WS event handlers + useGameWs call + AudioEngine init + game session sync effect + landedPawn effect -> ~230 LOC
- Tach use_app_turn_controls.ts (custom hook): handleRollDice, handleEndTurn, AFK timer, handleSendEmote, handleLeaveRoom -> ~90 LOC
- File goc main.tsx chi giu: admin routing + store selectors + effectivePlayers + hook calls + JSX render + ReactDOM.createRoot -> ~130 LOC

Facade Strategy: GameCanvas van export tu main.tsx. App khong duoc import tu ngoai. Zero breaking change.

Tep can tao moi:
- src/client/network/use_app_session.ts (~230 LOC)
- src/client/network/use_app_turn_controls.ts (~90 LOC)

### 3.5 auction_3d_stage.tsx (497 LOC -> <= 220 LOC)

Phan tich noi bo:
- Constants + Types (L16-L70, ~55 LOC): CARD_DIMENSIONS, AUCTION_COLORS, THEATRICAL_LIGHTING_CONFIG, GoldParticle
- Pure math functions (L72-L187, ~116 LOC): calculateTheatricalAmbientIntensity, calculateParallaxTilt, calculateUrgentAuraColor, calculateCardSpringRecoil, createInitialParticles, updateParticles
- Interfaces + Hook (L189-L258, ~70 LOC): Auction3DStageProps, AuctionAnimationRefs, useAuctionCardAnimation hook
- Auction3DStage component (L260-L497, ~237 LOC): data extraction + memos + refs + effects + JSX

Duong cat tu nhien:
- Tach auction_particle_engine.ts (pure TS, khong JSX): constants + types + 6 pure math functions -> ~120 LOC
- Tach use_auction_card_animation.ts (custom hook): useAuctionCardAnimation + AuctionAnimationRefs interface -> ~70 LOC
- File goc chi giu: Auction3DStage component + imports + re-exports -> ~220 LOC

Facade Strategy: auction_3d_stage.tsx re-export toan bo tu 2 tep con. tests/client/auction_3d_stage.test.ts va time_of_day_lighting.tsx khong thay doi bat ky import nao.

Tep can tao moi:
- src/client/3d/auction_particle_engine.ts (~120 LOC)
- src/client/3d/use_auction_card_animation.ts (~70 LOC)

---

## 4. CHIEN LUOC 4 SLICE DOC LAP

Slice 1: Server Core
  room_manager.ts -> room_manager_queries.ts + room_manager_lifecycle.ts
  wss_server.ts   -> wss_connection_handler.ts + wss_intent_handler.ts
  Kiem chung: npm test + npm run test:chaos (1000 van)

Slice 2: Client Network Delta
  apply_delta.ts -> apply_delta_players.ts + apply_delta_cells.ts
  Kiem chung: npx vitest run tests/contracts/imp57_economy_and_card_clarity.test.ts tests/contracts/imp63_lean_tabletop_hud_and_perf.test.ts

Slice 3: Client App Lifecycle
  main.tsx -> use_app_session.ts + use_app_turn_controls.ts
  Kiem chung: npm run build + npm run lint:ui

Slice 4: 3D Visual Arena
  auction_3d_stage.tsx -> auction_particle_engine.ts + use_auction_card_animation.ts
  Kiem chung: npm run build

---

## 5. DANH SACH TAT CA TEP MOI DU KIEN (10 tep moi)

Slice 1 - Server Core:
  src/server/room_manager_queries.ts (~60 LOC) — Pure read functions: getPropertyRent, getRankings, createDelta
  src/server/room_manager_lifecycle.ts (~75 LOC) — Pure lifecycle functions: closeRoom, timers, activity tracking
  src/server/network/wss_connection_handler.ts (~50 LOC) — Socket binding, session init, connection/close events
  src/server/network/wss_intent_handler.ts (~80 LOC) — INTENT va RECONNECT message processing

Slice 2 - Client Network Delta:
  src/client/network/apply_delta_players.ts (~160 LOC) — Sync player positions, balances, HUD info
  src/client/network/apply_delta_cells.ts (~133 LOC) — Sync cell ownership, levels, mortgage flags

Slice 3 - Client App Lifecycle:
  src/client/network/use_app_session.ts (~230 LOC) — WS events, game session initialization, delta handling
  src/client/network/use_app_turn_controls.ts (~90 LOC) — Roll, EndTurn, AFK timer, Emote, LeaveRoom

Slice 4 - 3D Visual Arena:
  src/client/3d/auction_particle_engine.ts (~120 LOC) — Constants, types, pure math & particle functions
  src/client/3d/use_auction_card_animation.ts (~70 LOC) — useFrame animation hook for auction card

Tong: 10 tep moi, ~848 LOC moi.

---

## 6. LOC SAU PHAN RA (UOC TINH)

| Tep goc | LOC Hien tai | LOC Sau phan ra | Trang thai |
|---------|-------------|----------------|----------|
| wss_server.ts | 414 | ~280 | An toan |
| room_manager.ts | 402 | ~280 | An toan |
| apply_delta.ts | 432 | ~140 | An toan |
| main.tsx | 480 | ~130 | An toan |
| auction_3d_stage.tsx | 497 | ~220 | An toan |

---

## 7. RANG BUOC THUC THI

1. ZERO BREAKING CHANGE: Facade re-export 100% public API cu — consumers khong thay doi bat ky dong import nao.
2. ZERO LOGIC CHANGE: Chuyen code nguyen ven, khong sua thuat toan, khong rename bien, khong xoa comment.
3. ZERO CODE GOLF: Khong gop dong, khong tao stubs, khong xoa blank lines.
4. ATOMIC EDIT: Moi tep con duoc tao hoan chinh truoc khi tham chieu tu tep goc.

---

## 8. BO LENH KIEM CHUNG

  Slice 1: npm test && npm run test:chaos
  Slice 2: npx vitest run tests/contracts/imp57_economy_and_card_clarity.test.ts tests/contracts/imp63_lean_tabletop_hud_and_perf.test.ts
  Slice 3: npm run build && npm run lint:ui
  Slice 4: npm run build
  Final Gate: npm run gate:quick && npm run build && npm run test:chaos

---

## 9. TECH DEBT LEDGER

  DEBT-64-01: handleError trong App co nhieu reasonCode string literals — nen dung enum. Target: IMP-65
  DEBT-64-02: room_manager.ts co inline comment tieng Anh/Viet lan lon — chuan hoa. Target: IMP-65
  DEBT-64-03: auction_3d_stage.tsx dung Math.random() — nen dung PRNG seeded nhat quan. Target: IMP-66

---

Tao boi: Antigravity Senior System Architect — 2026-09-15
Trang thai: PENDING USER APPROVAL
