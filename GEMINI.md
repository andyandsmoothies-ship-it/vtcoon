# AGENTS CONSTITUTION (PROJECT HARNESS)
Any documents, artifacts of this project must be in Vietnamese. This project is for Viet Nam market.
## 1. HARD CONSTRAINTS
- **Terminal Execution**: Use Windows Command Prompt (`cmd /c`) with `;` for command chaining.
- **File Operation Tooling**: ALWAYS use native `write_to_file` or `replace_file_content` to create or modify code files. NEVER use terminal shell commands (`echo`, `type`, `cat`, PowerShell `here-string @"..."@`, or redirect `>`) to write code, avoiding syntax errors from escaped backticks/quotes and incorrect UTF-16 encoding.
- **Source Control Safety**: AI NEVER executes `git commit` or `git push`. Only the human user controls git commands.
- **Atomic Edits**: Before multi-file overwrite, verify target chunk match count to prevent incomplete edits.
- **Context Offloading**: Never dump raw verbose logs or large diffs into prompts. Run local scripts to summarize results to <10 lines.
- **Visual UI/UX Governance**: Strictly follow `docs/domain/design.md`. Prompts contain only lean token schemas (<40 lines). Heavy theme styles reside in the local environment.
- **Least New Structure (Anti-Slop)**: Add the minimum new structure to meet requirements. Zero single-use abstractions (YAGNI), zero speculative extensions, zero redundant dependencies.
- **Complexity Limits**: Enforce the 5-Tier Classification: Logic/FSM <= 400 LOC (trigger extraction warning at 300 LOC); UI Components <= 500 LOC; Static Data/Lookup Tables <= 800 LOC; Cyclomatic Complexity <= 5, max 30 LOC/function. Strictly FORBIDDEN to use "code golf", strip blank lines, delete comments, or create fake No-Op stubs to evade limits. Never invent or enforce ad-hoc per-file micro-budgets (e.g., "max +50 LOC", "max 150 LOC") in tickets or prompts. Files under 300 LOC must remain intact and must NEVER be split into premature extension/helper files (e.g., `*_ext.ts`); modular decomposition is only permitted and required when reaching 300-400 LOC.
- **Slice Scope Confinement**: Implement only the flows defined in the current ticket (Slice 1 implements Main Success Scenario only). When deferring Alternative flows (A#), MANDATORY to register them in the Tech Debt Ledger inside the epic ledger with the receiving target slice.
- **Test State Isolation**: Zero order-dependent tests. Run test suites with `--randomize`. Isolate test state and use Fixture/Schema Contract Tests to reconcile 100% of static data against SSOT.
- **Zero-Polling & Background Harness**: Never execute in-loop polling (`sleep`/`while`). Offload long tasks (>10s) to background processes. Terminate processes hanging over 60s without output.
- **SSOT & Player Intent Integrity**: All player business decisions (buy property, upgrade, trade) must be explicit Intent/Action transitions per ADR-0001. Never execute player choices as implicit side-effects of pawn movement.
- **Subagent Artifact Persistence (Dual Output Pattern)**: Authoring subagents (planners, slicers) creating large artifacts (`docs/plans/`, `issues/`) MUST write directly to disk files using `write_to_file` in `Workspace: "inherit"` and return only a concise summary (<20 lines) with clickable file links. Read-only reviewers (`spec-reviewer`, `code-reviewer`, `game-3d-visual-critic`) remain strictly read-only and report 1-page structured packets directly into chat.
- **Lean Runtime Observability**: Zero silent error swallowing (empty `catch` forbidden). All domain state transitions (FSM, transactions) must emit structured logs (`{ event, correlationId, timestamp, delta }`). Rejection of player actions must return an explicit Reason Code.
- **Vertical Slice Completeness & Closed-Loop Testing**: Any new state field on `Player` or `PropertyState` (such as `bankrupt`, `isMortgaged`) must be mapped simultaneously to `DeltaPayload` (`CellDelta` / `PlayerDelta`). Strictly forbid test mirroring (Bug-Codification); every emitted event card or modifier (Producer) must have a test proving that the beneficiary or paying consumer changes actual cash flow.
- **3D Visual Quality Gate (Visionary Art Audit)**: Khi người dùng yêu cầu hoặc tại các mốc nghiệm thu mỹ thuật quan trọng (`src/client/3d/`, `docs/domain/design.md`, R3F Canvas), triệu hồi Subagent chuyên gia độc lập `game-3d-visual-critic` để phản biện không khoan nhượng qua 5 góc chụp thực tế. Art Director tập trung vào 4 tầng thẩm mỹ (Bầu không khí, Cảm giác xúc giác sa bàn, Linh hồn đô thị, UX), tuyệt đối bài trừ lạm phát điểm số và bắt buộc đưa ra các định hướng đột phá vượt mong đợi (Wow-factor) sánh ngang game thương mại quốc tế.
- **2D UI Craft Quality Gate (Impeccable Audit)**: Mọi thay đổi UI 2D (`src/client/ui/`, modals, HUD) phải vượt qua `npm run lint:ui` với 0 vi phạm (4 anti-patterns: `border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`) và được thẩm định bởi Subagent chuyên gia độc lập `ui-craft-reviewer` với phán quyết `ship` hoặc `fix` không có lỗi chặn.
- **Visual Ground Truth Anchor (Mỏ Neo Chuẩn Thị Giác Retropoly)**: Mọi đợt nghiệm thu đồ họa 3D và UI bắt buộc đối chiếu ảnh render thực tế song song với ảnh tham chiếu chuẩn thương mại Retropoly (`media_1789200902293.jpg`). Tuyệt đối cấm nghiệm thu bằng checklist kỹ thuật thuần túy hoặc từ ngữ hoa mỹ chủ quan ("hoàng gia", "tinh xảo", "ma mị") khi mắt người nhìn vào thấy lệch pha đẳng cấp.
- **Rule "Kill The Premise" (Quy Tắc 2 Lần Sửa)**: Nếu một màn hình hoặc tính năng đã trải qua 2 lát cắt sửa vi mô (2 micro-fix slices) mà điểm thị giác vẫn không đạt bước nhảy vọt so với reference, TUYỆT ĐỐI CẤM thực hiện đợt sửa thứ 3 theo hướng cũ. Bắt buộc kích hoạt Architectural Premise Challenge để lật lại và xóa bỏ tiền đề bối cảnh sai lầm.
- **Single Cohesive World Invariant (Bất Biến Một Thế Giới Đồng Nhất)**: Toàn bộ vòng đời game (Sảnh Chờ, Trong Trận Đấu, Sàn Đấu Giá) bắt buộc thuộc về CÙNG MỘT THẾ GIỚI MỸ THUẬT: Sa bàn Đảo Vịnh Nhiệt Đới ngập tràn ánh nắng ngoài trời, biển xanh ngọc bích, bãi cát vàng và đô thị đồ chơi sống động. Cấm tuyệt đối tạo ra các "phòng họp kín tối tăm" lệch pha với thế giới chính.
- **Anti-Programmer-Art Primitive Ban (Lệnh Cấm Khối Hình Học Trần Trụi)**: Cấm ghép các khối hình học cơ bản (`boxGeometry`, `cylinderGeometry`) trần trụi trong không gian tối để giả lập cảnh quan game. Bắt buộc dùng ánh sáng tự nhiên ngoài trời (Outdoor Sunlight), bảng màu bão hòa nhiệt đới (Stylized Palette), và ngôn ngữ bo viền xúc giác đồ chơi (Toy-like Miniature Diorama).
- **Continuous Improvement & Ad-hoc Persistence (Quy Chuẩn Lưu Trữ Cải Tiến Đột Xuất)**: Mọi đợt tinh chỉnh, sửa lỗi hệ thống (Systemic Fix), nâng cấp trí thông minh Bot AI hoặc tối ưu trải nghiệm (Juice/VFX) phát sinh ngoài các Epic cơ sở TUYỆT ĐỐI KHÔNG chỉ lưu trong bộ nhớ tạm phiên (Session Artifacts / Chat). BẮT BUỘC phải lập kế hoạch tại `docs/plans/improvements/IMP-[ID]-[slug]_plan.md` và lập báo cáo nghiệm thu thực nghiệm tại `docs/reports/improvements/IMP-[ID]-[slug]_report.md`.

## 2. DEFINITION OF DONE
A task is COMPLETE only when:
1. Automated tests pass Adversarial Inversion (deliberate failure verification), carry traceability tags (`[UC-XXX/MSS]` or `[UC-XXX/A#]`), and ensure Fixture Contract Tests match 100% of the SSOT table.
2. Code passes 6 Slop Red Flags audit (least new structure, cyclomatic complexity <= 5, visual tokens compliance, zero code golf/no-op). Mọi thay đổi UI phải vượt qua `npm run lint:ui` với 0 Anti-patterns (`border-accent-on-rounded`, `bounce-easing`, `gray-on-color`, `gradient-text`).
3. Reviewer gates approve (`spec-reviewer` approves 100% Three-Way Spec Reconciliation against `docs/requirements.md` and checks for orphaned technical debt; `code-reviewer` approves code quality, architecture boundaries, and Lean Observability; `game-3d-visual-critic` approves 3D visual quality gate; `ui-craft-reviewer` approves 2D UI craft quality gate song song với cổng 3D khi có thay đổi giao diện 2D).
4. Progress is updated in `docs/epics/[epic]/_epic_ledger.md` (including Tech Debt Ledger if flows are deferred) and user commits changes to git.
5. Domain learnings (if any) are processed via Lean Retrospective Pyramid (Type > Shared Helper > `docs/domain/gotchas.md`).
6. Production Resilience verified: Defense against out-of-turn/invalid intents, global conservation invariant, and session drop/grace period handled safely.
7. Ad-hoc Improvements Documented: Mọi cải tiến đột xuất phải có kế hoạch tại `docs/plans/improvements/` và báo cáo nghiệm thu thực nghiệm tại `docs/reports/improvements/`, cập nhật ADR (nếu có thay đổi kiến trúc) và `docs/master_roadmap.md`.

## 3. PROJECT NFR BASELINE (VTCOON 3D BOARD GAME)
- **Game Engine & FSM**: Server-authoritative state transitions only. Deterministic PRNG seeded per game session. Turn action timeout <= 60s.
- **Rendering & UI**: 60 FPS target on React Three Fiber (R3F). Zero heavy computations or large JSON parsing on the main render thread.
- **Network / WebSocket**: State synchronization payload < 10KB per delta tick. Disconnection grace period 60s.
- **Code Quality**: TypeScript strict mode enabled (`strict: true`, `noUncheckedIndexedAccess: true`). Zero unnecessary manual null checks when the compiler guarantees safety.

## 4. INDEXED MEMORY POINTERS
When deep domain context is required, read the following index files:
- Project Requirements & Rules: [`docs/requirements.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/requirements.md)
- Entity Model & 28 Title Deeds: [`docs/domain/entity_model.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/entity_model.md)
- Visual Design System & Tokens: [`docs/domain/design.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md) hoặc [`DESIGN.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/DESIGN.md)
- Impeccable 2D Craft Skill & References: [`.agents/skills/impeccable/SKILL.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/SKILL.md)
- 2D Craft Reviewer Subagent: [`.agents/agents/ui-craft-reviewer.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/.agents/agents/ui-craft-reviewer.md)
- FSM Architecture Decision: [`docs/domain/adr/ADR-0001-fsm-architecture.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/adr/ADR-0001-fsm-architecture.md)
- 3D Rendering Architecture Decision: [`docs/domain/adr/ADR-0002-r3f-rendering.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/adr/ADR-0002-r3f-rendering.md)
- Architecture Decisions Ledger: `docs/domain/adr/`
- Active Epic Progress: `docs/epics/[epic]/_epic_ledger.md`
- Continuous Improvement Plans: `docs/plans/improvements/`
- Continuous Improvement Reports: `docs/reports/improvements/`
- Master Roadmap & Evolution Log: [`docs/master_roadmap.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/master_roadmap.md)
- Domain Gotchas & Edge Cases: [`docs/domain/gotchas.md`](file:///C:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md)
