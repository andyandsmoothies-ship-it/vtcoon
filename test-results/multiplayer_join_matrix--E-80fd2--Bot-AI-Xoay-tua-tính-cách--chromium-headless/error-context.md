# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: multiplayer_join_matrix.spec.ts >> [E2E Automation] Ma trận Tạo/Gia nhập phòng & Cấu hình Bot AI >> Case 1 [Lần 1/1]: 1 Host + 3 Bot AI (Xoay tua tính cách)
- Location: tests\e2e\multiplayer_join_matrix.spec.ts:12:5

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('[data-testid="pre-match-deck"]')
Expected: not visible
Received: visible
Timeout:  15000ms

Call log:
  - Expect "not toBeVisible" locator('[data-testid="pre-match-deck"]') with timeout 15000ms
  - waiting for locator('[data-testid="pre-match-deck"]')
    3 × locator resolved to <aside data-testid="pre-match-deck" class="pointer-events-auto absolute top-3 md:top-6 right-3 md:right-6 w-[calc(100%-1.5rem)] sm:w-[360px] max-w-[calc(100vw-1.5rem)] sm:max-w-[360px] max-h-[calc(100dvh-1.5rem)] md:max-h-[calc(100dvh-3rem)] z-20 flex flex-col justify-between p-3 sm:p-4 bg-[#FFFDF8] border-2 border-slate-900 shadow-[0_6px_0_0_#0f172a] rounded-3xl text-slate-900 overflow-hidden gap-2 sm:gap-3">…</aside>
      - unexpected value "visible"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Cho phép cấu hình số lần chạy qua biến môi trường (mặc định 3 lần cho E2E để xác thực độ ổn định)
  4   | const ITERATIONS = Number(process.env.RUN_COUNT) || 3;
  5   | 
  6   | test.describe('[E2E Automation] Ma trận Tạo/Gia nhập phòng & Cấu hình Bot AI', () => {
  7   | 
  8   |   // =========================================================================
  9   |   // CASE 1: 1 Người Thật (Host) + 3 Bot AI
  10  |   // =========================================================================
  11  |   for (let i = 1; i <= ITERATIONS; i++) {
  12  |     test(`Case 1 [Lần ${i}/${ITERATIONS}]: 1 Host + 3 Bot AI (Xoay tua tính cách)`, async ({ browser }) => {
  13  |       const context = await browser.newContext();
  14  |       const page = await context.newPage();
  15  | 
  16  |       try {
  17  |         await page.goto('/');
  18  | 
  19  |         // 1. Host bấm "Tạo Phòng Mới"
  20  |         const createBtn = page.locator('[data-testid="create-room-btn"]');
  21  |         await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
  22  |         await createBtn.click();
  23  | 
  24  |         // 2. Chờ sảnh chờ xuất hiện
  25  |         const deck = page.locator('[data-testid="pre-match-deck"]');
  26  |         await expect(deck).toBeVisible({ timeout: 10_000 });
  27  | 
  28  |         // 3. Thêm 3 Bot vào các vị trí 1, 2, 3
  29  |         for (let slot = 1; slot <= 3; slot++) {
  30  |           const addBotBtn = page.locator(`[data-testid="add-bot-slot-${slot}-btn"]`);
  31  |           if (await addBotBtn.isVisible()) {
  32  |             await addBotBtn.click();
  33  |           }
  34  |         }
  35  | 
  36  |         // 4. Đổi tính cách Bot theo thuật toán xoay tua chu kỳ
  37  |         for (let slot = 1; slot <= 3; slot++) {
  38  |           const cycleBtn = page.locator(`[data-testid="cycle-bot-${slot}-btn"]`);
  39  |           if (await cycleBtn.isVisible()) {
  40  |             const clicks = (i + slot) % 3;
  41  |             for (let c = 0; c < clicks; c++) {
  42  |               await cycleBtn.click();
  43  |             }
  44  |           }
  45  |         }
  46  | 
  47  |         // 5. Kiểm tra nút bắt đầu trận đấu và bấm Start
  48  |         const startBtn = page.locator('[data-testid="start-game-btn"]');
  49  |         await expect(startBtn).toBeEnabled({ timeout: 5000 });
  50  |         await startBtn.click();
  51  | 
  52  |         // 6. Xác nhận vào sa bàn 3D thành công (Sảnh chờ đóng lại)
> 53  |         await expect(deck).not.toBeVisible({ timeout: 15_000 });
      |                                ^ Error: expect(locator).not.toBeVisible() failed
  54  | 
  55  |       } finally {
  56  |         await context.close();
  57  |       }
  58  |     });
  59  |   }
  60  | 
  61  |   // =========================================================================
  62  |   // CASE 2: 2 Người Thật (Host + Guest) + 2 Bot AI
  63  |   // =========================================================================
  64  |   for (let i = 1; i <= ITERATIONS; i++) {
  65  |     test(`Case 2 [Lần ${i}/${ITERATIONS}]: 1 Host + 1 Guest (nhập mã phòng) + 2 Bot AI`, async ({ browser }) => {
  66  |       // Mở 2 context hoàn toàn độc lập (tương đương 2 trình duyệt không chung cookie/session)
  67  |       const hostContext = await browser.newContext();
  68  |       const guestContext = await browser.newContext();
  69  | 
  70  |       const hostPage = await hostContext.newPage();
  71  |       const guestPage = await guestContext.newPage();
  72  | 
  73  |       try {
  74  |         // --- BƯỚC 1: HOST TẠO PHÒNG VÀ LẤY MÃ PHÒNG ---
  75  |         await hostPage.goto('/');
  76  |         const createBtn = hostPage.locator('[data-testid="create-room-btn"]');
  77  |         await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
  78  |         await createBtn.click();
  79  | 
  80  |         const hostDeck = hostPage.locator('[data-testid="pre-match-deck"]');
  81  |         await expect(hostDeck).toBeVisible({ timeout: 10_000 });
  82  | 
  83  |         const roomCodeLocator = hostPage.locator('[data-testid="lobby-room-code"]');
  84  |         await roomCodeLocator.waitFor({ state: 'visible' });
  85  |         const roomCode = (await roomCodeLocator.innerText()).trim();
  86  |         expect(roomCode).toMatch(/^[A-Z0-9]{6}$/);
  87  | 
  88  |         // --- BƯỚC 2: GUEST MỞ BROWSER KHÁC NHẬP MÃ ĐỂ VÀO ---
  89  |         await guestPage.goto('/');
  90  |         const joinInput = guestPage.locator('[data-testid="join-room-input"]');
  91  |         await joinInput.waitFor({ state: 'visible', timeout: 15_000 });
  92  |         await joinInput.fill(roomCode);
  93  | 
  94  |         const joinBtn = guestPage.locator('[data-testid="join-room-btn"]');
  95  |         await expect(joinBtn).toBeEnabled({ timeout: 5000 });
  96  |         await joinBtn.click();
  97  | 
  98  |         // Cả 2 trình duyệt đều thấy sảnh chờ
  99  |         const guestDeck = guestPage.locator('[data-testid="pre-match-deck"]');
  100 |         await expect(hostDeck).toBeVisible({ timeout: 10_000 });
  101 |         await expect(guestDeck).toBeVisible({ timeout: 10_000 });
  102 | 
  103 |         // --- BƯỚC 3: HOST THÊM 2 BOT VÀO SLOT 2 VÀ SLOT 3 ---
  104 |         for (const slot of [2, 3]) {
  105 |           const addBotBtn = hostPage.locator(`[data-testid="add-bot-slot-${slot}-btn"]`);
  106 |           if (await addBotBtn.isVisible()) {
  107 |             await addBotBtn.click();
  108 |           }
  109 |           const cycleBtn = hostPage.locator(`[data-testid="cycle-bot-${slot}-btn"]`);
  110 |           if (await cycleBtn.isVisible()) {
  111 |             const clicks = (i + slot) % 3;
  112 |             for (let c = 0; c < clicks; c++) {
  113 |               await cycleBtn.click();
  114 |             }
  115 |           }
  116 |         }
  117 | 
  118 |         // --- BƯỚC 4: GUEST BẤM SẴN SÀNG & HOST BẤM BẮT ĐẦU ---
  119 |         const readyBtn = guestPage.locator('[data-testid="toggle-ready-btn"]');
  120 |         if (await readyBtn.isVisible()) {
  121 |           await readyBtn.click();
  122 |         }
  123 | 
  124 |         const startBtn = hostPage.locator('[data-testid="start-game-btn"]');
  125 |         await expect(startBtn).toBeEnabled({ timeout: 5000 });
  126 |         await startBtn.click();
  127 | 
  128 |         // Cả 2 cùng vào game
  129 |         await expect(hostDeck).not.toBeVisible({ timeout: 15_000 });
  130 |         await expect(guestDeck).not.toBeVisible({ timeout: 15_000 });
  131 | 
  132 |       } finally {
  133 |         await hostContext.close();
  134 |         await guestContext.close();
  135 |       }
  136 |     });
  137 |   }
  138 | });
  139 | 
```