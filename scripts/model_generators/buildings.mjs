import * as THREE from 'three';

// --- TYPOLOGY 1: RIVERINE (Sông Nước Nam Bộ - Cần Thơ, An Giang, Kiên Giang) ---
export function buildRiverineC1() {
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

export function buildRiverineC2() {
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

export function buildRiverineC3() {
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
export function buildResortC1() {
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

export function buildResortC2() {
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

export function buildResortC3() {
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
export function buildHeritageC1() {
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

export function buildHeritageC2() {
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

export function buildHeritageC3() {
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
export function buildMetropolisC1() {
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

export function buildMetropolisC2() {
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

export function buildMetropolisC3() {
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
export function buildBuildingC1() {
  return buildMetropolisC1();
}
export function buildBuildingC2() {
  return buildMetropolisC2();
}
export function buildBuildingC3() {
  return buildMetropolisC3();
}