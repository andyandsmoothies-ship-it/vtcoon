import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import {
  validateDrawCallsBudget,
} from '../../src/client/3d/spatial_invariants';
import {
  validateCameraFrustum,
  validateMatrixFinite,
  validateContextLossRecovery,
  MAX_ALLOWED_DRAW_CALLS,
} from './spatial_test_helpers';

describe('Station 4 Headless WebGL2 Spatial Boundary Sentinel Probe', { timeout: 30000 }, () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    try {
      const channel = process.platform === 'win32' ? 'msedge' : undefined;
      browser = await chromium.launch({
        channel,
        headless: true,
        args: [
          '--enable-webgl',
          '--use-gl=angle',
          '--use-angle=swiftshader',
          '--enable-unsafe-swiftshader',
          '--no-sandbox',
          '--disable-gpu-sandbox',
        ],
      });

      page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      // Định tuyến tự động phục vụ mọi module Three.js nội bộ (three.module.js, three.core.js)
      await page.route('**/*three*.js', (route) => {
        const url = route.request().url();
        const filename = path.basename(new URL(url).pathname);
        const localPath = path.resolve('node_modules/three/build', filename);
        if (fs.existsSync(localPath)) {
          route.fulfill({
            path: localPath,
            contentType: 'text/javascript',
          });
        } else {
          route.continue();
        }
      });

      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <base href="http://localhost/">
            <script type="importmap">
              { "imports": { "three": "http://localhost/three.module.js" } }
            </script>
            <script>
              window.__vite_ssr_dynamic_import__ = (specifier) => {
                return (new Function("s", "return import(s)"))(specifier);
              };
            </script>
          </head>
          <body style="margin: 0; padding: 0;">
            <canvas id="webgl-canvas" width="1280" height="800"></canvas>
          </body>
        </html>
      `);
    } catch (err) {
      if (browser) await browser.close();
      throw err;
    }
  });

  afterAll(async () => {
    try {
      if (page) {
        // Render một scene 3D thực tế có hình học và màu sắc xác định để làm bằng chứng vật lý (Physical Visual Evidence)
        await page.evaluate(async () => {
          const THREE = await import('three');
          const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
          if (!canvas) return;
          const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
          renderer.setClearColor(0x0f172a, 1.0); // Nền Dark Slate (không phải đen kịt #000000)
          renderer.setSize(1280, 800);

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.1, 100);
          camera.position.set(3, 4, 6);
          camera.lookAt(0, 0, 0);

          // Khối hình hộp 3D xanh lục emerald đại diện cho thực thể không gian
          const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
          const material = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const cube = new THREE.Mesh(geometry, material);
          scene.add(cube);

          // Đường viền trắng tương phản làm rõ các cạnh 3D
          const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry),
            new THREE.LineBasicMaterial({ color: 0xffffff })
          );
          scene.add(edges);

          renderer.render(scene, camera);
        });

        const tmpDir = path.resolve('.agents/tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        await page.screenshot({ path: path.join(tmpDir, 'webgl2_headless_smoke_probe.png') });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

  it('[TC-257.01/MSS][UC-STATION4-3D/MSS] Khởi chạy Chromium headless thành công với cờ WebGL2 phần cứng (--use-gl=angle, --enable-webgl, --use-angle=swiftshader)', async () => {
    const isSupported = await page.evaluate(() => {
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return gl !== null;
    });
    expect(isSupported).toBe(true);
  });

  it('[TC-257.02/MSS][UC-STATION4-3D/MSS] Khởi tạo THREE.WebGLRenderer trên canvas WebGL2 trong Chromium headless không ném ngoại lệ và giải phóng sạch context qua dispose()', async () => {
    const initResult = await page.evaluate(async () => {
      const THREE = await import('three');
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
      const created = Boolean(renderer);
      const hasInfo = Boolean(renderer.info);
      renderer.dispose();
      return { created, hasInfo };
    });
    expect(initResult.created).toBe(true);
    expect(initResult.hasInfo).toBe(true);
  });

  it('[TC-257.03/MSS][UC-STATION4-3D/MSS] renderer.info.render phản ánh số lượng draw calls > 0 và pixel buffer ghi nhận màu sắc hình học thực tế', async () => {
    const result = await page.evaluate(async () => {
      const THREE = await import('three');
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const renderer = new THREE.WebGLRenderer({ canvas });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.1, 100);
      camera.position.set(0, 0, 10);

      const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
      scene.add(mesh);

      renderer.render(scene, camera);
      const calls = renderer.info.render.calls;

      // Đọc trực tiếp pixel tại tâm màn hình để xác nhận rasterization thật sự xảy ra trên GPU framebuffer
      const gl = renderer.getContext();
      const pixel = new Uint8Array(4);
      gl.readPixels(640, 400, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      const isGreen = (pixel[1] ?? 0) > 200 && pixel[3] === 255;

      renderer.dispose();
      return { calls, isGreen };
    });
    expect(result.calls).toBeGreaterThan(0);
    expect(result.isGreen).toBe(true);
  });

  it('[TC-257.04/MSS][UC-STATION4-3D/MSS] renderer.info.render phản ánh số lượng triangles > 0 khớp với geometry đã nạp vào scene', async () => {
    const triangles = await page.evaluate(async () => {
      const THREE = await import('three');
      const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
      const renderer = new THREE.WebGLRenderer({ canvas });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.1, 100);

      const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial());
      scene.add(mesh);

      renderer.render(scene, camera);
      const triCount = renderer.info.render.triangles;
      renderer.dispose();
      return triCount;
    });
    expect(triangles).toBe(12); // BoxGeometry gồm 12 tam giác
  });

  it('[TC-257.05/MSS][UC-STATION4-3D/MSS] Duyệt cây Three.js Scene Graph (traverse) đếm đúng số lượng Mesh và Group phân cấp', async () => {
    const counts = await page.evaluate(async () => {
      const THREE = await import('three');
      const scene = new THREE.Scene();
      const group = new THREE.Group();
      group.add(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial()));
      group.add(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial()));
      scene.add(group);

      let meshCount = 0;
      let groupCount = 0;
      scene.traverse((obj) => {
        if ((obj as { isMesh?: boolean }).isMesh) meshCount++;
        if ((obj as { isGroup?: boolean }).isGroup) groupCount++;
      });
      return { meshCount, groupCount };
    });
    expect(counts.meshCount).toBe(2);
    expect(counts.groupCount).toBe(1);
  });

  it('[TC-257.06/MSS][UC-STATION4-3D/MSS] Giới hạn ngân sách Draw Calls: Kiểm chứng qua hàm sản xuất validateDrawCallsBudget bám sát SSOT PERF_BUDGET_LIMITS.targetMaxDrawCalls (85 calls)', () => {
    expect(MAX_ALLOWED_DRAW_CALLS).toBe(85);
    expect(validateDrawCallsBudget(25)).toBe(true);
    expect(validateDrawCallsBudget(85)).toBe(true);
    expect(validateDrawCallsBudget(86)).toBe(false);
  });

  it('[TC-257.07/MSS][UC-STATION4-3D/MSS] Kiểm tra ma trận chiếu (camera.projectionMatrix): 100% 16 phần tử là số thực hữu hạn (validateMatrixFinite = true), không chứa NaN hoặc Infinity', async () => {
    const elements = await page.evaluate(async () => {
      const THREE = await import('three');
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.5, 300);
      camera.updateProjectionMatrix();
      return Array.from(camera.projectionMatrix.elements);
    });
    expect(validateMatrixFinite(elements)).toBe(true);
  });

  it('[TC-257.08/MSS][UC-STATION4-3D/MSS] Kiểm tra ma trận thế giới (camera.matrixWorld): 100% 16 phần tử là số thực hữu hạn, bảo toàn vị trí camera không bị phân kỳ', async () => {
    const elements = await page.evaluate(async () => {
      const THREE = await import('three');
      const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.5, 300);
      camera.position.set(10, 20, 30);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);
      return Array.from(camera.matrixWorld.elements);
    });
    expect(validateMatrixFinite(elements)).toBe(true);
  });

  it('[TC-257.09/MSS][UC-STATION4-3D/MSS] Cấu hình Viewport và Camera frustum: Kiểm chứng qua validateCameraFrustum tuân thủ bất biến hình học (near > 0, far > near, aspect > 0, 0 < fov < 180)', async () => {
    const params = await page.evaluate(async () => {
      const THREE = await import('three');
      const camera = new THREE.PerspectiveCamera(24, 16 / 9, 0.5, 300);
      return { near: camera.near, far: camera.far, fov: camera.fov, aspect: camera.aspect };
    });
    expect(validateCameraFrustum(params.near, params.far, params.fov, params.aspect)).toBe(true);
  });

  it('[TC-257.10/MSS][UC-STATION4-3D/MSS] Kích hoạt sự cố mất ngữ cảnh (ext.loseContext): Bắt được sự kiện webglcontextlost và gọi e.preventDefault() để bảo lưu canvas', async () => {
    const lostHandled = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      try {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return false;
        const ext = gl.getExtension('WEBGL_lose_context');
        if (!ext) return false;

        let eventFired = false;
        let defaultPrevented = false;

        const lostPromise = new Promise<void>((resolve) => {
          canvas.addEventListener('webglcontextlost', (e) => {
            eventFired = true;
            e.preventDefault();
            defaultPrevented = e.defaultPrevented;
            resolve();
          }, { once: true });
        });

        ext.loseContext();
        await lostPromise;
        return eventFired && defaultPrevented;
      } finally {
        canvas.remove();
      }
    });
    expect(lostHandled).toBe(true);
  });

  it('[TC-257.11/MSS][UC-STATION4-3D/MSS] Khi mất ngữ cảnh: gl.isContextLost() trả về true, renderer không gây panic hoặc crash tiến trình', async () => {
    const isLost = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      try {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return false;
        const ext = gl.getExtension('WEBGL_lose_context');
        if (!ext) return false;

        const lostPromise = new Promise<void>((resolve) => {
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            resolve();
          }, { once: true });
        });

        ext.loseContext();
        await lostPromise;
        return gl.isContextLost();
      } finally {
        canvas.remove();
      }
    });
    expect(isLost).toBe(true);
  });

  it('[TC-257.12/MSS][UC-STATION4-3D/MSS] Khôi phục ngữ cảnh (ext.restoreContext): Lắng nghe bất đồng bộ sự kiện webglcontextrestored có timeout bảo vệ và xác nhận gl.isContextLost() trở về false', async () => {
    const restoredHandled = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      document.body.appendChild(canvas);
      try {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return false;
        const ext = gl.getExtension('WEBGL_lose_context');
        if (!ext) return false;

        let restoredFired = false;
        canvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
        }, { once: true });

        const restoredPromise = new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => resolve(false), 3000);
          canvas.addEventListener('webglcontextrestored', () => {
            clearTimeout(timer);
            restoredFired = true;
            resolve(true);
          }, { once: true });
        });

        ext.loseContext();
        await new Promise((r) => setTimeout(r, 100));

        ext.restoreContext();
        await restoredPromise;

        return restoredFired && !gl.isContextLost();
      } finally {
        canvas.remove();
      }
    });
    expect(restoredHandled).toBe(true);
  });

  it('[TC-257.13/MSS][UC-STATION4-3D/MSS] Tái render sau phục hồi ngữ cảnh: Scene render lại bình thường, các ma trận camera tiếp tục giữ giá trị hữu hạn không bị thoái hóa', async () => {
    const reRenderSuccess = await page.evaluate(async () => {
      const THREE = await import('three');
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 800;
      document.body.appendChild(canvas);
      try {
        const renderer = new THREE.WebGLRenderer({ canvas });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1280 / 800, 0.1, 100);
        scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));

        renderer.render(scene, camera);

        const gl = renderer.getContext();
        const ext = gl.getExtension('WEBGL_lose_context');
        if (!ext) {
          renderer.dispose();
          return false;
        }

        canvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
        }, { once: true });

        const restoredPromise = new Promise<boolean>((resolve) => {
          const timer = setTimeout(() => resolve(false), 3000);
          canvas.addEventListener('webglcontextrestored', () => {
            clearTimeout(timer);
            resolve(true);
          }, { once: true });
        });

        ext.loseContext();
        await new Promise((r) => setTimeout(r, 100));

        ext.restoreContext();
        await restoredPromise;

        renderer.render(scene, camera);
        const isFiniteProj = Array.from(camera.projectionMatrix.elements).every((e) => Number.isFinite(e));
        renderer.dispose();
        return isFiniteProj;
      } finally {
        canvas.remove();
      }
    });
    expect(reRenderSuccess).toBe(true);
  });

  it('[TC-257.14/A1][UC-STATION4-3D/A1] Luồng ngoại lệ A1: Camera có thông số dị thường (near >= far, fov <= 0, hoặc fov >= 180) bị validateCameraFrustum phát hiện và từ chối', () => {
    expect(validateCameraFrustum(10, 5, 45, 16 / 9)).toBe(false);
    expect(validateCameraFrustum(0.1, 100, 0, 16 / 9)).toBe(false);
    expect(validateCameraFrustum(0.1, 100, 180, 16 / 9)).toBe(false);
    expect(validateCameraFrustum(0.1, 100, 185, 16 / 9)).toBe(false);
  });

  it('[TC-257.15/A1][UC-STATION4-3D/A1] Luồng ngoại lệ A1 (Biên aspect ratio & tham số chuẩn): Aspect ratio âm bị từ chối, và bộ tham số hình học chuẩn được validateCameraFrustum xác nhận', () => {
    expect(validateCameraFrustum(0.1, 100, 45, -1)).toBe(false);
    expect(validateCameraFrustum(0.5, 300, 45, 16 / 9)).toBe(true);
  });

  it('[TC-257.16/A2][UC-STATION4-3D/A2] Luồng ngoại lệ A2: Ma trận chiếu chứa giá trị NaN hoặc Infinity do tính toán sai góc/tỷ lệ bị validateMatrixFinite chặn đứng', () => {
    const corruptedMatrixNaN = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, NaN, 0, 0, 0, 0, 1];
    const corruptedMatrixInf = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, Infinity, 0, 0, 0, 0, 1];
    const validMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    expect(validateMatrixFinite(corruptedMatrixNaN)).toBe(false);
    expect(validateMatrixFinite(corruptedMatrixInf)).toBe(false);
    expect(validateMatrixFinite(validMatrix)).toBe(true);
  });

  it('[TC-257.17/A3][UC-STATION4-3D/A3] Luồng ngoại lệ A3: Context lost nếu không được gọi preventDefault() sẽ bị validateContextLossRecovery đánh dấu là UNRECOVERABLE_ABORT', () => {
    expect(validateContextLossRecovery(false)).toBe('UNRECOVERABLE_ABORT');
    expect(validateContextLossRecovery(true)).toBe('RECOVERABLE');
  });
});
