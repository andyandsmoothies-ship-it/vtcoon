# IMP-156 — Pre-Public Security & Resilience Hardening Report

**Ngày hoàn thành**: 2026-09-21
**Kết quả**: ✅ 14 file production + 1 file test đã sửa | Build pass | 5738 tests pass

## Tóm Tắt Thực Hiện

### Trụ 1: Admin Secret (CRITICAL → RESOLVED)
- Xóa `DEFAULT_ADMIN_SECRET = 'vtcoon-admin-2026'` khỏi `admin_types.ts`
- `AdminManager` constructor: Production throw nếu thiếu env, dev warn + admin panel disabled
- `authenticate()` trả `false` ngay khi secret rỗng
- Client: `DEFAULT_SECRET = ''`, placeholder `"Nhập mã admin..."`
- `docker-compose.yml`: thêm `VTCOON_ADMIN_SECRET=${VTCOON_ADMIN_SECRET}`
- `.dockerignore`: thêm `.env` + `.env.*`
- `.env.example`: template đầy đủ

### Trụ 2: WebSocket Defense (CRITICAL → RESOLVED)
- `maxPayload: 64 * 1024` trên WebSocketServer constructor
- `verifyClient`: check `ALLOWED_ORIGINS` env (chỉ khi production + env đã set)
- `EnvelopeValidator`: byte pre-check 64KB trước `JSON.parse`
- **Lưu ý**: Cloudflare quick tunnel tạo domain ngẫu nhiên → chưa thể whitelist Origin tĩnh. User quyết định giữ nguyên, publish qua render.com

### Trụ 3: Socket Identity (CRITICAL → RESOLVED)
- Phương án **Hybrid**: `isSocketOwner()` helper kiểm tra socket ownership
  - `boundSocket === socket` → cho phép
  - `boundSocket === undefined` → cho phép + bind
  - `boundSocket.readyState !== OPEN` → cho phép (tab refresh tự nhiên)
  - `boundSocket.readyState === OPEN && !== socket` → **reject** (impersonation)
- Áp dụng cho: `handleIntentMsg`, `handleStartGame`, `handleLeaveRoom`, `handleEmote`, `handleResync`
- Security log: `SECURITY_IMPERSONATION_ATTEMPT` trên intent handler

### Trụ 4: HTTP Security (CRITICAL → RESOLVED)
- Path traversal: `path.resolve` + `startsWith(resolvedStatic + path.sep)` + `decodeURIComponent` try/catch
- Windows edge case: `path.normalize('/')` → `\` → strip leading separators trước resolve
- 3 security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- Thêm vào cả `health_check.ts` (Node.js) và `nginx.conf` (proxy)
- CSP deferred — cần audit React + R3F inline styles riêng

### Trụ 5: Memory & Room Flooding (CRITICAL + HIGH → RESOLVED)
- Room cap: `getRoomCount() >= MAX_CONCURRENT_ROOMS` (env, default 50) tại `handleCreateRoom`
- `PendingTradeManager`: thêm `this.sessionsByOfferId.delete(session.offerId)` vào `resolveSession`, `cancelSession`, `checkTimeout`

## Sự Cố & Khắc Phục

1. **TS2345 health_check.ts:62** — `string | undefined` do `noUncheckedIndexedAccess`. Fix: `?? '/'` fallback
2. **12 test failures** — 3 file test cần update:
   - `admin_portal.test.ts`: 10 chỗ dùng hardcoded old secret → `TEST_ADMIN_SECRET`
   - `ops04_deployment.test.ts` + `imp139_single_port_server.test.ts`: path traversal check 403 trên Windows do `path.resolve(staticDir, '\\')` → drive root. Fix: strip leading separators

## Checklist Sau Deploy
- [ ] Set `VTCOON_ADMIN_SECRET` trong .env production
- [ ] Thu hồi Ngrok token cũ (đã nằm trong .env trên đĩa)
- [ ] Fix tên biến `ops_runbook.md` (`ADMIN_SECRET` → `VTCOON_ADMIN_SECRET`)
