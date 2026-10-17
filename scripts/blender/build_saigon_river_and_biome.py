# [IMP-435] Blender 5.2 LTS Procedural Generator:
# 1. S-Shaped Saigon River Spline (public/models/board/saigon_river_spline.glb)
# 2. Indochine Botanical Biome: Coconut Palms & Frangipani Blossoms (public/models/board/indochine_botanical_biome.glb)

import os
import math
import bpy
import bmesh
from mathutils import Vector, Matrix

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "board")
RIVER_GLB_PATH = os.path.join(OUT_GLB_DIR, "saigon_river_spline.glb")
BIOME_GLB_PATH = os.path.join(OUT_GLB_DIR, "indochine_botanical_biome.glb")
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


def make_pbr_material(name, hex_color, metallic=0.05, roughness=0.3, coat=0.0, emissive_hex=None, emissive_strength=0.0):
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
        if emissive_hex and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = hex_to_rgba(emissive_hex)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emissive_strength
    return mat


# =============================================================================
# PART 1: S-SHAPED SAIGON RIVER SPLINE & BEVELED EMBANKMENTS
# =============================================================================

def get_river_center_x(z):
    """
    Computes X centerline of the Saigon River at longitudinal coordinate Z (Three.js coordinates).
    - Under Ba Son Bridge (Z = -3.8): X = 0.0
    - East sweep around Sunken Arena (Z = 0.0): X = 2.45
    - Under Railway Bridge (Z = +3.8): X = 0.0
    - North entrance (Z = -7.4): X = -0.45
    - South exit (Z = +7.4): X = -0.45
    """
    if z < -3.8:
        t = (z - (-7.4)) / (-3.8 - (-7.4))  # 0 at -7.4, 1 at -3.8
        t = max(0.0, min(1.0, t))
        s = 3.0 * t * t - 2.0 * t * t * t  # smoothstep
        return -0.45 * (1.0 - s) + 0.0 * s
    elif z <= 3.8:
        # Curve between -3.8 and +3.8 bulging at z = 0.0
        # Normalised [-1, 1]
        u = z / 3.8
        # Bell curve peaked at u=0
        arch = math.cos(u * math.pi / 2.0)
        return 2.65 * arch
    else:
        t = (z - 3.8) / (7.4 - 3.8)  # 0 at 3.8, 1 at 7.4
        t = max(0.0, min(1.0, t))
        s = 3.0 * t * t - 2.0 * t * t * t
        return 0.0 * (1.0 - s) + (-0.45) * s


def get_river_half_width(z):
    """
    Computes half-width of the river at Z.
    Widened at harbor bend (Z around 2.0) to accommodate moored cruiser.
    """
    base_hw = 0.78
    if 0.5 <= z <= 3.2:
        # Marina basin expansion
        c = (z - 2.0) / 1.2
        c = max(-1.0, min(1.0, c))
        bump = math.cos(c * math.pi / 2.0)
        return base_hw + 0.15 * bump
    return base_hw


def build_saigon_river_spline_mesh():
    """
    Constructs:
    1. Dark sediment riverbed (Y = -0.052)
    2. Jade water surface (Y = -0.035) with subtle camber
    3. West and East beveled stone retaining embankments (coping at Y = 0.006, slope down to -0.035)
    """
    bm = bmesh.new()

    # Step in Z along the river from Z = -7.4 to +7.4 in 48 slices
    num_slices = 49
    z_min = -7.4
    z_max = 7.4

    slices_verts = []

    embankment_width = 0.08
    embankment_curb = 0.10

    for i in range(num_slices):
        t = i / (num_slices - 1)
        z_3j = z_min + t * (z_max - z_min)
        cx = get_river_center_x(z_3j)
        hw = get_river_half_width(z_3j)

        # Three.js coords: X = cx, Y = height, Z = z_3j
        # Blender coords: X_bl = X_3j, Y_bl = -z_3j, Z_bl = Y_3j
        y_bl = -z_3j

        w_water_x = cx - hw
        e_water_x = cx + hw

        w_inner_x = w_water_x - embankment_curb
        e_inner_x = e_water_x + embankment_curb

        w_outer_x = w_inner_x - embankment_width
        e_outer_x = e_inner_x + embankment_width

        w_bed_x = cx - (hw - 0.15)
        e_bed_x = cx + (hw - 0.15)

        # Column points in Blender (X, Y, Z):
        row = [
            bm.verts.new(Vector((w_outer_x, y_bl, 0.003))),    # 0: West outer tie
            bm.verts.new(Vector((w_inner_x, y_bl, 0.008))),    # 1: West top curb
            bm.verts.new(Vector((w_water_x, y_bl, -0.035))),   # 2: West water lip
            bm.verts.new(Vector((w_bed_x, y_bl, -0.052))),     # 3: West bed toe
            bm.verts.new(Vector((cx, y_bl, -0.052))),          # 4: Center bed
            bm.verts.new(Vector((e_bed_x, y_bl, -0.052))),     # 5: East bed toe
            bm.verts.new(Vector((e_water_x, y_bl, -0.035))),   # 6: East water lip
            bm.verts.new(Vector((e_inner_x, y_bl, 0.008))),    # 7: East top curb
            bm.verts.new(Vector((e_outer_x, y_bl, 0.003))),    # 8: East outer tie
        ]
        slices_verts.append(row)

    # Water surface vertices (separate layer at Y = -0.035 to allow clean water material)
    water_slices = []
    for i in range(num_slices):
        t = i / (num_slices - 1)
        z_3j = z_min + t * (z_max - z_min)
        cx = get_river_center_x(z_3j)
        hw = get_river_half_width(z_3j)
        y_bl = -z_3j

        w_water_x = cx - hw
        e_water_x = cx + hw

        # 3 points across the water surface: West, Center, East
        w_v = bm.verts.new(Vector((w_water_x, y_bl, -0.0345)))
        c_v = bm.verts.new(Vector((cx, y_bl, -0.0340)))
        e_v = bm.verts.new(Vector((e_water_x, y_bl, -0.0345)))
        water_slices.append([w_v, c_v, e_v])

    # Connect faces for Embankment & Riverbed
    for i in range(num_slices - 1):
        r1 = slices_verts[i]
        r2 = slices_verts[i + 1]

        # West Embankment: 0-1, 1-2
        f_w1 = bm.faces.new([r1[0], r2[0], r2[1], r1[1]])
        f_w1.material_index = 0  # Stone
        f_w2 = bm.faces.new([r1[1], r2[1], r2[2], r1[2]])
        f_w2.material_index = 0  # Stone

        # Riverbed: 2-3, 3-4, 4-5, 5-6
        f_b1 = bm.faces.new([r1[2], r2[2], r2[3], r1[3]])
        f_b1.material_index = 1  # Dark Bed
        f_b2 = bm.faces.new([r1[3], r2[3], r2[4], r1[4]])
        f_b2.material_index = 1
        f_b3 = bm.faces.new([r1[4], r2[4], r2[5], r1[5]])
        f_b3.material_index = 1
        f_b4 = bm.faces.new([r1[5], r2[5], r2[6], r1[6]])
        f_b4.material_index = 1

        # East Embankment: 6-7, 7-8
        f_e1 = bm.faces.new([r1[6], r2[6], r2[7], r1[7]])
        f_e1.material_index = 0  # Stone
        f_e2 = bm.faces.new([r1[7], r2[7], r2[8], r1[8]])
        f_e2.material_index = 0  # Stone

        # Water surface:
        w1 = water_slices[i]
        w2 = water_slices[i + 1]
        fw_1 = bm.faces.new([w1[0], w2[0], w2[1], w1[1]])
        fw_1.material_index = 2  # Water
        fw_2 = bm.faces.new([w1[1], w2[1], w2[2], w1[2]])
        fw_2.material_index = 2

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def export_saigon_river():
    clear_scene()
    bm = build_saigon_river_spline_mesh()

    mesh_data = bpy.data.meshes.new("SaigonRiverSplineMesh")
    bm.to_mesh(mesh_data)
    bm.free()

    obj = bpy.data.objects.new("SaigonRiverSpline", mesh_data)
    bpy.context.collection.objects.link(obj)

    # Assign materials:
    # 0: Stone Embankment (Antique Granite)
    mat_stone = make_pbr_material("Mat_EmbankmentStone", "#94A3B8", metallic=0.10, roughness=0.62)
    # 1: Dark Riverbed
    mat_bed = make_pbr_material("Mat_RiverBedSediment", "#0C4A6E", metallic=0.05, roughness=0.90)
    # 2: Jade River Water
    mat_water = make_pbr_material("Mat_SaigonJadeWater", "#0E4D44", metallic=0.15, roughness=0.20, coat=0.8)

    obj.data.materials.append(mat_stone)
    obj.data.materials.append(mat_bed)
    obj.data.materials.append(mat_water)

    # Export to GLB
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.export_scene.gltf(
        filepath=RIVER_GLB_PATH,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True
    )
    print(f"[Blender] Exported Saigon River Spline to: {RIVER_GLB_PATH} ({os.path.getsize(RIVER_GLB_PATH)} bytes)")


# =============================================================================
# PART 2: INDOCHINE BOTANICAL BIOME (COCONUT PALMS & FRANGIPANI TREES)
# =============================================================================

def add_cylinder_strip(bm, pt1, pt2, r1, r2, segs=6, mat_idx=0):
    """Adds a tapered cylinder segment between pt1 and pt2."""
    dir_vec = (pt2 - pt1)
    length = dir_vec.length
    if length < 1e-5:
        return
    z_axis = dir_vec.normalized()
    # find orthogonal vector
    up = Vector((0, 0, 1)) if abs(z_axis.z) < 0.9 else Vector((1, 0, 0))
    x_axis = z_axis.cross(up).normalized()
    y_axis = x_axis.cross(z_axis).normalized()

    ring1 = []
    ring2 = []
    for i in range(segs):
        ang = 2.0 * math.pi * i / segs
        ca = math.cos(ang)
        sa = math.sin(ang)
        offset1 = (x_axis * ca + y_axis * sa) * r1
        offset2 = (x_axis * ca + y_axis * sa) * r2
        ring1.append(bm.verts.new(pt1 + offset1))
        ring2.append(bm.verts.new(pt2 + offset2))

    for i in range(segs):
        i_next = (i + 1) % segs
        f = bm.faces.new([ring1[i], ring2[i], ring2[i_next], ring1[i_next]])
        f.material_index = mat_idx


def add_coconut_palm(bm, x_3j, z_3j, height=0.55, lean_dir=(0.5, 0.5), lean_amount=0.14):
    """
    Creates a stylized tropical Coconut Palm (Cocos nucifera).
    Blender coords: X_bl = x_3j, Y_bl = -z_3j, Z_bl = height.
    """
    x_bl = x_3j
    y_bl = -z_3j
    base_pos = Vector((x_bl, y_bl, 0.005))

    # Curve trunk upwards in 6 segments
    num_segs = 6
    trunk_pts = [base_pos]
    ld = Vector((lean_dir[0], -lean_dir[1])).normalized()

    for i in range(1, num_segs + 1):
        t = i / num_segs
        # Quadratic curve for lean
        offset_xy = ld * (lean_amount * (t * t))
        z_h = height * t
        pt = Vector((x_bl + offset_xy.x, y_bl + offset_xy.y, z_h))
        trunk_pts.append(pt)

    # Build trunk
    for i in range(num_segs):
        t1 = i / num_segs
        t2 = (i + 1) / num_segs
        r1 = 0.040 * (1.0 - t1 * 0.45)
        r2 = 0.040 * (1.0 - t2 * 0.45)
        add_cylinder_strip(bm, trunk_pts[i], trunk_pts[i + 1], r1, r2, segs=6, mat_idx=0)

    crown_pt = trunk_pts[-1]

    # Coconuts (3 small spheres under crown)
    for c_i in range(3):
        c_ang = c_i * (2.0 * math.pi / 3.0)
        c_pos = crown_pt + Vector((math.cos(c_ang) * 0.03, math.sin(c_ang) * 0.03, -0.025))
        # Small diamond / low-poly coconut
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.022, matrix=Matrix.Translation(c_pos))

    # 7 Arched Palm Fronds (Lá dừa hình cánh cung cong rủ)
    num_fronds = 7
    frond_len = height * 0.52

    for f_i in range(num_fronds):
        f_ang = f_i * (2.0 * math.pi / num_fronds) + (f_i * 0.15)
        f_dir = Vector((math.cos(f_ang), math.sin(f_ang), 0.0))

        # Frond spine: 4 segments arching up then drooping
        frond_spine = [crown_pt]
        for s in range(1, 5):
            st = s / 4.0
            horiz_dist = frond_len * st
            # Arch formula: rises then falls
            vert_drop = (0.28 * math.sin(st * math.pi)) - (0.42 * (st * st))
            p = crown_pt + f_dir * horiz_dist + Vector((0, 0, vert_drop))
            frond_spine.append(p)

        # Frond ribbon quads (Lá cọ xòe)
        for s in range(4):
            p1 = frond_spine[s]
            p2 = frond_spine[s + 1]
            st = s / 4.0
            leaf_w = 0.075 * math.sin((st + 0.15) * math.pi * 0.85)

            # perpendicular horizontal vector
            perp = Vector((-f_dir.y, f_dir.x, 0)).normalized() * leaf_w

            v1 = bm.verts.new(p1 - perp * (0.6 if s > 0 else 0.1))
            v2 = bm.verts.new(p1 + perp * (0.6 if s > 0 else 0.1))
            v3 = bm.verts.new(p2 + perp)
            v4 = bm.verts.new(p2 - perp)

            face = bm.faces.new([v1, v2, v3, v4])
            face.material_index = 1  # Foliage


def add_frangipani_tree(bm, x_3j, z_3j, height=0.32):
    """
    Creates a stylized flowering Frangipani / Temple Tree (Plumeria).
    Gnarly branches, waxy leaves, and white blossoms with golden center.
    """
    x_bl = x_3j
    y_bl = -z_3j
    base_pos = Vector((x_bl, y_bl, 0.005))

    # Main short stocky trunk
    fork_pt = base_pos + Vector((0, 0, height * 0.45))
    add_cylinder_strip(bm, base_pos, fork_pt, 0.032, 0.024, segs=6, mat_idx=0)

    # 3 Divergent crooked branches
    branch_heads = []
    for b_i in range(3):
        b_ang = b_i * (2.0 * math.pi / 3.0) + 0.35
        b_vec = Vector((math.cos(b_ang) * 0.11, math.sin(b_ang) * 0.11, height * 0.45))
        b_tip = fork_pt + b_vec
        add_cylinder_strip(bm, fork_pt, b_tip, 0.022, 0.014, segs=5, mat_idx=0)
        branch_heads.append(b_tip)

    # Clustered oval leaves and blossoms on each branch head
    for head in branch_heads:
        # 5 Elliptical leaves radiating
        for l_i in range(5):
            l_ang = l_i * (2.0 * math.pi / 5.0)
            l_dir = Vector((math.cos(l_ang), math.sin(l_ang), 0.25)).normalized()
            l_mid = head + l_dir * 0.07 + Vector((0, 0, 0.015))
            l_tip = head + l_dir * 0.13 - Vector((0, 0, 0.015))

            perp = Vector((-l_dir.y, l_dir.x, 0)).normalized() * 0.038
            v1 = bm.verts.new(head)
            v2 = bm.verts.new(l_mid + perp)
            v3 = bm.verts.new(l_tip)
            v4 = bm.verts.new(l_mid - perp)
            f_leaf = bm.faces.new([v1, v2, v3, v4])
            f_leaf.material_index = 1  # Foliage

        # Blossom perched on branch top (5-pointed star / flower)
        b_center = head + Vector((0, 0, 0.035))
        for p_i in range(5):
            p_ang = p_i * (2.0 * math.pi / 5.0)
            p_ang_next = ((p_i + 1) % 5) * (2.0 * math.pi / 5.0)
            petal_tip = b_center + Vector((math.cos(p_ang) * 0.045, math.sin(p_ang) * 0.045, 0.005))
            petal_edge = b_center + Vector((math.cos(p_ang_next) * 0.020, math.sin(p_ang_next) * 0.020, 0))

            f_petal = bm.faces.new([
                bm.verts.new(b_center),
                bm.verts.new(petal_tip),
                bm.verts.new(petal_edge)
            ])
            f_petal.material_index = 2  # White Blossom


def export_indochine_biome():
    clear_scene()
    bm = bmesh.new()

    # Strategic Biome Layout (Three.js coordinates X, Z):
    # Group 1: Northwest Riverbank & Ba Son Plaza (near Bridge Plaza at X=-2.7, Z=-3.8)
    add_coconut_palm(bm, x_3j=-2.1, z_3j=-3.2, height=0.58, lean_dir=(0.7, 0.3), lean_amount=0.15)
    add_coconut_palm(bm, x_3j=-1.6, z_3j=-2.4, height=0.52, lean_dir=(0.5, 0.5), lean_amount=0.12)
    add_frangipani_tree(bm, x_3j=-2.5, z_3j=-2.6, height=0.32)

    # Group 2: Northeast Riverbank (near Ba Son Plaza East at X=2.7, Z=-3.8)
    add_coconut_palm(bm, x_3j=2.2, z_3j=-3.2, height=0.56, lean_dir=(-0.6, 0.4), lean_amount=0.14)
    add_coconut_palm(bm, x_3j=1.8, z_3j=-2.2, height=0.50, lean_dir=(-0.4, 0.6), lean_amount=0.12)
    add_frangipani_tree(bm, x_3j=2.4, z_3j=-2.4, height=0.30)

    # Group 3: Central Arena & River Flanks
    add_coconut_palm(bm, x_3j=-2.0, z_3j=0.0, height=0.62, lean_dir=(0.8, -0.1), lean_amount=0.16)
    add_frangipani_tree(bm, x_3j=-2.2, z_3j=-0.9, height=0.34)
    add_coconut_palm(bm, x_3j=3.6, z_3j=0.2, height=0.60, lean_dir=(-0.7, 0.2), lean_amount=0.15)
    add_frangipani_tree(bm, x_3j=3.4, z_3j=-0.7, height=0.32)

    # Group 4: Southwest Riverbank & Railway Plaza / Heritage (near X=-2.7, Z=+3.8)
    add_coconut_palm(bm, x_3j=-2.2, z_3j=3.0, height=0.56, lean_dir=(0.6, -0.4), lean_amount=0.14)
    add_frangipani_tree(bm, x_3j=-2.5, z_3j=2.2, height=0.35)

    # Group 5: Southeast Riverbank & Railway Plaza East (near X=2.7, Z=+3.8)
    add_coconut_palm(bm, x_3j=2.2, z_3j=3.0, height=0.54, lean_dir=(-0.6, -0.4), lean_amount=0.13)
    add_frangipani_tree(bm, x_3j=2.4, z_3j=2.2, height=0.30)

    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh_data = bpy.data.meshes.new("IndochineBiomeMesh")
    bm.to_mesh(mesh_data)
    bm.free()

    obj = bpy.data.objects.new("IndochineBotanicalBiome", mesh_data)
    bpy.context.collection.objects.link(obj)

    # Materials:
    # 0: Palm/Tree Trunk Bark (#5D4037)
    mat_bark = make_pbr_material("Mat_IndochineBark", "#5D4037", metallic=0.04, roughness=0.82)
    # 1: Tropical Foliage (#2E7D32)
    mat_foliage = make_pbr_material("Mat_TropicalFoliage", "#2E7D32", metallic=0.02, roughness=0.55)
    # 2: Frangipani Blossom (#FFFDF0 with subtle golden emission)
    mat_blossom = make_pbr_material("Mat_FrangipaniBlossom", "#FFFDF0", metallic=0.02, roughness=0.35, emissive_hex="#FEF08A", emissive_strength=0.15)

    obj.data.materials.append(mat_bark)
    obj.data.materials.append(mat_foliage)
    obj.data.materials.append(mat_blossom)

    # Export to GLB
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.export_scene.gltf(
        filepath=BIOME_GLB_PATH,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True
    )
    print(f"[Blender] Exported Indochine Botanical Biome to: {BIOME_GLB_PATH} ({os.path.getsize(BIOME_GLB_PATH)} bytes)")


if __name__ == "__main__":
    export_saigon_river()
    export_indochine_biome()
