import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'node:fs';
import path from 'node:path';
import { parseGlbTriangles } from '../optimize_assets.mjs';

// Node.js FileReader polyfill for GLTFExporter
class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer()
      .then((buf) => {
        this.result = buf;
        if (this.onloadend) this.onloadend();
      })
      .catch((err) => {
        if (this.onerror) this.onerror(err);
      });
  }
}
globalThis.FileReader = NodeFileReader;

export function exportSceneToGlb(scene, outputPath) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          const buf = Buffer.from(gltf);
          fs.writeFileSync(outputPath, buf);
          const tris = parseGlbTriangles(buf);
          console.log(`✓ Exported ${outputPath} (${(buf.length / 1024).toFixed(1)} KB, ${tris} tris)`);
          resolve({ path: outputPath, bytes: buf.length, triangles: tris });
        } else {
          reject(new Error('GLTFExporter did not return an ArrayBuffer'));
        }
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}
