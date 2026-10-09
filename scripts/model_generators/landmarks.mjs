import * as THREE from 'three';

export function buildBenThanhLandmark() {
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

export function buildCathedralLandmark() {
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

export const BESPOKE_LANDMARK_CELLS = [
  1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39,
];

export function buildBespokeLandmarkModel(cellIndex) {
  const root = new THREE.Group();
  root.name = `Bld_C3_Cell_${cellIndex}_BespokeLandmark`;

  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.7, metalness: 0.1 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.5, metalness: 0.1 });
  const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.2 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7, metalness: 0.05 });
  const redRoofMat = new THREE.MeshStandardMaterial({ color: 0xB91C1C, roughness: 0.4, metalness: 0.1 });
  const greenRoofMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.4, metalness: 0.1 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.92, roughness: 0.15 });
  const blueGlassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, metalness: 0.85, roughness: 0.05 });
  const cyanGlassMat = new THREE.MeshStandardMaterial({ color: 0x0EA5E9, metalness: 0.85, roughness: 0.05 });
  const yellowWallMat = new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.5, metalness: 0.05 });
  const whiteWallMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3, metalness: 0.1 });
  const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xC2410C, roughness: 0.65, metalness: 0.1 });
  const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.95, roughness: 0.05 });
  const metalAntennaMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.9, roughness: 0.2 });

  // Standardized Plinth 0.55m x 0.04m x 0.55m (12 tris)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.55), plinthMat);
  plinth.position.y = 0.02;
  root.add(plinth);

  switch (cellIndex) {
    case 1: { // Dinh Thự Cổ Bình Thủy (Cần Thơ)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.06, 0.48), stoneMat);
      base.position.y = 0.07;
      root.add(base);
      const mansion = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.40), yellowWallMat);
      mansion.position.y = 0.24;
      root.add(mansion);
      const porch = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12, 1, false, 0, Math.PI), whiteWallMat);
      porch.rotation.z = -Math.PI / 2;
      porch.position.set(0, 0.12, 0.22);
      root.add(porch);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.22, 4), redRoofMat);
      roof.position.y = 0.49;
      roof.rotation.y = Math.PI / 4;
      root.add(roof);
      const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.14, 8), goldMat);
      finial.position.y = 0.67;
      root.add(finial);
      break;
    }
    case 3: { // Điện Thờ Bà Chúa Xứ (Châu Đốc)
      const terrace = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.50), stoneMat);
      terrace.position.y = 0.07;
      root.add(terrace);
      const hall1 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.20, 0.42), terracottaMat);
      hall1.position.y = 0.20;
      root.add(hall1);
      const roof1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.46), greenRoofMat);
      roof1.position.y = 0.32;
      root.add(roof1);
      const hall2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.30), terracottaMat);
      hall2.position.y = 0.43;
      root.add(hall2);
      const roof2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.34), greenRoofMat);
      roof2.position.y = 0.54;
      root.add(roof2);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.20, 8), goldMat);
      spire.position.y = 0.66;
      root.add(spire);
      break;
    }
    case 6: { // Tòa Tháp Đôi Hành Chính (Bình Dương)
      const podium = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.08, 0.48), darkStoneMat);
      podium.position.y = 0.08;
      root.add(podium);
      const towerA = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.30), blueGlassMat);
      towerA.position.set(-0.11, 0.48, 0);
      root.add(towerA);
      const towerB = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.30), blueGlassMat);
      towerB.position.set(0.11, 0.48, 0);
      root.add(towerB);
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.06, 0.18), cyanGlassMat);
      bridge.position.set(0, 0.58, 0);
      root.add(bridge);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.012, 0.16, 6), metalAntennaMat);
      mast.position.set(0.11, 0.92, 0);
      root.add(mast);
      break;
    }
    case 8: { // Lâu Đài Kỳ Quan Hoàng Gia (Đồng Nai)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.44), stoneMat);
      base.position.y = 0.15;
      root.add(base);
      [-0.18, 0.18].forEach((tx) => {
        [-0.16, 0.16].forEach((tz) => {
          const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.40, 10), stoneMat);
          turret.position.set(tx, 0.24, tz);
          root.add(turret);
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 10), darkStoneMat);
          cone.position.set(tx, 0.52, tz);
          root.add(cone);
        });
      });
      const keep = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.46, 0.20), stoneMat);
      keep.position.y = 0.47;
      root.add(keep);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), goldMat);
      dome.position.y = 0.75;
      root.add(dome);
      break;
    }
    case 9: { // Hải Đăng Vũng Tàu (Bà Rịa - Vũng Tàu)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.44), whiteWallMat);
      base.position.y = 0.11;
      root.add(base);
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 0.58, 16), whiteWallMat);
      tower.position.y = 0.47;
      root.add(tower);
      const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 16), darkStoneMat);
      gallery.position.y = 0.77;
      root.add(gallery);
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.10, 12), cyanGlassMat);
      lantern.position.y = 0.835;
      root.add(lantern);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), darkStoneMat);
      dome.position.y = 0.90;
      root.add(dome);
      break;
    }
    case 11: { // Resort Cánh Buồm Đồi Cát (Bình Thuận)
      const dune = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.08, 0.48), yellowWallMat);
      dune.position.y = 0.08;
      root.add(dune);
      const pool = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.18), cyanGlassMat);
      pool.position.set(0, 0.13, 0.12);
      root.add(pool);
      const hotel = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.26), whiteWallMat);
      hotel.position.set(0, 0.25, -0.06);
      root.add(hotel);
      const sail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.38, 4), whiteWallMat);
      sail.rotation.y = Math.PI / 4;
      sail.position.set(0, 0.55, -0.06);
      root.add(sail);
      break;
    }
    case 13: { // Ga Xe Lửa Art Deco Đà Lạt (Lâm Đồng)
      const plat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.48), stoneMat);
      plat.position.y = 0.07;
      root.add(plat);
      const station = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.38), yellowWallMat);
      station.position.y = 0.22;
      root.add(station);
      [-0.14, 0, 0.14].forEach((px) => {
        const peak = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.26, 4), redRoofMat);
        peak.position.set(px, 0.47, 0);
        peak.rotation.y = Math.PI / 4;
        root.add(peak);
      });
      const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), cyanGlassMat);
      clock.rotation.x = Math.PI / 2;
      clock.position.set(0, 0.38, 0.192);
      root.add(clock);
      break;
    }
    case 14: { // Tháp Trầm Hương Biển (Nha Trang)
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.08, 6), stoneMat);
      pod.position.y = 0.08;
      root.add(pod);
      const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.20, 6), terracottaMat);
      tier1.position.y = 0.22;
      root.add(tier1);
      const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.22, 6), terracottaMat);
      tier2.position.y = 0.43;
      root.add(tier2);
      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.24, 6), goldMat);
      bud.position.y = 0.66;
      root.add(bud);
      break;
    }
    case 16: { // Tháp Đôi Chăm Pa Di Sản (Quy Nhơn)
      const plat = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.06, 0.48), darkStoneMat);
      plat.position.y = 0.07;
      root.add(plat);
      const towerMain = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.48, 0.20), terracottaMat);
      towerMain.position.set(-0.10, 0.34, 0);
      root.add(towerMain);
      const roofMain = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 4), terracottaMat);
      roofMain.position.set(-0.10, 0.70, 0);
      roofMain.rotation.y = Math.PI / 4;
      root.add(roofMain);
      const towerSub = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.16), terracottaMat);
      towerSub.position.set(0.12, 0.29, 0);
      root.add(towerSub);
      const roofSub = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.18, 4), terracottaMat);
      roofSub.position.set(0.12, 0.57, 0);
      roofSub.rotation.y = Math.PI / 4;
      root.add(roofSub);
      break;
    }
    case 18: { // Lầu Ngũ Phụng - Ngọ Môn (Huế)
      const rampart = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.20, 0.44), darkStoneMat);
      rampart.position.y = 0.14;
      root.add(rampart);
      const pavilion = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.36), woodMat);
      pavilion.position.y = 0.31;
      root.add(pavilion);
      const roof1 = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.03, 0.42), goldMat);
      roof1.position.y = 0.40;
      root.add(roof1);
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.26), woodMat);
      upper.position.y = 0.48;
      root.add(upper);
      const roof2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.32), goldMat);
      roof2.position.y = 0.56;
      root.add(roof2);
      break;
    }
    case 19: { // Cao Ốc Khí Động Học Bắp Ngô (Đà Nẵng)
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.10, 0.46), darkStoneMat);
      pod.position.y = 0.09;
      root.add(pod);
      const corn = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 0.74, 16), blueGlassMat);
      corn.position.y = 0.51;
      root.add(corn);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.18, 16), cyanGlassMat);
      crown.position.y = 0.97;
      root.add(crown);
      break;
    }
    case 21: { // Khách Sạn Vỏ Sò Hoàng Gia (Sầm Sơn)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.08, 0.48), stoneMat);
      base.position.y = 0.08;
      root.add(base);
      [0, 1, 2].forEach((i) => {
        const shell = new THREE.Mesh(
          new THREE.BoxGeometry(0.46 - i * 0.08, 0.12, 0.42 - i * 0.06),
          i % 2 === 0 ? whiteWallMat : cyanGlassMat
        );
        shell.position.set(0, 0.18 + i * 0.13, -i * 0.03);
        root.add(shell);
      });
      const topDeck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.04, 16), goldMat);
      topDeck.position.set(0, 0.60, -0.06);
      root.add(topDeck);
      break;
    }
    case 23: { // Nhà Hát Thành Cổ Lam Sơn (Vinh)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.12, 0.48), darkStoneMat);
      base.position.y = 0.10;
      root.add(base);
      const hall = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.40), terracottaMat);
      hall.position.y = 0.28;
      root.add(hall);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.20, 4), redRoofMat);
      roof.position.y = 0.50;
      roof.rotation.y = Math.PI / 4;
      root.add(roof);
      break;
    }
    case 24: { // Đại Bảo Tháp Bái Đính (Ninh Bình)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.08, 8), stoneMat);
      base.position.y = 0.08;
      root.add(base);
      for (let t = 0; t < 9; t++) {
        const rWall = 0.19 - t * 0.014;
        const tierWall = new THREE.Mesh(new THREE.CylinderGeometry(rWall * 0.95, rWall, 0.06, 8), terracottaMat);
        tierWall.position.y = 0.15 + t * 0.08;
        root.add(tierWall);
        const rRoof = 0.22 - t * 0.014;
        const tierRoof = new THREE.Mesh(new THREE.CylinderGeometry(rRoof * 0.8, rRoof, 0.02, 8), darkStoneMat);
        tierRoof.position.y = 0.19 + t * 0.08;
        root.add(tierRoof);
      }
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 8), goldMat);
      finial.position.y = 0.95;
      root.add(finial);
      break;
    }
    case 26: { // Nhà Hát Lớn Thành Phố Cảng (Hải Phòng)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.08, 0.46), stoneMat);
      base.position.y = 0.08;
      root.add(base);
      const hall = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.30, 0.40), yellowWallMat);
      hall.position.y = 0.27;
      root.add(hall);
      [-0.15, -0.05, 0.05, 0.15].forEach((cx) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 8), whiteWallMat);
        col.position.set(cx, 0.26, 0.21);
        root.add(col);
      });
      const pediment = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.12, 4), whiteWallMat);
      pediment.rotation.y = Math.PI / 4;
      pediment.position.set(0, 0.48, 0.18);
      root.add(pediment);
      const mansard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.38), darkStoneMat);
      mansard.position.y = 0.49;
      root.add(mansard);
      break;
    }
    case 27: { // Tháp Chuông Venice Đảo Ngọc (Phú Quốc)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.08, 0.48), stoneMat);
      base.position.y = 0.08;
      root.add(base);
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.60, 0.22), terracottaMat);
      shaft.position.y = 0.42;
      root.add(shaft);
      const belfry = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.20), stoneMat);
      belfry.position.y = 0.79;
      root.add(belfry);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 4), greenRoofMat);
      spire.position.y = 0.98;
      spire.rotation.y = Math.PI / 4;
      root.add(spire);
      const angel = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 4), goldMat);
      angel.position.y = 1.14;
      root.add(angel);
      break;
    }
    case 29: { // Bảo Tàng Than Kính Đen (Quảng Ninh)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.04, 0.48), darkStoneMat);
      base.position.y = 0.06;
      root.add(base);
      const crystal1 = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.44, 0.40), obsidianMat);
      crystal1.position.set(0, 0.28, 0);
      crystal1.rotation.y = 0.15;
      root.add(crystal1);
      const crystal2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.26), obsidianMat);
      crystal2.position.set(0.08, 0.46, 0.06);
      crystal2.rotation.y = 0.45;
      root.add(crystal2);
      break;
    }
    case 31: { // Biệt Thự Rừng Cọ Ecopark (Hưng Yên)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.06, 0.48), stoneMat);
      base.position.y = 0.07;
      root.add(base);
      const floor1 = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.18, 0.38), woodMat);
      floor1.position.y = 0.19;
      root.add(floor1);
      const floor2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.32), cyanGlassMat);
      floor2.position.set(0.04, 0.36, 0);
      root.add(floor2);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.42), darkStoneMat);
      roof.position.set(0.02, 0.46, 0);
      roof.rotation.z = -0.08;
      root.add(roof);
      break;
    }
    case 32: { // Tháp Keangnam Landmark 72 (Cầu Giấy)
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.46), darkStoneMat);
      pod.position.y = 0.08;
      root.add(pod);
      const sec1 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.40, 0.26), blueGlassMat);
      sec1.position.y = 0.32;
      root.add(sec1);
      const sec2 = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.34, 0.20), blueGlassMat);
      sec2.position.y = 0.69;
      root.add(sec2);
      const sec3 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.14), cyanGlassMat);
      sec3.position.y = 0.99;
      root.add(sec3);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.010, 0.18, 6), metalAntennaMat);
      mast.position.y = 1.18;
      root.add(mast);
      break;
    }
    case 34: { // Nhà Hát Lớn Hà Nội (Hoàn Kiếm)
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.08, 0.46), stoneMat);
      base.position.y = 0.08;
      root.add(base);
      const hall = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.40), yellowWallMat);
      hall.position.y = 0.28;
      root.add(hall);
      const mansard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.38), darkStoneMat);
      mansard.position.y = 0.52;
      root.add(mansard);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), darkStoneMat);
      dome.position.y = 0.68;
      root.add(dome);
      const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.12, 6), goldMat);
      finial.position.y = 0.80;
      root.add(finial);
      break;
    }
    case 37: { // Tháp Xanh Empire Thủ Thiêm (Thủ Đức)
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.10, 0.48), darkStoneMat);
      pod.position.y = 0.09;
      root.add(pod);
      const tower1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.24), cyanGlassMat);
      tower1.position.y = 0.36;
      root.add(tower1);
      const cloud = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), greenRoofMat);
      cloud.position.y = 0.61;
      root.add(cloud);
      const tower2 = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.42, 0.17), cyanGlassMat);
      tower2.position.y = 0.85;
      root.add(tower2);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.20, 8), goldMat);
      spire.position.y = 1.12;
      root.add(spire);
      break;
    }
    case 39: { // Tháp Bitexco Búp Sen Sài Gòn (Quận 1)
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.08, 0.48), darkStoneMat);
      pod.position.y = 0.08;
      root.add(pod);
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.82, 16), blueGlassMat);
      shaft.position.y = 0.53;
      root.add(shaft);
      const helipad = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.02, 16), goldMat);
      helipad.position.set(0.14, 0.70, 0);
      root.add(helipad);
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.012, 0.18, 8), metalAntennaMat);
      spire.position.y = 1.08;
      root.add(spire);
      break;
    }
    default:
      break;
  }

  return root;
}