# KẾ HOẠCH CẢI TIẾN: IMP-112 - TÁI CÂN BẰNG TOÀN DIỆN HỆ THỐNG THẺ SỰ KIỆN VTCOON (HIGH-IMPACT EVENT CARD REBALANCING)

> **Mã cải tiến:** IMP-112  
> **Hạng mục:** Gameplay Balance, Economy & Event FSM (Hạng mục 1)  
> **Mức độ rủi ro:** Slice-Bound (Can thiệp logic thẻ sự kiện Chance/Market, bảo toàn dòng tiền Kho Bạc, không phá vỡ vòng quay turn/phase của FSM)  
> **Quy trình thực thi:** Bắt buộc tuân thủ Quy trình 3 Trạm độc lập (RED Test ➔ GREEN Code ➔ Independent Review).

---

## 1. MỤC TIÊU VÀ BỐI CẢNH

Sau khi rà soát toàn diện hệ thống 36 thẻ bài (20 thẻ Cơ Hội + 16 thẻ Thị Trường), người dùng đã phát hiện vấn đề cốt lõi: *"có những phiếu chỉ có hiệu ứng nhẹ nhàng, hầu như không ảnh hưởng gì"*. Cụ thể:
1. **Nhóm A (Con số quá nhỏ, không tạo áp lực tài chính)**: Các thẻ phạt 200–400 Tr. VNĐ hoàn toàn vô nghĩa trong giai đoạn giữa và cuối game khi vốn khả dụng từ 15.000–25.000 Tr. VNĐ.
2. **Nhóm B (Hiệu ứng No-op / điều kiện quá hẹp)**: Nhiều thẻ rơi vào tình trạng "rút như không rút" vì điều kiện kích hoạt hiếm hoi (chỉ ô 27 đạt Cấp 3, chỉ ô cùng nhóm màu, người rút không có cơ sở dịch vụ).
3. **Nhóm C (Bệnh chờ dẫm ô ngắn hạn)**: Các thẻ chỉ có hiệu ứng thụ động chờ đối thủ dẫm vào trong 1 vòng thường trôi qua mà không phát sinh bất kỳ tương tác dòng tiền nào.

Người dùng đã duyệt triển khai cả 3 nhóm giải pháp điều chỉnh đối với 11 thẻ sự kiện chiến lược.

---

## 2. PRE-FLIGHT BLAST RADIUS AUDIT (ĐÁNH GIÁ TÁC ĐỘNG)

```
[IMP-112 Rebalance]
       │
       ├── Nhóm A (Tăng lực con số): CC_COPYRIGHT, CC_FRANCHISE, CC_TAX_AUDIT
       ├── Nhóm B (Khử 100% No-op): MC_CASINO_PILOT, CC_VENUE_INCIDENT, MC_ANTI_SPECULATE, CC_SWAP_PROJECT
       └── Nhóm C (Hiệu ứng tức thì + 2 vòng): MC_UTILITY_DOUBLE, MC_FUEL_SURGE, CC_PORT_EXCLUSIVE, CC_BUILD_HALT, CC_MEDIA_CRISIS
               │
               ▼
       [Bảo Toàn Dòng Tiền Kho Bạc (Treasury Conservation Invariant)]
       - Mọi khoản phạt nộp vào room.treasury.
       - Các gói kích cầu/cổ tức giải ngân từ room.treasury.
       - Mọi người chơi đóng phụ phí thì chủ ô nhận, ô chưa có chủ nộp về Kho Bạc.
```

- **Mức độ rủi ro:** Slice-Bound (Ranh giới nghiệp vụ FSM thẻ sự kiện).
- **Direct Touch:**
  - `src/domain/event_card_metadata.ts`
  - `src/domain/chance_card_handlers.ts`
  - `src/domain/market_card_handlers.ts`
  - `src/domain/event_card_engine.ts`
  - `src/domain/property_manager.ts`
  - `src/domain/room.ts`
  - `src/server/room_manager.ts`
  - `src/server/network/delta_broadcaster.ts`
  - `docs/requirements.md` (§V)
  - `docs/domain/gotchas.md` (Gotcha #144)
- **Downstream Consumers:** 
  - Hệ thống tính tiền thuê `handleLanding` và `calculateRent`.
  - Hệ thống đồng bộ Delta qua WebSocket.
  - Giao diện `EventCardModal` và `ActivityFeedSidebar`.
- **Worst-Case Defense:** Nếu `room` không được truyền vào hàm xử lý thẻ (ví dụ trong các unit test cô lập), handler tự động bảo vệ fallback null-safe, không gây crash ứng dụng.

---

## 3. CHI TIẾT 11 THẺ ĐIỀU CHỈNH QUA 3 NHÓM

### Nhóm A: Tăng Lực Con Số
- **CC_COPYRIGHT**: Phạt -1.200 Tr. VNĐ nộp Kho Bạc Nhà Nước (thay vì -400 Tr. VNĐ).
- **CC_FRANCHISE**: Thu của mỗi đối thủ 800 Tr. VNĐ (thay vì 300 Tr. VNĐ; bàn 4 người thu được 2.400 Tr. VNĐ).
- **CC_TAX_AUDIT**: Phạt 500 Tr. VNĐ cho mỗi ô đất trống Cấp 0 (thay vì 200 Tr. VNĐ).

### Nhóm B: Khử 100% No-op & Điều Kiện Quá Hẹp
- **MC_CASINO_PILOT**: Mọi ô Dịch Vụ (6, 8, 26, 27) Cấp 2 trở lên nhận 1.500 Tr. VNĐ; ô 27 Cấp 3 nhận 3.000 Tr. VNĐ. Fallback: Nếu chưa ai có Cấp 2+, Kho Bạc giải ngân 1.000 Tr. VNĐ cho người nghèo nhất bàn cờ.
- **CC_VENUE_INCIDENT**: Sở hữu ô Dịch Vụ phạt 1.200 Tr. VNĐ; nếu KHÔNG sở hữu vẫn phạt 600 Tr. VNĐ phí bảo an nộp Kho Bạc.
- **MC_ANTI_SPECULATE**: Thuế P2P 20% + Phạt ngay 1.000 Tr. VNĐ thuế tài sản cho người chơi sở hữu từ 4 ô đất trở lên.
- **CC_SWAP_PROJECT**: Hoán đổi 1 ô đất Cấp 0 bất kỳ của đối thủ (không bị hạn chế cùng nhóm màu).

### Nhóm C: Bổ Sung Hiệu Ứng Tức Thì & Nâng Thời Hạn 2 Vòng
- **MC_UTILITY_DOUBLE**: x2 phí tiện ích trong 2 vòng + Mọi người chơi nộp ngay 400 Tr. VNĐ tiền điện & cước (chia đều 200 Tr. cho chủ ô 12/28 hoặc nộp Kho Bạc).
- **MC_FUEL_SURGE**: Phụ thu 500 Tr. VNĐ cước vận tải trong 2 vòng + Mọi người chơi nộp ngay 500 Tr. VNĐ phụ phí xăng dầu (chia 125 Tr. cho chủ 4 ô Hạ Tầng hoặc nộp Kho Bạc).
- **CC_PORT_EXCLUSIVE**: Nhận ngay 1.000 Tr. VNĐ cổ tức logistics từ Kho Bạc + trích 50% tiền phí cảng khi đối thủ dừng chân trong 2 vòng.
- **CC_BUILD_HALT**: Phạt ngay 800 Tr. VNĐ chi phí thanh tra + phong tỏa thu tiền ô đất trong 2 vòng.
- **CC_MEDIA_CRISIS**: Phạt ngay 800 Tr. VNĐ chi phí xử lý khủng hoảng + phong tỏa ô Dịch Vụ trong 2 vòng.

---

## 4. QUY TRÌNH 3 TRẠM THỰC THI

### Trạm 1: RED Contract & Inversion Test (`tests/domain/event_card_rebalance_high_impact.test.ts`)
- Subagent `qa-tester` tạo 40 atomic tests độc lập bao phủ Universal 4-Facet Behavioral Matrix.
- Chứng minh 29 tests FAILS với lỗi nghiệp vụ trên mã nguồn chưa cập nhật.

### Trạm 2: GREEN Implementation
- Subagent `implementer` cập nhật mã nguồn trong `src/domain/**` và `src/server/**` để chuyển toàn bộ 40 tests sang GREEN 100%.
- Kiểm tra toàn diện 219 test suites, TypeScript compilation, `npm run lint:ui`, build SSR/Client và nạp Docker.

### Trạm 3: Independent Review & Disk Verification
- Subagent `spec-reviewer` đối soát 100% spec, phòng chống Scope Drift, kiểm tra đĩa vật lý và ký duyệt xuất xưởng.
