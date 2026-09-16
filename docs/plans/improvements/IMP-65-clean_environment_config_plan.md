# IMP-65 â€” Clean Environment Config Plan

**Ngay lap ke hoach**: 2026-09-15
**Trang thai**: PENDING APPROVAL

---

## 1. Van de hien tai

Vite 6 cam khai bao `NODE_ENV=production` trong `.env`. Khi `npm run build` chay, Vite doc `.env`, thay `NODE_ENV=production` va emit warning:
```
NODE_ENV=production is not supported in the .env file.
Only NODE_ENV=development is supported to create a development build of your project.
```
Day la warning, khong phai error, nhung vi pham clean build principle.

---

## 2. Phan tich co che load env

### Vite 6 (Client Build)
- Vite 6 tu dong set `NODE_ENV=production` khi chay `vite build` -- khong can `.env` khai bao.
- Vite doc `.env` de inject `VITE_*` variables vao client bundle.
- Neu `.env` co `NODE_ENV`, Vite emit warning va IGNORE no.
- Vite KHONG truyen `NODE_ENV` xuong Node.js runtime.

### Server (Node.js Runtime)
- `src/server/index.ts` KHONG import dotenv -- khong co `require('dotenv').config()` hay tuong duong.
- Server doc `process.env.NODE_ENV` truc tiep tu environment cua process.
- Nguon `NODE_ENV` cho server:
  - **Local dev**: Shell environment (set thu cong hoac qua npm script)
  - **Docker**: `ENV NODE_ENV=production` trong Dockerfile L12 + `environment:` trong docker-compose.yml L6
  - **Test (ops04)**: Vitest set thu cong trong test body (`process.env.NODE_ENV = 'production'` tai L46)

### Vitest (Test Suite)
- Vitest KHONG tu dong load `.env` file theo mac dinh.
- ops04_deployment.test.ts tu thao tung `process.env` truc tiep -- khong phu thuoc `.env`.

---

## 3. Blast Radius Audit

| Thanh phan | Phu thuoc `.env[NODE_ENV]`? | Rui ro khi xoa | Giam thieu |
|---|---|---|---|
| `vite build` | Khong (Vite tu set) | 0 | N/A |
| `src/server/index.ts` (local dev) | Gian tiep qua shell | THAP -- Dockerenv co san | Dockerfile + compose da du |
| `tests/ops/ops04_deployment.test.ts` | Khong -- tá»± set trong test | 0 | Test tu manage process.env |
| `Dockerfile` | Khong -- dung `ENV NODE_ENV=production` | 0 | Da co san |
| `docker-compose.yml` | Khong -- dung `environment:` | 0 | Da co san |
| `npm test` (toan bo suite) | Khong | 0 | Vitest khong load .env |

**Ket luan**: Rui ro = ZERO. `NODE_ENV=production` trong `.env` chi phuc vu local dev khi dev chay server thu cong ngoai Docker.

---

## 4. Phuong an duoc chon: Phuong an B -- Xoa NODE_ENV khoi .env

**Ly do chon Phuong an B thay vi A**:
- Phuong an A (tach `.env.server`) yeu cau them co che load env rieng cho server -- phuc tap hon, them file, them dependency.
- Phuong an B chi can xoa 1 dong trong `.env` -- zero new structure, YAGNI compliant.
- Docker va CI da cung cap `NODE_ENV` qua environment rieng -- khong can `.env`.

**Giai phap phong thu cho local dev** (neu can chay server thu cong ngoai Docker):
- Developer set `NODE_ENV=production node dist/server/index.js` trong terminal.
- Hoac them npm script: `"start": "cross-env NODE_ENV=production node dist/server/index.js"` -- co san `cross-env` trong devDependencies.

---

## 5. Cac thay doi cu the

### [MODIFY] `.env`
- **Xoa** dong `NODE_ENV=production`
- **Giu nguyen** cac bien con lai: `PORT=3000`, `WSS_PORT=3001`, `GRACE_PERIOD_MS=60000`

### [MODIFY] `package.json`
- **Them** script `start`: `"start": "cross-env NODE_ENV=production node dist/server/index.js"`
- Giup developer chay server production thu cong ma khong can Docker.
- `cross-env` da co san trong devDependencies -- zero new dependency.

### Khong thay doi gi them:
- `src/server/index.ts` -- giu nguyen validateEnv() logic 100%
- `Dockerfile` -- da co `ENV NODE_ENV=production`
- `docker-compose.yml` -- da co `environment: - NODE_ENV=production`
- `tests/ops/ops04_deployment.test.ts` -- khong cham vao
- `vite.config.ts` -- khong cham vao

---

## 6. Quy trinh kiem thu

1. `npm run build` -> Khong con warning ve NODE_ENV
2. `npx vitest run tests/ops/ops04_deployment.test.ts` -> 100% PASS
3. `npm test` -> 177 files / 3044 tests PASS

---

## 7. Ke hoach rollback

Neu co van de: them lai `NODE_ENV=production` vao `.env`. Zero side effect.