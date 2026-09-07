# Ticket: GAME-S00 - Bộ Xương Sống Kỹ Thuật (Walking Skeleton)

## 1. Thông Tin Định Danh & Phân Lập (Metadata)
- **Mã Ticket:** `issues/GAME-S00-walking-skeleton.md`
- **Epic Trực Thuộc:** Gameplay Core (`docs/epics/gameplay/_epic_ledger.md`)
- **Lát Cắt:** Slice 00 (Tracer Bullet 0)
- **Use Cases Bao Phủ:**
  - `UC-GAME-004`: Thiết Lập Kết Nối WebSocket & Tín Hiệu Heartbeat 5s
  - `UC-GAME-006`: Kích Hoạt Thời Gian Ân Hạn Mất Kết Nối 60s
  - `UC-GAME-009`: Đồng Bộ Vi Sai Trạng Thái & Khóa Dữ Liệu Đồng Thời
- **Chuỗi Truy Vết (Traceability Chain):** FR-001 -> Epic Gameplay -> Slice 00 -> UC-GAME-004, UC-GAME-006, UC-GAME-009
- **Trạng Thái Vòng Đời:** Prepared (Chờ duyệt phạm vi trước khi thi công)
- **Ngân Sách Mã Nguồn (LOC Budget):** < 400 dòng cho toàn bộ mã nguồn và bài test của lát cắt

## 2. Mục Tiêu & Giá Trị Nghiệp Vụ (Intent & Value Delivered)
- **Giá Trị Bàn Giao:** Thiết lập đường ống kỹ thuật khép kín (End-to-End Tracer Bullet) kết nối giữa giao diện WebGL và máy chủ thời gian thực:
  1. Khung hiển thị sa bàn 3D/2.5D (React Three Fiber) dựng 40 ô cơ bản theo cấu hình tĩnh `boardConfig`.
  2. Kết nối WebSocket hai chiều với chu kỳ kiểm tra nhịp tim (heartbeat) định kỳ 5 giây nhằm xác định độ sống của kết nối.
  3. Kích hoạt cơ chế ân hạn mất kết nối 60 giây khi gián đoạn mạng và xử lý gói tin đồng bộ vi sai (delta state) từ máy chủ.
- **Ranh Giới Lát Cắt (Slice Scope Confinement - Chống Slop):**
  - CHỈ thi công hạ tầng kết nối thời gian thực và khung dựng sa bàn rỗng.
  - TUYỆT ĐỐI CHƯA cài đặt logic vòng lặp lượt chơi (đổ xúc xắc, mua bán đất, đấu giá, thẻ bài) thuộc về Slice 01 trở đi.

## 3. Điều Kiện Tiên Quyết & Đảm Bảo Trạng Thái (Preconditions & Guarantees)
- **Điều Kiện Tiên Quyết (Preconditions):**
  - Môi trường chạy máy chủ dịch vụ WebSocket hoạt động bình thường.
  - Thiết bị người dùng hỗ trợ dựng hình WebGL.
- **Đảm Bảo Khi Thành Công (Success Guarantees):**
  - Khách kết nối thành công tới máy chủ và duy trì trao đổi tín hiệu kiểm tra mỗi 5 giây.
  - Sa bàn 40 ô hiển thị đầy đủ trên màn hình không phát sinh lỗi đồ họa.
  - Dữ liệu vi sai trạng thái từ máy chủ được cập nhật tức thời vào khung nhìn.
- **Đảm Bảo Khi Thất Bại (Failure Postconditions):**
  - Khi đứt kết nối đột ngột, máy chủ đánh dấu trạng thái ân hạn 60 giây, giữ nguyên dữ liệu hiện hữu và không ghi đè trạng thái rác.
  - Hết 60 giây không khôi phục, máy chủ giải phóng tài nguyên phiên an toàn.

## 4. Hợp Đồng Kiểm Thử Nghiệm Thu (Acceptance Test Contracts)
- `[TC-00.1/MSS]`: [Khởi tạo kết nối từ người dùng] -> [Máy chủ chấp thuận và duy trì tín hiệu kiểm tra định kỳ 5 giây]
- `[TC-00.2/MSS]`: [Máy chủ phát gói tin đồng bộ vi sai] -> [Giao diện sa bàn cập nhật trạng thái hiển thị tương ứng chính xác]
- `[TC-00.3/A1]`: [Gián đoạn kết nối mạng đột ngột] -> [Hệ thống kích hoạt thời gian ân hạn 60 giây, giữ nguyên trạng thái phiên]
- `[TC-00.4/A2]`: [Hết 60 giây ân hạn mà không kết nối lại] -> [Hệ thống chuyển trạng thái phiên thành mất kết nối vĩnh viễn và giải phóng tài nguyên]

## 5. Ranh Giới Kiến Trúc & Cấu Trúc Đề Xuất (Architectural Scope)
- **Tầng Hiển Thị (Client WebGL / R3F Canvas):**
  - Khung Canvas hiển thị sa bàn 40 ô cơ bản.
  - Bộ thu nhận và phản hồi tín hiệu kiểm tra định kỳ.
- **Tầng Máy Chủ Thời Gian Thực (WebSocket Engine):**
  - Bộ điều phối phiên kết nối và giám sát nhịp tim 5 giây.
  - Bộ đếm thời gian ân hạn 60 giây bảo vệ phiên.
  - Bộ phát gói tin đồng bộ vi sai (delta sync).
- **Tầng Kiểm Thử (Automated Tests):**
  - Bài kiểm thử tích hợp kiểm chứng kết nối, nhịp tim và thời gian ân hạn (`tests/integration/walking_skeleton.test.ts`).

## 6. Tiêu Chuẩn Xuất Xưởng (Definition of Done)
1. 100% Test Contracts được kiểm chứng bằng bài test tự động có gắn nhãn truy vết `[UC-GAME-004/MSS]`, `[UC-GAME-006/A1]`, `[UC-GAME-009/MSS]`.
2. Vượt qua Thử thách đối nghịch (Adversarial Inversion): Cố tình sửa sai logic để chứng minh bài test chuyển sang màu đỏ.
3. Không vi phạm 6 Cờ Đỏ Slop (Nash): Không tạo cấu trúc trừu tượng dùng một lần (YAGNI), không thêm thư viện ngoài không cần thiết.
4. Được thẩm định và thông qua bởi hai cổng kiểm duyệt (`spec-reviewer` và `code-reviewer`) trước khi chuyển giao con người nghiệm thu.
