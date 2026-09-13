import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'node:fs';
import path from 'node:path';

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
          fs.writeFileSync(outputPath, Buffer.from(gltf));
          console.log(`✓ Exported ${outputPath} (${(gltf.byteLength / 1024).toFixed(1)} KB)`);
          resolve(outputPath);
        } else {
          reject(new Error('GLTFExporter did not return an ArrayBuffer'));
        }
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

// -------------------------------------------------------------
// 1. CHỢ BẾN THÀNH (Iconic Ben Thanh Market)
// -------------------------------------------------------------
function buildBenThanhModel() {
  const root = new THREE.Group();
  root.name = 'Landmark_BenThanh';

  // Vật liệu PBR
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0xE2E8F0,
    roughness: 0.65,
    metalness: 0.1,
    name: 'Mat_Plinth',
  });
  const shedWallMat = new THREE.MeshStandardMaterial({
    color: 0xFEF3C7,
    roughness: 0.55,
    metalness: 0.05,
    name: 'Mat_ShedWall',
  });
  const roofRedMat = new THREE.MeshStandardMaterial({
    color: 0xDC2626,
    roughness: 0.35,
    metalness: 0.1,
    name: 'Mat_RoofRed',
  });
  const roofDarkRedMat = new THREE.MeshStandardMaterial({
    color: 0xB91C1C,
    roughness: 0.4,
    metalness: 0.1,
    name: 'Mat_RoofDarkRed',
  });
  const roofDeepRedMat = new THREE.MeshStandardMaterial({
    color: 0x991B1B,
    roughness: 0.45,
    metalness: 0.1,
    name: 'Mat_RoofDeepRed',
  });
  const towerYellowMat = new THREE.MeshStandardMaterial({
    color: 0xFDE047,
    roughness: 0.45,
    metalness: 0.15,
    name: 'Mat_TowerYellow',
  });
  const archGateMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.8,
    metalness: 0.2,
    name: 'Mat_ArchGate',
  });
  const clockFaceMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A,
    emissive: 0xFEF08A,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    name: 'Mat_ClockFace',
  });
  const clockRimMat = new THREE.MeshStandardMaterial({
    color: 0x78350F,
    roughness: 0.5,
    metalness: 0.6,
    name: 'Mat_ClockRim',
  });
  const clockHandMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    roughness: 0.3,
    metalness: 0.8,
    name: 'Mat_ClockHand',
  });
  const flagPoleMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    metalness: 0.9,
    roughness: 0.2,
    name: 'Mat_FlagPole',
  });
  const flagMat = new THREE.MeshStandardMaterial({
    color: 0xDC2626,
    roughness: 0.5,
    name: 'Mat_Flag',
  });

  // A. Nền móng chợ lát đá vỉa hè
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 1.0), plinthMat);
  plinth.position.set(0, 0.02, 0);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  root.add(plinth);

  // B. Khối nhà lồng chợ phía sau
  const shed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.55), shedWallMat);
  shed.position.set(0, 0.13, 0.2);
  shed.castShadow = true;
  shed.receiveShadow = true;
  root.add(shed);

  // Mái ngói nhà lồng chợ
  const shedRoof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.14, 4), roofDarkRedMat);
  shedRoof.position.set(0, 0.29, 0.2);
  shedRoof.rotation.y = Math.PI / 4;
  shedRoof.castShadow = true;
  root.add(shedRoof);

  // C. Tháp đồng hồ trung tâm mặt tiền vươn cao
  const tower = new THREE.Group();
  tower.position.set(0, 0, -0.2);

  // 1. Thân tháp vàng kem Indochine
  const towerBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.42), towerYellowMat);
  towerBody.position.set(0, 0.24, 0);
  towerBody.castShadow = true;
  towerBody.receiveShadow = true;
  tower.add(towerBody);

  // Cổng vòm chợ phía dưới
  const archGate = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.02), archGateMat);
  archGate.position.set(0, 0.13, -0.212);
  tower.add(archGate);

  // Vòm cong trên cổng
  const archCurve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 12, 1, false, 0, Math.PI), archGateMat);
  archCurve.rotation.z = -Math.PI / 2;
  archCurve.rotation.y = Math.PI / 2;
  archCurve.position.set(0, 0.22, -0.212);
  tower.add(archCurve);

  // 2. Mặt đồng hồ tròn phía trước
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), clockFaceMat);
  clockFace.position.set(0, 0.33, -0.212);
  clockFace.rotation.y = Math.PI;
  tower.add(clockFace);

  const clockRim = new THREE.Mesh(new THREE.RingGeometry(0.075, 0.086, 16), clockRimMat);
  clockRim.position.set(0, 0.33, -0.214);
  clockRim.rotation.y = Math.PI;
  tower.add(clockRim);

  // Kim đồng hồ (chỉ 10h10)
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.045, 0.003), clockHandMat);
  hourHand.position.set(-0.012, 0.345, -0.216);
  hourHand.rotation.z = Math.PI / 6;
  tower.add(hourHand);

  const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.06, 0.003), clockHandMat);
  minuteHand.position.set(0.015, 0.35, -0.216);
  minuteHand.rotation.z = -Math.PI / 4;
  tower.add(minuteHand);

  // 3. Mái chóp ngói đỏ tam giác 3 tầng giật cấp đặc trưng
  // Tầng 1
  const roofTier1 = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.16, 4), roofRedMat);
  roofTier1.position.set(0, 0.50, 0);
  roofTier1.rotation.y = Math.PI / 4;
  roofTier1.castShadow = true;
  tower.add(roofTier1);

  // Tầng 2
  const roofTier2 = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.12, 4), roofDarkRedMat);
  roofTier2.position.set(0, 0.60, 0);
  roofTier2.rotation.y = Math.PI / 4;
  roofTier2.castShadow = true;
  tower.add(roofTier2);

  // Tầng 3
  const roofTier3 = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.08, 4), roofDeepRedMat);
  roofTier3.position.set(0, 0.68, 0);
  roofTier3.rotation.y = Math.PI / 4;
  roofTier3.castShadow = true;
  tower.add(roofTier3);

  // Cột cờ và lá cờ đỉnh tháp
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.14, 8), flagPoleMat);
  pole.position.set(0, 0.77, 0);
  tower.add(pole);

  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.002), flagMat);
  flag.position.set(0.035, 0.81, 0);
  tower.add(flag);

  root.add(tower);
  return root;
}

// -------------------------------------------------------------
// 2. NHÀ THỜ ĐỨC BÀ CỔ (Heritage Cathedral)
// -------------------------------------------------------------
function buildCathedralModel() {
  const root = new THREE.Group();
  root.name = 'Landmark_Cathedral';

  // Vật liệu PBR
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    roughness: 0.7,
    name: 'Mat_CathPlinth',
  });
  const brickRedMat = new THREE.MeshStandardMaterial({
    color: 0xB45309,
    roughness: 0.65,
    metalness: 0.1,
    name: 'Mat_BrickRed',
  });
  const roofBrownMat = new THREE.MeshStandardMaterial({
    color: 0x78350F,
    roughness: 0.55,
    name: 'Mat_RoofBrown',
  });
  const spireDarkMat = new THREE.MeshStandardMaterial({
    color: 0x451A03,
    roughness: 0.4,
    metalness: 0.2,
    name: 'Mat_SpireDark',
  });
  const roseWindowMat = new THREE.MeshStandardMaterial({
    color: 0x0284C7,
    emissive: 0x38BDF8,
    emissiveIntensity: 0.35,
    roughness: 0.1,
    metalness: 0.8,
    name: 'Mat_RoseWindow',
  });
  const goldMetalMat = new THREE.MeshStandardMaterial({
    color: 0xF59E0B,
    metalness: 0.9,
    roughness: 0.25,
    emissive: 0xF59E0B,
    emissiveIntensity: 0.2,
    name: 'Mat_GoldMetal',
  });
  const portalMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    roughness: 0.8,
    name: 'Mat_Portal',
  });

  // A. Nền móng đá
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.8), plinthMat);
  plinth.position.set(0, 0.02, 0.1);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  root.add(plinth);

  // B. Gian thánh đường chính bằng gạch nung đỏ
  const sanctuary = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.7), brickRedMat);
  sanctuary.position.set(0, 0.24, 0.1);
  sanctuary.castShadow = true;
  sanctuary.receiveShadow = true;
  root.add(sanctuary);

  // Mái ngói thánh đường chữ V vát dốc
  const sanctuaryRoof = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.22, 4), roofBrownMat);
  sanctuaryRoof.position.set(0, 0.52, 0.1);
  sanctuaryRoof.rotation.y = Math.PI / 4;
  sanctuaryRoof.castShadow = true;
  root.add(sanctuaryRoof);

  // Cửa sổ hoa hồng tròn (Rose Window) mặt tiền
  const rose = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), roseWindowMat);
  rose.position.set(0, 0.32, -0.255);
  rose.rotation.y = Math.PI;
  root.add(rose);

  const roseRim = new THREE.Mesh(new THREE.RingGeometry(0.085, 0.096, 16), goldMetalMat);
  roseRim.position.set(0, 0.32, -0.257);
  roseRim.rotation.y = Math.PI;
  root.add(roseRim);

  // Cổng vòm thánh đường
  const portal = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.02), portalMat);
  portal.position.set(0, 0.11, -0.255);
  root.add(portal);

  // C. Hai tháp chuông đôi đối xứng vươn cao
  [-0.24, 0.24].forEach((tx) => {
    const spireGroup = new THREE.Group();
    spireGroup.position.set(tx, 0, -0.2);

    // Thân tháp vuông gạch nung
    const spireBody = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), brickRedMat);
    spireBody.position.set(0, 0.37, 0);
    spireBody.castShadow = true;
    spireBody.receiveShadow = true;
    spireGroup.add(spireBody);

    // Cửa vòm tháp chuông (belfry louvers)
    const belfry1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.01), portalMat);
    belfry1.position.set(0, 0.58, -0.102);
    spireGroup.add(belfry1);

    // Chóp nhọn Gothic - Romanesque
    const spireCone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 4), spireDarkMat);
    spireCone.position.set(0, 0.85, 0);
    spireCone.rotation.y = Math.PI / 4;
    spireCone.castShadow = true;
    spireGroup.add(spireCone);

    // Thánh giá kim loại đỉnh tháp
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.09, 0.012), goldMetalMat);
    crossV.position.set(0, 1.05, 0);
    spireGroup.add(crossV);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.012), goldMetalMat);
    crossH.position.set(0, 1.07, 0);
    spireGroup.add(crossH);

    root.add(spireGroup);
  });

  return root;
}

// -------------------------------------------------------------
// MAIN EXECUTION
// -------------------------------------------------------------
async function main() {
  console.log('Building Landmark 3D Models...');

  const benThanhScene = new THREE.Scene();
  benThanhScene.add(buildBenThanhModel());
  await exportSceneToGlb(benThanhScene, 'public/models/landmarks/landmark_ben_thanh.glb');

  const cathedralScene = new THREE.Scene();
  cathedralScene.add(buildCathedralModel());
  await exportSceneToGlb(cathedralScene, 'public/models/landmarks/landmark_cathedral.glb');

  console.log('Done generating landmark models!');
}

main().catch((err) => {
  console.error('Fatal error generating landmarks:', err);
  process.exit(1);
});
