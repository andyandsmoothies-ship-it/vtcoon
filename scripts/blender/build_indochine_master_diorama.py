# [IMP-438] Blender 5.2 LTS Master Procedural & Sculpt Generator (V5 - AAA Parity & Polish)
# Targets:
# 1. Output GLB: public/models/board/indochine_master_diorama.glb
# 2. Preview Render: .agents/tmp/indochine_master_diorama_preview.jpg
#
# Authentic, magnificent realization of indochine_executive_tabletop.jpg:
# - Solid continuous manifold terrain with organic carved river valley (ZERO holes, ZERO voxel staircases)
# - Deep royal emerald velvet well (Z = -0.035m) with thick polished cast brass beveled lip
# - Dual-Tone Dong Son bronze drum medallion with 14 sun rays, concentric rings, and 8 soaring Chim Lạc
# - Wide circular limestone/granite esplanade with tiered curbs completely sealing terrain seam
# - S-curve jade Saigon river with natural sandstone boulder embankments
# - 3 luxury white motor yachts with teak decks and tinted glass flybridges
# - Saigon Notre-Dame Cathedral with red brick body, rose window, twin slate spires and crosses (fully unblocked)
# - Indochine Golden Pagoda with triple flared curved eaves, red lacquered pillars and stone steps
# - Ba Son Cable-Stayed Bridge with leaning white pylon and fan stay cables
# - Lush tropical flora: multi-segment arching coconut palms, flowering frangipani shrubs, and bonsai planters
# - Beveled Dark Walnut Chassis Outer Frame with gold brass inlay
# - Studio tabletop salon lighting (3200K key, turquoise fill, gold rim, AgX Medium High Contrast)

import os
import math
import bpy
import bmesh
from mathutils import Vector, Matrix, Euler

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB_DIR = os.path.join(ROOT_DIR, "public", "models", "board")
OUT_GLB_PATH = os.path.join(OUT_GLB_DIR, "indochine_master_diorama.glb")
OUT_PREVIEW_PATH = os.path.join(ROOT_DIR, ".agents", "tmp", "indochine_master_diorama_preview.jpg")
os.makedirs(OUT_GLB_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUT_PREVIEW_PATH), exist_ok=True)


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


def set_bsdf_input(bsdf, name, value):
    for inp in bsdf.inputs:
        if inp.name == name:
            inp.default_value = value
            return True
    return False


def make_pbr_material(name, hex_color, metallic=0.0, roughness=0.3, coat=0.0, sheen=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        set_bsdf_input(bsdf, "Base Color", hex_to_rgba(hex_color, alpha))
        set_bsdf_input(bsdf, "Metallic", metallic)
        set_bsdf_input(bsdf, "Roughness", roughness)
        if coat > 0.0:
            set_bsdf_input(bsdf, "Coat Weight", coat)
            set_bsdf_input(bsdf, "Coat", coat)
            set_bsdf_input(bsdf, "Coat Roughness", 0.08)
        if sheen > 0.0:
            set_bsdf_input(bsdf, "Sheen Weight", sheen)
            set_bsdf_input(bsdf, "Sheen Roughness", 0.5)
            set_bsdf_input(bsdf, "Sheen Tint", hex_to_rgba("#A7F3D0"))
    return mat


# =============================================================================
# 1. CENTRAL SUNKEN VELVET WELL & DUAL-TONE DONG SON BRONZE MEDALLION
# =============================================================================
def build_central_sunken_well(mat_velvet, mat_brass, mat_bronze_base, mat_bronze_gold):
    bm = bmesh.new()

    z_floor = -0.035
    z_lip = 0.024
    r_inner = 1.65
    r_outer = 1.78
    segs = 64

    # 1. Velvet floor disc
    v_center = bm.verts.new(Vector((0, 0, z_floor)))
    floor_rim_verts = []
    for s in range(segs):
        ang = s * (2.0 * math.pi / segs)
        v = bm.verts.new(Vector((r_inner * math.cos(ang), r_inner * math.sin(ang), z_floor)))
        floor_rim_verts.append(v)
    for s in range(segs):
        s_next = (s + 1) % segs
        bm.faces.new([v_center, floor_rim_verts[s], floor_rim_verts[s_next]])

    # 2. Velvet vertical cylindrical wall
    lip_inner_verts = []
    for s in range(segs):
        ang = s * (2.0 * math.pi / segs)
        v = bm.verts.new(Vector((r_inner * math.cos(ang), r_inner * math.sin(ang), z_lip)))
        lip_inner_verts.append(v)
    for s in range(segs):
        s_next = (s + 1) % segs
        bm.faces.new([floor_rim_verts[s], floor_rim_verts[s_next], lip_inner_verts[s_next], lip_inner_verts[s]])

    for f in bm.faces:
        f.material_index = 0  # Velvet

    # 3. Thick Cast Brass Beveled Lip (Outer Ring)
    lip_faces_start = len(bm.faces)
    lip_outer_verts = []
    lip_curb_base_verts = []
    for s in range(segs):
        ang = s * (2.0 * math.pi / segs)
        vo = bm.verts.new(Vector((r_outer * math.cos(ang), r_outer * math.sin(ang), z_lip + 0.007)))
        vb = bm.verts.new(Vector((r_outer * math.cos(ang), r_outer * math.sin(ang), 0.012)))
        lip_outer_verts.append(vo)
        lip_curb_base_verts.append(vb)
    for s in range(segs):
        s_next = (s + 1) % segs
        bm.faces.new([lip_inner_verts[s], lip_inner_verts[s_next], lip_outer_verts[s_next], lip_outer_verts[s]])
        bm.faces.new([lip_outer_verts[s], lip_outer_verts[s_next], lip_curb_base_verts[s_next], lip_curb_base_verts[s]])
    for f in bm.faces[lip_faces_start:]:
        f.material_index = 1  # Brass

    # 4. Dong Son Base Disc (Deep Antique Bronze #784A28)
    base_disc_start = len(bm.faces)
    z_m_base = z_floor + 0.003
    v_m_center = bm.verts.new(Vector((0, 0, z_m_base)))
    m_base_rim = []
    for s in range(segs):
        ang = s * (2.0 * math.pi / segs)
        m_base_rim.append(bm.verts.new(Vector((1.56 * math.cos(ang), 1.56 * math.sin(ang), z_m_base))))
    for s in range(segs):
        sn = (s + 1) % segs
        bm.faces.new([v_m_center, m_base_rim[s], m_base_rim[sn]])
    for f in bm.faces[base_disc_start:]:
        f.material_index = 2  # Bronze Base

    # 5. Polished Gold Relief Elements (9mm proud relief)
    z_relief = z_m_base + 0.009

    # Central Sun Disc & 14 Rays
    num_rays = 14
    r_hub = 0.28
    r_ray = 0.68
    c_m_top = bm.verts.new(Vector((0, 0, z_relief)))

    hub_t = []
    hub_b = []
    for i in range(num_rays * 2):
        ang = i * (2.0 * math.pi / (num_rays * 2))
        ht = bm.verts.new(Vector((r_hub * math.cos(ang), r_hub * math.sin(ang), z_relief)))
        hb = bm.verts.new(Vector((r_hub * math.cos(ang), r_hub * math.sin(ang), z_m_base)))
        hub_t.append(ht)
        hub_b.append(hb)
    for i in range(num_rays * 2):
        i_next = (i + 1) % (num_rays * 2)
        f_top = bm.faces.new([c_m_top, hub_t[i], hub_t[i_next]])
        f_side = bm.faces.new([hub_b[i], hub_t[i], hub_t[i_next], hub_b[i_next]])
        f_top.material_index = 3  # Bronze Gold
        f_side.material_index = 3

    for ray_i in range(num_rays):
        i1 = ray_i * 2
        i2 = (ray_i * 2 + 1) % (num_rays * 2)
        ang_tip = (i1 + 0.5) * (2.0 * math.pi / (num_rays * 2))
        tt = bm.verts.new(Vector((r_ray * math.cos(ang_tip), r_ray * math.sin(ang_tip), z_relief)))
        tb = bm.verts.new(Vector((r_ray * math.cos(ang_tip), r_ray * math.sin(ang_tip), z_m_base)))
        f1 = bm.faces.new([hub_t[i1], tt, hub_t[i2]])
        f2 = bm.faces.new([hub_b[i1], hub_t[i1], tt, tb])
        f3 = bm.faces.new([tb, tt, hub_t[i2], hub_b[i2]])
        f1.material_index = 3
        f2.material_index = 3
        f3.material_index = 3

    def add_gold_ring(r_in, r_out, seg_count=48):
        it = []
        ot = []
        for s in range(seg_count):
            ang = s * (2.0 * math.pi / seg_count)
            it.append(bm.verts.new(Vector((r_in * math.cos(ang), r_in * math.sin(ang), z_relief))))
            ot.append(bm.verts.new(Vector((r_out * math.cos(ang), r_out * math.sin(ang), z_relief))))
        for s in range(seg_count):
            sn = (s + 1) % seg_count
            f = bm.faces.new([it[s], ot[s], ot[sn], it[sn]])
            f.material_index = 3

    # Concentric rings
    add_gold_ring(0.74, 0.82, 48)
    add_gold_ring(0.92, 1.02, 48)

    # 8 Flying Chim Lạc Cranes (Prominent golden soaring birds)
    r_bird = 1.25
    for b_i in range(8):
        b_ang = b_i * (2.0 * math.pi / 8)
        cos_b = math.cos(b_ang)
        sin_b = math.sin(b_ang)
        tx = -sin_b
        ty = cos_b
        rx = cos_b
        ry = sin_b
        ctr = Vector((r_bird * cos_b, r_bird * sin_b, z_relief))

        # Stylized crane vertices
        v_bk = bm.verts.new(ctr + Vector((tx * 0.22 + rx * 0.05, ty * 0.22 + ry * 0.05, 0)))
        v_wg = bm.verts.new(ctr + Vector((tx * 0.05 + rx * 0.20, ty * 0.05 + ry * 0.20, 0)))
        v_hd = bm.verts.new(ctr + Vector((tx * 0.12 - rx * 0.03, ty * 0.12 - ry * 0.03, 0)))
        v_bd = bm.verts.new(ctr + Vector((-tx * 0.08 - rx * 0.06, -ty * 0.08 - ry * 0.06, 0)))
        v_tl = bm.verts.new(ctr + Vector((-tx * 0.20 - rx * 0.05, -ty * 0.20 - ry * 0.05, 0)))

        f1 = bm.faces.new([v_bk, v_wg, v_hd])
        f2 = bm.faces.new([v_hd, v_wg, v_bd])
        f3 = bm.faces.new([v_bd, v_wg, v_tl])
        f1.material_index = 3
        f2.material_index = 3
        f3.material_index = 3

    # Outer decorative ring
    add_gold_ring(1.44, 1.54, 56)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_Sunken_Well_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_Sunken_Well", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_velvet)
    obj.data.materials.append(mat_brass)
    obj.data.materials.append(mat_bronze_base)
    obj.data.materials.append(mat_bronze_gold)
    return obj


# =============================================================================
# 2. CIRCULAR GRANITE PAVED PROMENADE WITH TIERED SEALING CURB
# =============================================================================
def build_paved_promenade(mat_granite, mat_curb):
    bm = bmesh.new()
    segs = 64
    r1 = 1.78
    r2 = 2.40
    r3 = 2.68
    r4 = 3.02
    z_deck = 0.016
    z_curb = 0.011
    z_skirt = 0.002

    p_in = []
    p_deck = []
    p_curb = []
    p_skirt = []

    for s in range(segs):
        ang = s * (2.0 * math.pi / segs)
        cos_a = math.cos(ang)
        sin_a = math.sin(ang)
        p_in.append(bm.verts.new(Vector((r1 * cos_a, r1 * sin_a, z_deck))))
        p_deck.append(bm.verts.new(Vector((r2 * cos_a, r2 * sin_a, z_deck))))
        p_curb.append(bm.verts.new(Vector((r3 * cos_a, r3 * sin_a, z_curb))))
        p_skirt.append(bm.verts.new(Vector((r4 * cos_a, r4 * sin_a, z_skirt))))

    for s in range(segs):
        sn = (s + 1) % segs
        # Granite main promenade deck
        f1 = bm.faces.new([p_in[s], p_deck[s], p_deck[sn], p_in[sn]])
        f1.material_index = 0  # Granite
        f1.smooth = True

        # Tiered stone curb
        f2 = bm.faces.new([p_deck[s], p_curb[s], p_curb[sn], p_deck[sn]])
        f2.material_index = 1  # Curb
        f2.smooth = True

        # Outward-flared sealing skirt (completely covers terrain seam)
        f3 = bm.faces.new([p_curb[s], p_skirt[s], p_skirt[sn], p_curb[sn]])
        f3.material_index = 1  # Curb
        f3.smooth = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_Promenade_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_Promenade", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_granite)
    obj.data.materials.append(mat_curb)
    return obj


# =============================================================================
# 3. CONTINUOUS SCULPTED EMERALD TERRAIN WITH CARVED RIVER BED
# =============================================================================
def get_river_centerline_points():
    control_points = [
        Vector((-0.2, 4.8, 0)),
        Vector((0.6, 3.8, 0)),
        Vector((1.7, 2.7, 0)),
        Vector((2.7, 1.4, 0)),
        Vector((2.9, -0.2, 0)),
        Vector((2.4, -1.6, 0)),
        Vector((1.1, -2.6, 0)),
        Vector((-0.6, -3.2, 0)),
        Vector((-2.2, -3.5, 0)),
        Vector((-3.8, -3.7, 0)),
        Vector((-4.8, -3.8, 0)),
    ]
    pts = []
    num_pts = len(control_points)
    for i in range(num_pts - 1):
        p0 = control_points[max(0, i - 1)]
        p1 = control_points[i]
        p2 = control_points[i + 1]
        p3 = control_points[min(num_pts - 1, i + 2)]
        for step in range(8):
            t = step / 8.0
            t2 = t * t
            t3 = t2 * t
            pt = 0.5 * (
                (2 * p1) +
                (-p0 + p2) * t +
                (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                (-p0 + 3 * p1 - 3 * p2 + p3) * t3
            )
            pts.append(pt)
    pts.append(control_points[-1])
    return pts


def min_dist_to_river(x, y, river_pts):
    pt = Vector((x, y, 0))
    min_d = 999.0
    for i in range(len(river_pts) - 1):
        p1 = river_pts[i]
        p2 = river_pts[i + 1]
        line_vec = p2 - p1
        line_len2 = line_vec.length_squared
        if line_len2 > 1e-6:
            u = max(0.0, min(1.0, (pt - p1).dot(line_vec) / line_len2))
            proj = p1 + u * line_vec
            dist = (pt - proj).length
            if dist < min_d:
                min_d = dist
    return min_d


def build_continuous_sculpted_terrain(mat_turf, mat_soil):
    bm = bmesh.new()
    river_pts = get_river_centerline_points()

    half_size = 4.75
    grid_res = 52  # 52x52 grid
    step = (2 * half_size) / grid_res
    river_half_width = 0.85
    r_prom_cutoff = 2.68  # Clean cutoff neatly under the r=3.02 promenade skirt

    vert_grid = {}

    for gx in range(grid_res + 1):
        x = -half_size + gx * step
        for gy in range(grid_res + 1):
            y = -half_size + gy * step
            r = math.hypot(x, y)

            if r < r_prom_cutoff:
                continue

            d_river = min_dist_to_river(x, y, river_pts)

            if d_river < river_half_width:
                # Inside river channel
                t = d_river / river_half_width
                z = -0.035 + 0.040 * (0.5 - 0.5 * math.cos(t * math.pi))
            elif d_river < river_half_width + 0.45:
                # Riverbank transition
                t = (d_river - river_half_width) / 0.45
                z = 0.005 + 0.005 * t
            else:
                # Rolling terrain lawn
                z = 0.008 + 0.004 * math.sin(x * 0.8) * math.cos(y * 0.8)

            # Smoothly tuck underneath the promenade skirt
            if r < r_prom_cutoff + 0.35:
                t_sk = (r - r_prom_cutoff) / 0.35
                z = 0.001 * (1.0 - t_sk) + z * t_sk

            vert = bm.verts.new(Vector((x, y, z)))
            vert_grid[(gx, gy)] = vert

    # Generate quad faces where all 4 vertices exist
    for gx in range(grid_res):
        for gy in range(grid_res):
            v00 = vert_grid.get((gx, gy))
            v10 = vert_grid.get((gx + 1, gy))
            v11 = vert_grid.get((gx + 1, gy + 1))
            v01 = vert_grid.get((gx, gy + 1))

            if v00 and v10 and v11 and v01:
                f = bm.faces.new([v00, v10, v11, v01])
                f.material_index = 0  # Turf
                f.smooth = True

    # Subsurface base plinth
    z_base = -0.05
    skirt_faces_start = len(bm.faces)
    for gx in range(grid_res):
        v1 = vert_grid.get((gx, 0))
        v2 = vert_grid.get((gx + 1, 0))
        if v1 and v2:
            vb1 = bm.verts.new(Vector((v1.co.x, v1.co.y, z_base)))
            vb2 = bm.verts.new(Vector((v2.co.x, v2.co.y, z_base)))
            bm.faces.new([v1, v2, vb2, vb1])

        v1 = vert_grid.get((gx, grid_res))
        v2 = vert_grid.get((gx + 1, grid_res))
        if v1 and v2:
            vb1 = bm.verts.new(Vector((v1.co.x, v1.co.y, z_base)))
            vb2 = bm.verts.new(Vector((v2.co.x, v2.co.y, z_base)))
            bm.faces.new([v1, vb1, vb2, v2])

    for gy in range(grid_res):
        v1 = vert_grid.get((0, gy))
        v2 = vert_grid.get((0, gy + 1))
        if v1 and v2:
            vb1 = bm.verts.new(Vector((v1.co.x, v1.co.y, z_base)))
            vb2 = bm.verts.new(Vector((v2.co.x, v2.co.y, z_base)))
            bm.faces.new([v1, vb1, vb2, v2])

        v1 = vert_grid.get((grid_res, gy))
        v2 = vert_grid.get((grid_res, gy + 1))
        if v1 and v2:
            vb1 = bm.verts.new(Vector((v1.co.x, v1.co.y, z_base)))
            vb2 = bm.verts.new(Vector((v2.co.x, v2.co.y, z_base)))
            bm.faces.new([v1, v2, vb2, vb1])

    for f in bm.faces[skirt_faces_start:]:
        f.material_index = 1  # Soil plinth

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_Turf_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_Turf", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_turf)
    obj.data.materials.append(mat_soil)
    return obj


# =============================================================================
# 4. SAIGON RIVER WATER SURFACE, NATURAL BOULDERS & 3 LUXURY YACHTS
# =============================================================================
def build_saigon_river_and_features(mat_water, mat_boulder, mat_yacht_hull, mat_yacht_deck, mat_yacht_glass):
    bm = bmesh.new()
    river_pts = get_river_centerline_points()
    num_pts = len(river_pts)
    half_w = 0.80
    z_water = -0.015

    left_bank = []
    right_bank = []

    for i in range(num_pts):
        curr = river_pts[i]
        if i == 0:
            tangent = (river_pts[1] - curr).normalized()
        elif i == num_pts - 1:
            tangent = (curr - river_pts[i - 1]).normalized()
        else:
            tangent = (river_pts[i + 1] - river_pts[i - 1]).normalized()

        normal = Vector((-tangent.y, tangent.x, 0))
        w = half_w + 0.08 * math.sin(i * 0.4)
        vl = bm.verts.new(curr + normal * w + Vector((0, 0, z_water)))
        vr = bm.verts.new(curr - normal * w + Vector((0, 0, z_water)))
        left_bank.append(vl)
        right_bank.append(vr)

    for i in range(num_pts - 1):
        f = bm.faces.new([left_bank[i], right_bank[i], right_bank[i + 1], left_bank[i + 1]])
        f.material_index = 0  # Jade water
        f.smooth = True

    # Natural Sandstone River Boulders (Dense clusters along banks)
    boulder_starts = len(bm.faces)
    boulder_seeds = [
        # East bank boulders
        (1.9, 2.9, 0.16), (2.1, 2.7, 0.20), (2.8, 1.9, 0.18), (3.1, 0.9, 0.22),
        (3.2, -0.3, 0.18), (2.6, -1.7, 0.20), (1.5, -2.6, 0.18),
        # Inner island bank boulders
        (0.8, 2.3, 0.16), (1.7, 1.0, 0.20), (1.8, -0.5, 0.18), (1.2, -1.6, 0.16),
        (-0.2, -2.3, 0.18), (-1.4, -2.5, 0.18),
        # West exit bank boulders
        (-2.6, -3.6, 0.20), (-3.5, -3.8, 0.18), (-4.3, -3.9, 0.22),
        (-2.7, -2.6, 0.16), (-3.9, -2.9, 0.18),
        # Extra promenade curve riverbank stones
        (2.3, 2.1, 0.18), (2.5, 0.6, 0.22), (2.2, -1.0, 0.20),
    ]

    for bx, by, scale in boulder_seeds:
        b_mat = Matrix.Translation((bx, by, -0.012 + scale * 0.35)) @ Matrix.Diagonal((scale * 1.5, scale * 1.3, scale * 0.9, 1.0))
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.5, matrix=b_mat)

    for f in bm.faces[boulder_starts:]:
        f.material_index = 1  # Boulder
        f.smooth = True

    # 3 Luxury White Yachts on the River (Matching Concept Art)
    yachts = [
        (Vector((1.8, 3.2, z_water + 0.002)), 0.72, 0.72),     # North bend yacht
        (Vector((-3.2, -3.6, z_water + 0.002)), 0.65, -0.12),   # South-West exit yacht
        (Vector((2.7, 0.2, z_water + 0.002)), 0.58, 1.55),      # East channel luxury yacht
    ]

    for y_pos, y_len, y_rot in yachts:
        y_w = 0.24 * (y_len / 0.72)
        y_h = 0.14 * (y_len / 0.72)

        # Hull
        h_start = len(bm.faces)
        h_mat = Matrix.Translation(y_pos) @ Matrix.Rotation(y_rot, 4, 'Z')
        bmesh.ops.create_cone(bm, segments=8, radius1=y_w, radius2=0.03, depth=y_len, matrix=h_mat @ Matrix.Rotation(math.pi / 2, 4, 'Y'))
        for f in bm.faces[h_start:]:
            f.material_index = 2  # Yacht Hull

        # Teak Deck & Flybridge
        c_start = len(bm.faces)
        c_mat = Matrix.Translation(y_pos + Vector((0, 0, y_h * 0.75))) @ Matrix.Rotation(y_rot, 4, 'Z')
        bmesh.ops.create_cube(bm, size=1.0, matrix=c_mat @ Matrix.Diagonal((y_len * 0.48, y_w * 0.78, y_h * 0.8, 1.0)))
        for f in bm.faces[c_start:]:
            f.material_index = 3  # Teak Deck

        # Glass Windshield / Cabin
        g_start = len(bm.faces)
        g_mat = Matrix.Translation(y_pos + Vector((math.cos(y_rot) * 0.12, math.sin(y_rot) * 0.12, y_h * 1.05)))
        bmesh.ops.create_cone(bm, segments=6, radius1=y_w * 0.55, radius2=0.02, depth=0.09, matrix=g_mat)
        for f in bm.faces[g_start:]:
            f.material_index = 4  # Glass

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_River_Features_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_River_Features", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_water)
    obj.data.materials.append(mat_boulder)
    obj.data.materials.append(mat_yacht_hull)
    obj.data.materials.append(mat_yacht_deck)
    obj.data.materials.append(mat_yacht_glass)
    return obj


# =============================================================================
# 5. SAIGON NOTRE-DAME CATHEDRAL WITH ROSE WINDOW & TWIN SLATE SPIRES
# =============================================================================
def build_notre_dame_cathedral(mat_brick, mat_slate, mat_stone):
    bm = bmesh.new()
    x0 = 2.6
    y0 = 1.9
    z0 = 0.010

    # 1. Stone foundation plinth
    w_plinth_x = 1.05
    w_plinth_y = 1.55
    h_plinth = 0.06
    p_mat = Matrix.Translation((x0, y0, z0 + h_plinth / 2))
    bmesh.ops.create_cube(bm, size=1.0, matrix=p_mat @ Matrix.Diagonal((w_plinth_x, w_plinth_y, h_plinth, 1.0)))
    for f in bm.faces:
        f.material_index = 2  # Stone

    # 2. Main Basilica Nave (Red brick)
    z_nave = z0 + h_plinth
    h_nave = 0.58
    w_nave_x = 0.65
    w_nave_y = 1.05
    nave_start = len(bm.faces)
    n_mat = Matrix.Translation((x0, y0 - 0.18, z_nave + h_nave / 2))
    bmesh.ops.create_cube(bm, size=1.0, matrix=n_mat @ Matrix.Diagonal((w_nave_x, w_nave_y, h_nave, 1.0)))

    # Nave pitched gable roof
    z_roof = z_nave + h_nave
    h_roof = 0.32
    r_mat = Matrix.Translation((x0, y0 - 0.18, z_roof + h_roof / 2))
    bmesh.ops.create_cone(bm, segments=4, radius1=0.52, radius2=0.01, depth=h_roof, matrix=r_mat @ Matrix.Rotation(math.pi / 4, 4, 'Z'))

    # Buttresses along the nave flanks
    for side in [-1, 1]:
        for by_off in [-0.5, -0.2, 0.1]:
            b_mat = Matrix.Translation((x0 + side * (w_nave_x / 2 + 0.04), y0 + by_off, z_nave + h_nave * 0.4))
            bmesh.ops.create_cube(bm, size=1.0, matrix=b_mat @ Matrix.Diagonal((0.08, 0.12, h_nave * 0.8, 1.0)))

    for f in bm.faces[nave_start:]:
        f.material_index = 0  # Red Brick

    # 3. Twin Bell Towers (Front towers)
    tower_offsets = [(-0.26, 0.44), (0.26, 0.44)]
    w_tower = 0.30
    h_tower = 0.95
    h_spire = 0.65

    for tx, ty in tower_offsets:
        t_base = len(bm.faces)
        t_mat = Matrix.Translation((x0 + tx, y0 + ty, z_nave + h_tower / 2))
        bmesh.ops.create_cube(bm, size=1.0, matrix=t_mat @ Matrix.Diagonal((w_tower, w_tower, h_tower, 1.0)))
        for f in bm.faces[t_base:]:
            f.material_index = 0  # Brick

        # Pointed octagonal slate spires
        s_base = len(bm.faces)
        s_mat = Matrix.Translation((x0 + tx, y0 + ty, z_nave + h_tower + h_spire / 2))
        bmesh.ops.create_cone(bm, segments=8, radius1=0.19, radius2=0.01, depth=h_spire, matrix=s_mat)

        # Spire Cross atop
        c_mat = Matrix.Translation((x0 + tx, y0 + ty, z_nave + h_tower + h_spire + 0.06))
        bmesh.ops.create_cone(bm, segments=4, radius1=0.018, radius2=0.005, depth=0.12, matrix=c_mat)
        for f in bm.faces[s_base:]:
            f.material_index = 1  # Slate

    # 4. White Stone Rose Window & Gothic Portal
    rw_start = len(bm.faces)
    rw_mat = Matrix.Translation((x0, y0 + 0.44, z_nave + 0.60)) @ Matrix.Rotation(math.pi / 2, 4, 'X')
    bmesh.ops.create_cone(bm, segments=16, radius1=0.14, radius2=0.14, depth=0.03, matrix=rw_mat)
    # Portal Arched Doorway
    pd_mat = Matrix.Translation((x0, y0 + 0.45, z_nave + 0.18))
    bmesh.ops.create_cube(bm, size=1.0, matrix=pd_mat @ Matrix.Diagonal((0.26, 0.04, 0.36, 1.0)))
    for f in bm.faces[rw_start:]:
        f.material_index = 2  # Stone Trim

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_Cathedral_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_Cathedral", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_brick)
    obj.data.materials.append(mat_slate)
    obj.data.materials.append(mat_stone)
    return obj


# =============================================================================
# 6. INDOCHINE GILDED GOLDEN PAGODA ON SOUTH TERRACE
# =============================================================================
def build_golden_pagoda(mat_gold, mat_wood, mat_stone):
    bm = bmesh.new()
    x0 = 0.2
    y0 = -3.8
    z0 = 0.010

    # Stone plinth terrace
    w_p = 0.50
    h_p = 0.06
    p_mat = Matrix.Translation((x0, y0, z0 + h_p / 2))
    bmesh.ops.create_cube(bm, size=1.0, matrix=p_mat @ Matrix.Diagonal((w_p * 2, w_p * 2, h_p, 1.0)))
    # Stone balustrade steps
    s_mat = Matrix.Translation((x0, y0 + w_p + 0.12, z0 + h_p / 4))
    bmesh.ops.create_cube(bm, size=1.0, matrix=s_mat @ Matrix.Diagonal((0.40, 0.24, h_p / 2, 1.0)))
    for f in bm.faces:
        f.material_index = 2

    # 4 Red Lacquered Timber Pillars
    z_floor = z0 + h_p
    h_pil = 0.42
    for px, py in [(-0.32, -0.32), (0.32, -0.32), (0.32, 0.32), (-0.32, 0.32)]:
        p_faces = len(bm.faces)
        bmesh.ops.create_cone(bm, segments=8, radius1=0.030, radius2=0.030, depth=h_pil, matrix=Matrix.Translation((x0 + px, y0 + py, z_floor + h_pil / 2)))
        for f in bm.faces[p_faces:]:
            f.material_index = 1

    # Triple Flared Golden Roofs with Flared Dragon Corners
    z_r1 = z_floor + h_pil
    r1_faces = len(bm.faces)
    bmesh.ops.create_cone(bm, segments=4, radius1=0.68, radius2=0.28, depth=0.16, matrix=Matrix.Translation((x0, y0, z_r1 + 0.08)) @ Matrix.Rotation(math.pi / 4, 4, 'Z'))
    bmesh.ops.create_cone(bm, segments=4, radius1=0.48, radius2=0.16, depth=0.14, matrix=Matrix.Translation((x0, y0, z_r1 + 0.24)) @ Matrix.Rotation(math.pi / 4, 4, 'Z'))
    bmesh.ops.create_cone(bm, segments=4, radius1=0.28, radius2=0.07, depth=0.12, matrix=Matrix.Translation((x0, y0, z_r1 + 0.38)) @ Matrix.Rotation(math.pi / 4, 4, 'Z'))
    # Spire Finial
    bmesh.ops.create_cone(bm, segments=8, radius1=0.050, radius2=0.005, depth=0.22, matrix=Matrix.Translation((x0, y0, z_r1 + 0.52)))
    for f in bm.faces[r1_faces:]:
        f.material_index = 0  # Gold

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_Pagoda_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_Pagoda", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_gold)
    obj.data.materials.append(mat_wood)
    obj.data.materials.append(mat_stone)
    return obj


# =============================================================================
# 7. BA SON CABLE-STAYED BRIDGE (CẦU BA SON)
# =============================================================================
def build_bason_bridge(mat_white, mat_cable, mat_deck):
    bm = bmesh.new()

    pylon_pos = Vector((-0.65, -2.6, 0.008))
    h_pylon = 1.25

    # Leaning aerodynamic white pylon
    p_start = len(bm.faces)
    p_mat = Matrix.Translation(pylon_pos + Vector((0, 0, h_pylon / 2))) @ Matrix.Rotation(0.22, 4, 'Y')
    bmesh.ops.create_cone(bm, segments=8, radius1=0.085, radius2=0.030, depth=h_pylon, matrix=p_mat)
    for f in bm.faces[p_start:]:
        f.material_index = 0  # White Pylon

    # Bridge Deck spanning from (-0.9, -3.7) to (-1.2, -2.1)
    d_start = len(bm.faces)
    deck_start = Vector((-0.9, -3.7, 0.022))
    deck_end = Vector((-1.2, -2.1, 0.016))
    deck_mid = (deck_start + deck_end) / 2
    deck_len = (deck_end - deck_start).length
    deck_ang = math.atan2(deck_end.y - deck_start.y, deck_end.x - deck_start.x)

    deck_mat = Matrix.Translation(deck_mid) @ Matrix.Rotation(deck_ang, 4, 'Z')
    bmesh.ops.create_cube(bm, size=1.0, matrix=deck_mat @ Matrix.Diagonal((deck_len, 0.34, 0.028, 1.0)))
    for f in bm.faces[d_start:]:
        f.material_index = 2  # Deck

    # Stay Cables
    c_start = len(bm.faces)
    pylon_apex = pylon_pos + Vector((-0.20, 0, h_pylon - 0.05))
    num_cables = 10
    for c_i in range(num_cables):
        t = (c_i + 1) / (num_cables + 1)
        cable_deck_pt = deck_start.lerp(deck_end, t)
        mid_pt = (pylon_apex + cable_deck_pt) / 2
        c_vec = cable_deck_pt - pylon_apex
        c_len = c_vec.length
        c_mat = Matrix.Translation(mid_pt)
        bmesh.ops.create_cone(bm, segments=4, radius1=0.007, radius2=0.007, depth=c_len, matrix=c_mat)

    for f in bm.faces[c_start:]:
        f.material_index = 1  # Cable

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_Bridge_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_Bridge", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_white)
    obj.data.materials.append(mat_cable)
    obj.data.materials.append(mat_deck)
    return obj


# =============================================================================
# 8. LUSH TROPICAL FLORA: ARCHING COCONUT PALMS, BONSAI PLANTERS & FRANGIPANI
# =============================================================================
def build_tropical_flora(mat_trunk, mat_frond, mat_shrub, mat_petal, mat_center, mat_planter):
    bm = bmesh.new()

    # Arching Coconut Palms with Segmented Leaf Ribbons (Carefully distributed to frame landmarks)
    palm_sites = [
        (1.4, 3.5, 0.20, 1.1),
        (3.8, 2.8, 0.18, 1.15),  # Positioned behind cathedral to not occlude spires
        (3.6, 0.3, 0.22, 1.1),   # South-east of cathedral
        (-0.4, 2.8, 0.18, 1.0),
        (0.4, -2.9, 0.22, 1.05),
        (-2.2, -2.6, 0.20, 1.05),
        (-3.4, -2.7, 0.22, 1.1),
        (-0.8, -4.2, 0.18, 1.0),
        (2.3, 3.4, -0.15, 1.05),
        (-1.8, -3.2, -0.18, 0.95),
    ]

    for px, py, lean_ang, scale in palm_sites:
        t_base = len(bm.faces)
        h_total = 1.05 * scale
        seg_h = h_total / 3.0
        r_b = 0.055 * scale
        r_t = 0.030 * scale

        for si in range(3):
            z_s = 0.008 + si * seg_h + seg_h / 2
            x_s = px + math.sin(lean_ang) * (si * seg_h)
            r1 = r_b - si * (r_b - r_t) / 3.0
            r2 = r_b - (si + 1) * (r_b - r_t) / 3.0
            t_mat = Matrix.Translation((x_s, py, z_s)) @ Matrix.Rotation(lean_ang, 4, 'Y')
            bmesh.ops.create_cone(bm, segments=8, radius1=r1, radius2=r2, depth=seg_h, matrix=t_mat)

        for f in bm.faces[t_base:]:
            f.material_index = 0  # Trunk

        # 10 Broad Arching Palm Fronds
        crown_pt = Vector((px + math.sin(lean_ang) * h_total, py, 0.008 + math.cos(lean_ang) * h_total))
        num_fronds = 10
        for f_i in range(num_fronds):
            f_ang = f_i * (2.0 * math.pi / num_fronds) + (scale * 0.5)
            cos_f = math.cos(f_ang)
            sin_f = math.sin(f_ang)

            f_pts = []
            f_widths = [0.03, 0.16, 0.22, 0.15, 0.02]
            f_lens = [0.0, 0.22, 0.45, 0.68, 0.88]
            f_z_droops = [0.0, 0.08, 0.12, 0.02, -0.16]

            for s_idx in range(5):
                d_len = f_lens[s_idx] * scale
                d_z = f_z_droops[s_idx] * scale
                pt_mid = crown_pt + Vector((cos_f * d_len, sin_f * d_len, d_z))
                w = f_widths[s_idx] * scale
                side_vec = Vector((-sin_f * (w / 2), cos_f * (w / 2), 0))
                vl = bm.verts.new(pt_mid - side_vec)
                vr = bm.verts.new(pt_mid + side_vec)
                f_pts.append((vl, vr))

            for s_idx in range(4):
                vl1, vr1 = f_pts[s_idx]
                vl2, vr2 = f_pts[s_idx + 1]
                f = bm.faces.new([vl1, vr1, vr2, vl2])
                f.material_index = 1  # Frond
                f.smooth = True

    # Bonsai Trees in Ceramic Planters
    bonsai_sites = [
        (3.4, -2.6, 0.8), (-3.2, 2.6, 0.85), (0.2, 4.2, 0.9), (-3.4, -0.8, 0.8),
    ]
    for bx, by, b_scale in bonsai_sites:
        pot_start = len(bm.faces)
        p_mat = Matrix.Translation((bx, by, 0.015))
        bmesh.ops.create_cube(bm, size=1.0, matrix=p_mat @ Matrix.Diagonal((0.44 * b_scale, 0.32 * b_scale, 0.08, 1.0)))
        for f in bm.faces[pot_start:]:
            f.material_index = 5  # Ceramic Planter

        tr_start = len(bm.faces)
        tr_mat = Matrix.Translation((bx, by, 0.06 + 0.10 * b_scale)) @ Matrix.Rotation(0.25, 4, 'X')
        bmesh.ops.create_cone(bm, segments=6, radius1=0.035 * b_scale, radius2=0.018 * b_scale, depth=0.20 * b_scale, matrix=tr_mat)
        for f in bm.faces[tr_start:]:
            f.material_index = 0  # Trunk

        cl_start = len(bm.faces)
        for c_off_x, c_off_y, c_off_z, c_rad in [(-0.08, 0.04, 0.16, 0.12), (0.08, -0.04, 0.22, 0.14), (0.0, 0.06, 0.28, 0.16)]:
            c_mat = Matrix.Translation((bx + c_off_x * b_scale, by + c_off_y * b_scale, 0.06 + c_off_z * b_scale)) @ Matrix.Diagonal((c_rad * 1.5, c_rad * 1.3, c_rad * 0.6, 1.0))
            bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0, matrix=c_mat)
        for f in bm.faces[cl_start:]:
            f.material_index = 2  # Shrub/Foliage
            f.smooth = True

    # Flowering Frangipani Shrub Mounds
    blossom_sites = [
        (1.8, 1.6), (2.0, 1.4), (2.4, 0.6), (2.6, -0.8), (1.6, -2.0),
        (2.1, 2.6), (2.3, 2.7), (2.0, 2.2),
        (-1.2, 1.6), (-1.6, 0.8), (-1.4, -1.2),
        (0.6, -3.4), (-0.2, -3.4),
    ]

    for fx, fy in blossom_sites:
        b_ctr = Vector((fx, fy, 0.018))

        shrub_base = len(bm.faces)
        sh_mat = Matrix.Translation(b_ctr) @ Matrix.Diagonal((0.36, 0.36, 0.14, 1.0))
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.5, matrix=sh_mat)
        for f in bm.faces[shrub_base:]:
            f.material_index = 2  # Shrub
            f.smooth = True

        for fl_idx in range(3):
            ang_fl = fl_idx * (2.0 * math.pi / 3)
            fl_ctr = b_ctr + Vector((0.08 * math.cos(ang_fl), 0.08 * math.sin(ang_fl), 0.07))

            c_base = len(bm.faces)
            c_mat = Matrix.Translation(fl_ctr)
            bmesh.ops.create_cone(bm, segments=6, radius1=0.025, radius2=0.025, depth=0.010, matrix=c_mat)
            for f in bm.faces[c_base:]:
                f.material_index = 4  # Center

            petals_base = len(bm.faces)
            for p_i in range(5):
                p_ang = p_i * (2.0 * math.pi / 5)
                p_dir = Vector((math.cos(p_ang), math.sin(p_ang), 0))
                pt_mat = Matrix.Translation(fl_ctr + p_dir * 0.045) @ Matrix.Diagonal((0.040, 0.055, 0.008, 1.0))
                bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.5, matrix=pt_mat)

            for f in bm.faces[petals_base:]:
                f.material_index = 3  # Petal
                f.smooth = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_Flora_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_Flora", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_trunk)
    obj.data.materials.append(mat_frond)
    obj.data.materials.append(mat_shrub)
    obj.data.materials.append(mat_petal)
    obj.data.materials.append(mat_center)
    obj.data.materials.append(mat_planter)
    return obj


# =============================================================================
# 9. BEVELED DARK WALNUT CHASSIS OUTER FRAME WITH BRASS INLAY
# =============================================================================
def build_walnut_chassis_frame(mat_walnut, mat_brass):
    bm = bmesh.new()

    w_in = 4.75
    w_out = 5.25
    z_top = 0.028
    z_bot = -0.065

    # 4 border slabs around the perimeter
    borders = [
        # North border
        ((-w_out, w_in), (w_out, w_out)),
        # South border
        ((-w_out, -w_out), (w_out, -w_in)),
        # West border
        ((-w_out, -w_in), (-w_in, w_in)),
        # East border
        ((w_in, -w_in), (w_out, w_in)),
    ]

    for (x1, y1), (x2, y2) in borders:
        bx_w = x2 - x1
        bx_h = y2 - y1
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        f_start = len(bm.faces)
        b_mat = Matrix.Translation((cx, cy, (z_top + z_bot) / 2))
        bmesh.ops.create_cube(bm, size=1.0, matrix=b_mat @ Matrix.Diagonal((bx_w, bx_h, z_top - z_bot, 1.0)))
        for f in bm.faces[f_start:]:
            f.material_index = 0  # Walnut

    # Polished Brass Inlay Line running along the inner perimeter
    inlay_start = len(bm.faces)
    inlay_w = 0.024
    inlay_h = 0.005
    z_inlay = z_top + 0.002
    inlay_r = w_in + 0.05

    inlay_borders = [
        # North
        Vector((0, inlay_r, z_inlay)), Vector((2 * inlay_r, inlay_w, inlay_h)),
        # South
        Vector((0, -inlay_r, z_inlay)), Vector((2 * inlay_r, inlay_w, inlay_h)),
        # West
        Vector((-inlay_r, 0, z_inlay)), Vector((inlay_w, 2 * inlay_r, inlay_h)),
        # East
        Vector((inlay_r, 0, z_inlay)), Vector((inlay_w, 2 * inlay_r, inlay_h)),
    ]
    for i in range(0, len(inlay_borders), 2):
        i_pos = inlay_borders[i]
        i_dim = inlay_borders[i + 1]
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(i_pos) @ Matrix.Diagonal((i_dim.x, i_dim.y, i_dim.z, 1.0)))

    for f in bm.faces[inlay_start:]:
        f.material_index = 1  # Brass

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Master_Walnut_Frame_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Master_Walnut_Frame", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat_walnut)
    obj.data.materials.append(mat_brass)
    return obj


# =============================================================================
# MAIN PIPELINE & PREVIEW RENDER
# =============================================================================
def generate_master_diorama():
    clear_scene()

    print("=== [IMP-438] SCULPTING INDOCHINE MONOLITHIC MASTER DIORAMA (V5) ===")

    # Materials
    mat_velvet = make_pbr_material("MAT-emerald_velvet", "#043E2C", metallic=0.02, roughness=0.85, sheen=0.60)
    mat_brass = make_pbr_material("MAT-brass_cast", "#D4AF37", metallic=0.90, roughness=0.16, coat=0.45)
    mat_bronze_base = make_pbr_material("MAT-dongson_bronze_base", "#784A28", metallic=0.85, roughness=0.32)
    mat_bronze_gold = make_pbr_material("MAT-dongson_bronze_gold", "#FBBF24", metallic=0.92, roughness=0.15, coat=0.50)
    mat_granite = make_pbr_material("MAT-granite_cream", "#F1ECE1", metallic=0.02, roughness=0.60)
    mat_curb = make_pbr_material("MAT-granite_curb", "#CBD5E1", metallic=0.05, roughness=0.50)
    mat_water = make_pbr_material("MAT-river_jade", "#0D7A70", metallic=0.10, roughness=0.08, coat=0.50, alpha=0.94)
    mat_boulder = make_pbr_material("MAT-sandstone_boulder", "#DCD3C1", metallic=0.03, roughness=0.75)
    mat_yacht_hull = make_pbr_material("MAT-yacht_hull", "#F8FAFC", metallic=0.15, roughness=0.20)
    mat_yacht_deck = make_pbr_material("MAT-yacht_deck", "#B45309", metallic=0.05, roughness=0.45)
    mat_yacht_glass = make_pbr_material("MAT-yacht_glass", "#0F172A", metallic=0.85, roughness=0.08)
    mat_brick = make_pbr_material("MAT-red_brick", "#A32828", metallic=0.02, roughness=0.75)
    mat_slate = make_pbr_material("MAT-spire_slate", "#3B4B5C", metallic=0.25, roughness=0.40)
    mat_stone = make_pbr_material("MAT-terrace_stone", "#E2E8F0", metallic=0.04, roughness=0.55)
    mat_gold = make_pbr_material("MAT-pagoda_gold", "#F59E0B", metallic=0.92, roughness=0.16, coat=0.40)
    mat_wood = make_pbr_material("MAT-pagoda_wood", "#5B1414", metallic=0.05, roughness=0.50)
    mat_white = make_pbr_material("MAT-pylon_white", "#F8FAFC", metallic=0.15, roughness=0.25)
    mat_cable = make_pbr_material("MAT-cable_steel", "#94A3B8", metallic=0.75, roughness=0.20)
    mat_deck = make_pbr_material("MAT-deck_asphalt", "#334155", metallic=0.10, roughness=0.65)
    mat_trunk = make_pbr_material("MAT-palm_trunk", "#4E2D17", metallic=0.03, roughness=0.70)
    mat_frond = make_pbr_material("MAT-palm_frond", "#1E6E2E", metallic=0.02, roughness=0.45)
    mat_shrub = make_pbr_material("MAT-shrub_foliage", "#15803D", metallic=0.02, roughness=0.60)
    mat_petal = make_pbr_material("MAT-frangipani_petal", "#FFFFFF", metallic=0.02, roughness=0.30)
    mat_center = make_pbr_material("MAT-frangipani_center", "#FACC15", metallic=0.02, roughness=0.25)
    mat_planter = make_pbr_material("MAT-bonsai_planter", "#2A1D15", metallic=0.15, roughness=0.35)
    mat_turf = make_pbr_material("MAT-emerald_turf", "#1B4D2E", metallic=0.02, roughness=0.75)
    mat_soil = make_pbr_material("MAT-subsurface_soil", "#261A12", metallic=0.02, roughness=0.85)
    mat_walnut = make_pbr_material("MAT-walnut_frame", "#2E1B10", metallic=0.05, roughness=0.35, coat=0.40)

    # 1. Central Sunken Velvet Well with Dual-Tone Dong Son Medallion
    obj_well = build_central_sunken_well(mat_velvet, mat_brass, mat_bronze_base, mat_bronze_gold)

    # 2. Paved Granite Promenade with Sealing Skirt
    obj_promenade = build_paved_promenade(mat_granite, mat_curb)

    # 3. Continuous Sculpted Emerald Terrain
    obj_turf = build_continuous_sculpted_terrain(mat_turf, mat_soil)

    # 4. Saigon River & 3 Yachts & Boulders
    obj_river = build_saigon_river_and_features(mat_water, mat_boulder, mat_yacht_hull, mat_yacht_deck, mat_yacht_glass)

    # 5. Saigon Notre-Dame Cathedral
    obj_cathedral = build_notre_dame_cathedral(mat_brick, mat_slate, mat_stone)

    # 6. Indochine Gilded Golden Pagoda
    obj_pagoda = build_golden_pagoda(mat_gold, mat_wood, mat_stone)

    # 7. Ba Son Cable-Stayed Bridge
    obj_bridge = build_bason_bridge(mat_white, mat_cable, mat_deck)

    # 8. Tropical Flora (Coconut Palms, Bonsai Planters & Frangipani Flowering Shrubs)
    obj_flora = build_tropical_flora(mat_trunk, mat_frond, mat_shrub, mat_petal, mat_center, mat_planter)

    # 9. Beveled Dark Walnut Chassis Outer Frame
    obj_frame = build_walnut_chassis_frame(mat_walnut, mat_brass)

    # Select all master objects
    master_objs = [obj_well, obj_promenade, obj_turf, obj_river, obj_cathedral, obj_pagoda, obj_bridge, obj_flora, obj_frame]

    bpy.ops.object.select_all(action='DESELECT')
    for o in master_objs:
        o.select_set(True)

    # Calculate total triangles
    total_tris = 0
    for o in master_objs:
        bm = bmesh.new()
        bm.from_mesh(o.data)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        total_tris += len(bm.faces)
        bm.free()

    print(f"Total Master Triangles across 9 Components: {total_tris} (Budget <= 18,000)")
    assert total_tris <= 18000, f"Triangles budget exceeded: {total_tris}"

    # Export unified GLB
    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB_PATH,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
    )

    size_kb = os.path.getsize(OUT_GLB_PATH) / 1024.0
    print(f"✓ Master Diorama GLB generated: {OUT_GLB_PATH} ({size_kb:.1f} KB)")

    # =========================================================================
    # PREVIEW RENDERING (Tabletop Salon Studio Lighting & 42° Isometric Camera)
    # =========================================================================
    cam_data = bpy.data.cameras.new("Hero_Camera")
    cam_data.lens = 55
    cam_data.clip_start = 0.5
    cam_data.clip_end = 100.0

    cam_obj = bpy.data.objects.new("Hero_Camera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Position camera at (6.6, -9.4, 8.4) looking down at (0, 0, 0)
    cam_obj.location = (6.6, -9.4, 8.4)
    direction = (Vector((0, 0, 0)) - cam_obj.location).normalized()
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    # Lighting: 3-Point Warm Salon Chandelier Studio Setup
    # 1. Warm Key Chandelier Light (3200K, Point Light with soft radius)
    key_data = bpy.data.lights.new("Salon_Chandelier_Key", type='POINT')
    key_data.energy = 850.0
    key_data.shadow_soft_size = 0.45
    key_data.color = (1.0, 0.94, 0.82)
    key_obj = bpy.data.objects.new("Salon_Chandelier_Key", key_data)
    key_obj.location = (3.5, -5.0, 7.8)
    bpy.context.collection.objects.link(key_obj)

    # 2. Soft Ambient Turquoise Water Fill Light
    fill_data = bpy.data.lights.new("Salon_Fill", type='SUN')
    fill_data.energy = 3.2
    fill_data.color = (0.88, 0.95, 0.94)
    fill_obj = bpy.data.objects.new("Salon_Fill", fill_data)
    fill_obj.location = (-6.0, -4.0, 10.0)
    fill_obj.rotation_euler = (0.6, 0.2, -0.8)
    bpy.context.collection.objects.link(fill_obj)

    # 3. Warm Gold Rim Light
    rim_data = bpy.data.lights.new("Salon_Gold_Rim", type='SUN')
    rim_data.energy = 4.5
    rim_data.color = (1.0, 0.88, 0.65)
    rim_obj = bpy.data.objects.new("Salon_Gold_Rim", rim_data)
    rim_obj.location = (0.0, 8.0, 6.0)
    rim_obj.rotation_euler = (-0.8, 0.0, 0.0)
    bpy.context.collection.objects.link(rim_obj)

    # World background: Deep warm salon charcoal (#161311)
    bpy.context.scene.world = bpy.data.worlds.new("Salon_World")
    bg_node = bpy.context.scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = hex_to_rgba("#161311")
        bg_node.inputs['Strength'].default_value = 1.15

    # Render settings with AgX Medium High Contrast
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    bpy.context.scene.view_settings.view_transform = 'AgX'
    bpy.context.scene.view_settings.look = 'AgX - Medium High Contrast'
    bpy.context.scene.render.filepath = OUT_PREVIEW_PATH
    bpy.context.scene.render.resolution_x = 1280
    bpy.context.scene.render.resolution_y = 800
    bpy.context.scene.render.image_settings.file_format = 'JPEG'
    bpy.context.scene.render.image_settings.quality = 95

    print(f"Rendering master preview to {OUT_PREVIEW_PATH}...")
    bpy.ops.render.render(write_still=True)
    print(f"✓ Master Preview rendered successfully: {OUT_PREVIEW_PATH}")


if __name__ == "__main__":
    generate_master_diorama()
