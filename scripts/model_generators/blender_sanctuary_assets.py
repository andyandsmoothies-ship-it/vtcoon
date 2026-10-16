# [IMP-399] Canonical Blender 5.2.2 LTS Procedural Sculpt & Voronoi Displacement Generator
# Generates:
#   1. 4 Heroic Indochine Monument & Luxury Pawn GLBs in public/models/pawns/ (pawn_horse, pawn_tower, pawn_yacht, pawn_car)
#   2. Voronoi/Turbulence-displaced & Beveled Ha Long Bay Karst, Ringed Coconut Trunk & Pinnate V-Fold Frond Buffers
#      in src/client/3d/coastal_sanctuary_blender_meshes.ts
import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, noise

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "pawns")
OUT_TS_PATH = os.path.join(ROOT_DIR, "src", "client", "3d", "coastal_sanctuary_blender_meshes.ts")
os.makedirs(OUT_GLB_DIR, exist_ok=True)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_pbr_material(name, rgba, metallic=0.85, roughness=0.18):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = rgba
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
    return mat


def create_lofted_mesh(name, rings, close_caps=True, mat=None, smooth=True):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    ring_verts = []
    for ring in rings:
        verts = [bm.verts.new(co) for co in ring]
        ring_verts.append(verts)
    bm.verts.ensure_lookup_table()

    for r_idx in range(len(ring_verts) - 1):
        r1 = ring_verts[r_idx]
        r2 = ring_verts[r_idx + 1]
        n = len(r1)
        for i in range(n):
            v1 = r1[i]
            v2 = r1[(i + 1) % n]
            v3 = r2[(i + 1) % n]
            v4 = r2[i]
            bm.faces.new((v1, v2, v3, v4))

    if close_caps and len(ring_verts) >= 2:
        bm.faces.new(reversed(ring_verts[0]))
        bm.faces.new(ring_verts[-1])

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for poly in mesh.polygons:
        poly.use_smooth = smooth
    if mat:
        obj.data.materials.append(mat)
    return obj


def add_cylinder_part(name, r_bot, r_top, depth, loc, rot=(0, 0, 0), scale=(1, 1, 1), vertices=24, mat=None, bevel_width=0.0):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=r_bot,
        radius2=r_top,
        depth=depth,
        location=loc,
        rotation=rot,
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type="BEVEL")
        bev.width = bevel_width
        bev.segments = 2
        bpy.ops.object.modifier_apply(modifier=bev.name)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    if mat:
        obj.data.materials.append(mat)
    return obj


def add_box_part(name, size_xyz, loc, rot=(0, 0, 0), bevel_width=0.012, bevel_segs=2, subsurf=0, mat=None):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size_xyz
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type="BEVEL")
        bev.width = bevel_width
        bev.segments = bevel_segs
        bpy.ops.object.modifier_apply(modifier=bev.name)
    if subsurf > 0:
        sub = obj.modifiers.new(name="Subsurf", type="SUBSURF")
        sub.levels = subsurf
        sub.render_levels = subsurf
        bpy.ops.object.modifier_apply(modifier=sub.name)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    if mat:
        obj.data.materials.append(mat)
    return obj


def export_glb(filename):
    out_path = os.path.join(OUT_GLB_DIR, filename)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials="EXPORT",
    )
    print(f"Exported {out_path} ({os.path.getsize(out_path)} bytes)")


def build_royal_warhorse():
    clear_scene()
    mat_gold = make_pbr_material("Mat_RoyalGoldHorse", (0.96, 0.65, 0.08, 1.0), metallic=0.90, roughness=0.16)
    mat_bronze = make_pbr_material("Mat_TrimBronzeHorse", (0.72, 0.36, 0.06, 1.0), metallic=0.88, roughness=0.22)
    mat_jade = make_pbr_material("Mat_JadeAccent", (0.06, 0.58, 0.40, 1.0), metallic=0.25, roughness=0.20)

    add_cylinder_part("Pawn_Trim_SocleBase", 0.27, 0.25, 0.06, (0, 0, 0.03), vertices=18, mat=mat_bronze, bevel_width=0.008)
    add_cylinder_part("Pawn_Body_SocleMid", 0.23, 0.19, 0.07, (0, 0, 0.095), vertices=18, mat=mat_gold, bevel_width=0.008)
    add_cylinder_part("Pawn_Trim_JadeRing", 0.205, 0.205, 0.025, (0, 0, 0.14), vertices=18, mat=mat_jade)

    stations = [
        (0.00, 0.15, 0.16, 0.19, 0.0),
        (0.02, 0.24, 0.17, 0.22, -8.0),
        (-0.02, 0.35, 0.15, 0.20, -18.0),
        (-0.06, 0.47, 0.13, 0.17, -25.0),
        (-0.08, 0.58, 0.11, 0.15, -12.0),
        (-0.05, 0.67, 0.095, 0.14, 15.0),
        (0.03, 0.72, 0.085, 0.13, 45.0),
        (0.13, 0.69, 0.065, 0.09, 68.0),
        (0.21, 0.64, 0.048, 0.065, 75.0),
        (0.24, 0.62, 0.030, 0.040, 78.0),
    ]
    rings = []
    n_pts = 14
    for cy, cz, rx, ry, pitch in stations:
        rad = math.radians(pitch)
        ring = []
        for i in range(n_pts):
            ang = (2.0 * math.pi * i) / n_pts
            lx = math.cos(ang) * rx * (0.82 if math.sin(ang) > 0.3 else 1.0)
            ly = math.sin(ang) * ry
            ry_rot = ly * math.cos(rad)
            rz_rot = ly * math.sin(rad) * 0.45
            ring.append(Vector((lx, cy + ry_rot, cz + rz_rot)))
        rings.append(ring)

    create_lofted_mesh("Pawn_Body_Stallion", rings, close_caps=True, mat=mat_gold)

    mane_pts = [
        (0.0, -0.14, 0.69, 0.035, 0.11),
        (0.0, -0.18, 0.60, 0.038, 0.13),
        (0.0, -0.20, 0.49, 0.040, 0.14),
        (0.0, -0.18, 0.37, 0.038, 0.12),
        (0.0, -0.15, 0.26, 0.034, 0.10),
    ]
    for idx, (mx, my, mz, sx, sy) in enumerate(mane_pts):
        add_box_part(
            f"Pawn_Trim_Mane_{idx}",
            (sx, sy, 0.085),
            (mx, my, mz),
            rot=(math.radians(22 - idx * 7), 0, 0),
            bevel_width=0.008,
            bevel_segs=1,
            mat=mat_bronze,
        )

    for side in (-1, 1):
        add_cylinder_part(
            f"Pawn_Body_Ear_{side}",
            0.024,
            0.004,
            0.095,
            (side * 0.048, -0.05, 0.755),
            rot=(math.radians(-18), math.radians(side * 14), 0),
            vertices=8,
            mat=mat_gold,
        )

    for side, lift in ((-1, 0.02), (1, -0.01)):
        add_cylinder_part(
            f"Pawn_Body_ForelegUpper_{side}",
            0.040,
            0.030,
            0.16,
            (side * 0.095, 0.13, 0.36 + lift),
            rot=(math.radians(48), 0, math.radians(side * -8)),
            vertices=10,
            mat=mat_gold,
        )
        add_cylinder_part(
            f"Pawn_Trim_ForelegHoof_{side}",
            0.032,
            0.026,
            0.13,
            (side * 0.105, 0.20, 0.26 + lift),
            rot=(math.radians(-25), 0, 0),
            vertices=10,
            mat=mat_bronze,
        )

    export_glb("pawn_horse.glb")


def build_citadel_tower():
    clear_scene()
    mat_gold = make_pbr_material("Mat_RoyalBrassTower", (0.94, 0.64, 0.10, 1.0), metallic=0.88, roughness=0.18)
    mat_bronze = make_pbr_material("Mat_DarkBrassTrim", (0.62, 0.32, 0.07, 1.0), metallic=0.86, roughness=0.24)
    mat_lantern = make_pbr_material("Mat_LanternGlass", (0.12, 0.78, 0.88, 1.0), metallic=0.20, roughness=0.12)

    add_cylinder_part("Pawn_Trim_BasePlinth", 0.28, 0.25, 0.06, (0, 0, 0.03), vertices=12, mat=mat_bronze, bevel_width=0.006)
    add_cylinder_part("Pawn_Body_LowerTier", 0.24, 0.20, 0.22, (0, 0, 0.17), vertices=12, mat=mat_gold)
    add_cylinder_part("Pawn_Trim_MidCornice", 0.22, 0.20, 0.04, (0, 0, 0.30), vertices=12, mat=mat_bronze)
    add_cylinder_part("Pawn_Body_MainShaft", 0.18, 0.145, 0.26, (0, 0, 0.45), vertices=12, mat=mat_gold)

    for i in range(6):
        ang = (2.0 * math.pi * i) / 6.0
        px = math.cos(ang) * 0.17
        py = math.sin(ang) * 0.17
        add_box_part(
            f"Pawn_Trim_Pilaster_{i}",
            (0.028, 0.028, 0.44),
            (px, py, 0.34),
            rot=(0, 0, ang),
            bevel_width=0.004,
            bevel_segs=1,
            mat=mat_bronze,
        )

    add_cylinder_part("Pawn_Trim_GalleryBalcony", 0.21, 0.17, 0.05, (0, 0, 0.60), vertices=12, mat=mat_bronze)
    add_cylinder_part("Pawn_Body_LanternCore", 0.13, 0.13, 0.11, (0, 0, 0.68), vertices=12, mat=mat_lantern)

    for i in range(6):
        ang = (2.0 * math.pi * i) / 6.0
        tx = math.cos(ang) * 0.18
        ty = math.sin(ang) * 0.18
        add_box_part(
            f"Pawn_Body_Turret_{i}",
            (0.044, 0.044, 0.07),
            (tx, ty, 0.65),
            rot=(0, 0, ang),
            bevel_width=0.005,
            bevel_segs=1,
            mat=mat_gold,
        )

    add_cylinder_part("Pawn_Body_ImperialDome", 0.15, 0.04, 0.08, (0, 0, 0.77), vertices=12, mat=mat_gold, bevel_width=0.006)
    add_cylinder_part("Pawn_Trim_SpireFinial", 0.035, 0.005, 0.09, (0, 0, 0.85), vertices=10, mat=mat_bronze)

    export_glb("pawn_tower.glb")


def build_superyacht():
    clear_scene()
    mat_hull = make_pbr_material("Mat_PlatinumHull", (0.95, 0.97, 0.99, 1.0), metallic=0.45, roughness=0.14)
    mat_gold = make_pbr_material("Mat_GoldTrimYacht", (0.95, 0.64, 0.08, 1.0), metallic=0.90, roughness=0.16)
    mat_glass = make_pbr_material("Mat_OceanBridgeGlass", (0.04, 0.42, 0.68, 1.0), metallic=0.85, roughness=0.08)
    mat_teak = make_pbr_material("Mat_TeakDeck", (0.58, 0.30, 0.12, 1.0), metallic=0.15, roughness=0.35)

    add_cylinder_part("Pawn_Trim_CradleBase", 0.26, 0.23, 0.05, (0, 0, 0.025), vertices=24, mat=mat_gold, bevel_width=0.006)
    add_box_part("Pawn_Trim_KeelStrut", (0.08, 0.28, 0.06), (0, 0, 0.07), bevel_width=0.008, bevel_segs=1, mat=mat_gold)

    hull_stations = [
        (-0.35, 0.14, 0.13, 0.07, 0.18),
        (-0.22, 0.13, 0.16, 0.08, 0.19),
        (-0.05, 0.12, 0.17, 0.09, 0.20),
        (0.12, 0.13, 0.15, 0.08, 0.21),
        (0.26, 0.15, 0.09, 0.05, 0.23),
        (0.37, 0.18, 0.015, 0.015, 0.25),
    ]
    hull_rings = []
    for y_pos, z_bot, w_top, w_bot, z_top in hull_stations:
        ring = [
            Vector((0.0, y_pos, z_bot - 0.02)),
            Vector((w_bot, y_pos, z_bot)),
            Vector((w_top, y_pos, (z_bot + z_top) * 0.55)),
            Vector((w_top * 0.92, y_pos, z_top)),
            Vector((-w_top * 0.92, y_pos, z_top)),
            Vector((-w_top, y_pos, (z_bot + z_top) * 0.55)),
            Vector((-w_bot, y_pos, z_bot)),
        ]
        hull_rings.append(ring)
    create_lofted_mesh("Pawn_Body_YachtHull", hull_rings, close_caps=True, mat=mat_hull)

    add_box_part("Pawn_Trim_TeakMainDeck", (0.26, 0.58, 0.024), (0, -0.02, 0.22), bevel_width=0.006, bevel_segs=2, mat=mat_teak)
    add_box_part("Pawn_Trim_GoldRubRail", (0.31, 0.62, 0.016), (0, -0.01, 0.19), bevel_width=0.005, bevel_segs=1, mat=mat_gold)
    add_box_part("Pawn_Body_MainCabin", (0.22, 0.38, 0.08), (0, -0.04, 0.27), bevel_width=0.015, bevel_segs=2, mat=mat_hull)
    add_box_part("Pawn_Trim_BridgeGlass1", (0.23, 0.32, 0.042), (0, -0.02, 0.28), bevel_width=0.008, bevel_segs=1, mat=mat_glass)
    add_box_part("Pawn_Body_Flybridge", (0.17, 0.25, 0.065), (0, -0.07, 0.34), bevel_width=0.012, bevel_segs=2, mat=mat_hull)
    add_box_part("Pawn_Trim_BridgeGlass2", (0.18, 0.20, 0.032), (0, -0.05, 0.35), bevel_width=0.006, bevel_segs=1, mat=mat_glass)
    add_box_part("Pawn_Trim_RadarArch", (0.15, 0.06, 0.08), (0, -0.13, 0.40), rot=(math.radians(-24), 0, 0), bevel_width=0.008, bevel_segs=2, mat=mat_gold)
    add_cylinder_part("Pawn_Trim_RadarMast", 0.018, 0.006, 0.09, (0, -0.14, 0.47), rot=(math.radians(-18), 0, 0), vertices=12, mat=mat_gold)
    for side in (-1, 1):
        add_cylinder_part(f"Pawn_Body_Satcom_{side}", 0.026, 0.012, 0.035, (side * 0.048, -0.13, 0.445), vertices=12, mat=mat_hull)

    export_glb("pawn_yacht.glb")


def build_vintage_roadster():
    clear_scene()
    mat_gold = make_pbr_material("Mat_ImperialGoldCar", (0.95, 0.63, 0.07, 1.0), metallic=0.90, roughness=0.16)
    mat_bronze = make_pbr_material("Mat_BronzeFenderTrim", (0.64, 0.28, 0.06, 1.0), metallic=0.86, roughness=0.22)
    mat_chrome = make_pbr_material("Mat_SilverChrome", (0.92, 0.95, 0.98, 1.0), metallic=0.94, roughness=0.10)
    mat_tire = make_pbr_material("Mat_DarkTire", (0.14, 0.16, 0.20, 1.0), metallic=0.35, roughness=0.35)

    add_cylinder_part("Pawn_Trim_RoadsterPlinth", 0.27, 0.25, 0.045, (0, 0, 0.0225), vertices=16, mat=mat_bronze)
    add_box_part("Pawn_Body_MainChassis", (0.22, 0.56, 0.11), (0, 0.0, 0.14), bevel_width=0.022, bevel_segs=2, mat=mat_gold)
    add_box_part("Pawn_Body_LongHood", (0.18, 0.28, 0.09), (0, 0.13, 0.21), bevel_width=0.020, bevel_segs=1, mat=mat_gold)
    add_box_part("Pawn_Body_BoatTailRear", (0.19, 0.20, 0.08), (0, -0.18, 0.20), bevel_width=0.024, bevel_segs=1, mat=mat_gold)

    for side in (-1, 1):
        add_box_part(
            f"Pawn_Trim_FrontFender_{side}",
            (0.075, 0.24, 0.085),
            (side * 0.14, 0.14, 0.13),
            rot=(math.radians(-8), 0, 0),
            bevel_width=0.020,
            bevel_segs=1,
            mat=mat_bronze,
        )
        add_box_part(
            f"Pawn_Trim_RearFender_{side}",
            (0.075, 0.22, 0.085),
            (side * 0.14, -0.15, 0.13),
            rot=(math.radians(10), 0, 0),
            bevel_width=0.020,
            bevel_segs=1,
            mat=mat_bronze,
        )
        add_box_part(
            f"Pawn_Trim_RunningBoard_{side}",
            (0.06, 0.20, 0.022),
            (side * 0.14, 0.0, 0.095),
            bevel_width=0.004,
            bevel_segs=1,
            mat=mat_chrome,
        )

    add_box_part("Pawn_Trim_RadiatorGrille", (0.15, 0.035, 0.11), (0, 0.27, 0.20), bevel_width=0.008, bevel_segs=1, mat=mat_chrome)
    add_box_part("Pawn_Trim_Windshield", (0.17, 0.025, 0.085), (0, 0.01, 0.28), rot=(math.radians(-28), 0, 0), bevel_width=0.005, bevel_segs=1, mat=mat_chrome)
    add_box_part("Pawn_Trim_CockpitCowl", (0.16, 0.14, 0.045), (0, -0.08, 0.24), bevel_width=0.010, bevel_segs=1, mat=mat_bronze)

    for side in (-1, 1):
        add_cylinder_part(
            f"Pawn_Trim_Headlamp_{side}",
            0.034,
            0.024,
            0.045,
            (side * 0.095, 0.27, 0.22),
            rot=(math.radians(90), 0, 0),
            vertices=10,
            mat=mat_chrome,
        )

    wheel_coords = [(-0.16, 0.16), (0.16, 0.16), (-0.16, -0.16), (0.16, -0.16)]
    for idx, (wx, wy) in enumerate(wheel_coords):
        add_cylinder_part(
            f"Pawn_Body_WheelTire_{idx}",
            0.082,
            0.082,
            0.048,
            (wx, wy, 0.105),
            rot=(0, math.radians(90), 0),
            vertices=12,
            mat=mat_tire,
        )
        add_cylinder_part(
            f"Pawn_Trim_WheelHub_{idx}",
            0.052,
            0.052,
            0.054,
            (wx, wy, 0.105),
            rot=(0, math.radians(90), 0),
            vertices=10,
            mat=mat_chrome,
        )

    export_glb("pawn_car.glb")


# =========================================================================
# PART 2: BLENDER 5.2 VORONOI/NOISE KARST CLIFFS & CURVED COCONUT PALMS
# Converts Blender Z-up bmesh coordinates to Three.js Y-up (x, z, -y)
# =========================================================================
def extract_threejs_indexed_buffers(bm):
    bmesh.ops.triangulate(bm, faces=bm.faces)
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()
    positions = []
    for v in bm.verts:
        # Map Blender (x, y, z) -> Three.js (x, z, -y)
        positions.extend([round(v.co.x, 4), round(v.co.z, 4), round(-v.co.y, 4)])
    indices = []
    for f in bm.faces:
        indices.extend([f.verts[0].index, f.verts[1].index, f.verts[2].index])
    return positions, indices


def sculpt_karst_spire_bmesh(seed_offset, radial_segs=9, height_rings=6):
    bm = bmesh.new()
    ring_verts = []
    # Unit height 0.0 -> 1.0 in Blender Z (which maps to Three.js Y: 0.0 -> 1.0)
    radii_profile = [0.38, 0.42, 0.34, 0.28, 0.19, 0.09]
    z_profile = [0.0, 0.18, 0.42, 0.66, 0.86, 1.0]

    for r_idx in range(height_rings):
        base_r = radii_profile[r_idx]
        z_val = z_profile[r_idx]
        ring = []
        for i in range(radial_segs):
            ang = (2.0 * math.pi * i) / radial_segs
            sample_pt = Vector((math.cos(ang) * 1.7 + seed_offset, math.sin(ang) * 1.7 + seed_offset, z_val * 2.4))
            dists, _ = noise.voronoi(sample_pt, distance_metric='DISTANCE', exponent=2.0)
            turb = noise.turbulence_vector(sample_pt * 1.35, 3, False)
            crag_factor = 0.78 + 0.34 * (dists[1] - dists[0]) + 0.14 * turb.x
            r = base_r * max(0.52, min(1.28, crag_factor))
            x = math.cos(ang) * r + turb.y * 0.035 * (1.0 - z_val * 0.4)
            y = math.sin(ang) * r + turb.z * 0.035 * (1.0 - z_val * 0.4)
            z_disp = z_val + ( 0.035 * (dists[0] - 0.3) if 0 < r_idx < height_rings - 1 else 0.0 )
            ring.append(bm.verts.new((x, y, max(0.0, min(1.0, z_disp)))))
        ring_verts.append(ring)

    for r_idx in range(height_rings - 1):
        r1 = ring_verts[r_idx]
        r2 = ring_verts[r_idx + 1]
        for i in range(radial_segs):
            bm.faces.new((r1[i], r1[(i + 1) % radial_segs], r2[(i + 1) % radial_segs], r2[i]))

    bm.faces.new(reversed(ring_verts[0]))
    bm.faces.new(ring_verts[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    pos, idx = extract_threejs_indexed_buffers(bm)
    bm.free()
    return pos, idx


def sculpt_karst_shrub_bmesh():
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.20)
    for v in bm.verts:
        turb = noise.turbulence_vector(v.co * 4.2 + Vector((3.1, 1.7, 0.9)), 2, False)
        v.co.x *= 1.15 + 0.18 * turb.x
        v.co.y *= 1.10 + 0.18 * turb.y
        v.co.z = max(-0.04, v.co.z * (0.65 + 0.20 * turb.z) + 0.06)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    pos, idx = extract_threejs_indexed_buffers(bm)
    bm.free()
    return pos, idx


def sculpt_ringed_palm_trunk_bmesh():
    bm = bmesh.new()
    radial_segs = 7
    rings_count = 6
    ring_verts = []
    # Unit trunk from Z = 0.0 to Z = 1.0 with indented tropical bark rings & natural S-curve
    for r_idx in range(rings_count):
        t = r_idx / (rings_count - 1)
        # Flared bole at bottom, slim neck near crown, slight ring ridges
        ring_wave = 1.08 if r_idx % 2 == 1 else 0.95
        r = (0.072 * (1.0 - 0.42 * t) + (0.014 if r_idx == 0 else 0.0)) * ring_wave
        curve_x = math.sin(t * math.pi * 0.65) * 0.11
        ring = []
        for i in range(radial_segs):
            ang = (2.0 * math.pi * i) / radial_segs
            x = curve_x + math.cos(ang) * r
            y = math.sin(ang) * r
            ring.append(bm.verts.new((x, y, t)))
        ring_verts.append(ring)

    for r_idx in range(rings_count - 1):
        r1 = ring_verts[r_idx]
        r2 = ring_verts[r_idx + 1]
        for i in range(radial_segs):
            bm.faces.new((r1[i], r1[(i + 1) % radial_segs], r2[(i + 1) % radial_segs], r2[i]))

    bm.faces.new(reversed(ring_verts[0]))
    bm.faces.new(ring_verts[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    pos, idx = extract_threejs_indexed_buffers(bm)
    bm.free()
    return pos, idx


def sculpt_vfold_palm_frond_bmesh():
    bm = bmesh.new()
    # Sculpted V-section arched coconut frond extending along +X (0.04m -> 0.58m)
    # 9 stations along the rachis, each station has 5 vertices across width:
    # outer-left leaflet tip, mid-left fold, raised central rachis spine, mid-right fold, outer-right leaflet tip
    stations = [
        (0.03, 0.01, 0.035, 0.012),
        (0.10, 0.04, 0.075, 0.020),
        (0.18, 0.06, 0.115, 0.024),
        (0.26, 0.06, 0.130, 0.025),
        (0.34, 0.04, 0.125, 0.022),
        (0.41, 0.00, 0.105, 0.018),
        (0.47, -0.05, 0.078, 0.014),
        (0.53, -0.11, 0.045, 0.009),
        (0.58, -0.17, 0.012, 0.004),
    ]
    ring_verts = []
    for s_idx, (x_dist, z_arch, half_w, spine_rise) in enumerate(stations):
        serration = 1.08 if s_idx % 2 == 1 else 0.88
        w = half_w * serration
        pts = [
            (x_dist - 0.012, -w, z_arch - spine_rise * 1.4),
            (x_dist, -w * 0.45, z_arch + spine_rise * 0.35),
            (x_dist, 0.0, z_arch + spine_rise),
            (x_dist, w * 0.45, z_arch + spine_rise * 0.35),
            (x_dist - 0.012, w, z_arch - spine_rise * 1.4),
            # Bottom thickness return so frond is a closed 3D sculpted blade visible from all angles
            (x_dist, w * 0.35, z_arch - spine_rise * 0.35),
            (x_dist, -w * 0.35, z_arch - spine_rise * 0.35),
        ]
        ring_verts.append([bm.verts.new(p) for p in pts])

    n_cols = len(ring_verts[0])
    for r_idx in range(len(ring_verts) - 1):
        r1 = ring_verts[r_idx]
        r2 = ring_verts[r_idx + 1]
        for i in range(n_cols):
            bm.faces.new((r1[i], r1[(i + 1) % n_cols], r2[(i + 1) % n_cols], r2[i]))

    bm.faces.new(reversed(ring_verts[0]))
    bm.faces.new(ring_verts[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    pos, idx = extract_threejs_indexed_buffers(bm)
    bm.free()
    return pos, idx


def write_typescript_blender_meshes():
    spire_a_pos, spire_a_idx = sculpt_karst_spire_bmesh(seed_offset=1.25)
    spire_b_pos, spire_b_idx = sculpt_karst_spire_bmesh(seed_offset=4.85)
    shrub_pos, shrub_idx = sculpt_karst_shrub_bmesh()
    trunk_pos, trunk_idx = sculpt_ringed_palm_trunk_bmesh()
    frond_pos, frond_idx = sculpt_vfold_palm_frond_bmesh()

    def fmt_arr(arr, per_line=24):
        chunks = []
        for i in range(0, len(arr), per_line):
            chunks.append("    " + ", ".join(str(x) for x in arr[i : i + per_line]))
        return "[\n" + ",\n".join(chunks) + ",\n  ]"

    ts_code = f"""// [UI-S01/MSS][IMP-399] Blender 5.2.2 LTS Voronoi-Displaced Karst & Sculpted Coconut Palm Archetypes
// Generated by scripts/model_generators/blender_sanctuary_assets.py via Blender 5.2 bmesh + mathutils.noise
import {{ BufferAttribute, BufferGeometry }} from 'three';

export interface BlenderSculptedArchetype {{
  readonly positions: ReadonlyArray<number>;
  readonly indices: ReadonlyArray<number>;
}}

export const BLENDER_KARST_SPIRE_A: BlenderSculptedArchetype = {{
  positions: {fmt_arr(spire_a_pos)},
  indices: {fmt_arr(spire_a_idx)},
}};

export const BLENDER_KARST_SPIRE_B: BlenderSculptedArchetype = {{
  positions: {fmt_arr(spire_b_pos)},
  indices: {fmt_arr(spire_b_idx)},
}};

export const BLENDER_KARST_SHRUB: BlenderSculptedArchetype = {{
  positions: {fmt_arr(shrub_pos)},
  indices: {fmt_arr(shrub_idx)},
}};

export const BLENDER_RINGED_PALM_TRUNK: BlenderSculptedArchetype = {{
  positions: {fmt_arr(trunk_pos)},
  indices: {fmt_arr(trunk_idx)},
}};

export const BLENDER_VFOLD_PALM_FROND: BlenderSculptedArchetype = {{
  positions: {fmt_arr(frond_pos)},
  indices: {fmt_arr(frond_idx)},
}};

const archetypeBaseCache = new WeakMap<BlenderSculptedArchetype, BufferGeometry>();

export function createBlenderArchetypeGeometry(archetype: BlenderSculptedArchetype): BufferGeometry {{
  let base = archetypeBaseCache.get(archetype);
  if (!base) {{
    const indexed = new BufferGeometry();
    indexed.setAttribute('position', new BufferAttribute(new Float32Array(archetype.positions), 3));
    indexed.setIndex(Array.from(archetype.indices));
    base = indexed.toNonIndexed();
    indexed.dispose();
    base.computeVertexNormals();
    archetypeBaseCache.set(archetype, base);
  }}
  return base.clone();
}}
"""
    with open(OUT_TS_PATH, "w", encoding="utf-8") as f:
        f.write(ts_code)
    print(f"Exported Blender 5.2 TypeScript archetypes to {OUT_TS_PATH}")


if __name__ == "__main__":
    build_royal_warhorse()
    build_citadel_tower()
    build_superyacht()
    build_vintage_roadster()
    write_typescript_blender_meshes()
