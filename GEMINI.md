# AGENTS CONSTITUTION (PROJECT HARNESS)

> Precedence: This project harness specializes Global AG OS Rules. Project rules strictly override global rules in case of conflict.
> Target Market: Viet Nam. All user-facing documents and game artifacts must be in Vietnamese.

## 1. BẢNG CỔNG GÁC CƠ HỌC BẮT BUỘC (MANDATORY MECHANICAL GATES)
Mọi ticket phải vượt qua 100% các script chốt chặn tự động trước khi bàn giao:
1. **Kiểm tra & Ký duyệt Plan tự động**: `node scripts/audit_plan.mjs <plan_path> [--auto-sign]`
2. **Kiểm tra không sửa ngoài phạm vi Plan**: `node scripts/check_scope.mjs [plan_path]`
3. **Kiểm tra Fast Pre-Filter (Type, LOC, Linters, Assert Density)**: `npm run prefilter -- <files>`
4. **Kiểm tra Live Socket Port 0 & Mutation**: `npm run sentinel -- --ticket <id> --test <test_path>`
5. **Kiểm toán Bằng chứng vật lý toàn diện**: `node scripts/check_evidence.mjs <ticket>`

## 2. CHEATSHEET LUẬT THÉP (NEGATIVE CONSTRAINTS - VI PHẠM LÀ EXIT 1)
- **Zero Dirty Casts**: CẤM `as any`, `as unknown as T` trên toàn bộ codebase (`src/**` và `tests/**`).
- **Anti-TIDD**: CẤM thêm export, prop, method chỉ phục vụ test (`ForTesting`). Mọi export mới trong `src/**` phải có consumer ngoài `tests/**`.
- **Seam Discipline**: Giao diện là ranh giới kiểm thử. CẤM monkey-patch framework (`spyOn(React)`, `__CLIENT_INTERNALS_*`, `Object.prototype`).
- **LOC Ceilings**: Tier 1 (Domain/FSM/Server) <= 400 LOC; Tier 2 (UI/3D/Views) <= 500 LOC; Tier 3 (Static Config) <= 800 LOC; Living Tests <= 600 LOC. Measure qua `npm run check:loc`. Cấm code-golfing.
- **Assertion Density**: Mỗi atomic test case tối đa 1-4 asserts (`expect`). CẤM dùng loop (`for`, `forEach`) trong `it()`.
- **Fast & Deterministic Testing**: Dùng seeded PRNG, zero-delay sockets, fake timers. CẤM unseeded `Math.random()` và sleep tùy tiện (>= 3000ms).
- **Non-Interactive CLI Guard**: CẤM chạy `npx <pkg>` trần không có `--yes` trong subshell ngầm (tránh prompt interactive treo vô hạn). CẤM inline multiline code trong PowerShell `-e "..."`.
- **Client/Server Boundary**: CẤM import runtime built-ins (`node:*`, ws) vào client/browser bundles. Sockets dùng dynamic live `port: 0`.
- **Pure-Move Quarantine**: Refactor ticket phải bảo toàn 100% hành vi, cấm sửa đổi ngữ nghĩa, cấm swallow error (`try...catch`).
- **Poka-Yoke UI Affordance**: Nút bấm UI enabled/disabled và giá hiển thị PHẢI lấy trực tiếp từ Domain Validators (`canDo`, `evaluation`), cấm tính lại độc lập.
- **i18n Exhaustiveness**: Mọi mã `ActionRejectReason` phải có mapping 100% trong `src/domain/i18n/vi.ts` typed `Record<ActionRejectReason, string>`.

## 3. QUY TRÌNH TINH GỌN (LEAN PIPELINE)
- **Tier 1 (Fast-Track)**: < 50 LOC, visual/CSS/spacing, text, isolated fix (0 Schema, 0 FSM, 0 Net). Main Agent thực thi trực tiếp 1-2 phút, 0 subagents, 0 plan.
- **Micro-Slice (<= 50 LOC, 1 phân hệ)**:
  1. Soạn Lean Plan: `.agents/plans/PLAN_[ID].md` (<= 200 dòng, 0 code-dump).
  2. Máy duyệt Plan: `node scripts/audit_plan.mjs <plan> --auto-sign` (0 defects tự ký `HARDENED_APPROVED`).
  3. Cổng Human Gate: User gõ "đồng ý".
  4. Trạm 1 (RED): `qa-tester` viết contract test trong `tests/**` (Adversarial Inversion: fail vì runtime assertions).
  5. Trạm 2 (GREEN): `implementer` viết code tối thiểu trong `src/**`.
  6. Chốt chặn cơ học: Chạy `npm run prefilter -- <files>` và `npm run check:scope`.
  7. Nghiệm thu & Xuất Audit Reports: Main Agent trực tiếp xuất bản các báo cáo kiểm toán vật lý vào `.agents/audit/SPEC_REVIEW_[ID].md` và `.agents/audit/CODE_REVIEW_[ID].md` (theo chuẩn cấu trúc hệ thống, 0 subagents), chụp Dual-Viewport (nếu đụng UI) và bàn giao cho User.
- **Epic / Feature Lớn (> 50 LOC, > 2-3 files)**:
  - Bắt buộc chạy **Auto-Slicing Protocol** xuất Micro-Slices Roadmap (< 10 dòng) trước khi lập plan.
  - Bắt buộc có 1 vòng phản biện thù địch (`adversarial-challenger`) vào `.agents/audit/PLAN_CHALLENGE_[TICKET].md` để chặn đứng lỗ hổng game design/kinh tế.

## 4. BẤT BIẾN NGHIỆP VỤ SSOT (docs/domain/gotchas/)
Tra cứu pillar tương ứng trước khi lập plan hoặc sửa code:
- FSM & Vòng chơi: [`fsm_lifecycle.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/fsm_lifecycle.md)
- Kinh tế & Kho bạc: [`economy_treasury.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/economy_treasury.md)
- Bot AI đàm phán: [`bot_negotiation.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/bot_negotiation.md)
- Mạng & Live Sockets: [`network_delta.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/network_delta.md)
- Giao diện UI & Touch: [`ui_ergonomics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/ui_ergonomics.md)
- Đồ họa 3D & Di động: [`3d_cinematics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/3d_cinematics.md)
- Kỹ thuật kiểm thử: [`testing_traps.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/testing_traps.md)
- Thiết kế Module sâu: [`deep_modules.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/deep_modules.md)
