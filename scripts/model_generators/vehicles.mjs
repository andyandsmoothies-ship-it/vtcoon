import * as THREE from 'three';

export function buildVehicleBus() {
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

export function buildVehicleTaxi() {
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

export function buildVehicleSedan() {
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

export function buildVehicleVan() {
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

export function buildVehicleBoat() {
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

export function buildVehicleContainer() {
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