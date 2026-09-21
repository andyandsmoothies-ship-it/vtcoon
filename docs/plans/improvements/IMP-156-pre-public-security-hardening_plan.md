# IMP-156 — Pre-Public Security & Resilience Hardening

**Ngày lập**: 2026-09-21
**Trụ cột**: Bảo mật Admin, Phòng vệ WebSocket, Xác thực Socket Identity, HTTP Security, Memory Leak

## Phạm Vi

Rà soát an ninh toàn diện 5 trụ cột trên mã nguồn thực tế trước khi publish public:

1. **Admin Secret** (IMP-156.1): Triệt `DEFAULT_ADMIN_SECRET`, production throw, dev disabled
2. **WebSocket Defense** (IMP-156.2): maxPayload 64KB, verifyClient origin check, byte pre-check
3. **Socket Identity** (IMP-156.3): Hybrid ownership check — reject impersonation khi socket cũ còn OPEN
4. **HTTP Security** (IMP-156.4): Path traversal fix, 3 security headers (health_check + nginx)
5. **Memory & Room Flooding** (IMP-156.5): Room cap 50, PendingTradeManager `sessionsByOfferId` leak fix

## Phương Pháp

- Audit 19 kiểm tra → 6 PASS · 2 Partial · 11 FAIL (5 CRITICAL)
- Trade-off analysis 5 chiều cho mỗi finding trước khi implement
- User phê duyệt: Phương án C (Hybrid Socket Identity), 64KB maxPayload, 50 room cap
- 3 batch song song qua subagents, mỗi batch xử lý nhóm file độc lập

## Files Thay Đổi

| File | Thay đổi |
|---|---|
| `src/server/network/wss_intent_handler.ts` | Socket identity check + `sockets` in IntentHandlerDeps |
| `src/server/network/wss_lobby_handlers.ts` | `isSocketOwner()` helper + guards 4 handlers + room cap |
| `src/server/network/wss_server.ts` | maxPayload 64KB + verifyClient |
| `src/server/network/admin_types.ts` | Xóa DEFAULT_ADMIN_SECRET |
| `src/server/network/admin_manager.ts` | Production throw + dev warn + empty secret auth disabled |
| `src/server/health_check.ts` | Path traversal fix + 3 security headers |
| `nginx/nginx.conf` | 3 security headers ở http block |
| `src/server/pending_trade_manager.ts` | Fix sessionsByOfferId leak (3 methods) |
| `src/server/security/envelope_validator.ts` | 64KB byte pre-check |
| `src/client/ui/admin/use_admin_portal.ts` | DEFAULT_SECRET = '' |
| `src/client/ui/admin/admin_lock_screen.tsx` | Placeholder update |
| `docker-compose.yml` | VTCOON_ADMIN_SECRET env |
| `.dockerignore` | .env exclusion |
| `.env.example` | New template file |
| `tests/server/admin_portal.test.ts` | TEST_ADMIN_SECRET thay hardcoded secret |

## Xác Minh

- `npx tsc --noEmit` → exit 0
- `npx vitest run` → 5738 passed, 0 failed (280 test files)
