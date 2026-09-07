# Handoff -- VTCoOn Slice 00 APPROVED, chuan bi Slice 01
Thoi diem: 2026-09-07T21:01 +07:00

## 1. Trang Thai: Slice 00 APPROVED -- READY TO COMMIT

- 22/22 tests XANH sau kiet toan 6 loi audit
- Bao cao: docs/reports/audits/GAME-S00_acceptance_report.md
- Epic Ledger: _epic_ledger.md Slice 00 -> Done (2026-09-07)
- Nguoi dung CHUA commit -- AI khong chay git

## 2. Nhiem Vu Ngay Khi Bat Dau Phien Moi

1. Xac nhan nguoi dung da commit Slice 00.
2. Doc hoac tao ticket Slice 01 theo mau GAME-S00.
3. Thi cong Slice 01: Ping-Pong TDD, Workspace inherit.

## 3. Kien Truc Slice 00 (Da Ket Thuc)

  src/domain/board_config.ts     64L  CellType, BoardCell, BOARD_CONFIG[40]
  src/server/session_manager.ts  73L  SessionManager, SessionState x3, DeltaPayload
  src/client/game_canvas.tsx     41L  cellPosition(), GameCanvas (R3F)
  tests/: 6 files, 22 tests
  HEARTBEAT_INTERVAL_MS=5000  GRACE_PERIOD_MS=60000
  SessionState: Connected | GracePeriod | Disconnected (gan truoc delete)

## 4. Slice 01 -- Thong Tin Can Biet

  Ten: San Dau & Vong Lap Luot Choi Co Ban
  UCs: UC-GAME-001 den UC-GAME-019
  TC-01.1: Tao phong -> ma 6 ky tu, gia nhap thanh cong
  TC-01.2: FSM dem nguoc 60s, auto-skip qua han
  TC-01.3: 2D6, di chuyen, 3 doi lien tiep -> Tram Kiem Toan
  TC-01.4: Qua GO -> cong 2.000 Tr. VND, tru thue luy tien
  LOC Budget: moi file < 400 dong
  Precondition: Slice 00 Done (dat roi)

## 5. Rang Buoc Bat Bien

  Terminal: cmd /c, chain bang ;. Khong dung bash.
  AI khong chay git. Nguoi dung tu commit.
  TypeScript strict + noUncheckedIndexedAccess.
  Max 400 LOC/file, ham <= 30 dong, CC <= 5.
  Ping-Pong TDD: QA (chi tests/) -> Impl (chi src/) -> Inversion Gate.
  Workspace: inherit cho Slice 01.

## 6. Ky Nang De Xuat Phien Ke Tiep

  tdd, atdd-quality-gates, de-sloppify, writing-plans,
  use-case-slicing, domain-modeling, vertical-slice-completeness

## 7. Gotcha Da Hoc

  R3F khong test duoc trong Node: chi test pure fn (cellPosition).
  Integration test PASS ngay: binh thuong khi module da co san.
  ws/types/ws: xoa neu chua dung, them lai khi WebSocket that can.
  Dead enum: phai duoc gan truoc delete de khong vi pham Slop #1.
  Code review song song 2 reviewer: spec + code reviewer hieu qua nhat.
  Ghi file markdown ra project: dung PowerShell script (.ps1) rieng.

