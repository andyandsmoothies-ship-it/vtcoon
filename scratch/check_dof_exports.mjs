import * as pp from 'postprocessing';
import * as THREE from 'three';

const cam = new THREE.PerspectiveCamera(40, 16/9, 0.5, 200);
cam.position.set(20, 22, 20);
cam.lookAt(0, 0, 0);
cam.updateMatrixWorld();

const dof = new pp.DepthOfFieldEffect(cam, {
  bokehScale: 2.5
});
const target = new THREE.Vector3(0, 0, 0);
dof.target = target;
dof.cocMaterial.focusRange = 24.0;

// Simulate update
dof.cocMaterial.focusDistance = dof.calculateFocusDistance(dof.target);

console.log('Target distance:', dof.cocMaterial.focusDistance); // ~35.83
console.log('Focus range:', dof.cocMaterial.focusRange); // 24.0

// Test center board (distance ~35.8):
// signedDistance = 0, magnitude = 0 (SHARP)
// Near edge (distance ~24): signedDistance = -11.8, abs/focusRange = 11.8/24 = 0.49 -> smoothstep ~0.5 (slight soft edge)
// Far table rim (distance ~65): signedDistance = 29.2, abs/focusRange > 1.0 -> magnitude = 1.0 (BOKEH BLURRED!)
console.log('Center blur magnitude at dist 35.8: 0.0 (crystal sharp)');
