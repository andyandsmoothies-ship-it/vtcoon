# VTCOON 3D ASSET REPOSITORY (IMP-29)

Thư mục chứa toàn bộ tài nguyên mô hình 3D (.glb) nguồn mở chuẩn bị cho game VTCOON.

## I. CẤU TRÚC THƯ MỤC
- `pawns/`: 4 quân cờ VIP (Host P1 Tháp Vàng, P2 Du Thuyền Bạc, P3 Xe Cổ Đồng, P4 Ngựa Sapphire).
- `buildings/`: Công trình nhà đất 3 cấp độ (C1 Nhà phố Đông Dương, C2 Cao ốc Sapphire, C3 Landmark Hoàng Kim).
- `vehicles/`: Phương tiện vi giao thông (Xe buýt, taxi, xe con sedan, cano / tàu container).
- `landmarks/`: Danh thắng di sản 4 góc bàn cờ (Chợ Bến Thành, Sân bay Tân Sơn Nhất, Cảng Cát Lái...).

## II. QUY CHUẨN NGÂN SÁCH KỸ THUẬT (ASSET BUDGETS)
- **Tổng dung lượng toàn bộ mô hình ban đầu**: <= 2.5 MB.
- **Quân cờ (`pawns/`)**: <= 150 KB, <= 1.200 triangles.
- **Tòa nhà (`buildings/`)**: <= 100 KB, <= 800 triangles.
- **Phương tiện (`vehicles/`)**: <= 30 KB, <= 400 triangles.
- **Danh thắng (`landmarks/`)**: <= 200 KB, <= 1.500 triangles.
- **Vân bề mặt (Textures)**: 512x512 hoặc tối đa 1024x1024 WebP/PNG.

## III. QUY CÁCH TẠO HÌNH (BLOCKBENCH / VOXEL)
- Trục **Y hướng lên (Y-Up)**.
- Trọng tâm (Pivot): Đặt tại **chân đế `[0, 0, 0]`** của mô hình.
- Định dạng xuất: **Binary glTF (`.glb`)**.
