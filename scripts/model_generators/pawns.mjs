import * as THREE from 'three';

export function buildPawnTower() {
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

export function buildPawnYacht() {
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

export function buildPawnCar() {
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

export function buildPawnDog() {
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

export function buildPawnCat() {
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

export function buildPawnHorse() {
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

export function buildPawnElephant() {
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