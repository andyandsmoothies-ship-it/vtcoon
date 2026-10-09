# Sentinel Targeted Mutation Probes

Thư mục này chứa các tệp cấu hình quy tắc đột biến (Targeted AST Mutation Rules) riêng biệt cho từng ticket của dự án VTCOON, phục vụ cổng kiểm định Station 4 Chaos Sentinel.

## 1. Cơ chế hoạt động (Decentralized Architecture)
Trước đây, toàn bộ cấu hình quy tắc đột biến của tất cả các ticket được gom cứng (hardcode) trong `scripts/sentinel_runner.mjs`, khiến tệp này phình to hơn 1.700 dòng và dễ gây xung đột merge git.

Kiến trúc mới đã tách biệt các quy tắc thành các tệp JSON độc lập:
- Bộ thực thi `scripts/sentinel_runner.mjs` tự động tìm nạp tệp tương ứng theo mã ticket thông qua hàm `loadTargetedProbes(ticketId)`.
- Đường dẫn tra cứu: `scripts/sentinel_probes/<TICKET_ID>.json` (không phân biệt hoa thường, e.g. `IMP-341.json`).

## 2. Cấu trúc tệp quy tắc (`<TICKET_ID>.json`)
Mỗi tệp JSON là một danh sách (`Array`) các đối tượng đột biến với định dạng:

```json
[
  {
    "file": "src/client/3d/camera_arbitration_engine.ts",
    "desc": "AST: mutate USER_GESTURE priority 20 -> 5",
    "target": "USER_GESTURE: 20,",
    "replacement": "USER_GESTURE: 5,"
  }
]
```

### Các trường dữ liệu:
- `file` *(string, bắt buộc)*: Đường dẫn tương đối từ gốc repository đến tệp mã nguồn cần tiêm đột biến.
- `desc` *(string, bắt buộc)*: Mô tả hành vi/logic bị biến đổi (hiển thị trên console output của Sentinel).
- `target` *(string, bắt buộc)*: Chuỗi gốc chính xác trong mã nguồn cần thay thế.
- `replacement` *(string, bắt buộc)*: Chuỗi mã giả mạo/đột biến để kiểm thử độ nhạy của bộ test contract.

## 3. Quy trình thêm quy tắc cho Ticket mới
Khi triển khai ticket mới yêu cầu kiểm định Station 4 Sentinel:
1. Tạo tệp mới `scripts/sentinel_probes/<TICKET_ID>.json` (ví dụ `scripts/sentinel_probes/IMP-343.json`).
2. Khai báo tối thiểu các quy tắc đột biến nhạy cảm để đảm bảo tổng số mutant tiêu diệt (killed mutants) đạt chuẩn sàn (>= 14 mutants).
3. Chạy lệnh:
   ```bash
   npm run sentinel -- --ticket <TICKET_ID> --3d --test tests/<path_to_test> --src src/<path_to_src>
   ```
4. Không cần chỉnh sửa bất kỳ dòng mã nào trong `scripts/sentinel_runner.mjs`.
