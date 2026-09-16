// [IMP-62] Generator for Photorealistic Miniature Diorama Tabletop 3D Assets (.glb)
// Builds 15 models: 3 Buildings (C1-C3), 4 Luxury Pawns, 2 Landmarks, 6 Micro Vehicles
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'node:fs';
import path from 'node:path';
import { parseGlbTriangles } from './optimize_assets.mjs';

// Node.js FileReader polyfill for GLTFExporter
class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = NodeFileReader;

function exportSceneToGlb(scene, outputPath) {
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

// =========================================================================
// 1. REGIONAL BUILDINGS (C1 - C3) - 4 Typologies (Target: 350 - 750 tris, plinth 0.55m x 0.55m)
// =========================================================================

// --- TYPOLOGY 1: RIVERINE (Sông Nước Nam Bộ - Cần Thơ, An Giang, Kiên Giang) ---
function buildRiverineC1() {
  const root = new THREE.Group();
  root.name = 'Bld_Riverine_C1_StiltHouse';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const woodDeckMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.75, metalness: 0.05 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.6, metalness: 0.05 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.4, metalness: 0.1 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.7 });
  const awningMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.5 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Timber stilts floor deck (12 tris)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.03, 0.48), woodDeckMat);
  deck.position.y = 0.06;
  root.add(deck);

  // 6 Stilt columns (6 x 12 = 72 tris)
  [-0.22, 0, 0.22].forEach((sx) => {
    [-0.20, 0.20].forEach((sz) => {
      const stilt = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), darkWoodMat);
      stilt.position.set(sx, 0.045, sz);
      root.add(stilt);
    });
  });

  // Main stilt house body (12 tris)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.26, 0.40), wallMat);
  body.position.y = 0.205;
  root.add(body);

  // Front porch entrance (12 tris)
  const porch = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.10), woodDeckMat);
  porch.position.set(0, 0.08, 0.24);
  root.add(porch);

  // Front double wooden doors (2 x 12 = 24 tris)
  [-0.05, 0.05].forEach((dx) => {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.02), darkWoodMat);
    door.position.set(dx, 0.17, 0.205);
    root.add(door);
  });

  // Striped awning canopy over river landing (12 tris)
  const awning = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.025, 0.14), awningMat);
  awning.position.set(0, 0.27, 0.24);
  awning.rotation.x = Math.PI / 10;
  root.add(awning);

  // 2 Side windows with louvers (2 x 36 = 72 tris)
  [-0.225, 0.225].forEach((wx) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.14), darkWoodMat);
    win.position.set(wx, 0.22, 0);
    root.add(win);
  });

  // Pitched terracotta roof pyramid (Cone 4 segs = 24 tris)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.22, 4), roofMat);
  roof.position.y = 0.44;
  roof.rotation.y = Math.PI / 4;
  root.add(roof);

  // Roof ridge beam (Cylinder 8 segs = 32 tris)
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.46, 8), darkWoodMat);
  ridge.position.set(0, 0.54, 0);
  ridge.rotation.z = Math.PI / 2;
  root.add(ridge);

  // Mooring bollards on river dock (2 x Cylinder 10 segs = 72 tris)
  [-0.12, 0.12].forEach((bx) => {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 10), darkWoodMat);
    bollard.position.set(bx, 0.10, 0.27);
    root.add(bollard);
  });

  return root;
}

function buildRiverineC2() {
  const root = new THREE.Group();
  root.name = 'Bld_Riverine_C2_CanalHotel';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xFEF08A, roughness: 0.55, metalness: 0.05 });
  const shutterMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.35, metalness: 0.1 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.15, metalness: 0.7 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Ground floor Indochine cafe (12 tris)
  const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.46), wallMat);
  groundFloor.position.y = 0.16;
  root.add(groundFloor);

  // Floor dividing cornice (12 tris)
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.03, 0.48), plinthMat);
  cornice.position.y = 0.295;
  root.add(cornice);

  // First floor guest rooms (12 tris)
  const firstFloor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.42), wallMat);
  firstFloor.position.y = 0.43;
  root.add(firstFloor);

  // Semicircular Indochine river balcony (Cylinder 16 segs = 64 tris)
  const balcony = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16, 1, false, 0, Math.PI), darkWoodMat);
  balcony.rotation.z = -Math.PI / 2;
  balcony.rotation.y = Math.PI / 2;
  balcony.position.set(0, 0.32, 0.22);
  root.add(balcony);

  // Balcony balustrade posts (5 posts x 12 = 60 tris + rail = 72 tris)
  [-0.10, -0.05, 0, 0.05, 0.10].forEach((bx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.09, 0.015), darkWoodMat);
    post.position.set(bx, 0.37, 0.32);
    root.add(post);
  });
  const railH = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.02), darkWoodMat);
  railH.position.set(0, 0.42, 0.32);
  root.add(railH);

  // Balcony french door (24 tris)
  const bDoor = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.03), glassMat);
  bDoor.position.set(0, 0.42, 0.215);
  root.add(bDoor);

  // 4 Indochine shuttered windows (4 x 36 = 144 tris)
  const winOffsets = [
    { pos: [-0.225, 0.42, 0.08], rot: Math.PI / 2 },
    { pos: [-0.225, 0.42, -0.08], rot: Math.PI / 2 },
    { pos: [0.225, 0.42, 0.08], rot: -Math.PI / 2 },
    { pos: [0.225, 0.42, -0.08], rot: -Math.PI / 2 },
  ];
  winOffsets.forEach(({ pos, rot }) => {
    const wFrame = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.02), glassMat);
    wFrame.position.set(pos[0], pos[1], pos[2]);
    wFrame.rotation.y = rot;
    root.add(wFrame);

    const lShutter = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.015), shutterMat);
    lShutter.position.set(pos[0], pos[1], pos[2] - 0.06);
    lShutter.rotation.y = rot;
    root.add(lShutter);

    const rShutter = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.015), shutterMat);
    rShutter.position.set(pos[0], pos[1], pos[2] + 0.06);
    rShutter.rotation.y = rot;
    root.add(rShutter);
  });

  // Hipped roof pyramid (Cone 4 sides = 24 tris)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.20, 4), roofMat);
  roof.position.y = 0.65;
  roof.rotation.y = Math.PI / 4;
  root.add(roof);

  // Roof dormer (24 tris)
  const dormer = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.10, 4), roofMat);
  dormer.position.set(0, 0.64, 0.16);
  dormer.rotation.y = Math.PI / 4;
  root.add(dormer);

  // Finial lamp on roof (Cylinder 8 segs = 32 tris)
  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.14, 8), darkWoodMat);
  finial.position.set(0, 0.77, 0);
  root.add(finial);

  return root;
}

function buildRiverineC3() {
  const root = new THREE.Group();
  root.name = 'Bld_Riverine_C3_MarinaComplex';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.4, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.85 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.2 });
  const roofTealMat = new THREE.MeshStandardMaterial({ color: 0x0E7490, roughness: 0.35, metalness: 0.2 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Marina terminal podium (12 tris)
  const podium = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.12, 0.50), stoneMat);
  podium.position.y = 0.10;
  root.add(podium);

  // Wave canopy over marina entrance (Cylinder 16 segs = 64 tris)
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.44, 16, 1, false, 0, Math.PI), roofTealMat);
  canopy.rotation.z = -Math.PI / 2;
  canopy.position.set(0, 0.18, 0.12);
  root.add(canopy);

  // Central riverfront glazed atrium (12 tris)
  const atrium = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.32, 0.38), glassMat);
  atrium.position.y = 0.32;
  root.add(atrium);

  // 4 Corner structural pillars (4 x 12 = 48 tris)
  [-0.20, 0.20].forEach((px) => {
    [-0.19, 0.19].forEach((pz) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.04), stoneMat);
      col.position.set(px, 0.32, pz);
      root.add(col);
    });
  });

  // Intermediate terrace deck (12 tris)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.40), goldMat);
  deck.position.y = 0.495;
  root.add(deck);

  // Marina observation beacon tower (Cylinder 16 segs = 64 tris)
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.14, 0.36, 16), stoneMat);
  tower.position.y = 0.69;
  root.add(tower);

  // Beacon lantern glass room (Cylinder 16 segs = 64 tris)
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.10, 16), glassMat);
  lantern.position.y = 0.92;
  root.add(lantern);

  // Beacon golden dome (Sphere 10x10 = 180 tris)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), goldMat);
  dome.position.y = 0.97;
  root.add(dome);

  // Needle spire (Cylinder 8 segs = 32 tris)
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.015, 0.18, 8), goldMat);
  needle.position.y = 1.08;
  root.add(needle);

  // Promenade balustrade railing (5 posts x 12 = 60 tris)
  [-0.16, -0.08, 0, 0.08, 0.16].forEach((rx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.06, 0.015), goldMat);
    post.position.set(rx, 0.54, 0.20);
    root.add(post);
  });

  return root;
}

// --- TYPOLOGY 2: RESORT (Nghỉ Dưỡng Biển & Núi - Đà Lạt, Nha Trang, Vũng Tàu, Hạ Long) ---
function buildResortC1() {
  const root = new THREE.Group();
  root.name = 'Bld_Resort_C1_TropicalVilla';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.25, metalness: 0.05 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.6, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.85 });
  const roofTimberMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.5 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Villa terrace slab (12 tris)
  const slab = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.48), whiteMat);
  slab.position.y = 0.055;
  root.add(slab);

  // Villa glass living pavilion (12 tris)
  const pavilion = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.22, 0.38), glassMat);
  pavilion.position.y = 0.18;
  root.add(pavilion);

  // 4 Slender white columns (4 x Cylinder 8 segs = 128 tris)
  [-0.19, 0.19].forEach((cx) => {
    [-0.18, 0.18].forEach((cz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), whiteMat);
      col.position.set(cx, 0.18, cz);
      root.add(col);
    });
  });

  // Teak privacy screen louvers (6 x 12 = 72 tris)
  for (let i = 0; i < 6; i++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.04), woodMat);
    louver.position.set(-0.20, 0.18, -0.12 + i * 0.05);
    root.add(louver);
  }

  // Sharp A-frame triangular pitched roof (Cone 4 segs = 24 tris)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.24, 4), roofTimberMat);
  roof.position.y = 0.41;
  roof.rotation.y = Math.PI / 4;
  root.add(roof);

  // Overhanging roof eaves cornice (12 tris)
  const eave = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.025, 0.42), woodMat);
  eave.position.y = 0.30;
  root.add(eave);

  // Sun lounger chairs on patio (2 x 12 = 24 tris)
  [-0.08, 0.08].forEach((lx) => {
    const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.10), whiteMat);
    lounger.position.set(lx, 0.08, 0.18);
    root.add(lounger);
  });

  // Modern chimney flute (Cylinder 8 segs = 32 tris)
  const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8), whiteMat);
  flute.position.set(0.12, 0.44, -0.10);
  root.add(flute);

  return root;
}

function buildResortC2() {
  const root = new THREE.Group();
  root.name = 'Bld_Resort_C2_CoastalResort';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.25, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.85 });
  const poolMat = new THREE.MeshStandardMaterial({ color: 0x06B6D4, roughness: 0.05, metalness: 0.2, emissive: 0x0891B2, emissiveIntensity: 0.2 });
  const teakMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.6 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Ground resort podium & lobby (12 tris)
  const podium = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.14, 0.50), whiteMat);
  podium.position.y = 0.11;
  root.add(podium);

  // Lower suite block (12 tris)
  const lowerBlock = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.20, 0.42), glassMat);
  lowerBlock.position.y = 0.28;
  root.add(lowerBlock);

  // Mid-level infinity pool terrace slab (12 tris)
  const poolDeck = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.24), whiteMat);
  poolDeck.position.set(0, 0.40, 0.12);
  root.add(poolDeck);

  // Azure pool water surface (12 tris)
  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.015, 0.18), poolMat);
  poolWater.position.set(0, 0.425, 0.12);
  root.add(poolWater);

  // Upper tower suites (12 tris)
  const upperTower = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.26), whiteMat);
  upperTower.position.set(0, 0.53, -0.08);
  root.add(upperTower);

  // Panoramic window strip on upper tower (12 tris)
  const upperGlass = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.12, 0.22), glassMat);
  upperGlass.position.set(0, 0.54, -0.08);
  root.add(upperGlass);

  // 8 Vertical sunscreen fins (8 x 12 = 96 tris)
  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.20, 0.04), teakMat);
    fin.position.set(-0.16 + i * 0.045, 0.28, 0.215);
    root.add(fin);
  }

  // Rooftop pergola canopy: 4 posts (128 tris) + 4 slats (48 tris) = 176 tris
  [-0.14, 0.14].forEach((px) => {
    [-0.16, 0.0].forEach((pz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8), teakMat);
      col.position.set(px, 0.70, pz);
      root.add(col);
    });
  });
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.02), teakMat);
    slat.position.set(0, 0.76, -0.16 + i * 0.05);
    root.add(slat);
  }

  // Decorative palm pot (Cylinder 10 segs = 40 tris)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.05, 10), teakMat);
  pot.position.set(0.18, 0.44, 0.20);
  root.add(pot);

  return root;
}

function buildResortC3() {
  const root = new THREE.Group();
  root.name = 'Bld_Resort_C3_SailCondotel';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.2, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.08, metalness: 0.9 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.95, roughness: 0.2 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Stepped elliptical podium (Cylinder 16 segs = 64 tris)
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.08, 16), whiteMat);
  podium.position.y = 0.08;
  root.add(podium);

  // Lower sail tower (Cylinder 16 segs = 64 tris)
  const sailLower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.36, 16), glassMat);
  sailLower.position.set(0, 0.30, -0.02);
  root.add(sailLower);

  // Mid sail tower taper (Cylinder 16 segs = 64 tris)
  const sailMid = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.34, 16), glassMat);
  sailMid.position.set(0, 0.65, -0.02);
  root.add(sailMid);

  // Upper sail crown taper (Cylinder 16 segs = 64 tris)
  const sailUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.28, 16), glassMat);
  sailUpper.position.set(0, 0.96, -0.02);
  root.add(sailUpper);

  // Curved aerodynamic sail spine exoskeleton (4 curved ribs = 48 tris)
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.03), whiteMat);
    rib.position.set(0, 0.25 + i * 0.24, 0.15 - i * 0.04);
    rib.rotation.x = -Math.PI / 16;
    root.add(rib);
  }

  // Cantilevered circular helipad / sky observation platform (Cylinder 16 segs = 64 tris)
  const helipad = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.02, 16), whiteMat);
  helipad.position.set(0, 0.88, 0.12);
  root.add(helipad);

  // Helipad ring rim (Cylinder 16 segs = 64 tris)
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.022, 16), goldMat);
  rim.position.set(0, 0.88, 0.12);
  root.add(rim);

  // Golden architectural needle pinnacle (Cylinder 12 segs = 48 tris)
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.016, 0.22, 12), goldMat);
  spire.position.set(0, 1.15, -0.02);
  root.add(spire);

  // Antenna beacon (Sphere 8x8 = 56 tris)
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), goldMat);
  beacon.position.set(0, 1.26, -0.02);
  root.add(beacon);

  return root;
}

// --- TYPOLOGY 3: HERITAGE (Phố Cổ & Di Sản - Huế, Ninh Bình, Nghệ An, Hưng Yên, Hoàn Kiếm) ---
function buildHeritageC1() {
  const root = new THREE.Group();
  root.name = 'Bld_Heritage_C1_OldTownTubehouse';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const ochreMat = new THREE.MeshStandardMaterial({ color: 0xEAB308, roughness: 0.65, metalness: 0.05 });
  const tileMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7, metalness: 0.1 });
  const greenShutterMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.7 });
  const lanternMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.4, emissive: 0xEF4444, emissiveIntensity: 0.4 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Ground floor yellow ochre tubehouse (12 tris)
  const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.46), ochreMat);
  groundFloor.position.y = 0.16;
  root.add(groundFloor);

  // Traditional front timber folding doors (4 leaves = 48 tris)
  [-0.12, -0.04, 0.04, 0.12].forEach((dx) => {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.02), darkWoodMat);
    leaf.position.set(dx, 0.15, 0.235);
    root.add(leaf);
  });

  // Intermediate wooden eave cornice (12 tris)
  const eaveMid = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.48), tileMat);
  eaveMid.position.y = 0.295;
  root.add(eaveMid);

  // Upper floor with weathered patina (12 tris)
  const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.44), ochreMat);
  upperFloor.position.y = 0.42;
  root.add(upperFloor);

  // Wooden balcony railing (5 posts x 12 = 60 tris + rail = 72 tris)
  [-0.14, -0.07, 0, 0.07, 0.14].forEach((bx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.08, 0.015), darkWoodMat);
    post.position.set(bx, 0.35, 0.235);
    root.add(post);
  });
  const balRail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.015), darkWoodMat);
  balRail.position.set(0, 0.39, 0.235);
  root.add(balRail);

  // 2 Emerald green shutter windows (2 x 36 = 72 tris)
  [-0.10, 0.10].forEach((wx) => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.02), darkWoodMat);
    win.position.set(wx, 0.43, 0.225);
    root.add(win);

    const shutterL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.015), greenShutterMat);
    shutterL.position.set(wx - 0.05, 0.43, 0.23);
    root.add(shutterL);

    const shutterR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.12, 0.015), greenShutterMat);
    shutterR.position.set(wx + 0.05, 0.43, 0.23);
    root.add(shutterR);
  });

  // Yin-yang curved tiled roof (Cone 4 segs = 24 tris)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.18, 4), tileMat);
  roof.position.y = 0.60;
  roof.rotation.y = Math.PI / 4;
  root.add(roof);

  // Dragon/Cloud eave gable ornaments (2 x 12 = 24 tris)
  [-0.20, 0.20].forEach((gx) => {
    const gable = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.04), darkWoodMat);
    gable.position.set(gx, 0.54, 0);
    root.add(gable);
  });

  // Red festive silk lanterns at entrance (2 x Sphere 8x8 = 112 tris)
  [-0.14, 0.14].forEach((lx) => {
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), lanternMat);
    lantern.position.set(lx, 0.25, 0.24);
    root.add(lantern);
  });

  return root;
}

function buildHeritageC2() {
  const root = new THREE.Group();
  root.name = 'Bld_Heritage_C2_ColonialMansion';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.5, metalness: 0.05 });
  const slateMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.3 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.15, metalness: 0.7 });
  const moldingMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.5 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Rusticated ground base (12 tris)
  const groundBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.46), creamMat);
  groundBase.position.y = 0.15;
  root.add(groundBase);

  // Piano Nobile first floor (12 tris)
  const firstFloor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.42), creamMat);
  firstFloor.position.y = 0.38;
  root.add(firstFloor);

  // Entablature molding band (12 tris)
  const entablature = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.44), moldingMat);
  entablature.position.y = 0.515;
  root.add(entablature);

  // 4 Neoclassical columns / pilasters (4 x Cylinder 10 segs = 160 tris)
  [-0.18, -0.06, 0.06, 0.18].forEach((cx) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 10), moldingMat);
    col.position.set(cx, 0.38, 0.215);
    root.add(col);
  });

  // 3 French arched portal windows (3 x 48 = 144 tris)
  [-0.12, 0, 0.12].forEach((ax) => {
    const rectWin = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.02), glassMat);
    rectWin.position.set(ax, 0.36, 0.215);
    root.add(rectWin);

    const archWin = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10, 1, false, 0, Math.PI), glassMat);
    archWin.rotation.z = -Math.PI / 2;
    archWin.rotation.y = Math.PI / 2;
    archWin.position.set(ax, 0.42, 0.215);
    root.add(archWin);
  });

  // Mansard slate roof (12 tris)
  const mansard = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.18, 0.38), slateMat);
  mansard.position.y = 0.62;
  root.add(mansard);

  // 2 Neoclassical roof dormers (2 x Cone 4 segs = 48 tris)
  [-0.09, 0.09].forEach((dx) => {
    const dormer = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.10, 4), slateMat);
    dormer.position.set(dx, 0.64, 0.18);
    dormer.rotation.y = Math.PI / 4;
    root.add(dormer);
  });

  // Parapet balustrade (5 posts x 12 = 60 tris)
  [-0.16, -0.08, 0, 0.08, 0.16].forEach((px) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.06, 0.015), moldingMat);
    post.position.set(px, 0.54, 0.22);
    root.add(post);
  });

  return root;
}

function buildHeritageC3() {
  const root = new THREE.Group();
  root.name = 'Bld_Heritage_C3_PavilionTower';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const stoneBaseMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.6, metalness: 0.1 });
  const lacquerRedMat = new THREE.MeshStandardMaterial({ color: 0xB91C1C, roughness: 0.35, metalness: 0.2 });
  const darkTileMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.7 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.2 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Stepped ceremonial base (12 tris)
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.48), stoneBaseMat);
  base.position.y = 0.08;
  root.add(base);

  // Tier 1 Pavilion body (12 tris)
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.20, 0.40), lacquerRedMat);
  tier1.position.y = 0.22;
  root.add(tier1);

  // Tier 1 Curved Pagoda Eaves (Cone 4 segs = 24 tris)
  const eaves1 = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.10, 4), darkTileMat);
  eaves1.position.y = 0.35;
  eaves1.rotation.y = Math.PI / 4;
  root.add(eaves1);

  // Tier 2 Pavilion body (12 tris)
  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.32), lacquerRedMat);
  tier2.position.y = 0.47;
  root.add(tier2);

  // Bronze Drum circular motif on Tier 2 facade (Cylinder 16 segs = 64 tris)
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.015, 16), goldMat);
  drum.rotation.x = Math.PI / 2;
  drum.position.set(0, 0.47, 0.165);
  root.add(drum);

  // Tier 2 Curved Pagoda Eaves (Cone 4 segs = 24 tris)
  const eaves2 = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.10, 4), darkTileMat);
  eaves2.position.y = 0.59;
  eaves2.rotation.y = Math.PI / 4;
  root.add(eaves2);

  // Tier 3 Ceremonial Crown (12 tris)
  const tier3 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.24), lacquerRedMat);
  tier3.position.y = 0.70;
  root.add(tier3);

  // Tier 3 Curved Roof (Cone 4 segs = 24 tris)
  const eaves3 = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.10, 4), darkTileMat);
  eaves3.position.y = 0.82;
  eaves3.rotation.y = Math.PI / 4;
  root.add(eaves3);

  // 8 Ceremonial wooden columns (8 x Cylinder 8 segs = 256 tris)
  [-0.18, 0.18].forEach((cx) => {
    [-0.18, 0.18].forEach((cz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.20, 8), darkTileMat);
      col.position.set(cx, 0.22, cz);
      root.add(col);
    });
  });

  // Golden ceremonial bottle gourd finial (Hồ Lô) (Sphere 10x10 = 180 tris)
  const gourd = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), goldMat);
  gourd.position.y = 0.90;
  root.add(gourd);

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.015, 0.14, 8), goldMat);
  spire.position.y = 0.99;
  root.add(spire);

  return root;
}

// --- TYPOLOGY 4: METROPOLIS (Siêu Đô Thị Tài Chính - TP.HCM Q1, Thủ Đức, Hà Nội Cầu Giấy, Đà Nẵng) ---
function buildMetropolisC1() {
  const root = new THREE.Group();
  root.name = 'Bld_Metropolis_C1_NeoShophouse';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const darkAlumMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3, metalness: 0.7 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.85 });
  const goldAccentMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.2 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Ground retail glass showroom (12 tris)
  const showroom = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.46), glassMat);
  showroom.position.y = 0.17;
  root.add(showroom);

  // Architectural portal frame (12 tris)
  const portal = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.06), darkAlumMat);
  portal.position.set(0, 0.18, 0.22);
  root.add(portal);

  // Upper floor office cube with glass facade (12 tris)
  const upperCube = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.26, 0.44), stoneMat);
  upperCube.position.y = 0.44;
  root.add(upperCube);

  // Upper panoramic ribbon glass (12 tris)
  const ribbonGlass = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.42), glassMat);
  ribbonGlass.position.y = 0.44;
  root.add(ribbonGlass);

  // 6 Vertical architectural fins (6 x 12 = 72 tris)
  for (let i = 0; i < 6; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.26, 0.04), darkAlumMat);
    fin.position.set(-0.16 + i * 0.064, 0.44, 0.23);
    root.add(fin);
  }

  // Illuminated corporate brand fascia (12 tris)
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.015), goldAccentMat);
  fascia.position.set(0, 0.31, 0.235);
  root.add(fascia);

  // Glass entrance canopy (12 tris)
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.02, 0.12), glassMat);
  canopy.position.set(0, 0.28, 0.28);
  root.add(canopy);

  // 4 Corner structural mullions (4 x Cylinder 8 segs = 128 tris)
  [-0.21, 0.21].forEach((cx) => {
    [-0.21, 0.21].forEach((cz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 8), darkAlumMat);
      col.position.set(cx, 0.17, cz);
      root.add(col);
    });
  });

  // Parapet roof rim (12 tris)
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.46), darkAlumMat);
  parapet.position.y = 0.585;
  root.add(parapet);

  // Rooftop mechanical HVAC unit (12 tris) and antenna mast (Cylinder 8 segs = 32 tris)
  const hvac = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), darkAlumMat);
  hvac.position.set(0.08, 0.61, -0.06);
  root.add(hvac);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.16, 8), darkAlumMat);
  antenna.position.set(-0.12, 0.65, -0.10);
  root.add(antenna);

  return root;
}

function buildMetropolisC2() {
  const root = new THREE.Group();
  root.name = 'Bld_Metropolis_C2_SapphirePlaza';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const graniteMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.5, metalness: 0.1 });
  const sapphireMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.85 });
  const metalFinMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.6 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.2 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Granite podium base (12 tris)
  const podium = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.10, 0.50), graniteMat);
  podium.position.y = 0.09;
  root.add(podium);

  // Octagonal chamfered sapphire glass tower (Cylinder 8 segs, 2 height segs = 64 tris)
  const octBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.62, 8, 2), sapphireMat);
  octBody.position.y = 0.45;
  root.add(octBody);

  // 3 Floor dividing spandrel plates (3 x 12 = 36 tris)
  [0.30, 0.46, 0.62].forEach((fy) => {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.025, 0.44), graniteMat);
    plate.position.y = fy;
    root.add(plate);
  });

  // Vertical facade fins (8 fins x 12 = 96 tris)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const fx = Math.cos(angle) * 0.245;
    const fz = Math.sin(angle) * 0.245;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.60, 0.05), metalFinMat);
    fin.position.set(fx, 0.45, fz);
    fin.rotation.y = -angle;
    root.add(fin);
  }

  // Entrance revolving door drum (Cylinder 12 segs = 48 tris)
  const doorDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.10, 12), goldMat);
  doorDrum.position.set(0, 0.14, 0.22);
  root.add(doorDrum);

  // Rooftop mechanical penthouse (12 tris) + 4 louvers (48 tris) = 60 tris
  const roofBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.10, 0.28), graniteMat);
  roofBox.position.y = 0.81;
  root.add(roofBox);
  for (let i = 0; i < 4; i++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.015, 0.015), metalFinMat);
    louver.position.set(0, 0.78 + i * 0.02, 0.145);
    root.add(louver);
  }

  // Antenna mast (Cylinder 8 segs = 32 tris)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.010, 0.22, 8), metalFinMat);
  mast.position.set(0, 0.97, 0);
  root.add(mast);

  return root;
}

function buildMetropolisC3() {
  const root = new THREE.Group();
  root.name = 'Bld_Metropolis_C3_DiamondTower';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.4, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.08, metalness: 0.88 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.95, roughness: 0.2 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.4, metalness: 0.6 });

  // Plinth foundation 0.55 x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  // Stepped podium (2 boxes = 24 tris)
  const pod1 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.52), stoneMat);
  pod1.position.y = 0.05;
  root.add(pod1);
  const pod2 = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.46), stoneMat);
  pod2.position.y = 0.105;
  root.add(pod2);

  // Tower Tier 1 (12 tris)
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.32, 0.40), glassMat);
  tier1.position.y = 0.29;
  root.add(tier1);

  // Tier 1 Corner columns (4 x 12 = 48 tris)
  [-0.20, 0.20].forEach((cx) => {
    [-0.20, 0.20].forEach((cz) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, 0.03), stoneMat);
      col.position.set(cx, 0.29, cz);
      root.add(col);
    });
  });

  // Terrace 1 cornice band (12 tris)
  const corn1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.42), goldMat);
  corn1.position.y = 0.462;
  root.add(corn1);

  // Tower Tier 2 (12 tris)
  const tier2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.30, 0.32), glassMat);
  tier2.position.y = 0.625;
  root.add(tier2);

  // Tier 2 Corner columns (4 x 12 = 48 tris)
  [-0.16, 0.16].forEach((cx) => {
    [-0.16, 0.16].forEach((cz) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.30, 0.025), stoneMat);
      col.position.set(cx, 0.625, cz);
      root.add(col);
    });
  });

  // Terrace 2 cornice band (12 tris)
  const corn2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.025, 0.34), goldMat);
  corn2.position.y = 0.787;
  root.add(corn2);

  // Tower Tier 3 (12 tris)
  const tier3 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), glassMat);
  tier3.position.y = 0.91;
  root.add(tier3);

  // Diamond-cut faceted crown (Cone 4 segs = 24 tris)
  const diamondCrown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.14, 4), darkMetalMat);
  diamondCrown.position.y = 1.09;
  diamondCrown.rotation.y = Math.PI / 4;
  root.add(diamondCrown);

  // Helipad disc (Cylinder 16 segs = 64 tris)
  const helipad = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.015, 16), stoneMat);
  helipad.position.y = 1.03;
  root.add(helipad);

  // Golden Spire needle (Cylinder 12 segs = 48 tris)
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.02, 0.28, 12), goldMat);
  spire.position.y = 1.25;
  root.add(spire);

  // Beacon sphere (Sphere 8x8 = 56 tris)
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), goldMat);
  beacon.position.y = 1.40;
  root.add(beacon);

  return root;
}

// Backward-compatible aliases
function buildBuildingC1() {
  return buildMetropolisC1();
}
function buildBuildingC2() {
  return buildMetropolisC2();
}
function buildBuildingC3() {
  return buildMetropolisC3();
}

// =========================================================================
// 2. LUXURY PAWNS Target: 550 - 1100 tris (Contract: >500, <=1200)
// =========================================================================

function buildPawnTower() {
  const root = new THREE.Group();
  root.name = 'Pawn_Tower_Citadel';

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    metalness: 0.9,
    roughness: 0.2,
    name: 'Mat_Brass',
  });
  const darkBrassMat = new THREE.MeshStandardMaterial({
    color: 0xB45309,
    metalness: 0.85,
    roughness: 0.3,
    name: 'Mat_DarkBrass',
  });

  // Base tier 1 (Cylinder 24 segs = 96 tris)
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.08, 24), brassMat);
  base1.position.y = 0.04;
  root.add(base1);

  // Base tier 2 (Cylinder 24 segs = 96 tris)
  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.08, 24), darkBrassMat);
  base2.position.y = 0.12;
  root.add(base2);

  // Base collar ring (Cylinder 24 segs = 96 tris)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 24), brassMat);
  collar.position.y = 0.19;
  root.add(collar);

  // Fluted body (Cylinder 24 segs, 2 height segs = 144 tris)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.65, 24, 2), brassMat);
  body.position.y = 0.545;
  root.add(body);

  // Capital cornice flare (Cylinder 24 segs = 96 tris)
  const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.22, 0.14, 24), darkBrassMat);
  capital.position.y = 0.94;
  root.add(capital);

  // Parapet battlement wall ring (Cylinder 24 segs = 96 tris)
  const parapet = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 24), brassMat);
  parapet.position.y = 1.07;
  root.add(parapet);

  // 4 Crenellations / Merlons (4 x 12 = 48 tris)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const mx = Math.cos(angle) * 0.28;
    const mz = Math.sin(angle) * 0.28;
    const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.12), brassMat);
    merlon.position.set(mx, 1.18, mz);
    root.add(merlon);
  }

  // Central viewing turret dome (Sphere 10x10 = 180 tris)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), darkBrassMat);
  dome.position.y = 1.15;
  root.add(dome);

  return root;
}

function buildPawnYacht() {
  const root = new THREE.Group();
  root.name = 'Pawn_Yacht_Superyacht';

  const platinumMat = new THREE.MeshStandardMaterial({
    color: 0xF1F5F9,
    roughness: 0.15,
    metalness: 0.92,
    name: 'Mat_DieCastPlatinum',
  });
  const darkPlatinumMat = new THREE.MeshStandardMaterial({
    color: 0x94A3B8,
    roughness: 0.18,
    metalness: 0.90,
    name: 'Mat_DieCastPlatinumDark',
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    roughness: 0.18,
    metalness: 0.90,
    name: 'Mat_DieCastGoldTrim',
  });

  // Stepped weighted base (2 x Cylinder 24 segs = 192 tris)
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.08, 24), platinumMat);
  base1.position.y = 0.04;
  root.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.36, 0.08, 24), darkPlatinumMat);
  base2.position.y = 0.12;
  root.add(base2);

  // Base collar ring (Cylinder 24 segs = 96 tris)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.06, 24), goldTrimMat);
  collar.position.y = 0.19;
  root.add(collar);

  // Lower hull wedge (Cone 4 segs = 24 tris)
  const bowKeel = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.65, 4), darkPlatinumMat);
  bowKeel.position.set(0, 0.30, 0.38);
  bowKeel.rotation.x = Math.PI / 2;
  bowKeel.rotation.y = Math.PI / 4;
  root.add(bowKeel);

  // Main hull body (Box 12 tris)
  const mainHull = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.70), platinumMat);
  mainHull.position.set(0, 0.30, -0.05);
  root.add(mainHull);

  // Gold waterline accent trim (12 tris)
  const waterlineTrim = new THREE.Mesh(new THREE.BoxGeometry(0.365, 0.02, 0.705), goldTrimMat);
  waterlineTrim.position.set(0, 0.30, -0.05);
  root.add(waterlineTrim);

  // Transom swim platform (12 tris)
  const transom = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.16), goldTrimMat);
  transom.position.set(0, 0.26, -0.45);
  root.add(transom);

  // Platinum main deck (12 tris)
  const mainDeck = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.65), darkPlatinumMat);
  mainDeck.position.set(0, 0.38, -0.05);
  root.add(mainDeck);

  // Salon superstructure tier 1 (Box 12 tris + gold trim 12 tris)
  const salon1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.48), platinumMat);
  salon1.position.set(0, 0.45, -0.02);
  root.add(salon1);

  const salonTrim = new THREE.Mesh(new THREE.BoxGeometry(0.285, 0.04, 0.44), goldTrimMat);
  salonTrim.position.set(0, 0.46, -0.02);
  root.add(salonTrim);

  // Flybridge tier 2 (Box 12 tris)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.10, 0.32), platinumMat);
  bridge.position.set(0, 0.56, -0.04);
  root.add(bridge);

  const bridgeTrim = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.03, 0.26), goldTrimMat);
  bridgeTrim.position.set(0, 0.57, -0.02);
  root.add(bridgeTrim);

  // Radar arch / Mast (Cylinder 12 segs = 48 tris)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.25, 12), goldTrimMat);
  mast.position.set(0, 0.72, -0.12);
  root.add(mast);

  // Satellite radar domes (2 x Sphere 10x10 = 360 tris)
  [-0.06, 0.06].forEach((sx) => {
    const radome = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), platinumMat);
    radome.position.set(sx, 0.68, -0.15);
    root.add(radome);
  });

  return root;
}

function buildPawnCar() {
  const root = new THREE.Group();
  root.name = 'Pawn_Car_Roadster';

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    metalness: 0.9,
    roughness: 0.18,
    name: 'Mat_BrassCar',
  });
  const darkBrassMat = new THREE.MeshStandardMaterial({
    color: 0xB45309,
    metalness: 0.9,
    roughness: 0.2,
    name: 'Mat_DarkBrassCar',
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    metalness: 0.92,
    roughness: 0.15,
    name: 'Mat_ChromeCar',
  });

  // Stepped weighted base (2 x Cylinder 24 segs = 192 tris)
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.08, 24), brassMat);
  base1.position.y = 0.04;
  root.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.36, 0.08, 24), darkBrassMat);
  base2.position.y = 0.12;
  root.add(base2);

  // Base collar ring (Cylinder 24 segs = 96 tris)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.06, 24), brassMat);
  collar.position.y = 0.19;
  root.add(collar);

  // Car chassis & main body (Box 12 tris)
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.62), brassMat);
  chassis.position.set(0, 0.31, 0);
  root.add(chassis);

  // Engine hood torpedo taper (Cone 4 segs = 24 tris)
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 4), brassMat);
  hood.position.set(0, 0.32, 0.38);
  hood.rotation.x = Math.PI / 2;
  hood.rotation.y = Math.PI / 4;
  root.add(hood);

  // Chrome Radiator grille (Box 12 tris)
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.15, 0.04), chromeMat);
  grille.position.set(0, 0.32, 0.52);
  root.add(grille);

  // 4 Wheels: die-cast wire-spoke metal wheels (Cylinders 12 segs)
  const wheelPositions = [
    [-0.16, 0.27, 0.22],
    [0.16, 0.27, 0.22],
    [-0.16, 0.27, -0.22],
    [0.16, 0.27, -0.22],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12), darkBrassMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(wx, wy, wz);
    root.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.052, 12), chromeMat);
    rim.rotation.z = Math.PI / 2;
    rim.position.set(wx, wy, wz);
    root.add(rim);
  });

  // Cockpit interior & seat (cast metal, no leather)
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.16), darkBrassMat);
  seat.position.set(0, 0.37, -0.06);
  root.add(seat);

  // Windshield (cast metal, no glass)
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.02), chromeMat);
  windshield.position.set(0, 0.41, 0.06);
  windshield.rotation.x = -Math.PI / 6;
  root.add(windshield);

  // Round headlights (2 x Cylinder 10 segs = 72 tris)
  [-0.09, 0.09].forEach((hx) => {
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), chromeMat);
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(hx, 0.33, 0.51);
    root.add(lamp);
  });

  return root;
}

function buildPawnDog() {
  const root = new THREE.Group();
  root.name = 'Pawn_Dog_Corgi';

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    metalness: 0.95,
    roughness: 0.12,
    name: 'Mat_SilverDog',
  });
  const darkSilverMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    metalness: 0.92,
    roughness: 0.15,
    name: 'Mat_DarkSilverDog',
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.2,
    metalness: 0.8,
    name: 'Mat_DarkEyeNose',
  });
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xDC2626,
    roughness: 0.3,
    metalness: 0.3,
    name: 'Mat_RedCollar',
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    metalness: 0.9,
    roughness: 0.15,
    name: 'Mat_GoldBell',
  });

  // NO PEDESTAL BASE (Zero-Pedestal Invariant)

  // 4 Short Chubby Legs (4 x Cylinder 6 segs = 96 tris)
  [-0.065, 0.065].forEach((lx) => {
    [-0.07, 0.07].forEach((lz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.08, 6), darkSilverMat);
      leg.position.set(lx, 0.04, lz);
      root.add(leg);
    });
  });

  // Plump Round Body (Sphere 10x10 = 180 tris)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), silverMat);
  body.position.set(0, 0.13, 0);
  root.add(body);

  // Big Cute Head with Chubby Cheeks (Sphere 10x10 = 180 tris)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), silverMat);
  head.position.set(0, 0.23, 0.07);
  root.add(head);

  // Snout (Sphere 6x6 = 60 tris)
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), darkSilverMat);
  snout.position.set(0, 0.21, 0.14);
  root.add(snout);

  // Button Nose (Sphere 4x4 = 24 tris)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), darkMat);
  nose.position.set(0, 0.22, 0.17);
  root.add(nose);

  // Expressive Dark Eyes (2 x Sphere 4x4 = 48 tris)
  [-0.04, 0.04].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), darkMat);
    eye.position.set(ex, 0.25, 0.15);
    root.add(eye);
  });

  // Upright Rounded Corgi Ears (2 x Cone 6 segs = 24 tris)
  [-0.06, 0.06].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 6), darkSilverMat);
    ear.position.set(ex, 0.33, 0.04);
    ear.rotation.z = ex > 0 ? -0.15 : 0.15;
    root.add(ear);
  });

  // Player Accent Collar (Torus 6x12 = 72 tris)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.014, 6, 12), redMat);
  collar.position.set(0, 0.18, 0.04);
  collar.rotation.x = Math.PI / 2;
  root.add(collar);

  // Golden Bell (Sphere 6x6 = 60 tris)
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), goldMat);
  bell.position.set(0, 0.17, 0.12);
  root.add(bell);

  // Wagging Tail (Cylinder 6 segs = 24 tris)
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.07, 6), darkSilverMat);
  tail.position.set(0, 0.15, -0.12);
  tail.rotation.x = -Math.PI / 4;
  root.add(tail);

  return root;
}

function buildPawnCat() {
  const root = new THREE.Group();
  root.name = 'Pawn_Cat_Fortune';

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    metalness: 0.95,
    roughness: 0.12,
    name: 'Mat_SilverCat',
  });
  const darkSilverMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    metalness: 0.92,
    roughness: 0.15,
    name: 'Mat_DarkSilverCat',
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.2,
    metalness: 0.8,
    name: 'Mat_DarkEyeNose',
  });
  const pinkMat = new THREE.MeshStandardMaterial({
    color: 0xF43F5E,
    roughness: 0.3,
    metalness: 0.2,
    name: 'Mat_PinkNose',
  });
  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x3B82F6,
    roughness: 0.3,
    metalness: 0.3,
    name: 'Mat_BlueBib',
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    metalness: 0.9,
    roughness: 0.15,
    name: 'Mat_GoldCoin',
  });

  // NO PEDESTAL BASE (Zero-Pedestal Invariant)

  // Plump Sitting Body (Sphere 10x10 = 180 tris)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), silverMat);
  body.position.set(0, 0.13, 0);
  root.add(body);

  // Head (Sphere 10x10 = 180 tris)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), silverMat);
  head.position.set(0, 0.25, 0.02);
  root.add(head);

  // Pointed Cat Ears (2 x Cone 6 segs = 24 tris)
  [-0.06, 0.06].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.065, 6), darkSilverMat);
    ear.position.set(ex, 0.34, 0.02);
    ear.rotation.z = ex > 0 ? -0.18 : 0.18;
    root.add(ear);
  });

  // Expressive Eyes (2 x Sphere 4x4 = 48 tris)
  [-0.045, 0.045].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), darkMat);
    eye.position.set(ex, 0.26, 0.11);
    root.add(eye);
  });

  // Cute Pink Nose (Sphere 4x4 = 24 tris)
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 4), pinkMat);
  nose.position.set(0, 0.24, 0.12);
  root.add(nose);

  // Waving Right Arm (Cylinder 6 segs + Sphere 6x6 = 24 + 60 = 84 tris)
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.03, 0.11, 6), silverMat);
  arm.position.set(0.085, 0.23, 0.05);
  arm.rotation.set(0.4, 0, -0.3);
  root.add(arm);

  const paw = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), silverMat);
  paw.position.set(0.115, 0.29, 0.08);
  root.add(paw);

  // Left Paw with Golden Koban Coin (Cylinder 10 segs = 40 tris)
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.015, 10), goldMat);
  coin.position.set(-0.05, 0.14, 0.11);
  coin.rotation.set(Math.PI / 4, 0, -Math.PI / 6);
  root.add(coin);

  // Player Accent Bib (Cylinder 8 segs = 32 tris)
  const bib = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.025, 8), blueMat);
  bib.position.set(0, 0.19, 0.08);
  root.add(bib);

  return root;
}

function buildPawnHorse() {
  const root = new THREE.Group();
  root.name = 'Pawn_Horse_Knight';

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    metalness: 0.95,
    roughness: 0.12,
    name: 'Mat_SilverHorse',
  });
  const darkSilverMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    metalness: 0.92,
    roughness: 0.15,
    name: 'Mat_DarkSilverHorse',
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.2,
    metalness: 0.8,
    name: 'Mat_DarkEyeNose',
  });
  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x10B981,
    roughness: 0.3,
    metalness: 0.2,
    name: 'Mat_GreenSaddle',
  });

  // NO PEDESTAL BASE (Zero-Pedestal Invariant)

  // 4 Short Sturdy Legs (4 x Cylinder 6 segs = 96 tris)
  [-0.065, 0.065].forEach((lx) => {
    [-0.07, 0.07].forEach((lz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.08, 6), darkSilverMat);
      leg.position.set(lx, 0.04, lz);
      root.add(leg);
    });
  });

  // Round Chubby Body (Sphere 10x10 = 180 tris)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), silverMat);
  body.position.set(0, 0.13, -0.01);
  root.add(body);

  // Saddle Blanket (Box 12 tris)
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.035, 0.13), greenMat);
  saddle.position.set(0, 0.19, -0.01);
  root.add(saddle);

  // Head (Sphere 10x10 = 180 tris)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), silverMat);
  head.position.set(0, 0.25, 0.08);
  root.add(head);

  // Muzzle (Box 12 tris)
  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.065, 0.08), silverMat);
  muzzle.position.set(0, 0.21, 0.14);
  root.add(muzzle);

  // Friendly Dark Eyes (2 x Sphere 4x4 = 48 tris)
  [-0.045, 0.045].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), darkMat);
    eye.position.set(ex, 0.26, 0.13);
    root.add(eye);
  });

  // Pointed Ears (2 x Cone 4 segs = 16 tris)
  [-0.035, 0.035].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 4), darkSilverMat);
    ear.position.set(ex, 0.33, 0.06);
    ear.rotation.z = ex > 0 ? -0.15 : 0.15;
    root.add(ear);
  });

  // Mane ridges (3 stacked boxes = 36 tris)
  [-0.03, 0.01, 0.05].forEach((z, i) => {
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.035, 0.035), darkSilverMat);
    mane.position.set(0, 0.22 + i * 0.04, z - 0.04);
    mane.rotation.x = 0.2;
    root.add(mane);
  });

  return root;
}

function buildPawnElephant() {
  const root = new THREE.Group();
  root.name = 'Pawn_Elephant_Royal';

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    metalness: 0.95,
    roughness: 0.12,
    name: 'Mat_SilverElephant',
  });
  const darkSilverMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    metalness: 0.92,
    roughness: 0.15,
    name: 'Mat_DarkSilverElephant',
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.2,
    metalness: 0.8,
    name: 'Mat_DarkEyeNose',
  });
  const purpleMat = new THREE.MeshStandardMaterial({
    color: 0xA855F7,
    roughness: 0.3,
    metalness: 0.2,
    name: 'Mat_PurpleBlanket',
  });

  // NO PEDESTAL BASE (Zero-Pedestal Invariant)

  // 4 Pillared Legs (4 x Cylinder 6 segs = 96 tris)
  [-0.07, 0.07].forEach((lx) => {
    [-0.07, 0.07].forEach((lz) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.035, 0.08, 6), darkSilverMat);
      leg.position.set(lx, 0.04, lz);
      root.add(leg);
    });
  });

  // Plump Round Body (Sphere 10x10 = 180 tris)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), silverMat);
  body.position.set(0, 0.14, -0.02);
  root.add(body);

  // Royal Blanket (Box 12 tris)
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.14), purpleMat);
  blanket.position.set(0, 0.22, -0.02);
  root.add(blanket);

  // Head (Sphere 10x10 = 180 tris)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), silverMat);
  head.position.set(0, 0.23, 0.07);
  root.add(head);

  // Upraised Trunk (Cylinder 8 segs = 32 tris)
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.16, 8), darkSilverMat);
  trunk.position.set(0, 0.28, 0.17);
  trunk.rotation.x = 0.8;
  root.add(trunk);

  // Soft Flapping Ears (2 x Box 12 tris = 24 tris)
  [-0.10, 0.10].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.09, 0.07), darkSilverMat);
    ear.position.set(ex, 0.24, 0.07);
    ear.rotation.y = ex > 0 ? -0.4 : 0.4;
    root.add(ear);
  });

  // Friendly Dark Eyes (2 x Sphere 4x4 = 48 tris)
  [-0.05, 0.05].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), darkMat);
    eye.position.set(ex, 0.25, 0.13);
    root.add(eye);
  });

  return root;
}

// =========================================================================
// 3. LANDMARKS Target: 750 - 1450 tris (Contract: >700, <=1500)
// =========================================================================

function buildBenThanhLandmark() {
  const root = new THREE.Group();
  root.name = 'Landmark_BenThanh_Detailed';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.65, metalness: 0.1 });
  const shedWallMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.55, metalness: 0.05 });
  const roofRedMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.35, metalness: 0.1 });
  const roofDarkRedMat = new THREE.MeshStandardMaterial({ color: 0xB91C1C, roughness: 0.4, metalness: 0.1 });
  const roofDeepRedMat = new THREE.MeshStandardMaterial({ color: 0x991B1B, roughness: 0.45, metalness: 0.1 });
  const towerYellowMat = new THREE.MeshStandardMaterial({ color: 0xFDE047, roughness: 0.45, metalness: 0.15 });
  const archGateMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8, metalness: 0.2 });
  const clockFaceMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A,
    emissive: 0xFEF08A,
    emissiveIntensity: 0.4,
    roughness: 0.2,
  });
  const clockRimMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.5, metalness: 0.6 });
  const clockHandMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3, metalness: 0.8 });
  const flagPoleMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.2 });
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.5 });

  // Plinth foundation (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.05, 1.05), plinthMat);
  plinth.position.y = 0.025;
  root.add(plinth);

  // Market pavilion shed (12 tris)
  const shed = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.20, 0.60), shedWallMat);
  shed.position.set(0, 0.15, 0.2);
  root.add(shed);

  // Market shed roof (Cone 4 segs = 24 tris)
  const shedRoof = new THREE.Mesh(new THREE.ConeGeometry(0.74, 0.16, 4), roofDarkRedMat);
  shedRoof.position.set(0, 0.33, 0.2);
  shedRoof.rotation.y = Math.PI / 4;
  root.add(shedRoof);

  // Central Clock Tower Body (12 tris)
  const tower = new THREE.Group();
  tower.position.set(0, 0, -0.2);

  const towerBody = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.45, 0.44), towerYellowMat);
  towerBody.position.set(0, 0.275, 0);
  tower.add(towerBody);

  // Triple entrance arches: 3 arches on front facade (3 x 48 = 144 tris)
  [-0.12, 0, 0.12].forEach((ax) => {
    const archHole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.02), archGateMat);
    archHole.position.set(ax, 0.13, -0.222);
    tower.add(archHole);

    const archCurve = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12, 1, false, 0, Math.PI), archGateMat);
    archCurve.rotation.z = -Math.PI / 2;
    archCurve.rotation.y = Math.PI / 2;
    archCurve.position.set(ax, 0.21, -0.222);
    tower.add(archCurve);
  });

  // Quad Clock Faces on 4 sides of the tower (4 x Cylinder 16 segs = 4 x 64 = 256 tris)
  const clockRotations = [
    { pos: [0, 0.36, -0.223], rot: [Math.PI / 2, 0, 0] }, // Front (-Z)
    { pos: [0, 0.36, 0.223], rot: [-Math.PI / 2, 0, 0] }, // Back (+Z)
    { pos: [-0.223, 0.36, 0], rot: [0, 0, -Math.PI / 2] }, // Left (-X)
    { pos: [0.223, 0.36, 0], rot: [0, 0, Math.PI / 2] }, // Right (+X)
  ];

  clockRotations.forEach(({ pos, rot }) => {
    const cRim = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.015, 16), clockRimMat);
    cRim.position.set(pos[0], pos[1], pos[2]);
    cRim.rotation.set(rot[0], rot[1], rot[2]);
    tower.add(cRim);

    const cFace = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.018, 16), clockFaceMat);
    cFace.position.set(pos[0], pos[1], pos[2]);
    cFace.rotation.set(rot[0], rot[1], rot[2]);
    tower.add(cFace);
  });

  // Clock hands on front face (24 tris)
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.045, 0.003), clockHandMat);
  hourHand.position.set(-0.012, 0.375, -0.235);
  hourHand.rotation.z = Math.PI / 6;
  tower.add(hourHand);

  const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.060, 0.003), clockHandMat);
  minHand.position.set(0.015, 0.380, -0.235);
  minHand.rotation.z = -Math.PI / 4;
  tower.add(minHand);

  // 3-Tier Hipped Roof Pyramids (3 x Cone 4 segs = 72 tris)
  const roofT1 = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.16, 4), roofRedMat);
  roofT1.position.set(0, 0.58, 0);
  roofT1.rotation.y = Math.PI / 4;
  tower.add(roofT1);

  const roofT2 = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.12, 4), roofDarkRedMat);
  roofT2.position.set(0, 0.68, 0);
  roofT2.rotation.y = Math.PI / 4;
  tower.add(roofT2);

  const roofT3 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.08, 4), roofDeepRedMat);
  roofT3.position.set(0, 0.76, 0);
  roofT3.rotation.y = Math.PI / 4;
  tower.add(roofT3);

  // Flagpole & Flag (Cylinder 12 segs = 48 tris)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.16, 12), flagPoleMat);
  pole.position.set(0, 0.86, 0);
  tower.add(pole);

  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.002), flagMat);
  flag.position.set(0.045, 0.90, 0);
  tower.add(flag);

  root.add(tower);
  return root;
}

function buildCathedralLandmark() {
  const root = new THREE.Group();
  root.name = 'Landmark_Cathedral_Detailed';

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const brickRedMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.65, metalness: 0.1 });
  const roofBrownMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.55 });
  const spireDarkMat = new THREE.MeshStandardMaterial({ color: 0x451A03, roughness: 0.4, metalness: 0.2 });
  const roseWindowMat = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    emissive: 0x38BDF8,
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.8,
  });
  const goldMetalMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    metalness: 0.9,
    roughness: 0.25,
    emissive: 0xF59E0B,
    emissiveIntensity: 0.2,
  });
  const portalMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 });

  // Plinth foundation (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.05, 0.85), plinthMat);
  plinth.position.set(0, 0.025, 0.1);
  root.add(plinth);

  // Nave sanctuary (12 tris)
  const sanctuary = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.44, 0.72), brickRedMat);
  sanctuary.position.set(0, 0.27, 0.1);
  root.add(sanctuary);

  // 6 Side Buttresses on Nave (6 x 12 = 72 tris)
  [-0.34, 0.34].forEach((bx) => {
    [-0.15, 0.10, 0.35].forEach((bz) => {
      const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.08), brickRedMat);
      buttress.position.set(bx, 0.24, bz);
      root.add(buttress);
    });
  });

  // Rear Apse semicircular ambulatory (Cylinder 16 segs = 64 tris)
  const apse = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.44, 16, 1, false, 0, Math.PI), brickRedMat);
  apse.position.set(0, 0.27, 0.46);
  root.add(apse);

  // Apse cone roof (Cone 16 segs = 32 tris)
  const apseRoof = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 16, 1, false, 0, Math.PI), roofBrownMat);
  apseRoof.position.set(0, 0.55, 0.46);
  root.add(apseRoof);

  // Nave pitched roof (Cone 4 segs = 24 tris)
  const sanctuaryRoof = new THREE.Mesh(new THREE.ConeGeometry(0.50, 0.24, 4), roofBrownMat);
  sanctuaryRoof.position.set(0, 0.56, 0.1);
  sanctuaryRoof.rotation.y = Math.PI / 4;
  root.add(sanctuaryRoof);

  // Triple recessed portal arches (3 x 48 = 144 tris)
  [-0.14, 0, 0.14].forEach((px) => {
    const portal = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.02), portalMat);
    portal.position.set(px, 0.12, -0.262);
    root.add(portal);

    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12, 1, false, 0, Math.PI), portalMat);
    arch.rotation.z = -Math.PI / 2;
    arch.rotation.y = Math.PI / 2;
    arch.position.set(px, 0.19, -0.262);
    root.add(arch);
  });

  // Rose Window (Cylinder 24 segs = 96 tris)
  const roseRim = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.015, 24), goldMetalMat);
  roseRim.rotation.x = Math.PI / 2;
  roseRim.position.set(0, 0.35, -0.262);
  root.add(roseRim);

  const roseGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.018, 24), roseWindowMat);
  roseGlass.rotation.x = Math.PI / 2;
  roseGlass.position.set(0, 0.35, -0.262);
  root.add(roseGlass);

  // Twin Bell Towers (Left & Right)
  [-0.24, 0.24].forEach((tx) => {
    const tower = new THREE.Group();
    tower.position.set(tx, 0, -0.2);

    // Tower brick body (12 tris)
    const tBody = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.74, 0.22), brickRedMat);
    tBody.position.y = 0.42;
    tower.add(tBody);

    // 4 Belfry louvers on 4 sides of each tower (4 x Cylinder 12 segs = 4 x 48 = 192 tris)
    const belfryRots = [
      { pos: [0, 0.62, -0.112], rot: [0, 0, 0] },
      { pos: [0, 0.62, 0.112], rot: [0, Math.PI, 0] },
      { pos: [-0.112, 0.62, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [0.112, 0.62, 0], rot: [0, -Math.PI / 2, 0] },
    ];
    belfryRots.forEach(({ pos, rot }) => {
      const louver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.01), portalMat);
      louver.position.set(pos[0], pos[1], pos[2]);
      louver.rotation.set(rot[0], rot[1], rot[2]);
      tower.add(louver);
    });

    // Tall Gothic spire (Cone 4 segs = 24 tris)
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 4), spireDarkMat);
    spire.position.y = 0.96;
    spire.rotation.y = Math.PI / 4;
    tower.add(spire);

    // Latin Cross (24 tris)
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.10, 0.014), goldMetalMat);
    crossV.position.y = 1.18;
    tower.add(crossV);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 0.014), goldMetalMat);
    crossH.position.y = 1.20;
    tower.add(crossH);

    root.add(tower);
  });

  return root;
}

// =========================================================================
// 4. MICRO VEHICLES Target: 150 - 380 tris (Contract: <= 400)
// =========================================================================

function buildVehicleBus() {
  const root = new THREE.Group();
  root.name = 'Vehicle_Bus';

  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.8 });

  // Body box (12 tris)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.58), yellowMat);
  body.position.y = 0.14;
  root.add(body);

  // Panoramic windows strip (12 tris)
  const windows = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.07, 0.50), glassMat);
  windows.position.y = 0.16;
  root.add(windows);

  // Roof AC unit (12 tris)
  const ac = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.22), yellowMat);
  ac.position.y = 0.25;
  root.add(ac);

  // 4 Wheels: Cylinder 12 segs = 48 tris x 4 = 192 tris
  const wheels = [
    [-0.13, 0.06, 0.18],
    [0.13, 0.06, 0.18],
    [-0.13, 0.06, -0.18],
    [0.13, 0.06, -0.18],
  ];
  wheels.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), darkMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    root.add(wheel);
  });

  return root;
}

function buildVehicleTaxi() {
  const root = new THREE.Group();
  root.name = 'Vehicle_Taxi';

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.25 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
  const amberMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, emissive: 0xF59E0B, emissiveIntensity: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.8 });

  // Chassis & hood (12 tris)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.44), greenMat);
  body.position.y = 0.09;
  root.add(body);

  // Cabin greenhouse (12 tris)
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.24), whiteMat);
  cabin.position.set(0, 0.16, -0.02);
  root.add(cabin);

  // Window strip (12 tris)
  const windows = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.05, 0.22), glassMat);
  windows.position.set(0, 0.16, -0.02);
  root.add(windows);

  // Rooftop taxi sign (12 tris)
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.04), amberMat);
  sign.position.set(0, 0.215, -0.02);
  root.add(sign);

  // 4 Wheels: 4 x Cylinder 12 segs = 192 tris
  const wheels = [
    [-0.12, 0.05, 0.14],
    [0.12, 0.05, 0.14],
    [-0.12, 0.05, -0.14],
    [0.12, 0.05, -0.14],
  ];
  wheels.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), darkMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    root.add(wheel);
  });

  return root;
}

function buildVehicleSedan() {
  const root = new THREE.Group();
  root.name = 'Vehicle_Sedan';

  const blueMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.2, metalness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xBAE6FD, roughness: 0.1, metalness: 0.85 });

  // Lower body (12 tris)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.46), blueMat);
  body.position.y = 0.09;
  root.add(body);

  // Cabin (12 tris)
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.24), glassMat);
  cabin.position.set(0, 0.16, -0.02);
  root.add(cabin);

  // Roof (12 tris)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.02, 0.20), blueMat);
  roof.position.set(0, 0.20, -0.02);
  root.add(roof);

  // 4 Wheels: 4 x Cylinder 12 segs = 192 tris
  const wheels = [
    [-0.12, 0.05, 0.14],
    [0.12, 0.05, 0.14],
    [-0.12, 0.05, -0.14],
    [0.12, 0.05, -0.14],
  ];
  wheels.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), darkMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    root.add(wheel);
  });

  return root;
}

function buildVehicleVan() {
  const root = new THREE.Group();
  root.name = 'Vehicle_Van';

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.8 });

  // Main van cargo body (12 tris)
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.48), whiteMat);
  body.position.y = 0.13;
  root.add(body);

  // Front cabin hood step (12 tris)
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.08, 0.12), whiteMat);
  hood.position.set(0, 0.09, 0.26);
  root.add(hood);

  // Windshield (12 tris)
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.04), glassMat);
  windshield.position.set(0, 0.16, 0.22);
  windshield.rotation.x = -Math.PI / 8;
  root.add(windshield);

  // 4 Wheels: 4 x Cylinder 12 segs = 192 tris
  const wheels = [
    [-0.13, 0.05, 0.18],
    [0.13, 0.05, 0.18],
    [-0.13, 0.05, -0.16],
    [0.13, 0.05, -0.16],
  ];
  wheels.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), darkMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    root.add(wheel);
  });

  return root;
}

function buildVehicleBoat() {
  const root = new THREE.Group();
  root.name = 'Vehicle_Boat';

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.2 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xEA580C, roughness: 0.35 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.8 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.8, roughness: 0.2 });

  // V-Hull bow (Cone 4 segs = 24 tris)
  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 4), whiteMat);
  bow.position.set(0, 0.06, 0.18);
  bow.rotation.x = Math.PI / 2;
  bow.rotation.y = Math.PI / 4;
  root.add(bow);

  // Main hull body (12 tris)
  const hull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.36), whiteMat);
  hull.position.set(0, 0.06, -0.06);
  root.add(hull);

  // Coast guard orange stripe (12 tris)
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.03, 0.30), orangeMat);
  stripe.position.set(0, 0.08, -0.04);
  root.add(stripe);

  // Windshield (12 tris)
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.06, 0.04), glassMat);
  windshield.position.set(0, 0.13, 0.08);
  windshield.rotation.x = -Math.PI / 6;
  root.add(windshield);

  // Cockpit seats (2 x 12 = 24 tris)
  [-0.06, 0.06].forEach((sx) => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.08), orangeMat);
    seat.position.set(sx, 0.10, -0.02);
    root.add(seat);
  });

  // Bow handrail (2 x 12 = 24 tris)
  [-0.10, 0.10].forEach((rx) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.22), chromeMat);
    rail.position.set(rx, 0.12, 0.12);
    root.add(rail);
  });

  // Twin Outboard Motors: 2 x Cylinder 12 segs = 96 tris
  [-0.08, 0.08].forEach((mx) => {
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.12, 12), chromeMat);
    motor.position.set(mx, 0.05, -0.26);
    root.add(motor);
  });

  return root;
}

function buildVehicleContainer() {
  const root = new THREE.Group();
  root.name = 'Vehicle_Container';

  const redMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.4 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1E40AF, roughness: 0.45 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.1, metalness: 0.8 });

  // Truck tractor cab (12 tris)
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.22), redMat);
  cab.position.set(0, 0.14, 0.32);
  root.add(cab);

  // Windshield (12 tris)
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.02), glassMat);
  windshield.position.set(0, 0.17, 0.435);
  root.add(windshield);

  // Container trailer chassis (12 tris)
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.52), darkMat);
  chassis.position.set(0, 0.06, -0.06);
  root.add(chassis);

  // 20ft Cargo Container box (12 tris)
  const container = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.48), blueMat);
  container.position.set(0, 0.17, -0.08);
  root.add(container);

  // 6 Wheels: 6 x Cylinder 12 segs = 288 tris
  const wheels = [
    [-0.13, 0.05, 0.34],
    [0.13, 0.05, 0.34],
    [-0.13, 0.05, -0.18],
    [0.13, 0.05, -0.18],
    [-0.13, 0.05, -0.28],
    [0.13, 0.05, -0.28],
  ];
  wheels.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), darkMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    root.add(wheel);
  });

  return root;
}

// =========================================================================
// MAIN GENERATOR PIPELINE
// =========================================================================
async function generateAllModels() {
  console.log('=== VTCOON HIGH-FIDELITY 3D ASSET GENERATOR (IMP-62) ===\n');

  const models = [
    // Regional Typology 1: Riverine (Sông Nước Nam Bộ)
    { scene: buildRiverineC1(), path: 'public/models/buildings/bld_riverine_c1.glb' },
    { scene: buildRiverineC2(), path: 'public/models/buildings/bld_riverine_c2.glb' },
    { scene: buildRiverineC3(), path: 'public/models/buildings/bld_riverine_c3.glb' },

    // Regional Typology 2: Resort (Nghỉ Dưỡng Biển & Núi)
    { scene: buildResortC1(), path: 'public/models/buildings/bld_resort_c1.glb' },
    { scene: buildResortC2(), path: 'public/models/buildings/bld_resort_c2.glb' },
    { scene: buildResortC3(), path: 'public/models/buildings/bld_resort_c3.glb' },

    // Regional Typology 3: Heritage (Phố Cổ & Di Sản)
    { scene: buildHeritageC1(), path: 'public/models/buildings/bld_heritage_c1.glb' },
    { scene: buildHeritageC2(), path: 'public/models/buildings/bld_heritage_c2.glb' },
    { scene: buildHeritageC3(), path: 'public/models/buildings/bld_heritage_c3.glb' },

    // Regional Typology 4: Metropolis (Siêu Đô Thị Tài Chính)
    { scene: buildMetropolisC1(), path: 'public/models/buildings/bld_metropolis_c1.glb' },
    { scene: buildMetropolisC2(), path: 'public/models/buildings/bld_metropolis_c2.glb' },
    { scene: buildMetropolisC3(), path: 'public/models/buildings/bld_metropolis_c3.glb' },

    // Backward-compatible fallback buildings
    { scene: buildBuildingC1(), path: 'public/models/buildings/building_c1.glb' },
    { scene: buildBuildingC2(), path: 'public/models/buildings/building_c2.glb' },
    { scene: buildBuildingC3(), path: 'public/models/buildings/building_c3.glb' },

    // Luxury Pawns (IMP-83 Silver Animals)
    { scene: buildPawnDog(), path: 'public/models/pawns/pawn_dog.glb' },
    { scene: buildPawnCat(), path: 'public/models/pawns/pawn_cat.glb' },
    { scene: buildPawnHorse(), path: 'public/models/pawns/pawn_horse.glb' },
    { scene: buildPawnElephant(), path: 'public/models/pawns/pawn_elephant.glb' },

    // Legacy Luxury Pawns (Retained for Contract & Backward-Compatibility)
    { scene: buildPawnTower(), path: 'public/models/pawns/pawn_tower.glb' },
    { scene: buildPawnYacht(), path: 'public/models/pawns/pawn_yacht.glb' },
    { scene: buildPawnCar(), path: 'public/models/pawns/pawn_car.glb' },

    // Landmarks
    { scene: buildBenThanhLandmark(), path: 'public/models/landmarks/landmark_ben_thanh.glb' },
    { scene: buildCathedralLandmark(), path: 'public/models/landmarks/landmark_cathedral.glb' },

    // Vehicles
    { scene: buildVehicleBus(), path: 'public/models/vehicles/vehicle_bus.glb' },
    { scene: buildVehicleTaxi(), path: 'public/models/vehicles/vehicle_taxi.glb' },
    { scene: buildVehicleSedan(), path: 'public/models/vehicles/vehicle_sedan.glb' },
    { scene: buildVehicleVan(), path: 'public/models/vehicles/vehicle_van.glb' },
    { scene: buildVehicleBoat(), path: 'public/models/vehicles/vehicle_boat.glb' },
    { scene: buildVehicleContainer(), path: 'public/models/vehicles/vehicle_container.glb' },
  ];

  for (const m of models) {
    const scene = new THREE.Scene();
    scene.add(m.scene);
    await exportSceneToGlb(scene, m.path);
  }

  console.log(`\n✓ Successfully generated all ${models.length} high-fidelity models.`);
}

generateAllModels().catch((err) => {
  console.error('Fatal error generating models:', err);
  process.exit(1);
});
