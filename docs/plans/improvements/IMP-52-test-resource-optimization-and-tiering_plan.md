# Kế Hoạch Cải Tiến: IMP-52 - Tối Ưu Hóa Tài Nguyên Kiểm Thử & Phân Tầng Test Suites

## 1. BỐI CẢNH & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE)
1. **Quá tải CPU từ Vitest Worker Threads**: Vitest mặc định chạy đa luồng tối đa theo số nhân logic của CPU (`os.cpus().length` = 8–16 threads). Mỗi thread khởi tạo độc lập môi trường Node, nạp Three.js, React 19 và JSDOM, đẩy CPU máy người dùng lên 100% gây hiện tượng giật đơ máy tính.
2. **Nghẽn I/O & IPC từ Log Spam**: Tệp `tests/simulation/chaos_monkey_simulator.test.ts` phát sinh hơn 27.800 dòng JSON domain logs ra console (`console.info`) khi mô phỏng 1.000 ván. IPC của Vitest bị nghẽn trong việc chuyển các dòng log này về tiến trình chính.
3. **Mô phỏng 1.000 ván mặc định**: 100 ván mô phỏng đã chạy tới ~11.400 lượt, kiểm chứng toàn diện 3 Bất Biến Vĩ Mô (Liveness 0% Deadlock, Cash Conservation Δ = 0, Finite Balances) chỉ trong ~0.35s. 1.000 ván là bài kiểm thử stress chuyên sâu nên được tách thành script `npm run test:chaos` phục vụ kiểm định phát hành (Release Audit).
4. **Sai lệch ngẫu nhiên trong test V8 Heap**: Trong `tests/stress/ops01_concurrent_rooms.test.ts`, việc assert `heapAfter - heapBefore > 0` bị fail ngẫu nhiên do Garbage Collection ngầm của V8 kích hoạt đúng thời điểm test.

```
[UI/Terminal] ──> Giới hạn maxThreads (<= 4 luồng) ──> CPU <= 50%
[Simulator]   ──> Tắt tiếng log spam trong loop     ──> I/O Terminal êm ái
[Simulator]   ──> Mặc định 100 ván (~11.400 turns)   ──> Hoàn thành trong < 0.4s
[Release]     ──> npm run test:chaos (1.000 ván)    ──> Phục vụ Audit định kỳ
```

## 2. PHẠM VI SỬA ĐỔI
1. `vitest.config.ts`: Khống chế luồng `pool: 'threads'`, `maxThreads: Math.min(4, Math.max(1, Math.floor(os.cpus().length / 2)))`, `minThreads: 1`.
2. `tests/simulation/chaos_monkey_simulator.test.ts`:
   - Mute `console.info` và `console.warn` trong suốt vòng lặp mô phỏng.
   - Hỗ trợ `process.env.CHAOS_GAMES ? parseInt(process.env.CHAOS_GAMES, 10) : 100`.
   - Vẫn xuất bảng tổng hợp ASCII sau khi hoàn tất.
3. `tests/stress/ops01_concurrent_rooms.test.ts`: Khắc phục assertion V8 heap không tất định, xác minh rò rỉ thông qua `activeRooms === 10` và retained references.
4. `package.json`: Thêm script `"test:chaos"`.
5. `tests/contracts/test_tiering_and_resource_contract.test.ts`: Test hợp đồng kiểm chứng các tham số tối ưu hóa.

## 3. TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)
1. 153/153 test suites PASS 100%.
2. Lệnh `npm test` chạy êm ái, CPU không bị đẩy lên 100%, không còn ngập 27.800 dòng log spam.
3. 3 Bất Biến Vĩ Mô của Chaos Monkey Simulator được bảo toàn tuyệt đối.
4. Script `npm run test:chaos` chạy thành công 1.000 ván khi cần kiểm định chuyên sâu.
5. 0 lỗi TypeScript (`tsc --noEmit`), 0 vi phạm UI lint (`npm run lint:ui`).
