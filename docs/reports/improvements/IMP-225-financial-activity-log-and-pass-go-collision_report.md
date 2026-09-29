# BÁO CÁO HOÀN THÀNH — IMP-225: FINANCIAL ACTIVITY LOG & PASS GO COLLISION RESILIENCE

> **Mã Ticket**: `IMP-225` | **Loại Thay Đổi**: Tier 2 (Full Rigor - Network / Activity Stream / Financial Matcher)  
> **Trạng Thái**: ✅ **HOÀN THÀNH — PRODUCTION READY**  
> **Thực Hiện Theo**: Quy Trình 3 Trạm Đối Kháng Hiến Pháp Antigravity (`GEMINI.md`)  
> **Evidence Snapshot**: [`.agents/evidence/imp225_snapshot.json`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/evidence/imp225_snapshot.json)

---

## 1. TỔNG QUAN VẤN ĐỀ VÀ NGUYÊN NHÂN GỐC

Trong ván đấu thực tế (Room `VTFEA4`), tại Vòng 14 khi người chơi `Spunky Hamster` đổ xí ngầu [2, 6] di chuyển từ ô 38 qua ô Bắt Đầu (ô 0) nhận lương GO `+2.000 Tr.` và dẫm vào BĐS cấp 2 của `Bot AI 3` tại Bình Dương (ô 6) chịu tiền thuê `3.750 Tr.`:
- Số dư người chơi nhận delta ròng `-1.750 Tr.` (`+2.000 - 3.750`).
- Bộ khớp tiền thuê cũ (`matchRentTransactions`) so sánh cứng `Math.abs(payer.diff) === receiver.diff` (`1.750 === 3.750` -> `false`).
- Khiến hệ thống fallback về log chung chung: *"Spunky Hamster đã nộp phí / nộp thuế 1.750"* và *"Bot AI 3 nhận được 3.750 tiền thưởng"*. Khoản lương vượt GO bị nuốt chửng hoàn toàn.

---

## 2. NỘI DUNG VÀ KIẾN TRÚC TRIỂN KHAI

### 2.1 Tiếp thu 5 điểm phản biện cứng (P1–P5)
1. **[C1] Hằng số SSOT**: Khai báo `CHANCE_MARKET_CELLS = new Set([2, 7, 17, 22, 33, 36])` tập trung; import `AIRPORT_CELLS` từ `telemetry_expected_delta.ts` (không dùng constant ảo `PORT_CELLS`).
2. **[C2] Tính bất biến thuần hàm (Functional Immutability)**: Giữ nguyên `readonly diff: number;` trong `BalanceDelta`. `extractPassedGoActivities` sử dụng phép nhân bản thuần hàm `{ ...p, diff: newDiff }`, tuyệt đối không mutate in-place.
3. **[C3] Tương thích ngược 100%**: `activity_financial_tracker.ts` re-export toàn bộ 7 interfaces và functions gốc (`matchRentTransactions`, `processPayerFee`, `processReceiverReward`, `BalanceDelta`, `PropertyFinancialContext`, v.v.).
4. **[C4] Xóa bỏ Test Checklist phản mẫu**: Thay thế `TC-225.16` thành kiểm thử nghiệp vụ thực tế: Vượt GO (`+2.000`), thu hồi nợ thấu chi `CC_OVERDRAFT` (`-3.300`) và trả tiền thuê (`-1.500`) tách bạch 3 log độc lập.
5. **[C5] Phân biệt cước viễn thông Viettel**: Chỉ nhận diện cước data 150 Tr. khi người nộp đứng tại `CHANCE_MARKET_CELLS`, không nhầm lẫn với phí dịch vụ dừng chân thông thường tại ô 28.

### 2.2 Tách Submodule & Chuẩn hóa cấu trúc
- **Tạo mới `src/client/network/activity_rent_matcher.ts`** (294 LOC <= trần 400 LOC Tier 1):
  - Khớp tiền thuê đa tầng: Viettel cước 150 Tr., khớp 1-1, chia 50/50 phí cảng `CC_PORT_EXCLUSIVE`, và bù trừ con nợ mất khả năng thanh toán (Insolvency Partial Rent).
  - Tách độc lập lương Vượt GO bằng hàm `extractPassedGoActivities`.
  - Phân tích Gói Kích Cầu Kho Bạc (`processReceiverReward`).
- **Tinh gọn `src/client/network/activity_financial_tracker.ts`** (226 LOC <= trần 400 LOC Tier 1):
  - Bổ sung tách bóc hàm con (`collectPayersAndReceivers`, `processMaBuyouts`, `processHoseActivityResult`) đáp ứng `lint:slop` (hàm <= 60 SLOC).
  - Nhận diện `hasPassedGo` kể cả khi net balance `diff === 0`.
- **Cập nhật `activity_badge_dispatcher.ts`** (221 LOC <= trần 400 LOC Tier 1):
  - Bổ sung `handleSalaryBadge` đồng bộ FloatingTextType.Reward và âm thanh chiến thắng `SoundEngine.playVictoryChime()`.
- **Cập nhật UI & Store**:
  - `src/client/store/activity_store.ts`: Bổ sung `'salary'` vào `ActivityLogType`.
  - `src/client/ui/activity_feed_sidebar.tsx`: Gán emoji `🏁` cho loại log `'salary'`.
- **Đóng đinh Bất biến Gotchas**:
  - Ghi nhận **Invariant #11** tại [docs/domain/gotchas.md](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas.md) (Pillar II: Kinh Tế & Kho Bạc).

---

## 3. KẾT QUẢ QUY TRÌNH 3 TRẠM (3-STATION PIPELINE)

| Trạm | Phụ Trách | Trạng Thái | Chi Tiết |
| :--- | :--- | :---: | :--- |
| **Trạm 1: QA RED** | `qa-tester` | ✅ PASSED | 16 test cases trong `tests/contracts/imp225_financial_activity_log_collision.test.ts`. 12 failed \| 4 passed chứng minh Inversion Gate. |
| **Trạm 2: GREEN** | `implementer` | ✅ PASSED | Triển khai mã nguồn tối thiểu, 16/16 contract tests GREEN, 65/65 tests hồi quy GREEN. |
| **Trạm 2.5: Scout** | `scout` | ✅ PASSED | 0 stale closures, 0 leak, 0 `as any`, LOC budgets an toàn. |
| **Trạm 3: Spec Review** | `spec-reviewer` | ✅ APPROVED | 100% đối chiếu đặc tả C1-C5, tương thích ngược hoàn hảo, snapshot hợp lệ. |
| **Trạm 3: UI Craft Review** | `ui-craft-reviewer` | ✅ APPROVED | Huy hiệu hiển thị song song minh bạch, không tràn layout mobile 360px, 0 linter violations. |

---

## 4. MA TRẬN KIỂM THỬ HỢP ĐỒNG (TC-225.01 .. TC-225.16)

- `TC-225.01`: Vượt GO và dẫm BĐS đối thủ (-3.750) -> Tách log Lương GO `+2.000` và Trả thuê `-3.750`.
- `TC-225.02`: Vượt GO và dẫm BĐS có tiền thuê nhỏ hơn lương -> Net `+1.200` phát sinh đủ 2 log tách bạch.
- `TC-225.03`: Vượt GO và tiền thuê bằng đúng lương -> Net `0` vẫn phát sinh đủ 2 log độc lập.
- `TC-225.04`: Vượt GO vào ô đất trống -> Phát sinh log Lương GO chuẩn xác mang nhãn `🏁`.
- `TC-225.05`: Thẻ `CC_PORT_EXCLUSIVE` chia đôi phí cảng 50/50 -> Phát sinh log chia đều cho 2 bên, không rơi vào 'tiền thưởng'.
- `TC-225.06`: Con nợ âm vốn chỉ trả được một phần tiền thuê -> Khớp đúng khoản thực nhận của chủ đất, không quy thành thuế.
- `TC-225.07`: Ô Đất Dịch Vụ C2 có phụ phí xúc xắc chẵn (+200 Tr.) -> Nhận diện đầy đủ tiền thuê tổng hợp.
- `TC-225.08`: Ô BĐS đang có hiệu ứng MACRO_LAND_FEVER (x2.5) -> Khớp tiền thuê sau nhân chính xác.
- `TC-225.09`: Ô Tiện Ích EVN / Viettel với biểu phí phẳng -> Khớp tiền thuê tiện ích chuẩn xác.
- `TC-225.10`: Thẻ Cơ Hội / Thị Trường phát sinh cước Viettel 150 Tr. -> Ghi rõ cước data, không nhầm với phí ô 28.
- `TC-225.11`: Vượt GO nộp thuế đất lũy tiến -> Lương và thuế ghi nhận tách bạch minh bạch.
- `TC-225.12`: Ô Ga hàng không / Sân bay có ETC (+50% phí) -> Khớp phí dịch vụ chính xác.
- `TC-225.13`: Gói kích cầu Kho Bạc giải ngân -> Log mang nhãn '🏛️ [Kích Cầu Kho Bạc]'.
- `TC-225.14`: Kích cầu xảy ra đồng thời với lượt trả tiền thuê -> Tách biệt 2 giao dịch, không bị nuốt số dư.
- `TC-225.15`: Va chạm Vượt GO + Trả thuê -> Phát đủ Badge Lương (Reward) và Badge Thuê (Penalty).
- `TC-225.16`: Vượt GO (+2.000), thu nợ thấu chi CC_OVERDRAFT (-3.300) và trả thuê (-1.500) -> Tách đủ 3 log độc lập.
