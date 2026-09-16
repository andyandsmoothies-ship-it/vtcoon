# IMP-65 - Clean Environment Config Report

**Ngay hoan thanh**: 2026-09-15
**Trang thai**: COMPLETE
**Ke hoach**: docs/plans/improvements/IMP-65-clean_environment_config_plan.md

---

## 1. Van de goc re

Vite 6 cam khai bao NODE_ENV=production trong .env. Khi 
pm run build chay, emit warning:
`
NODE_ENV=production is not supported in the .env file.
`
Ngoai ra, phat hien bug thi cap: Vite 6 + @tailwindcss/vite v4 khong xu ly duoc inline <style> block trong index.html, gay loi [vite:html-inline-proxy] No matching HTML proxy module found.

---

## 2. Cac thay doi thuc hien

| File | Thay doi |
|---|---|
| .env | Xoa dong NODE_ENV=production |
| package.json | Them script start: cross-env NODE_ENV=production node dist/server/index.js |
| src/client/index.css | Di chuyen CSS reset tu HTML vao CSS (fix bug thi cap Vite 6) |
| index.html | Xoa <style> block inline |

---

## 3. Ly do khong thay doi server/index.ts

- alidateEnv() kiem tra process.env.NODE_ENV tu runtime environment.
- Docker: ENV NODE_ENV=production trong Dockerfile L12 va environment: trong docker-compose.yml cung cap bien nay.
- Test ops04: tu thao tung process.env trong test body, khong phu thuoc .env.
- Zero ripple effect.

---

## 4. Bug thi cap phat hien (Vite 6 + @tailwindcss/vite)

**Nguyen nhan**: @tailwindcss/vite plugin intercept HTML processing va lam gay html-inline-proxy khi co <style> block trong index.html.
**Giai phap**: Di chuyen CSS vao src/client/index.css (dung noi thuoc ve cua no).
**Ket qua**: Build sach hoan toan, khong con bat ky warning nao.

---

## 5. Ket qua kiem thu

| Gate | Ket qua |
|---|---|
| pm run build\ | EXIT 0 - 796 modules - 0 warning NODE_ENV |
| \ops04_deployment.test.ts\ | 3/3 PASS |
| pm test\ | 177 files / 3044 tests PASS - 26.15s |
