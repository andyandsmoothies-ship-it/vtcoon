# IMP-66 - WSS Zero Cross-Talk E2E Test Plan

**Ngay lap ke hoach**: 2026-09-15  
**Trang thai**: PENDING APPROVAL

---

## 1. Muc tieu

Xay dung bo test E2E chung minh: Goi tin tu Phong A tuyet doi khong lot sang client cua Phong B tren duong truyen WebSocket thuc te (Zero Cross-Talk Invariant).

---

## 2. Hau ky hat so

| File | Test count | Status |
|---|---|---|
| tests/server/net01_wss.test.ts | 6 | Bat tay WS, tao/gia nhap phong |
| tests/server/net03_sync.test.ts | 9 | Delta sync, Intent Mutex, resync |
| tests/server/ops03_security.test.ts | 12 | Rate limit, anti-cheat, malformed |

Port dang dung: 3099 (net01), 3101 (net03), 3108 (ops03).  
Port moi danh cho IMP-66: **3105** (chua bi chiem).

---

## 3. Vi tri dat test

**File moi**: `tests/server/net05_zero_cross_talk.test.ts`  
**Ly do tach file moi**: net01_wss.test.ts da dat 225 LOC (gioi han 300 LOC). Them 4 test case se vuot nguong. IMP-66 la suite doc lap, logic khac biet.

---

## 4. Helper functions can them

### 4.1 collectForMs(socket, ms) - NEW
Khac voi collectMessages() reject khi timeout, ham nay resolve sau N ms voi tat ca packets nhan duoc (co the la mang rong). Day la ham nen tang do "zero leak".

```typescript
function collectForMs(socket: WebSocket, ms: number): Promise<WsServerMessage[]> {
  return new Promise((resolve) => {
    const msgs: WsServerMessage[] = [];
    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
    };
    socket.on('message', onMsg);
    setTimeout(() => {
      socket.off('message', onMsg);
      resolve(msgs);
    }, ms);
  });
}
```

### 4.2 setupRoom(server, hostId, guestId) - NEW
Helper ket hop: tao phong + join + start game + collect STATE_DELTA ban dau -> tra ve { roomCode, wsHost, wsGuest }.

---

## 5. Kich ban kiem dinh (4 test cases)

### [TC-NET05.1/MSS] Zero Cross-Talk - Room A broadcast khong loc sang Room B
- Mo A1, A2 vao Room A. Mo B1, B2 vao Room B.
- Bat dau game ca 2 phong.
- A1 gui INTENT_ROLL.
- Ky vong: A2 nhan STATE_DELTA (chung minh broadcast noi bo hoat dong).
- Ky vong: B1, B2 trong 500ms KHONG nhan bat ky packet nao tu Room A.
- Assert: `expect(leakedToB).toHaveLength(0)` <- ASSERTION COT LOI.

### [TC-NET05.2/MSS] Zero Cross-Talk - Room B broadcast khong loc sang Room A (dao nguoc)
- Tuong tu TC-NET05.1 nhung hanh dong xuat phat tu Room B.
- B1 gui INTENT_EMOTE.
- Ky vong: B2 nhan PLAYER_EMOTE.
- Ky vong: A1, A2 trong 500ms KHONG nhan bat ky packet nao tu Room B.
- Assert: `expect(leakedToA).toHaveLength(0)`.

### [TC-NET05.3/Adversarial] Concurrent Rooms - Promise.all tuong tranh khong gay cross-talk hay timeout
- Ca 2 phong gui INTENT dong thoi qua Promise.all.
- Ky vong: Ca Room A lan Room B deu nhan STATE_DELTA dung phong cua minh.
- Ky vong: 0 packet cheo phong trong ca 2 chieu.
- Assert per-room mutex hoat dong doc lap: khong phong nao bi block boi phong kia.

### [TC-NET05.4/Adversarial] Dong socket Room A - Room B tiep tuc nhan broadcast binh thuong
- Sau khi A1, A2 dong ket noi, B1 gui INTENT.
- Ky vong: B2 nhan STATE_DELTA binh thuong (Room B khong bi anh huong boi dong phong A).
- Assert: `expect(b2Delta?.type).toBe('STATE_DELTA')`.

---

## 6. Cac tep bi tac dong

| File | Hanh dong |
|---|---|
| tests/server/net05_zero_cross_talk.test.ts | [NEW] 4 test cases, <= 200 LOC |

Khong tac dong vao bat ky file src/ nao. Khong tac dong vao test files hien co.

---

## 7. Tieu chuan nghiem thu

1. `npx vitest run tests/server/net05_zero_cross_talk.test.ts` -> 4/4 PASS, thoi gian <= 3s
2. `npm run gate:quick` -> 0 TypeScript error, 0 linter error
3. `npm test` -> 177+1=178 files, 3044+>=15 tests PASS

---

## 8. Rui ro & phong thu

| Rui ro | Bien phap |
|---|---|
| Port conflict | Dung port 3105 doc lap, afterAll dong server |
| Socket leak | Dong tat ca sockets trong afterAll { for (const s of allSockets) s.close() } |
| Timer drift | collectForMs dung 500ms - du lon de bat goi tin ro ri, du nho cho CI/CD |
| Race condition | setupRoom doi STATE_DELTA truoc khi gui INTENT |
