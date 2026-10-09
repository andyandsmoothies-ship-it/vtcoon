// [IMP-62] Generator for Photorealistic Miniature Diorama Tabletop 3D Assets (.glb)
// Builds 15 models: 3 Buildings (C1-C3), 4 Luxury Pawns, 2 Landmarks, 6 Micro Vehicles
import * as THREE from 'three';
import { exportSceneToGlb } from './model_generators/exporter.mjs';
import {
  buildRiverineC1,
  buildRiverineC2,
  buildRiverineC3,
  buildResortC1,
  buildResortC2,
  buildResortC3,
  buildHeritageC1,
  buildHeritageC2,
  buildHeritageC3,
  buildMetropolisC1,
  buildMetropolisC2,
  buildMetropolisC3,
  buildBuildingC1,
  buildBuildingC2,
  buildBuildingC3,
} from './model_generators/buildings.mjs';
import {
  buildPawnDog,
  buildPawnCat,
  buildPawnHorse,
  buildPawnElephant,
  buildPawnTower,
  buildPawnYacht,
  buildPawnCar,
} from './model_generators/pawns.mjs';
import {
  buildBenThanhLandmark,
  buildCathedralLandmark,
  BESPOKE_LANDMARK_CELLS,
  buildBespokeLandmarkModel,
} from './model_generators/landmarks.mjs';
import {
  buildVehicleBus,
  buildVehicleTaxi,
  buildVehicleSedan,
  buildVehicleVan,
  buildVehicleBoat,
  buildVehicleContainer,
} from './model_generators/vehicles.mjs';

// Re-export all builders for programmatic consumers and test suites
export * from './model_generators/exporter.mjs';
export * from './model_generators/buildings.mjs';
export * from './model_generators/pawns.mjs';
export * from './model_generators/landmarks.mjs';
export * from './model_generators/vehicles.mjs';

// =========================================================================
// MAIN GENERATOR PIPELINE
// =========================================================================
export async function generateAllModels() {
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

    // Bespoke Landmarks C3 for 22 Buyable Properties (IMP-203)
    ...BESPOKE_LANDMARK_CELLS.map((cellIndex) => ({
      scene: buildBespokeLandmarkModel(cellIndex),
      path: `public/models/landmarks/bld_c3_cell_${cellIndex}.glb`,
    })),
  ];

  for (const m of models) {
    const scene = new THREE.Scene();
    scene.add(m.scene);
    await exportSceneToGlb(scene, m.path);
  }

  console.log(`\n✓ Successfully generated all ${models.length} high-fidelity models.`);
}

// Auto-run when executed directly via CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/generate_high_fidelity_models.mjs')) {
  generateAllModels().catch((err) => {
    console.error('Fatal error generating models:', err);
    process.exit(1);
  });
}
