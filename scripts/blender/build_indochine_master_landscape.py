# [IMP-436] Blender 5.2 LTS Procedural Generator:
# Indochine Master Tabletop Sculpt & VIP Landscape
# Output: public/models/board/indochine_master_landscape.glb
# Sub-features:
# 1. 3D Embossed Dong Son Bronze Relief Medallion (14-ray sun star, 8 chim Lạc, concentric rings)
# 2. Indochine Gilded Golden Pagoda (Chùa Vàng Nam Bộ on river terrace)
# 3. 4 Corner Bonsai Penjing Planters (Aristocratic collector ceramics & cloud-pruned foliage)
# 4. Organic Riverbank Boulders along the Saigon River curves

import os
import math
import bpy
import bmesh
from mathutils import Vector, Matrix

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "board")
OUT_GLB_PATH = os.path.join(OUT_GLB_DIR, "indochine_master_landscape.glb")
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


def make_pbr_material(name, hex_color, metallic=0.05, roughness=0.3, coat=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Coat Weight" in bsdf.inputs and coat > 0.0:
            bsdf.inputs["Coat Weight"].default_value = coat
            if "Coat Roughness" in bsdf.inputs:
                bsdf.inputs["Coat Roughness"].default_value = 0.1
        elif "Coat" in bsdf.inputs and coat > 0.0:
            bsdf.inputs["Coat"].default_value = coat
    return mat


# =============================================================================
# PART 1: 3D EMBOSSED DONG SON BRONZE RELIEF MEDALLION
# =============================================================================
def build_dong_son_relief(mat_bronze):
    """
    Creates the embossed 3D Dong Son bronze drum medallion sitting on the sunken arena floor.
    Blender Z is Three.js Y (elevation in [-0.020, -0.018]m).
    Radius R <= 1.35m.
    """
    bm = bmesh.new()
    z_base = 0.0020
    z_relief = 0.0045

    # 1. Central Sun Disc & 14-Ray Sun Star
    num_rays = 14
    r_hub = 0.16
    r_ray_tip = 0.38
    c_vert_base = bm.verts.new(Vector((0, 0, z_base)))
    c_vert_top = bm.verts.new(Vector((0, 0, z_relief)))

    # Central disc
    hub_base_verts = []
    hub_top_verts = []
    for i in range(num_rays * 2):
        ang = i * (2.0 * math.pi / (num_rays * 2))
        hb = bm.verts.new(Vector((r_hub * math.cos(ang), r_hub * math.sin(ang), z_base)))
        ht = bm.verts.new(Vector((r_hub * math.cos(ang), r_hub * math.sin(ang), z_relief)))
        hub_base_verts.append(hb)
        hub_top_verts.append(ht)

    for i in range(num_rays * 2):
        i_next = (i + 1) % (num_rays * 2)
        bm.faces.new([c_vert_top, hub_top_verts[i], hub_top_verts[i_next]])
        bm.faces.new([hub_base_verts[i], hub_top_verts[i], hub_top_verts[i_next], hub_base_verts[i_next]])

    # 14 Triangular Rays radiating outward
    for ray_i in range(num_rays):
        idx_root1 = ray_i * 2
        idx_root2 = (ray_i * 2 + 1) % (num_rays * 2)
        ang_tip = (idx_root1 + 0.5) * (2.0 * math.pi / (num_rays * 2))

        tip_top = bm.verts.new(Vector((r_ray_tip * math.cos(ang_tip), r_ray_tip * math.sin(ang_tip), z_relief)))
        tip_base = bm.verts.new(Vector((r_ray_tip * math.cos(ang_tip), r_ray_tip * math.sin(ang_tip), z_base)))

        v1 = hub_top_verts[idx_root1]
        v2 = hub_top_verts[idx_root2]
        v1_b = hub_base_verts[idx_root1]
        v2_b = hub_base_verts[idx_root2]

        # Top face of ray
        bm.faces.new([v1, tip_top, v2])
        # Sides of ray
        bm.faces.new([v1_b, v1, tip_top, tip_base])
        bm.faces.new([tip_base, tip_top, v2, v2_b])

    # 2. Concentric Decorative Chevron Rings
    def add_flat_annulus(r_inner, r_outer, z_lvl, segs=48):
        inner_v = []
        outer_v = []
        for s in range(segs):
            ang = s * (2.0 * math.pi / segs)
            iv = bm.verts.new(Vector((r_inner * math.cos(ang), r_inner * math.sin(ang), z_lvl)))
            ov = bm.verts.new(Vector((r_outer * math.cos(ang), r_outer * math.sin(ang), z_lvl)))
            inner_v.append(iv)
            outer_v.append(ov)
        for s in range(segs):
            s_next = (s + 1) % segs
            bm.faces.new([inner_v[s], outer_v[s], outer_v[s_next], inner_v[s_next]])

    # Ring 1: Chevron / bead ring
    add_flat_annulus(0.48, 0.54, z_relief, segs=48)
    # Ring 2: Concentric cord ring
    add_flat_annulus(0.64, 0.72, z_relief, segs=48)

    # 3. 8 Chim Lạc Flying Cranes Relief Silhouettes (Chim Lạc bay ngược chiều kim đồng hồ)
    num_birds = 8
    r_bird = 0.96
    for b_i in range(num_birds):
        b_ang = b_i * (2.0 * math.pi / num_birds)
        cos_b = math.cos(b_ang)
        sin_b = math.sin(b_ang)
        # Tangent vector for CCW flight direction
        tx = -sin_b
        ty = cos_b
        # Radial vector
        rx = cos_b
        ry = sin_b

        center = Vector((r_bird * cos_b, r_bird * sin_b, z_relief))

        # Define 5 stylized vertices for bird silhouette: beak, neck, wing-tip, body, tail
        p_beak = center + Vector((tx * 0.12 + rx * 0.02, ty * 0.12 + ry * 0.02, 0))
        p_wing = center + Vector((tx * 0.02 + rx * 0.10, ty * 0.02 + ry * 0.10, 0))
        p_head = center + Vector((tx * 0.06 - rx * 0.01, ty * 0.06 - ry * 0.01, 0))
        p_body = center + Vector((-tx * 0.04 - rx * 0.03, -ty * 0.04 - ry * 0.03, 0))
        p_tail = center + Vector((-tx * 0.10 - rx * 0.02, -ty * 0.10 - ry * 0.02, 0))

        v_beak = bm.verts.new(p_beak)
        v_wing = bm.verts.new(p_wing)
        v_head = bm.verts.new(p_head)
        v_body = bm.verts.new(p_body)
        v_tail = bm.verts.new(p_tail)

        # 2 triangles for bird body
        bm.faces.new([v_beak, v_wing, v_head])
        bm.faces.new([v_head, v_wing, v_body])
        bm.faces.new([v_body, v_wing, v_tail])

    # Ring 4: Outer rim frame
    add_flat_annulus(1.20, 1.32, z_relief, segs=56)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("DongSon_Bronze_Relief_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("DongSon_Bronze_Relief", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_bronze)
    return obj


# =============================================================================
# PART 2: INDOCHINE GILDED GOLDEN PAGODA
# =============================================================================
def build_golden_pagoda(mat_gold, mat_wood, mat_stone):
    """
    Creates the gilded Indochine Golden Pagoda pavilion on the northeast river terrace.
    Three.js Coordinates: X ≈ 2.7m, Z ≈ -1.6m, Y ≈ 0.015m.
    Blender Coordinates: X = 2.7m, Y = 1.6m, Z = 0.015m.
    Separation from cruiser at (1.6, 2.2) is ~3.95m (> 3.5m clearance).
    """
    bm = bmesh.new()
    x0 = 2.7
    y0 = 1.6
    z0 = 0.015

    # 1. Stone Plinth Terrace (0.7m x 0.7m, height 0.04m)
    w_plinth = 0.36
    h_plinth = 0.04
    plinth_mat = Matrix.Translation((x0, y0, z0 + h_plinth / 2))
    bmesh.ops.create_cube(bm, size=1.0, matrix=plinth_mat @ Matrix.Diagonal((w_plinth * 2, w_plinth * 2, h_plinth, 1.0)))

    # Assign stone material to plinth
    for f in bm.faces:
        f.material_index = 2  # Stone

    # 2. Four Lacquered Wooden Pillars
    z_floor = z0 + h_plinth
    h_pillar = 0.32
    r_pillar = 0.024
    pillar_offsets = [(-0.22, -0.22), (0.22, -0.22), (0.22, 0.22), (-0.22, 0.22)]

    pillar_faces_start = len(bm.faces)
    for px, py in pillar_offsets:
        p_mat = Matrix.Translation((x0 + px, y0 + py, z_floor + h_pillar / 2))
        bmesh.ops.create_cone(
            bm,
            segments=8,
            radius1=r_pillar,
            radius2=r_pillar,
            depth=h_pillar,
            matrix=p_mat,
        )
    for f in bm.faces[pillar_faces_start:]:
        f.material_index = 1  # Wood

    # 3. Lower Tier Curved Flared Eaves Roof (Gilded Gold)
    z_roof1 = z_floor + h_pillar
    roof1_start = len(bm.faces)

    def add_curved_roof_tier(z_base, w_eaves, w_apex, h_eaves, h_rise):
        # 4 corners of eaves (flared up slightly)
        eaves = [
            Vector((x0 - w_eaves, y0 - w_eaves, z_base + h_eaves)),
            Vector((x0 + w_eaves, y0 - w_eaves, z_base + h_eaves)),
            Vector((x0 + w_eaves, y0 + w_eaves, z_base + h_eaves)),
            Vector((x0 - w_eaves, y0 + w_eaves, z_base + h_eaves)),
        ]
        # 4 corners of roof apex
        apex = [
            Vector((x0 - w_apex, y0 - w_apex, z_base + h_eaves + h_rise)),
            Vector((x0 + w_apex, y0 - w_apex, z_base + h_eaves + h_rise)),
            Vector((x0 + w_apex, y0 + w_apex, z_base + h_eaves + h_rise)),
            Vector((x0 - w_apex, y0 + w_apex, z_base + h_eaves + h_rise)),
        ]
        ev = [bm.verts.new(p) for p in eaves]
        av = [bm.verts.new(p) for p in apex]

        # 4 roof slopes
        bm.faces.new([ev[0], ev[1], av[1], av[0]])
        bm.faces.new([ev[1], ev[2], av[2], av[1]])
        bm.faces.new([ev[2], ev[3], av[3], av[2]])
        bm.faces.new([ev[3], ev[0], av[0], av[3]])
        # Top apex face
        bm.faces.new(av)

    # Tier 1 Roof
    add_curved_roof_tier(z_roof1, w_eaves=0.42, w_apex=0.20, h_eaves=0.03, h_rise=0.12)

    # Tier 2 Pavilion & Upper Roof
    z_roof2 = z_roof1 + 0.15
    add_curved_roof_tier(z_roof2, w_eaves=0.28, w_apex=0.10, h_eaves=0.02, h_rise=0.10)

    # Ornamental Golden Lotus Spire
    z_spire = z_roof2 + 0.12
    spire_mat = Matrix.Translation((x0, y0, z_spire + 0.08))
    bmesh.ops.create_cone(
        bm,
        segments=8,
        radius1=0.04,
        radius2=0.005,
        depth=0.16,
        matrix=spire_mat,
    )

    for f in bm.faces[roof1_start:]:
        f.material_index = 0  # Gold

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Indochine_Golden_Pagoda_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Indochine_Golden_Pagoda", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_gold)
    obj.data.materials.append(mat_wood)
    obj.data.materials.append(mat_stone)
    return obj


# =============================================================================
# PART 3: 4 CORNER BONSAI PENJING PLANTERS
# =============================================================================
def build_corner_bonsai_planters(mat_pot, mat_wood, mat_foliage):
    """
    Creates 4 aristocratic penjing bonsai planters at the 4 inner corners of the board diorama:
    (±4.2m, 0.015m, ±4.2m).
    In Blender: (±4.2m, ∓4.2m, 0.015m).
    """
    bm = bmesh.new()
    corners = [
        (-4.2, -4.2),  # NW in Three.js (Z=-4.2 -> Y=+4.2 in Blender)
        (4.2, -4.2),   # NE
        (-4.2, 4.2),   # SW
        (4.2, 4.2),    # SE
    ]

    for cx_3j, cz_3j in corners:
        bx = cx_3j
        by = -cz_3j
        bz = 0.015

        # 1. Octagonal Ceramic Glazed Pot (Scaled 1.35x)
        pot_start = len(bm.faces)
        pot_mat = Matrix.Translation((bx, by, bz + 0.055))
        bmesh.ops.create_cone(
            bm,
            segments=8,
            radius1=0.28,
            radius2=0.34,
            depth=0.11,
            matrix=pot_mat,
        )
        for f in bm.faces[pot_start:]:
            f.material_index = 0  # Pot

        # 2. Gnarled Miniature Bonsai Trunk
        trunk_start = len(bm.faces)
        t_mat = Matrix.Translation((bx, by, bz + 0.18))
        bmesh.ops.create_cone(
            bm,
            segments=6,
            radius1=0.048,
            radius2=0.025,
            depth=0.18,
            matrix=t_mat @ Matrix.Rotation(0.25, 4, 'X'),
        )
        for f in bm.faces[trunk_start:]:
            f.material_index = 1  # Wood

        # 3. Cloud-Pruned Cascading Foliage Pads (3 emerald jade ellipsoids, scaled 1.35x)
        foliage_start = len(bm.faces)
        cloud_offsets = [
            (0.08, 0.05, 0.28, 0.14, 0.07),
            (-0.07, 0.03, 0.23, 0.11, 0.055),
            (0.03, -0.08, 0.19, 0.10, 0.05),
        ]
        for ox, oy, oz, r_xy, r_z in cloud_offsets:
            c_mat = Matrix.Translation((bx + ox, by + oy, bz + oz)) @ Matrix.Diagonal((r_xy * 2, r_xy * 2, r_z * 2, 1.0))
            bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.5, matrix=c_mat)

        for f in bm.faces[foliage_start:]:
            f.material_index = 2  # Foliage

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Corner_Bonsai_Planters_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Corner_Bonsai_Planters", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_pot)
    obj.data.materials.append(mat_wood)
    obj.data.materials.append(mat_foliage)
    return obj


# =============================================================================
# PART 4: ORGANIC RIVERBANK BOULDERS
# =============================================================================
def build_riverbank_boulders(mat_stone):
    """
    Creates organic river boulders clustered naturally along the Saigon River curves.
    Strictly outside the central arena collar: R >= 1.68m from (0, 0).
    """
    bm = bmesh.new()

    boulder_clusters = [
        # East bank bend clusters
        (2.45, 0.95, -0.025, 0.14),
        (2.60, 0.70, -0.020, 0.11),
        (3.05, -0.80, -0.015, 0.16),
        (3.20, -1.10, -0.018, 0.12),
        (2.10, 2.70, -0.022, 0.15),
        (1.90, 2.95, -0.020, 0.10),
        # West bank clusters
        (-0.35, -4.60, -0.020, 0.18),
        (-0.55, -4.90, -0.015, 0.13),
        (-0.40, 4.70, -0.020, 0.16),
        (-0.60, 5.00, -0.015, 0.12),
    ]

    for bx_3j, bz_3j, by_elev, scale in boulder_clusters:
        dist = math.hypot(bx_3j, bz_3j)
        assert dist >= 1.68, f"Boulder at ({bx_3j}, {bz_3j}) penetrates arena radius {dist} < 1.68m"

        bl_x = bx_3j
        bl_y = -bz_3j
        bl_z = by_elev + scale * 0.4

        b_mat = Matrix.Translation((bl_x, bl_y, bl_z)) @ Matrix.Diagonal((scale * 1.8, scale * 1.5, scale * 1.0, 1.0))
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.5, matrix=b_mat)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Riverbank_Boulders_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Riverbank_Boulders", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_stone)
    return obj


# =============================================================================
# MAIN PIPELINE
# =============================================================================
def generate_indochine_master_landscape():
    clear_scene()

    print("=== [IMP-436] BLENDER 5.2 LTS INDOCHINE MASTER TABLETOP SCULPT ===")

    # Materials
    mat_bronze = make_pbr_material("DongSon_Bronze_Relief", "#8C6239", metallic=0.90, roughness=0.18, coat=0.35)
    mat_gold = make_pbr_material("Pagoda_Gold", "#D4AF37", metallic=0.88, roughness=0.20, coat=0.30)
    mat_wood = make_pbr_material("Indochine_Wood", "#451A03", metallic=0.05, roughness=0.45)
    mat_stone = make_pbr_material("Terrace_Stone", "#78716C", metallic=0.04, roughness=0.75)
    mat_pot = make_pbr_material("Bonsai_Ceramic_Pot", "#1C1917", metallic=0.18, roughness=0.18, coat=0.50)
    mat_foliage = make_pbr_material("Bonsai_Foliage", "#16A34A", metallic=0.02, roughness=0.50)

    # 1. 3D Embossed Dong Son Relief
    obj_relief = build_dong_son_relief(mat_bronze)

    # 2. Gilded Golden Pagoda
    obj_pagoda = build_golden_pagoda(mat_gold, mat_wood, mat_stone)

    # 3. 4 Corner Bonsai Planters
    obj_bonsai = build_corner_bonsai_planters(mat_pot, mat_wood, mat_foliage)

    # 4. Organic Riverbank Boulders
    obj_boulders = build_riverbank_boulders(mat_stone)

    # Export to unified GLB
    # Select all 4 objects
    bpy.ops.object.select_all(action='DESELECT')
    for obj in [obj_relief, obj_pagoda, obj_bonsai, obj_boulders]:
        obj.select_set(True)

    # Calculate total triangle count
    total_tris = 0
    for obj in [obj_relief, obj_pagoda, obj_bonsai, obj_boulders]:
        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        total_tris += len(bm.faces)
        bm.free()

    print(f"Total Triangles across 4 Master Features: {total_tris} (Budget <= 7,500)")
    assert total_tris <= 7500, f"Triangles budget exceeded: {total_tris}"

    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB_PATH,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials="EXPORT",
    )

    size_bytes = os.path.getsize(OUT_GLB_PATH)
    print(f"✓ Master Landscape GLB generated: {OUT_GLB_PATH} ({size_bytes / 1024:.1f} KB)")
    assert size_bytes <= 380 * 1024, f"GLB size exceeds 380KB: {size_bytes} bytes"


if __name__ == "__main__":
    generate_indochine_master_landscape()
