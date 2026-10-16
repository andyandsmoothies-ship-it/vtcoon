# [IMP-403] Blender 5.2 LTS Procedural Generator: Indochine War Room Auction Gavel & Trade Balance Scale
# Target Assets:
#   - public/models/landmarks/auction_gavel.glb
#     Locked Unscaled Base Dimensions: Width = 0.44m (X: -0.22..+0.22), Height = 0.42m (Z: 0.00..+0.42 in Blender -> Y: 0.00..+0.42 in GLB), Depth = 0.44m (Y: -0.22..+0.22 in Blender -> Z: -0.22..+0.22 in GLB)
#   - public/models/landmarks/trade_balance_scale.glb
#     Locked Unscaled Base Dimensions: Width = 0.52m (X: -0.26..+0.26), Height = 0.48m (Z: 0.00..+0.48 in Blender -> Y: 0.00..+0.48 in GLB), Depth = 0.32m (Y: -0.16..+0.16 in Blender -> Z: -0.16..+0.16 in GLB)
# Pivot: [0, 0, 0] at bottom center of pedestal base.
# Pipeline: bmesh + Spin/Lathe profiles + Bevel Modifier (3 segments) + Weighted Normals + Multi-Material PBR.

import bpy
import bmesh
import math
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "landmarks")
os.makedirs(OUT_GLB_DIR, exist_ok=True)


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


def create_bmesh_box(name, size_xyz, center_xyz, rot_euler=(0.0, 0.0, 0.0), mat=None, bevel_width=0.0, bevel_segments=3):
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


def create_lathe_profile_object(name, profile_rz, segments=12, center_xyz=(0.0, 0.0, 0.0), rot_euler=(0.0, 0.0, 0.0), mat=None):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    rings = []
    for r, z in profile_rz:
        ring = []
        for s in range(segments):
            ang = (2.0 * math.pi * s) / segments
            ring.append(bm.verts.new((r * math.cos(ang), r * math.sin(ang), z)))
        rings.append(ring)

    for i in range(len(rings) - 1):
        r1 = rings[i]
        r2 = rings[i + 1]
        for s in range(segments):
            s_next = (s + 1) % segments
            bm.faces.new((r1[s], r1[s_next], r2[s_next], r2[s]))

    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])

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

    return obj


def finalize_and_export_glb(parts, obj_name, target_w, target_h, target_d, out_filename):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in parts:
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(True)

    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    merged = bpy.context.active_object
    merged.name = obj_name

    mesh = merged.data
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
        v.co.x = (v.co.x - cx) * (target_w / cur_w)
        v.co.y = (v.co.y - cy) * (target_d / cur_d)
        v.co.z = (v.co.z - min_z) * (target_h / cur_h)

    mesh.update()

    for poly in mesh.polygons:
        poly.use_smooth = True

    wn_mod = merged.modifiers.new(name="WeightedNormal", type="WEIGHTED_NORMAL")
    wn_mod.keep_sharp = True
    bpy.context.view_layer.objects.active = merged
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

    out_path = os.path.join(OUT_GLB_DIR, out_filename)
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
    print(f"[IMP-403] {out_filename} BBox: width={bbox_w}m, height={bbox_h}m, depth={bbox_d}m | Tris={tri_count} | Size={size_bytes}B")

    assert abs(bbox_w - target_w) <= 1e-3, f"{out_filename} width mismatch: {bbox_w} != {target_w}"
    assert abs(bbox_h - target_h) <= 1e-3, f"{out_filename} height mismatch: {bbox_h} != {target_h}"
    assert abs(bbox_d - target_d) <= 1e-3, f"{out_filename} depth mismatch: {bbox_d} != {target_d}"
    assert tri_count <= 1500, f"{out_filename} triangle budget exceeded: {tri_count} > 1500"
    assert size_bytes <= 48 * 1024, f"{out_filename} file size exceeded 48KB: {size_bytes} bytes"


def build_auction_gavel():
    clear_scene()
    mats = {
        "marble": make_pbr_material("Mat_CarraraMarble", "#F8FAFC", metallic=0.05, roughness=0.20, emission_hex="#E2E8F0", emission_strength=0.12),
        "walnut": make_pbr_material("Mat_EbonyWalnut", "#2B1D14", metallic=0.10, roughness=0.26, emission_hex="#451A03", emission_strength=0.08),
        "brass": make_pbr_material("Mat_BrushedBrass", "#D97706", metallic=0.88, roughness=0.20, emission_hex="#B45309", emission_strength=0.25),
        "gold": make_pbr_material("Mat_ImperialGold", "#F59E0B", metallic=0.94, roughness=0.14, emission_hex="#FBBF24", emission_strength=0.52),
    }

    parts = []
    # 1. Stepped Indochine Carrara Marble & Walnut Sound Block Base (Z = 0.00..0.15m)
    parts.append(
        create_bmesh_box(
            "SoundBlock_MarblePlinth",
            size_xyz=(0.44, 0.44, 0.052),
            center_xyz=(0.0, 0.0, 0.026),
            mat=mats["marble"],
            bevel_width=0.005,
            bevel_segments=3,
        )
    )
    parts.append(
        create_bmesh_box(
            "SoundBlock_BrassCollar",
            size_xyz=(0.38, 0.38, 0.026),
            center_xyz=(0.0, 0.0, 0.065),
            mat=mats["brass"],
            bevel_width=0.003,
            bevel_segments=2,
        )
    )
    anvil_profile = [
        (0.175, 0.078),
        (0.182, 0.095),
        (0.160, 0.118),
        (0.168, 0.136),
    ]
    parts.append(
        create_lathe_profile_object(
            "SoundBlock_WalnutAnvil",
            profile_rz=anvil_profile,
            segments=14,
            mat=mats["walnut"],
        )
    )
    pad_profile = [
        (0.145, 0.136),
        (0.150, 0.146),
        (0.132, 0.156),
    ]
    parts.append(
        create_lathe_profile_object(
            "SoundBlock_GoldStrikePad",
            profile_rz=pad_profile,
            segments=14,
            mat=mats["gold"],
        )
    )

    # 2. Heroic 35-degree Cocked Gavel above the Sound Block (Z = 0.15..0.42m)
    strike_angle = math.radians(35.0)
    head_profile = [
        (0.068, -0.115),
        (0.076, -0.095),
        (0.062, -0.055),
        (0.056, 0.000),
        (0.062, 0.055),
        (0.076, 0.095),
        (0.068, 0.115),
    ]
    parts.append(
        create_lathe_profile_object(
            "Gavel_TurnedHead",
            profile_rz=head_profile,
            segments=12,
            center_xyz=(-0.055, -0.015, 0.285),
            rot_euler=(math.radians(90.0) - strike_angle * 0.35, strike_angle, math.radians(22.0)),
            mat=mats["walnut"],
        )
    )

    for offset_axis in (-0.072, 0.0, 0.072):
        collar_profile = [
            (0.078, offset_axis - 0.014),
            (0.081, offset_axis),
            (0.078, offset_axis + 0.014),
        ]
        parts.append(
            create_lathe_profile_object(
                f"Gavel_GoldBand_{offset_axis:.2f}",
                profile_rz=collar_profile,
                segments=12,
                center_xyz=(-0.055, -0.015, 0.285),
                rot_euler=(math.radians(90.0) - strike_angle * 0.35, strike_angle, math.radians(22.0)),
                mat=mats["gold"],
            )
        )

    handle_profile = [
        (0.026, 0.00),
        (0.022, 0.08),
        (0.028, 0.16),
        (0.038, 0.23),
        (0.044, 0.27),
        (0.032, 0.29),
    ]
    parts.append(
        create_lathe_profile_object(
            "Gavel_TurnedHandle",
            profile_rz=handle_profile,
            segments=12,
            center_xyz=(-0.045, -0.010, 0.265),
            rot_euler=(math.radians(-12.0), math.radians(55.0), math.radians(-18.0)),
            mat=mats["walnut"],
        )
    )
    pommel_profile = [
        (0.046, 0.24),
        (0.052, 0.275),
        (0.036, 0.305),
    ]
    parts.append(
        create_lathe_profile_object(
            "Gavel_GoldPommel",
            profile_rz=pommel_profile,
            segments=12,
            center_xyz=(-0.045, -0.010, 0.265),
            rot_euler=(math.radians(-12.0), math.radians(55.0), math.radians(-18.0)),
            mat=mats["gold"],
        )
    )

    finalize_and_export_glb(
        parts=parts,
        obj_name="WarRoomAuctionGavel",
        target_w=0.44,
        target_h=0.42,
        target_d=0.44,
        out_filename="auction_gavel.glb",
    )


def build_trade_balance_scale():
    clear_scene()
    mats = {
        "marble": make_pbr_material("Mat_ScaleMarble", "#F8FAFC", metallic=0.05, roughness=0.20, emission_hex="#E2E8F0", emission_strength=0.14),
        "walnut": make_pbr_material("Mat_ScaleWalnut", "#2B1D14", metallic=0.08, roughness=0.28),
        "brass": make_pbr_material("Mat_ScaleBrass", "#D97706", metallic=0.90, roughness=0.18, emission_hex="#B45309", emission_strength=0.28),
        "gold": make_pbr_material("Mat_ScaleGold9999", "#FBBF24", metallic=0.94, roughness=0.15, emission_hex="#F59E0B", emission_strength=0.55),
    }

    parts = []
    parts.append(
        create_bmesh_box(
            "Scale_Base_MarblePlinth",
            size_xyz=(0.38, 0.32, 0.048),
            center_xyz=(0.0, 0.0, 0.024),
            mat=mats["marble"],
            bevel_width=0.004,
            bevel_segments=3,
        )
    )
    parts.append(
        create_bmesh_box(
            "Scale_Base_BrassStep",
            size_xyz=(0.31, 0.26, 0.036),
            center_xyz=(0.0, 0.0, 0.066),
            mat=mats["brass"],
            bevel_width=0.003,
            bevel_segments=2,
        )
    )

    pillar_profile = [
        (0.072, 0.080),
        (0.058, 0.115),
        (0.036, 0.160),
        (0.044, 0.250),
        (0.032, 0.340),
        (0.052, 0.395),
        (0.038, 0.430),
    ]
    parts.append(
        create_lathe_profile_object(
            "Scale_CentralBrassColumn",
            profile_rz=pillar_profile,
            segments=12,
            mat=mats["brass"],
        )
    )

    finial_profile = [
        (0.042, 0.428),
        (0.056, 0.452),
        (0.024, 0.480),
    ]
    parts.append(
        create_lathe_profile_object(
            "Scale_ApexGoldFinial",
            profile_rz=finial_profile,
            segments=12,
            mat=mats["gold"],
        )
    )

    parts.append(
        create_bmesh_box(
            "Scale_BalanceBeam",
            size_xyz=(0.45, 0.042, 0.034),
            center_xyz=(0.0, 0.0, 0.395),
            mat=mats["gold"],
            bevel_width=0.003,
            bevel_segments=3,
        )
    )
    parts.append(
        create_bmesh_box(
            "Scale_FulcrumShield",
            size_xyz=(0.088, 0.062, 0.076),
            center_xyz=(0.0, 0.0, 0.398),
            mat=mats["marble"],
            bevel_width=0.003,
            bevel_segments=2,
        )
    )

    for side_name, px in (("Left", -0.182), ("Right", 0.182)):
        parts.append(
            create_bmesh_box(
                f"Scale_{side_name}_BeamCap",
                size_xyz=(0.046, 0.048, 0.046),
                center_xyz=(px, 0.0, 0.395),
                mat=mats["brass"],
                bevel_width=0.002,
                bevel_segments=1,
            )
        )
        for sy in (-0.048, 0.048):
            parts.append(
                create_bmesh_box(
                    f"Scale_{side_name}_ChainRod_{sy:.2f}",
                    size_xyz=(0.016, 0.016, 0.185),
                    center_xyz=(px, sy * 0.65, 0.300),
                    rot_euler=(math.radians(8.0 if sy > 0 else -8.0), 0.0, 0.0),
                    mat=mats["brass"],
                )
            )

        pan_profile = [
            (0.032, 0.182),
            (0.068, 0.194),
            (0.078, 0.214),
            (0.072, 0.222),
            (0.056, 0.204),
        ]
        parts.append(
            create_lathe_profile_object(
                f"Scale_{side_name}_GoldPan",
                profile_rz=pan_profile,
                segments=12,
                center_xyz=(px, 0.0, 0.0),
                mat=mats["gold"],
            )
        )

        parts.append(
            create_bmesh_box(
                f"Scale_{side_name}_BullionToken",
                size_xyz=(0.068, 0.054, 0.036),
                center_xyz=(px, 0.0, 0.220),
                mat=mats["gold"],
                bevel_width=0.003,
                bevel_segments=1,
            )
        )

    finalize_and_export_glb(
        parts=parts,
        obj_name="WarRoomTradeBalanceScale",
        target_w=0.52,
        target_h=0.48,
        target_d=0.32,
        out_filename="trade_balance_scale.glb",
    )


if __name__ == "__main__":
    build_auction_gavel()
    build_trade_balance_scale()
