# [IMP-134] Kế Hoạch Hệ Thống Thông Điệp & Gợi Ý Thao Tác Ngữ Cảnh Có Ý Nghĩa (Actionable In-Game Guidance System)

> **Mã Cải Tiến**: `IMP-134`  
> **Mức Độ**: 🟡 UI/UX & Client Notification Architecture  
> **Traceability**: `[UC-IMP134]`, `[TC-IMP134.01..TC-IMP134.39]`, Gotcha #176

---

## 1. Mục Tiêu & Phạm Vi
1. Thay thế 100% các chuỗi lỗi máy chủ thô ráp (`Lỗi máy chủ: REASON_CODE`) thành thông điệp tiếng Việt có ý nghĩa, thân thiện, giải thích rõ quy tắc và mách nước hành động tiếp theo cho người chơi.
2. Nâng cấp `ServerToast` thành Toast Card 2 tầng chuẩn Impeccable Retropoly, có nút đóng nhanh ✖ đạt chuẩn WCAG Touch Target 44px.
3. Chống va chạm và chồng lấn chip thông báo trên ActionDock qua bộ phân giải ưu tiên độc quyền `resolveActionDockNotice`.
4. Đảm bảo trải nghiệm thích ứng mượt mà trên cả Desktop lẫn Mobile hẹp (< 390px).

---

## 2. Thiết Kế Kỹ Thuật
1. `src/client/ui/actionable_notification.ts`:
   - `resolveActionableNotification(reasonCode)`: Phân loại Tone và xuất khẩu cấu trúc thông điệp ({ icon, title, description, actionHint }).
   - `formatServerErrorMessage(reasonCode)`: Chuyển thể chuỗi thông báo, giữ nguyên các từ khóa regex hợp đồng cũ.
2. `src/client/ui/ui_helpers.ts`:
   - `resolveActionDockNotice(params)`: Ưu tiên `Insolvent > Audit > SkipTurn > BotPacing`, cung cấp cặp văn bản `desktopText` và `mobileText` (trần <= 45 ký tự).
3. `src/client/main.tsx`:
   - Nâng cấp `ServerToast` với nút đóng nhanh touch target >= 44px.
4. `src/client/network/use_app_session.ts`:
   - Kết nối trực tiếp vào `formatServerErrorMessage`.
5. `src/client/ui/action_dock.tsx`:
   - Render chip độc quyền với nhãn thích ứng responsive.
