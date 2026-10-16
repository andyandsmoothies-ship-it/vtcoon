# [IMP-402] Blender 5.2 LTS Procedural Generator: Indochine Sanctuary Wealth Trays (Tiers 1..4)
# Target Assets:
#   - public/models/landmarks/wealth_tray_tier1.glb (Startup: 3 Heroic Gold Bullion Bars + 1 Crimson Land Deed)
#   - public/models/landmarks/wealth_tray_tier2.glb (Merchant: 6 Gold Bullion Bars + Polymer Note Bundle + 2 Crimson Land Deeds)
#   - public/models/landmarks/wealth_tray_tier3.glb (Tycoon: 10 Gold Bullion Pyramid + 4 Crimson Land Deeds)
#   - public/models/landmarks/wealth_tray_tier4.glb (Monopoly Emperor: 14 Gold Bullion Hoard + 6 Crimson Land Deeds + Imperial Crown)
# Locked Unscaled Base Dimensions: Width = 0.36m (X: -0.18..+0.18), Height = 0.44m (Z: 0.00..+0.44 in Blender -> Y: 0.00..+0.44 in GLB), Depth = 0.48m (Y: -0.24..+0.24 in Blender -> Z: -0.24..+0.24 in GLB)
# Pivot: [0, 0, 0] at bottom center of stepped plinth base.
# Pipeline: bmesh + Boolean Modifier (recessed velvet tray cavity) + Bevel Modifier (3 segments) + Weighted Normals + PBR Materials.

import bpy
import bmesh
import math
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "landmarks")
os.makedirs(OUT_GLB_DIR, exist_ok=True)

TARGET_WIDTH = 0.36
TARGET_HEIGHT = 0.44
TARGET_DEPTH = 0.48


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_to_rgba(hex_str, alpha=1.0):
    h = hex_str.lstrip("#")
    r = srgb_to_linear(int(h[0:2], 16) / 255.0)
    g = srgb_to_linear(int(h[2:4], 16) / 255.0)
    b = srgb_to_linear(int(h[4:6], 16) / 255.0)
    return (r, g, b, alpha)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_pbr_material(name, hex_color, metallic=0.08, roughness=0.28, emission_hex=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    bsdf = mat.node_tree.nodes.get("Principled BSDF") if mat.node_tree else None
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if emission_hex and emission_strength > 0.0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = hex_to_rgba(emission_hex)
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = hex_to_rgba(emission_hex)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def create_bmesh_box(name, size_xyz, center_xyz, rot_euler=(0.0, 0.0, 0.0), mat=None, bevel_width=0.0, bevel_segments=1):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size_xyz[0]
        v.co.y *= size_xyz[1]
        v.co.z *= size_xyz[2]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = center_xyz
    obj.rotation_euler = rot_euler
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    if mat:
        obj.data.materials.append(mat)

    if bevel_width > 0:
        bev = obj.modifiers.new(name="Bevel", type="BEVEL")
        bev.width = bevel_width
        bev.segments = bevel_segments
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(32.0)

    return obj


def create_gold_bullion_bar(name, center_xyz, length=0.165, width_bot=0.076, width_top=0.052, height=0.056, rot_z=-0.35, mat=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    # Sculpted trapezoidal 999.9 gold bar with beveled top rim in bmesh (28 tris per bar)
    hl_bot = length * 0.50
    hl_mid = length * 0.45
    hl_top = length * 0.39
    hw_bot = width_bot * 0.50
    hw_mid = width_top * 0.58
    hw_top = width_top * 0.46
    z_bot = -height * 0.50
    z_mid = height * 0.28
    z_top = height * 0.50

    rings = [
        [(-hw_bot, -hl_bot, z_bot), (hw_bot, -hl_bot, z_bot), (hw_bot, hl_bot, z_bot), (-hw_bot, hl_bot, z_bot)],
        [(-hw_mid, -hl_mid, z_mid), (hw_mid, -hl_mid, z_mid), (hw_mid, hl_mid, z_mid), (-hw_mid, hl_mid, z_mid)],
        [(-hw_top, -hl_top, z_top), (hw_top, -hl_top, z_top), (hw_top, hl_top, z_top), (-hw_top, hl_top, z_top)],
    ]
    ring_verts = [[bm.verts.new(co) for co in r] for r in rings]
    bm.faces.new(reversed(ring_verts[0]))
    bm.faces.new(ring_verts[-1])
    for r_idx in range(len(ring_verts) - 1):
        r1 = ring_verts[r_idx]
        r2 = ring_verts[r_idx + 1]
        for i in range(4):
            bm.faces.new((r1[i], r1[(i + 1) % 4], r2[(i + 1) % 4], r2[i]))

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = center_xyz
    obj.rotation_euler = (0.0, 0.0, rot_z)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    if mat:
        obj.data.materials.append(mat)
    return obj


def create_crimson_land_deed(name, center_xyz, size_xyz=(0.036, 0.165, 0.235), rot_euler=(0.0, -0.14, -0.35), mat_deed=None, mat_gold=None):
    parts = []
    # Oriented so the wide cover face (Y x Z) faces directly toward the (+X, -Y) camera vector!
    folder = create_bmesh_box(
        f"{name}_Folder",
        size_xyz=size_xyz,
        center_xyz=center_xyz,
        rot_euler=rot_euler,
        mat=mat_deed,
        bevel_width=0.0,
    )
    parts.append(folder)

    emblem_size = (size_xyz[0] + 0.008, size_xyz[1] * 0.58, size_xyz[2] * 0.48)
    emblem = create_bmesh_box(
        f"{name}_GoldSeal",
        size_xyz=emblem_size,
        center_xyz=center_xyz,
        rot_euler=rot_euler,
        mat=mat_gold,
        bevel_width=0.0,
    )
    parts.append(emblem)
    return parts


def create_imperial_crown(name, center_xyz, mat_emissive_gold, mat_crimson):
    parts = []
    cx, cy, cz = center_xyz
    band = create_bmesh_box(
        f"{name}_BaseBand",
        size_xyz=(0.155, 0.155, 0.045),
        center_xyz=(cx, cy, cz + 0.022),
        mat=mat_emissive_gold,
        bevel_width=0.003,
        bevel_segments=1,
    )
    parts.append(band)

    cushion = create_bmesh_box(
        f"{name}_VelvetDome",
        size_xyz=(0.122, 0.122, 0.068),
        center_xyz=(cx, cy, cz + 0.056),
        mat=mat_crimson,
        bevel_width=0.004,
        bevel_segments=1,
    )
    parts.append(cushion)

    for idx, ang in enumerate((0.0, math.pi * 0.25, math.pi * 0.5, math.pi * 0.75)):
        parts.append(
            create_bmesh_box(
                f"{name}_CrownSpire_{idx}",
                size_xyz=(0.172, 0.024, 0.088),
                center_xyz=(cx, cy, cz + 0.068),
                rot_euler=(0.0, 0.0, ang),
                mat=mat_emissive_gold,
                bevel_width=0.0,
            )
        )

    parts.append(
        create_bmesh_box(
            f"{name}_CrownApex",
            size_xyz=(0.058, 0.058, 0.062),
            center_xyz=(cx, cy, cz + 0.122),
            rot_euler=(0.0, 0.0, math.pi * 0.25),
            mat=mat_emissive_gold,
            bevel_width=0.003,
            bevel_segments=1,
        )
    )
    return parts


def build_base_stepped_plinth_and_basin(mats):
    parts = []
    # 1. Lower Stepped Plinth (Z = 0.00..0.14m in Blender -> worldY = -0.24..-0.10m)
    # High-contrast Brushed Brass & Carrara Ivory Marble stepped plinth so it pops vividly against the dark #2B1D14 walnut deck
    parts.append(
        create_bmesh_box(
            "Tray_Plinth_LowerStep",
            size_xyz=(0.36, 0.48, 0.048),
            center_xyz=(0.0, 0.0, 0.024),
            mat=mats["brass"],
            bevel_width=0.003,
            bevel_segments=1,
        )
    )
    parts.append(
        create_bmesh_box(
            "Tray_Plinth_MarbleRiser",
            size_xyz=(0.342, 0.462, 0.062),
            center_xyz=(0.0, 0.0, 0.079),
            mat=mats["marble"],
            bevel_width=0.0025,
            bevel_segments=1,
        )
    )
    parts.append(
        create_bmesh_box(
            "Tray_Plinth_WalnutCollar",
            size_xyz=(0.332, 0.452, 0.030),
            center_xyz=(0.0, 0.0, 0.125),
            mat=mats["walnut"],
            bevel_width=0.0,
        )
    )

    # 2. Upper Gleaming Brass Tray Frame (Z = 0.14..0.195m) carved with Boolean Modifier + Bevel 3 segments
    tray_frame = create_bmesh_box(
        "Tray_Upper_BrassFrame",
        size_xyz=(0.354, 0.474, 0.056),
        center_xyz=(0.0, 0.0, 0.168),
        mat=mats["brass"],
        bevel_width=0.0,
    )
    basin_cutter = create_bmesh_box(
        "Tray_Basin_BooleanCutter",
        size_xyz=(0.304, 0.424, 0.046),
        center_xyz=(0.0, 0.0, 0.180),
        mat=None,
        bevel_width=0.0,
    )

    bool_mod = tray_frame.modifiers.new(name="BasinCarveBoolean", type="BOOLEAN")
    bool_mod.operation = "DIFFERENCE"
    bool_mod.solver = "EXACT"
    bool_mod.object = basin_cutter

    bev_mod = tray_frame.modifiers.new(name="TrayFrameBevel", type="BEVEL")
    bev_mod.width = 0.0035
    bev_mod.segments = 3
    bev_mod.limit_method = "ANGLE"
    bev_mod.angle_limit = math.radians(32.0)

    bpy.context.view_layer.objects.active = tray_frame
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)
    bpy.ops.object.modifier_apply(modifier=bev_mod.name)
    bpy.data.objects.remove(basin_cutter, do_unlink=True)
    parts.append(tray_frame)

    # 3. Raised Royal Crimson Velvet Cushion Bed (Z = 0.155..0.200m, flush above rim so 100% of gold & deeds are unobstructed)
    parts.append(
        create_bmesh_box(
            "Tray_CrimsonVelvet_Bed",
            size_xyz=(0.300, 0.420, 0.044),
            center_xyz=(0.0, 0.0, 0.178),
            mat=mats["velvet"],
            bevel_width=0.004,
            bevel_segments=1,
        )
    )

    # 4. 4 Gleaming Gold Corner Finials
    for sx in (-1, 1):
        for sy in (-1, 1):
            parts.append(
                create_bmesh_box(
                    f"Tray_Brass_CornerMount_{sx}_{sy}",
                    size_xyz=(0.052, 0.052, 0.068),
                    center_xyz=(sx * 0.154, sy * 0.214, 0.174),
                    mat=mats["emissive_gold"],
                    bevel_width=0.003,
                    bevel_segments=1,
                )
            )

    return parts


def build_tier_tray(tier):
    clear_scene()
    mats = {
        "walnut": make_pbr_material("Mat_WalnutWood", "#2B1D14", metallic=0.08, roughness=0.28),
        "marble": make_pbr_material("Mat_CarraraMarble", "#F8FAFC", metallic=0.05, roughness=0.22),
        "brass": make_pbr_material(
            "Mat_BrushedBrass",
            "#F59E0B",
            metallic=0.88,
            roughness=0.18,
            emission_hex="#D97706",
            emission_strength=0.22,
        ),
        "velvet": make_pbr_material(
            "Mat_CrimsonVelvet",
            "#BE123C",
            metallic=0.04,
            roughness=0.65,
            emission_hex="#991B1B",
            emission_strength=0.15,
        ),
        "gold": make_pbr_material(
            "Mat_Gold9999",
            "#FBBF24",
            metallic=0.92,
            roughness=0.14,
            emission_hex="#F59E0B",
            emission_strength=0.42,
        ),
        "deed": make_pbr_material(
            "Mat_CrimsonDeed",
            "#DC2626",
            metallic=0.10,
            roughness=0.36,
            emission_hex="#991B1B",
            emission_strength=0.20,
        ),
        "polymer": make_pbr_material(
            "Mat_PolymerNotes",
            "#0EA5E9",
            metallic=0.12,
            roughness=0.32,
            emission_hex="#0284C7",
            emission_strength=0.25,
        ),
        "emissive_gold": make_pbr_material(
            "Mat_EmissiveGold",
            "#FDE047",
            metallic=0.95,
            roughness=0.10,
            emission_hex="#F59E0B",
            emission_strength=0.65,
        ),
    }

    parts = build_base_stepped_plinth_and_basin(mats)

    if tier == 1:
        # Foreground camera-facing (+X, -Y) heroic gold bullion bars + tall Crimson Land Deed backdrop
        bar_positions = [
            (0.042, -0.085, 0.228, -0.32),
            (0.055, 0.045, 0.228, -0.42),
            (0.048, -0.020, 0.282, -0.36),
        ]
        for idx, (bx, by, bz, rot_z) in enumerate(bar_positions):
            parts.append(create_gold_bullion_bar(f"Tier1_GoldBar_{idx}", (bx, by, bz), rot_z=rot_z, mat=mats["gold"]))

        parts.extend(
            create_crimson_land_deed(
                "Tier1_HeroDeed",
                center_xyz=(-0.058, 0.035, 0.320),
                size_xyz=(0.042, 0.195, 0.240),
                rot_euler=(0.0, -0.12, -0.35),
                mat_deed=mats["deed"],
                mat_gold=mats["emissive_gold"],
            )
        )

    elif tier == 2:
        bar_positions = [
            (0.032, -0.115, 0.228, -0.32),
            (0.058, -0.025, 0.228, -0.32),
            (0.082, 0.065, 0.228, -0.32),
            (0.045, -0.070, 0.282, -0.36),
            (0.070, 0.020, 0.282, -0.36),
            (0.058, -0.025, 0.336, -0.34),
        ]
        for idx, (bx, by, bz, rot_z) in enumerate(bar_positions):
            parts.append(create_gold_bullion_bar(f"Tier2_GoldBar_{idx}", (bx, by, bz), rot_z=rot_z, mat=mats["gold"]))

        # Prominent 500k Polymer Note Bundle in front-left corner
        parts.append(
            create_bmesh_box(
                "Tier2_PolymerBundle",
                size_xyz=(0.135, 0.095, 0.072),
                center_xyz=(0.045, 0.135, 0.236),
                rot_euler=(0.0, 0.0, -0.25),
                mat=mats["polymer"],
                bevel_width=0.0025,
                bevel_segments=1,
            )
        )
        parts.append(
            create_bmesh_box(
                "Tier2_PolymerStrap",
                size_xyz=(0.042, 0.102, 0.076),
                center_xyz=(0.045, 0.135, 0.236),
                rot_euler=(0.0, 0.0, -0.25),
                mat=mats["emissive_gold"],
                bevel_width=0.0,
            )
        )

        parts.extend(
            create_crimson_land_deed(
                "Tier2_Deed_A",
                center_xyz=(-0.068, -0.045, 0.315),
                size_xyz=(0.038, 0.180, 0.230),
                rot_euler=(0.0, -0.14, -0.45),
                mat_deed=mats["deed"],
                mat_gold=mats["emissive_gold"],
            )
        )
        parts.extend(
            create_crimson_land_deed(
                "Tier2_Deed_B",
                center_xyz=(-0.052, 0.075, 0.325),
                size_xyz=(0.038, 0.185, 0.235),
                rot_euler=(0.0, -0.10, -0.22),
                mat_deed=mats["deed"],
                mat_gold=mats["emissive_gold"],
            )
        )

    elif tier == 3:
        bar_positions = [
            (0.020, -0.135, 0.226, -0.34),
            (0.044, -0.050, 0.226, -0.34),
            (0.068, 0.035, 0.226, -0.34),
            (0.092, 0.120, 0.226, -0.34),
            (0.032, -0.092, 0.278, -0.34),
            (0.056, -0.008, 0.278, -0.34),
            (0.080, 0.078, 0.278, -0.34),
            (0.044, -0.050, 0.330, -0.34),
            (0.068, 0.035, 0.330, -0.34),
            (0.056, -0.008, 0.382, -0.34),
        ]
        for idx, (bx, by, bz, rot_z) in enumerate(bar_positions):
            parts.append(create_gold_bullion_bar(f"Tier3_GoldBar_{idx}", (bx, by, bz), rot_z=rot_z, mat=mats["gold"]))

        deed_specs = [
            (-0.075, -0.105, 0.305, (0.0, -0.16, -0.52)),
            (-0.068, -0.030, 0.318, (0.0, -0.13, -0.38)),
            (-0.062, 0.045, 0.325, (0.0, -0.10, -0.24)),
            (-0.055, 0.120, 0.312, (0.0, -0.08, -0.12)),
        ]
        for idx, (dx, dy, dz, rot_e) in enumerate(deed_specs):
            parts.extend(
                create_crimson_land_deed(
                    f"Tier3_Deed_{idx}",
                    center_xyz=(dx, dy, dz),
                    size_xyz=(0.036, 0.170, 0.230),
                    rot_euler=rot_e,
                    mat_deed=mats["deed"],
                    mat_gold=mats["emissive_gold"],
                )
            )

    else:
        bar_positions = [
            (0.012, -0.145, 0.224, -0.34),
            (0.032, -0.075, 0.224, -0.34),
            (0.052, -0.005, 0.224, -0.34),
            (0.072, 0.065, 0.224, -0.34),
            (0.092, 0.135, 0.224, -0.34),
            (0.022, -0.110, 0.272, -0.34),
            (0.042, -0.040, 0.272, -0.34),
            (0.062, 0.030, 0.272, -0.34),
            (0.082, 0.100, 0.272, -0.34),
            (0.032, -0.075, 0.320, -0.34),
            (0.052, -0.005, 0.320, -0.34),
            (0.072, 0.065, 0.320, -0.34),
            (0.042, -0.040, 0.365, -0.34),
            (0.062, 0.030, 0.365, -0.34),
        ]
        for idx, (bx, by, bz, rot_z) in enumerate(bar_positions):
            parts.append(
                create_gold_bullion_bar(
                    f"Tier4_GoldBar_{idx}",
                    (bx, by, bz),
                    width_bot=0.068,
                    width_top=0.048,
                    height=0.050,
                    rot_z=rot_z,
                    mat=mats["gold"],
                )
            )

        deed_specs = [
            (-0.082, -0.135, 0.295, (0.0, -0.18, -0.58)),
            (-0.076, -0.080, 0.308, (0.0, -0.15, -0.46)),
            (-0.070, -0.025, 0.318, (0.0, -0.12, -0.34)),
            (-0.066, 0.030, 0.322, (0.0, -0.10, -0.22)),
            (-0.062, 0.085, 0.312, (0.0, -0.08, -0.12)),
            (-0.058, 0.140, 0.298, (0.0, -0.06, -0.02)),
        ]
        for idx, (dx, dy, dz, rot_e) in enumerate(deed_specs):
            parts.extend(
                create_crimson_land_deed(
                    f"Tier4_Deed_{idx}",
                    center_xyz=(dx, dy, dz),
                    size_xyz=(0.034, 0.160, 0.225),
                    rot_euler=rot_e,
                    mat_deed=mats["deed"],
                    mat_gold=mats["emissive_gold"],
                )
            )

        parts.extend(create_imperial_crown("Tier4_ImperialCrown", (0.045, -0.005, 0.318), mats["emissive_gold"], mats["velvet"]))

    # Apply modifiers on all sub-parts and join into a single multi-material mesh
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(True)

    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    tray_obj = bpy.context.active_object
    tray_obj.name = f"SanctuaryWealthTray_Tier{tier}"

    # Normalize exact unscaled bounding box to 0.36m (X) x 0.48m (Y) x 0.44m (Z) with Pivot [0, 0, 0] at bottom center
    mesh = tray_obj.data
    xs = [v.co.x for v in mesh.vertices]
    ys = [v.co.y for v in mesh.vertices]
    zs = [v.co.z for v in mesh.vertices]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    cur_w = max(1e-6, max_x - min_x)
    cur_d = max(1e-6, max_y - min_y)
    cur_h = max(1e-6, max_z - min_z)
    cx = 0.5 * (min_x + max_x)
    cy = 0.5 * (min_y + max_y)

    for v in mesh.vertices:
        v.co.x = (v.co.x - cx) * (TARGET_WIDTH / cur_w)
        v.co.y = (v.co.y - cy) * (TARGET_DEPTH / cur_d)
        v.co.z = (v.co.z - min_z) * (TARGET_HEIGHT / cur_h)

    mesh.update()

    # Smooth shading + Weighted Normals Modifier for crisp bevel highlights
    for poly in mesh.polygons:
        poly.use_smooth = True

    wn_mod = tray_obj.modifiers.new(name="WeightedNormal", type="WEIGHTED_NORMAL")
    wn_mod.keep_sharp = True
    bpy.context.view_layer.objects.active = tray_obj
    bpy.ops.object.modifier_apply(modifier=wn_mod.name)

    bm_check = bmesh.new()
    bm_check.from_mesh(mesh)
    bmesh.ops.triangulate(bm_check, faces=bm_check.faces)
    tri_count = len(bm_check.faces)
    bm_check.free()

    final_xs = [v.co.x for v in mesh.vertices]
    final_ys = [v.co.y for v in mesh.vertices]
    final_zs = [v.co.z for v in mesh.vertices]
    bbox_w = round(max(final_xs) - min(final_xs), 4)
    bbox_d = round(max(final_ys) - min(final_ys), 4)
    bbox_h = round(max(final_zs) - min(final_zs), 4)

    out_path = os.path.join(OUT_GLB_DIR, f"wealth_tray_tier{tier}.glb")
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials="EXPORT",
    )
    size_bytes = os.path.getsize(out_path)
    print(f"[IMP-402] Tier {tier} BBox: width={bbox_w}m, height={bbox_h}m, depth={bbox_d}m | Tris={tri_count} | Size={size_bytes}B")

    assert abs(bbox_w - TARGET_WIDTH) <= 1e-3, f"Tier {tier} width mismatch: {bbox_w}"
    assert abs(bbox_h - TARGET_HEIGHT) <= 1e-3, f"Tier {tier} height mismatch: {bbox_h}"
    assert abs(bbox_d - TARGET_DEPTH) <= 1e-3, f"Tier {tier} depth mismatch: {bbox_d}"
    assert tri_count <= 1500, f"Tier {tier} triangle budget exceeded: {tri_count} > 1500"
    assert size_bytes <= 48 * 1024, f"Tier {tier} file size exceeded 48KB: {size_bytes} bytes"


if __name__ == "__main__":
    for t in (1, 2, 3, 4):
        build_tier_tray(t)
