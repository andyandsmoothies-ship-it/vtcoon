# RULE-BUG LEDGER (SỔ CÁI KIỂM TOÁN QUY TẮC & TRUY VẾT LỖI THỰC TẾ)

> **Mục tiêu:** Quản trị siêu dữ liệu quy tắc (Meta-Engineering & Prompt Governance).  
> **Nhiệm vụ:** Theo dõi nguồn gốc thực tế của từng quy tắc trong [`.agents/agents/plan-griller.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/agents/plan-griller.md).  
> **Nguyên tắc Bước 2 (Sau 3–4 vé IMP):**  
> 1. Quy tắc có Bug Instance thực tế $\rightarrow$ **GIỮ LẠI** hoặc **CHUYỂN SANG SCRIPT CƠ HỌC** (`scripts/audit_plan.mjs`).  
> 2. Quy tắc không có Bug Instance thực tế (Speculative / Luật giả định) $\rightarrow$ **CẮT BỎ** để giảm kích thước prompt từ 29 KB về khoảng 18 KB mà không gây rủi ro.

---

## BẢNG MA TRẬN QUY TẮC & TRUY VẾT LỖI (RULE-BUG MAPPING)

| Mã Rule | Tên Quy Tắc Trong plan-griller | Trụ Cột | Bug Instance Cụ Thể (Ticket ID) | Tần Suất | Trạng Thái / Hướng Xử Lý |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **R-01** | Store State vs Action SRP Separation | Pillar 1 | **IMP-234** (User Review P2: AI đưa hàm `setSpotlightedCells` vào data shape `GameState` & `INITIAL_GAME_STATE`) | 1 | 🤖 **Đã chuyển sang `audit_plan.mjs`** |
| **R-02** | Unimplementable Test Patterns Guard | Pillar 5 | **IMP-234** (User Review P3: AI đề xuất test `TC-234.16` đo GC churn không thể chạy trên Vitest Node headless) | 1 | 🤖 **Đã chuyển sang `audit_plan.mjs`** |
| **R-03** | Platform Locale Portability (`toLocaleString`) | Pillar 5 | **IMP-225** (Flaky test do phân cách nghìn `1.500` trên Windows vs `1,500` trên Linux CI) | 1 | 🛡️ **Giữ lại trong Core Pillar 5** |
| **R-04** | Parametric Progress & Milestone Decoupling | Pillar 5 | **IMP-233** (Tăng `VIADUCT_NUM_SEGMENTS` 32 lên 96 làm trôi toạ độ ga đỗ tàu và gãy góc dầm cầu) | 1 | 🛡️ **Giữ lại trong Core Pillar 5** |
| **R-05** | Multi-Phase Async/Animation Timing Invariant | Pillar 5 | **IMP-230** (Hàm `getPawnPassGoDelay` chỉ kiểm tra `pendingPawnMove` mà bỏ quên `activePawnAnimation` đang chạy) | 1 | 🛡️ **Giữ lại trong Core Pillar 5** |
| **R-06** | Legacy Facade Deprecation & SSOT Invariant | Pillar 5 | **IMP-230, IMP-235, IMP-236** (IMP-236: Khóa `isCompetitiveDuel` bảo toàn 100% test fixture `imp119` & `solvency_solver`) | 3 | 🛡️ **Giữ lại trong Core Pillar 5** |
| **R-07** | Subtractive LOC Arithmetic (`[+Added] - [-Deleted]`) | Pillar 5 | **IMP-228, IMP-230, IMP-234, IMP-235, IMP-236** (Đo đạc Total Lines & SLOC bảo toàn cả 4 tệp <= 400 Tier 1) | 5 | 🤖 **Đã kiểm soát qua `check_loc.mjs`** |
| **R-08** | Enclosing Scope Coordinate Guard (`Inside X()`) | Pillar 5 | **IMP-230, IMP-233, IMP-236** (IMP-236: P2 & P5 anchor chính xác trong `bot_engine` và `bot_auction`) | 3 | 🛡️ **Giữ lại trong Core Pillar 5** |
| **R-09** | Zero Dirty Casts (`as any`, `as unknown as`) | Pillar 5 | **IMP-220, IMP-225, IMP-234** (AI dùng `as any` để bypass TypeScript strict mode) | 3 | 🤖 **Đã chuyển sang `audit_plan.mjs`** |
| **R-10** | Physical Horizontal Pixel Arithmetic for 360px | Pillar 2 | **IMP-231, IMP-232, IMP-234, IMP-235** (ServerToast z-60 & chip BĐS không tràn viền ngang 360px) | 4 | 📱 **Ứng viên JIT Mobile Supplement** |
| **R-11** | Zero-Blank-Material & Ground Truth Anchor | Pillar 2 | **IMP-228, IMP-233, IMP-234** (Vật liệu 3D thiếu PBR, Z-fighting dầm cầu, Z-fighting viền hào quang) | 3 | 🎮 **Ứng viên JIT 3D Supplement** |
| **R-12** | Ban Scalar Pseudo-Proxies (KISS Adapters) | Pillar 5 | *Chưa ghi nhận bug instance nào từ IMP-01 đến IMP-234* | 0 | ⚠️ **Ứng viên cắt bỏ (Prune ở Bước 2)** |
| **R-13** | Dynamic Getter Allocation Churn Check | Pillar 5 | *Chưa ghi nhận bug instance nào từ IMP-01 đến IMP-234* | 0 | ⚠️ **Ứng viên cắt bỏ (Prune ở Bước 2)** |
| **R-14** | Compound Quiescence / Dual-Pending Mutex | Pillar 5 | *Chưa ghi nhận bug instance nào từ IMP-01 đến IMP-234* | 0 | ⚠️ **Ứng viên cắt bỏ (Prune ở Bước 2)** |
| **R-15** | Ban Dummy Data-Attribute Test Bypasses | Pillar 5 | *Chưa ghi nhận bug instance nào từ IMP-01 đến IMP-234* | 0 | ⚠️ **Ứng viên cắt bỏ (Prune ở Bước 2)** |

---

## TIẾN TRÌNH THEO DÕI BƯỚC 2 (PROMPT DE-BLOATING ROADMAP)
- **Chu kỳ đánh giá:** Sau 3–4 vé IMP tiếp theo (dự kiến tại **IMP-237 / IMP-238**).
- **Mục tiêu:** Rà soát lại các mục có tần suất `0`, xác nhận không có hồi quy, và cắt giảm an toàn prompt `plan-griller.md` từ 29 KB xuống 18 KB.
