import { test, expect } from '@playwright/test';

// Cho phép cấu hình số lần chạy qua biến môi trường (mặc định 3 lần cho E2E để xác thực độ ổn định)
const ITERATIONS = Number(process.env.RUN_COUNT) || 3;

test.describe('[E2E Automation] Ma trận Tạo/Gia nhập phòng & Cấu hình Bot AI', () => {

  // =========================================================================
  // CASE 1: 1 Người Thật (Host) + 3 Bot AI
  // =========================================================================
  for (let i = 1; i <= ITERATIONS; i++) {
    test(`Case 1 [Lần ${i}/${ITERATIONS}]: 1 Host + 3 Bot AI (Xoay tua tính cách)`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await page.goto('/');

        // 1. Host bấm "Tạo Phòng Mới"
        const createBtn = page.locator('[data-testid="create-room-btn"]');
        await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
        await createBtn.click();

        // 2. Chờ sảnh chờ xuất hiện
        const deck = page.locator('[data-testid="pre-match-deck"]');
        await expect(deck).toBeVisible({ timeout: 10_000 });

        // 3. Thêm 3 Bot vào các vị trí 1, 2, 3
        for (let slot = 1; slot <= 3; slot++) {
          const addBotBtn = page.locator(`[data-testid="add-bot-slot-${slot}-btn"]`);
          if (await addBotBtn.isVisible()) {
            await addBotBtn.click();
          }
        }

        // 4. Đổi tính cách Bot theo thuật toán xoay tua chu kỳ
        for (let slot = 1; slot <= 3; slot++) {
          const cycleBtn = page.locator(`[data-testid="cycle-bot-${slot}-btn"]`);
          if (await cycleBtn.isVisible()) {
            const clicks = (i + slot) % 3;
            for (let c = 0; c < clicks; c++) {
              await cycleBtn.click();
            }
          }
        }

        // 5. Kiểm tra nút bắt đầu trận đấu và bấm Start
        const startBtn = page.locator('[data-testid="start-game-btn"]');
        await expect(startBtn).toBeEnabled({ timeout: 5000 });
        await startBtn.click();

        // 6. Xác nhận vào sa bàn 3D thành công (Sảnh chờ đóng lại)
        await expect(deck).not.toBeVisible({ timeout: 15_000 });

      } finally {
        await context.close();
      }
    });
  }

  // =========================================================================
  // CASE 2: 2 Người Thật (Host + Guest) + 2 Bot AI
  // =========================================================================
  for (let i = 1; i <= ITERATIONS; i++) {
    test(`Case 2 [Lần ${i}/${ITERATIONS}]: 1 Host + 1 Guest (nhập mã phòng) + 2 Bot AI`, async ({ browser }) => {
      // Mở 2 context hoàn toàn độc lập (tương đương 2 trình duyệt không chung cookie/session)
      const hostContext = await browser.newContext();
      const guestContext = await browser.newContext();

      const hostPage = await hostContext.newPage();
      const guestPage = await guestContext.newPage();

      try {
        // --- BƯỚC 1: HOST TẠO PHÒNG VÀ LẤY MÃ PHÒNG ---
        await hostPage.goto('/');
        const createBtn = hostPage.locator('[data-testid="create-room-btn"]');
        await createBtn.waitFor({ state: 'visible', timeout: 15_000 });
        await createBtn.click();

        const hostDeck = hostPage.locator('[data-testid="pre-match-deck"]');
        await expect(hostDeck).toBeVisible({ timeout: 10_000 });

        const roomCodeLocator = hostPage.locator('[data-testid="lobby-room-code"]');
        await roomCodeLocator.waitFor({ state: 'visible' });
        const roomCode = (await roomCodeLocator.innerText()).trim();
        expect(roomCode).toMatch(/^[A-Z0-9]{6}$/);

        // --- BƯỚC 2: GUEST MỞ BROWSER KHÁC NHẬP MÃ ĐỂ VÀO ---
        await guestPage.goto('/');
        const joinInput = guestPage.locator('[data-testid="join-room-input"]');
        await joinInput.waitFor({ state: 'visible', timeout: 15_000 });
        await joinInput.fill(roomCode);

        const joinBtn = guestPage.locator('[data-testid="join-room-btn"]');
        await expect(joinBtn).toBeEnabled({ timeout: 5000 });
        await joinBtn.click();

        // Cả 2 trình duyệt đều thấy sảnh chờ
        const guestDeck = guestPage.locator('[data-testid="pre-match-deck"]');
        await expect(hostDeck).toBeVisible({ timeout: 10_000 });
        await expect(guestDeck).toBeVisible({ timeout: 10_000 });

        // --- BƯỚC 3: HOST THÊM 2 BOT VÀO SLOT 2 VÀ SLOT 3 ---
        for (const slot of [2, 3]) {
          const addBotBtn = hostPage.locator(`[data-testid="add-bot-slot-${slot}-btn"]`);
          if (await addBotBtn.isVisible()) {
            await addBotBtn.click();
          }
          const cycleBtn = hostPage.locator(`[data-testid="cycle-bot-${slot}-btn"]`);
          if (await cycleBtn.isVisible()) {
            const clicks = (i + slot) % 3;
            for (let c = 0; c < clicks; c++) {
              await cycleBtn.click();
            }
          }
        }

        // --- BƯỚC 4: GUEST BẤM SẴN SÀNG & HOST BẤM BẮT ĐẦU ---
        const readyBtn = guestPage.locator('[data-testid="toggle-ready-btn"]');
        if (await readyBtn.isVisible()) {
          await readyBtn.click();
        }

        const startBtn = hostPage.locator('[data-testid="start-game-btn"]');
        await expect(startBtn).toBeEnabled({ timeout: 5000 });
        await startBtn.click();

        // Cả 2 cùng vào game
        await expect(hostDeck).not.toBeVisible({ timeout: 15_000 });
        await expect(guestDeck).not.toBeVisible({ timeout: 15_000 });

      } finally {
        await hostContext.close();
        await guestContext.close();
      }
    });
  }
});
