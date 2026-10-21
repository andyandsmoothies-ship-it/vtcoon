# -*- coding: utf-8 -*-
"""
VTCOON — Quần đảo Duyên hải, Bãi cát Vát nghiêng, Rặng Karst Vịnh Hạ Long & Tàu Viễn Dương (Blender 5.2.2 LTS)
==============================================================================================================
Mục tiêu xuất bản (AAA Architectural & Geomorphological Realism):
  • Tệp đích: `public/models/board/coastal_archipelago_base.glb`
  • Giữ vùng trung tâm (|X| <= 10.2m, |Y| <= 10.2m) rỗng hoặc phẳng ở cao độ Z <= -0.38m bên dưới bàn cờ để tuyệt đối
    không va chạm hay xuyên cắt với các ô bàn cờ (X, Y in [-10.5m, +10.5m]).
  • Các hạng mục điêu khắc chân thực từ R >= 10.5m ra tới R = 50.0m:
      1. Bờ biển cát trắng ngà vát nghiêng tự nhiên (#EFE5D8, Roughness 0.85, Z = -0.34m .. -0.38m) ôm quanh chu vi
         bàn cờ kèm thềm cát ướt (#DECBB4), viền bọt sóng trắng (#F0F9FF), 4 mũi đất / đảo san hô tự nhiên ở 4 góc
         phần tư, các đảo cồn cát tách biệt có viền sóng vỗ, ghềnh đá hoa cương đa diện phân lớp và cầu cảng gỗ bến du
         thuyền có nhà chòi đón khách ở Tây Nam.
      2. Quần thể núi đá vôi Karst Vịnh Hạ Long phía Bắc / Đông Bắc (Y = 32m .. 50m, đỉnh cao Z = 6.0m .. 14.0m)
         chuẩn địa mạo Karst nhiệt đới ngập nước (fenglin / fengcong):
           - Hàm ếch sóng ăn mòn chân núi (wave-cut notch #334155) + viền bọt sóng trắng & quầng nước nông ngọc lam
             bao quanh chân từng hòn đảo đá.
           - Vách đá vôi dựng đứng vát cạnh sắc nét (#64748B & #94A3B8) có mũi đá nhọn đâm xuyên qua tán rừng.
           - Thảm thực vật nhiệt đới đa tầng (#14532D, #15803D, #22C55E) bám bất đối xứng trên đỉnh, yên ngựa và các
             bậc thềm vách đá lưng chừng núi (loại bỏ hoàn toàn hình dáng chóp nón đội mũ xanh đơn điệu).
      3. Đội tàu hàng hải hợp nhất độ chi tiết cao kèm vệt sóng rẽ nước:
         - Tây Nam ngoài khơi: 1 tàu chở hàng Container viễn dương dài ~11m (Z = -0.30m), thân đỏ (#DC2626), mũi quả lê,
           boong mũi cao, cầu lashing, đài chỉ huy trắng nhiều tầng có cánh gà buồng lái, xuồng cứu sinh, cột radar và
           các kiện container xếp tầng đa sắc (#0284C7, #10B981, #F59E0B).
         - Gần bãi tắm & cầu cảng Tây Nam: 1 du thuyền nghỉ dưỡng cao cấp màu trắng (~3.5m) với sàn gỗ Teak, kính vòm
           đen bóng, đệm tắm nắng mũi tàu và vòm radar thể thao.
      4. Hệ thống rặng dừa nhiệt đới đa tầng cao độ dọc theo 4 mũi cát và đảo vệ tinh.
      5. Mặt biển đồng tâm hữu cơ (60m x 60m mở rộng ra R = 50m tại Z = -0.32m, lòng dưới bàn cờ hạ xuống Z = -0.385m)
         chuyển sắc 5 cấp độ sâu đầm phá từ bọt sóng (#F0F9FF) -> ngọc lam sáng (#22D3EE) -> ngọc bích (#06B6D4) ->
         xanh san hô (#0284C7) -> xanh đại dương thẳm (#0C4A6E).
  • Ràng buộc kỹ thuật nghiêm ngặt:
      - Tổng số tam giác toàn cảnh < 15,000 triangles.
      - Cấu trúc phân cấp: Gộp toàn bộ cảnh thành ĐÚNG 3 Mesh tĩnh:
          1. `GEO_Archipelago_Terrain` (Bãi cát, ghềnh đá, vách núi Karst, mặt biển, cầu cảng gỗ).
          2. `GEO_Archipelago_Foliage` (Toàn bộ cây dừa nhiệt đới và thảm thực vật trên đỉnh núi Karst).
          3. `GEO_Archipelago_Vessels` (Tàu container 11m và du thuyền 3.5m).
"""

import json
import math
import os
import random
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

from vtcoon_tabletop.core import (MeshBatch, PROJECT_ROOT, add_box, add_cylinder,  # noqa: E402
                                  add_sphere, add_tube_along, create_pbr_material as pbr, ensure_collection,
                                  hex_to_rgba, local_frame, move_to_collection)

GLB_OUT_PATH = os.path.join(PROJECT_ROOT, "public", "models", "board", "coastal_archipelago_base.glb")
BLEND_OUT_PATH = os.path.join(PROJECT_ROOT, "coastal_archipelago_studio.blend")
RENDER_OUT_PATH = os.path.join(PROJECT_ROOT, ".agents", "tmp", "coastal_archipelago_verified.jpg")
ARCHIPELAGO_COLLECTION = "01_Coastal_Archipelago_Base"


# -----------------------------------------------------------------------------
# 1. Bảng vật liệu Principled BSDF chuẩn PBR
# -----------------------------------------------------------------------------
def build_archipelago_materials() -> dict[str, bpy.types.Material]:
    return {
        # Địa hình bãi biển, bọt sóng & mặt biển phân tầng độ sâu (Lagoon Bathymetry)
        "ivory_sand": pbr("MAT_Archipelago_Ivory_Sand", "#EFE5D8", metallic=0.0, roughness=0.85, specular=0.35),
        "wet_sand": pbr("MAT_Archipelago_Wet_Sand", "#D6C0A6", metallic=0.0, roughness=0.38, specular=0.72, coat=0.40),
        "sea_foam": pbr("MAT_Archipelago_Surf_Foam", "#F0F9FF", metallic=0.0, roughness=0.28, specular=0.80,
                        emission_hex="#E0F2FE", emission_strength=0.18),
        "karst_rock": pbr("MAT_Archipelago_Karst_Limestone", "#64748B", metallic=0.0, roughness=0.86, specular=0.36),
        "karst_light": pbr("MAT_Archipelago_Karst_Sunlit", "#94A3B8", metallic=0.0, roughness=0.82, specular=0.40),
        "dark_reef": pbr("MAT_Archipelago_Tidal_Basalt", "#334155", metallic=0.0, roughness=0.72, specular=0.48),
        "jetty_wood": pbr("MAT_Archipelago_Jetty_Timber", "#78350F", metallic=0.0, roughness=0.64, specular=0.40),
        "jetty_thatch": pbr("MAT_Archipelago_Pier_Roof", "#B45309", metallic=0.0, roughness=0.76, specular=0.32),
        "ocean_crystal": pbr("MAT_Archipelago_Lagoon_Crystal", "#22D3EE", metallic=0.02, roughness=0.08,
                             specular=0.96, coat=0.92, emission_hex="#06B6D4", emission_strength=0.20),
        "ocean_shallow": pbr("MAT_Archipelago_Ocean_Turquoise", "#06B6D4", metallic=0.02, roughness=0.09,
                             specular=0.96, coat=0.90, emission_hex="#0891B2", emission_strength=0.16),
        "ocean_mid": pbr("MAT_Archipelago_Ocean_Cerulean", "#0284C7", metallic=0.04, roughness=0.11,
                         specular=0.95, coat=0.88, emission_hex="#0369A1", emission_strength=0.12),
        "ocean_deep": pbr("MAT_Archipelago_Ocean_DeepNavy", "#0C4A6E", metallic=0.05, roughness=0.12,
                          specular=0.96, coat=0.88, emission_hex="#075985", emission_strength=0.10),
        # Thảm thực vật & Rặng dừa nhiệt đới
        "palm_trunk": pbr("MAT_Archipelago_Palm_Trunk", "#854D0E", metallic=0.0, roughness=0.78, specular=0.32),
        "coconut": pbr("MAT_Archipelago_Coconut_Cluster", "#713F12", metallic=0.0, roughness=0.55, specular=0.42),
        "palm_frond": pbr("MAT_Archipelago_Palm_Frond", "#16A34A", metallic=0.0, roughness=0.50, specular=0.48),
        "karst_forest": pbr("MAT_Archipelago_Karst_DeepForest", "#14532D", metallic=0.0, roughness=0.72, specular=0.35),
        "karst_moss": pbr("MAT_Archipelago_Karst_Canopy", "#15803D", metallic=0.0, roughness=0.66, specular=0.38),
        "tropical_bush": pbr("MAT_Archipelago_Tropical_Shrub", "#22C55E", metallic=0.0, roughness=0.58, specular=0.42),
        # Đội tàu hàng hải (Container Ship & Leisure Yacht)
        "hull_red": pbr("MAT_Vessel_Cargo_RedHull", "#DC2626", metallic=0.05, roughness=0.34, specular=0.65, coat=0.40),
        "hull_dark": pbr("MAT_Vessel_Waterline_Boot", "#1E293B", metallic=0.08, roughness=0.42, specular=0.55),
        "vessel_white": pbr("MAT_Vessel_Superstructure_White", "#F8FAFC", metallic=0.02, roughness=0.20,
                            specular=0.78, coat=0.60),
        "vessel_deck": pbr("MAT_Vessel_Steel_Deck", "#475569", metallic=0.25, roughness=0.50, specular=0.52),
        "bridge_glass": pbr("MAT_Vessel_Bridge_Glass", "#0F172A", metallic=0.10, roughness=0.05,
                            specular=0.98, coat=0.98),
        "cargo_blue": pbr("MAT_Cargo_Container_Blue", "#0284C7", metallic=0.18, roughness=0.40, specular=0.58),
        "cargo_green": pbr("MAT_Cargo_Container_Green", "#10B981", metallic=0.18, roughness=0.40, specular=0.58),
        "cargo_yellow": pbr("MAT_Cargo_Container_Yellow", "#F59E0B", metallic=0.18, roughness=0.40, specular=0.58),
        "yacht_stripe": pbr("MAT_Yacht_Azure_Accent", "#0284C7", metallic=0.05, roughness=0.18, coat=0.75),
        "yacht_teak": pbr("MAT_Yacht_Teak_Deck", "#92400E", metallic=0.0, roughness=0.42, coat=0.32),
    }


# -----------------------------------------------------------------------------
# 2. Hàm phụ trợ toán học & điêu khắc địa mạo Karst / Đảo san hô
# -----------------------------------------------------------------------------
def _clamp_outside_board(x: float, y: float, z: float) -> float:
    """Đảm bảo mọi điểm trong vùng trung tâm |X| <= 10.2m, |Y| <= 10.2m luôn nằm ở Z <= -0.385m."""
    if abs(x) <= 10.25 and abs(y) <= 10.25:
        return min(z, -0.385)
    return z


def _add_foliage_dome(
    bm: bmesh.types.BMesh,
    cx: float,
    cy: float,
    cz: float,
    rx: float,
    ry: float,
    rz: float,
    rot_z: float = 0.0,
    segs: int = 6,
) -> None:
    """Khối vòm lá cây bụi / tán rừng tối ưu (2*segs tam giác, vát đa diện tự nhiên)."""
    c_r, s_r = math.cos(rot_z), math.sin(rot_z)
    bot_v = bm.verts.new((cx, cy, cz - 0.30 * rz))
    top_v = bm.verts.new((cx + 0.08 * rx * c_r, cy + 0.08 * ry * s_r, cz + rz))
    ring = []
    for k in range(segs):
        a = 2.0 * math.pi * k / segs
        wobble = 1.0 + 0.12 * math.sin(3.0 * a + rot_z) - 0.07 * math.cos(2.0 * a)
        lx = rx * wobble * math.cos(a)
        ly = ry * wobble * math.sin(a)
        wx = cx + lx * c_r - ly * s_r
        wy = cy + lx * s_r + ly * c_r
        ring.append(bm.verts.new((wx, wy, cz + (0.12 + 0.08 * (k % 2)) * rz)))
    for k in range(segs):
        kn = (k + 1) % segs
        bm.faces.new((ring[k], ring[kn], top_v))
        bm.faces.new((ring[kn], ring[k], bot_v))


def _shore_contour_xy(r_base: float, cape_amp: float, th: float) -> tuple[float, float]:
    """
    Hàm đường đồng mức bờ biển/đầm phá đồng tâm:
      • Ở R gần 10.5m: ôm sát chu vi vuông của bàn cờ (|X|, |Y| = 10.48m).
      • Ở R trung gian (11m -> 38m): uốn lượn tự nhiên với 4 mũi đất vươn ra ở 4 góc phần tư và 4 vịnh nước xanh
        ăn sâu vào sát cạnh bàn cờ để bãi cát không bị bè phẳng đơn điệu.
      • Ở R = 50.0m: mở rộng ra biên vuông đại dương [-50m, +50m].
    """
    sq_factor = 1.0 / max(abs(math.cos(th)), abs(math.sin(th)), 1e-4)
    inner_sq = max(0.0, min(1.0, (12.6 - r_base) / 2.1))
    outer_sq = max(0.0, min(1.0, (r_base - 36.0) / 14.0))
    mid_weight = max(0.0, 1.0 - inner_sq - outer_sq)
    base_rad = r_base * (
        inner_sq * sq_factor
        + outer_sq * sq_factor
        + mid_weight * (0.28 * min(1.24, sq_factor) + 0.72 * 1.04)
    )
    # Tạo 4 mũi đất nhô dài ở 4 góc phần tư (pi/4, 3pi/4, 5pi/4, 7pi/4) + độ uốn lượn vịnh biển tự nhiên
    corner_peak = math.pow(0.5 * (1.0 - math.cos(4.0 * th)), 1.35)
    asymmetry = 0.16 * math.sin(3.0 * th - 0.55) + 0.11 * math.cos(5.0 * th + 0.40)
    cape_lobe = cape_amp * (0.85 * corner_peak + asymmetry)
    rad = base_rad + cape_lobe
    px = max(-50.0, min(50.0, rad * math.cos(th)))
    py = max(-50.0, min(50.0, rad * math.sin(th)))
    if abs(px) < 10.42 and abs(py) < 10.42:
        s_push = 10.42 / max(abs(px), abs(py), 1e-4)
        px, py = px * s_push, py * s_push
    return px, py


def _add_faceted_boulder(
    bm: bmesh.types.BMesh,
    cx: float,
    cy: float,
    cz: float,
    rx: float,
    ry: float,
    rz: float,
    seed: int,
    rot_z: float = 0.0,
) -> None:
    """Tảng đá ven biển đa diện vát cạnh tự nhiên (Flat-shaded coastal granite/limestone boulder)."""
    rng = random.Random(seed)
    segs = 7
    c_r, s_r = math.cos(rot_z), math.sin(rot_z)
    jit = [rng.uniform(0.80, 1.20) for _ in range(segs)]
    rings = []
    for z_frac, r_scale in ((-0.35, 1.06), (0.20, 0.92), (0.68, 0.54)):
        ring = []
        for k in range(segs):
            a = 2.0 * math.pi * k / segs + z_frac * 0.25
            lx = rx * r_scale * jit[k] * math.cos(a)
            ly = ry * r_scale * jit[k] * math.sin(a)
            wx = cx + lx * c_r - ly * s_r
            wy = cy + lx * s_r + ly * c_r
            wz = _clamp_outside_board(wx, wy, cz + z_frac * rz)
            ring.append(bm.verts.new((wx, wy, wz)))
        rings.append(ring)
    for li in range(len(rings) - 1):
        r0, r1 = rings[li], rings[li + 1]
        for k in range(segs):
            kn = (k + 1) % segs
            bm.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
    apex = bm.verts.new((cx + rng.uniform(-0.15, 0.15) * rx, cy + rng.uniform(-0.15, 0.15) * ry, cz + rz))
    for k in range(segs):
        bm.faces.new((rings[-1][k], rings[-1][(k + 1) % segs], apex))


def _add_halong_karst_tower(
    bm_rock: bmesh.types.BMesh,
    bm_light: bmesh.types.BMesh,
    bm_reef: bmesh.types.BMesh,
    bm_foam: bmesh.types.BMesh,
    bm_Lagoon: bmesh.types.BMesh,
    bm_forest: bmesh.types.BMesh,
    bm_moss: bmesh.types.BMesh,
    bm_bush: bmesh.types.BMesh,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    peak_z: float,
    seed: int,
    rot_z: float = 0.0,
) -> None:
    """
    Điêu khắc núi đá vôi Karst Vịnh Hạ Long chuẩn địa chất thực tế (Loại bỏ hình dáng nón đội mũ xanh):
      1. Quầng nước nông xanh ngọc (#22D3EE) + Viền bọt sóng trắng (#F0F9FF) + Hàm ếch đá đen (#334155) ở chân đảo.
      2. Vách đá vôi dựng đứng phân múi sắc cạnh (#64748B) và sống đá hứng nắng (#94A3B8) vươn lên tới tận ĐỈNH NÚI
         (mũi đá vôi nhọn đâm xuyên qua tán cây, tạo đường viền đỉnh núi răng cưa đa chóp).
      3. Các bậc thảm thực vật nhiệt đới 3 sắc độ (#14532D rừng già, #15803D rêu phong, #22C55E chồi non) bám bất đối
         xứng trên các hốc đá, yên ngựa và sườn thoải (không chụp kín như mũ bảo hiểm).
    """
    rng = random.Random(seed)
    segs = 10
    c_rot, s_rot = math.cos(rot_z), math.sin(rot_z)

    # Tạo biên dạng mặt cắt ngang góc cạnh như vách đá vôi bị phong hóa nứt dọc
    angle_mods = []
    ridge_heights = []
    for k in range(segs):
        a = 2.0 * math.pi * k / segs
        flute = 1.0 + 0.22 * math.cos(2.0 * a + seed * 0.3) - 0.16 * math.sin(3.0 * a - seed * 0.2)
        angle_mods.append(flute * rng.uniform(0.86, 1.14))
        # Tạo 2-3 chóp đá nhọn bất đối xứng trên đỉnh mỗi ngọn núi (multi-crag crown profile)
        crag = 0.82 + 0.18 * math.cos(2.0 * a - 0.5) + 0.10 * math.sin(3.0 * a)
        ridge_heights.append(crag)

    # 1. Quầng nước nông ngọc lam (#22D3EE) & Viền bọt sóng trắng (#F0F9FF) ôm quanh chân đảo đá
    ring_notch_in = []
    ring_foam_mid = []
    ring_lagoon_out = []
    for k in range(segs):
        a = 2.0 * math.pi * k / segs
        rm = angle_mods[k]
        for r_mul, z_val, lst, bm_t in (
            (0.86, -0.312, ring_notch_in, bm_foam),
            (1.16, -0.315, ring_foam_mid, bm_foam),
        ):
            lx, ly = rx * r_mul * rm * math.cos(a), ry * r_mul * rm * math.sin(a)
            wx, wy = cx + lx * c_rot - ly * s_rot, cy + lx * s_rot + ly * c_rot
            lst.append(bm_t.verts.new((wx, wy, z_val)))
    for k in range(segs):
        kn = (k + 1) % segs
        bm_foam.faces.new((ring_notch_in[k], ring_foam_mid[k], ring_foam_mid[kn], ring_notch_in[kn]))

    ring_lag_in = []
    for k in range(segs):
        a = 2.0 * math.pi * k / segs
        rm = angle_mods[k]
        lx1, ly1 = rx * 1.15 * rm * math.cos(a), ry * 1.15 * rm * math.sin(a)
        lx2, ly2 = rx * 1.65 * rm * math.cos(a), ry * 1.65 * rm * math.sin(a)
        ring_lag_in.append(bm_Lagoon.verts.new((cx + lx1 * c_rot - ly1 * s_rot, cy + lx1 * s_rot + ly1 * c_rot, -0.317)))
        ring_lagoon_out.append(bm_Lagoon.verts.new((cx + lx2 * c_rot - ly2 * s_rot, cy + lx2 * s_rot + ly2 * c_rot, -0.318)))
    for k in range(segs):
        kn = (k + 1) % segs
        bm_Lagoon.faces.new((ring_lag_in[k], ring_lagoon_out[k], ring_lagoon_out[kn], ring_lag_in[kn]))

    # 2. Thân núi đá vôi dựng đứng với hàm ếch sóng vỗ (Tầng 0->1: đá đen #334155; Tầng 1->6: vách đá vôi #64748B & #94A3B8)
    levels = (
        # (z_frac_or_abs, is_abs_z, scale_r, shift_x, shift_y)
        (-0.36, True, 1.06, 0.00, 0.00),   # Đế ngầm dưới nước
        (0.08, True, 0.82, 0.00, 0.00),    # Hõm hàm ếch sóng vỗ (Wave-cut tidal notch)
        (0.14, False, 1.02, 0.02, -0.02),  # Vách bụng đá nhô ra trên hàm ếch
        (0.38, False, 0.88, -0.04, 0.03),  # Bậc vách đá giữa
        (0.58, False, 0.72, 0.05, 0.02),   # Vách đá cao
        (0.72, False, 0.50, -0.03, 0.04),  # Gờ đỉnh đá dưới tán cây
        (0.78, False, 0.24, 0.02, -0.02),  # Mũi chóp đá vôi bên trong tán rừng
    )

    ring_coords: list[list[tuple[float, float, float]]] = []
    for li, (z_spec, is_abs, scale_r, shx, shy) in enumerate(levels):
        coords = []
        for k in range(segs):
            a = 2.0 * math.pi * k / segs + (0.08 if li % 2 == 1 else 0.0)
            rm = angle_mods[k]
            lx = (shx + scale_r * rm * math.cos(a)) * rx
            ly = (shy + scale_r * rm * math.sin(a)) * ry
            wx = cx + lx * c_rot - ly * s_rot
            wy = cy + lx * s_rot + ly * c_rot
            if is_abs:
                wz = z_spec
            else:
                # Đỉnh và vách đá biến thiên theo ridge_heights[k] tạo dáng núi răng cưa tự nhiên
                wz = peak_z * z_spec * (0.88 + 0.14 * ridge_heights[k]) + rng.uniform(-0.16, 0.18)
            coords.append((wx, wy, wz))
        ring_coords.append(coords)

    # Tầng 0 -> 1: Đai hàm ếch đá tối màu ẩm ướt (#334155)
    r0_reef = [bm_reef.verts.new(p) for p in ring_coords[0]]
    r1_reef = [bm_reef.verts.new(p) for p in ring_coords[1]]
    for k in range(segs):
        kn = (k + 1) % segs
        bm_reef.faces.new((r0_reef[k], r0_reef[kn], r1_reef[kn], r1_reef[k]))

    # Tầng 1 -> 6: Vách đá vôi dựng đứng phân múi tự nhiên
    for li in range(1, len(ring_coords) - 1):
        c0, c1 = ring_coords[li], ring_coords[li + 1]
        for k in range(segs):
            kn = (k + 1) % segs
            v00 = bm_rock.verts.new(c0[k])
            v01 = bm_rock.verts.new(c0[kn])
            v11 = bm_rock.verts.new(c1[kn])
            v10 = bm_rock.verts.new(c1[k])
            bm_rock.faces.new((v00, v01, v11, v10))

    # Đóng chóp đá vôi bên dưới tán rừng (không để lộ chóp xám trắng như tuyết trên đỉnh)
    top_crag = bm_rock.verts.new((cx, cy, peak_z * 0.88))
    top_ring_v = [bm_rock.verts.new(p) for p in ring_coords[-1]]
    for k in range(segs):
        bm_rock.faces.new((top_ring_v[k], top_ring_v[(k + 1) % segs], top_crag))

    # 3. Thảm thực vật rừng nhiệt đới đa tầng phủ dày đặn, tự nhiên trên đỉnh núi, yên ngựa & các gờ đá
    m_levels = (
        (peak_z * 0.68, 0.78),
        (peak_z * 0.82, 0.64),
        (peak_z * 0.94, 0.36),
    )
    m_rings = []
    for li_m, (m_z, m_frac) in enumerate(m_levels):
        m_ring = []
        for k in range(segs):
            a = 2.0 * math.pi * k / segs
            drape = -0.42 * (k % 2) if li_m == 0 else (0.16 * math.sin(2.0 * a) if li_m == 1 else 0.0)
            rm = angle_mods[k] * (1.0 + 0.10 * math.cos(2.0 * a + rot_z))
            lx = rx * m_frac * rm * math.cos(a)
            ly = ry * m_frac * rm * math.sin(a)
            wx = cx + lx * c_rot - ly * s_rot
            wy = cy + lx * s_rot + ly * c_rot
            m_ring.append(bm_moss.verts.new((wx, wy, m_z + drape)))
        m_rings.append(m_ring)
    for li in range(len(m_rings) - 1):
        mr0, mr1 = m_rings[li], m_rings[li + 1]
        for k in range(segs):
            kn = (k + 1) % segs
            bm_moss.faces.new((mr0[k], mr0[kn], mr1[kn], mr1[k]))
    m_apex = bm_moss.verts.new((cx, cy, peak_z))
    for k in range(segs):
        bm_moss.faces.new((m_rings[-1][k], m_rings[-1][(k + 1) % segs], m_apex))
    bm_moss.faces.new(list(reversed(m_rings[0])))

    canopy_pods = (
        # (offset_r_frac, angle_offset, z_frac, rx_frac, ry_frac, rz_frac, mat_bm)
        (-0.24, 0.5, 0.82, 0.54, 0.46, 0.11, bm_forest),
        (0.26, 2.4, 0.78, 0.50, 0.42, 0.10, bm_forest),
        (-0.18, 4.1, 0.85, 0.42, 0.36, 0.09, bm_bush),
        # Thảm cây bám ở bậc thềm lưng chừng vách đá (Mid-cliff hanging terrace)
        (0.72, 1.0, 0.45, 0.44, 0.32, 0.07, bm_forest),
        (0.70, 4.0, 0.50, 0.42, 0.30, 0.07, bm_moss),
    )
    for off_r, a_off, z_f, rxf, ryf, rzf, target_fol_bm in canopy_pods:
        ca = rot_z + a_off
        px = cx + off_r * rx * math.cos(ca)
        py = cy + off_r * ry * math.sin(ca)
        pz = peak_z * z_f
        _add_foliage_dome(
            target_fol_bm,
            px,
            py,
            pz,
            rx * rxf,
            ry * ryf,
            peak_z * rzf,
            rot_z=ca,
            segs=5,
        )


def _add_atoll_mound(
    bm_sand: bmesh.types.BMesh,
    bm_wet: bmesh.types.BMesh,
    bm_foam: bmesh.types.BMesh,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    z_bot: float,
    z_top: float,
    rot_z: float = 0.0,
    segs: int = 14,
    with_foam_ring: bool = False,
) -> None:
    """Đảo cát bồi / mũi cát vát thoải tự nhiên kèm vành đai cát ướt và viền bọt sóng trắng."""
    c_rot, s_rot = math.cos(rot_z), math.sin(rot_z)
    rings = []
    for r_scale, z_cur in ((1.14, z_bot), (0.92, z_bot + 0.020), (0.66, (z_bot + z_top) * 0.50), (0.32, z_top)):
        ring = []
        for k in range(segs):
            a = 2.0 * math.pi * k / segs
            wobble = 1.0 + 0.09 * math.sin(3.0 * a) + 0.05 * math.cos(2.0 * a - 0.4)
            lx = rx * r_scale * wobble * math.cos(a)
            ly = ry * r_scale * wobble * math.sin(a)
            wx = cx + lx * c_rot - ly * s_rot
            wy = cy + lx * s_rot + ly * c_rot
            wz = _clamp_outside_board(wx, wy, z_cur)
            ring.append((wx, wy, wz))
        rings.append(ring)

    if with_foam_ring:
        f_in = []
        f_out = []
        for k in range(segs):
            a = 2.0 * math.pi * k / segs
            wobble = 1.0 + 0.09 * math.sin(3.0 * a) + 0.05 * math.cos(2.0 * a - 0.4)
            for r_m, z_f, lst in ((0.96, -0.316, f_in), (1.18, -0.318, f_out)):
                lx = rx * r_m * wobble * math.cos(a)
                ly = ry * r_m * wobble * math.sin(a)
                wx = cx + lx * c_rot - ly * s_rot
                wy = cy + lx * s_rot + ly * c_rot
                lst.append(bm_foam.verts.new((wx, wy, _clamp_outside_board(wx, wy, z_f))))
        for k in range(segs):
            kn = (k + 1) % segs
            bm_foam.faces.new((f_in[k], f_out[k], f_out[kn], f_in[kn]))

    # Vành ngoài (0 -> 1) là cát ướt (#D6C0A6)
    w0 = [bm_wet.verts.new(p) for p in rings[0]]
    w1 = [bm_wet.verts.new(p) for p in rings[1]]
    for k in range(segs):
        kn = (k + 1) % segs
        bm_wet.faces.new((w0[k], w0[kn], w1[kn], w1[k]))

    # Vành trong (1 -> 2 -> 3 -> tâm) là cát trắng ngà (#EFE5D8)
    s_rings = [[bm_sand.verts.new(p) for p in r] for r in rings[1:]]
    for li in range(len(s_rings) - 1):
        r0, r1 = s_rings[li], s_rings[li + 1]
        for k in range(segs):
            kn = (k + 1) % segs
            bm_sand.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
    center_v = bm_sand.verts.new((cx, cy, _clamp_outside_board(cx, cy, z_top + 0.012)))
    for k in range(segs):
        bm_sand.faces.new((s_rings[-1][k], s_rings[-1][(k + 1) % segs], center_v))


def _add_curved_frond_blade(
    bm: bmesh.types.BMesh,
    origin: Vector,
    yaw: float,
    pitch: float,
    length: float,
    width: float,
) -> None:
    """Tàu lá dừa nhiệt đới uốn vòm 2 nhịp (6 tam giác / tàu lá) tạo dáng rủ tự nhiên."""
    c, s = math.cos(yaw), math.sin(yaw)
    cp, sp = math.cos(pitch), math.sin(pitch)

    def pt(lx: float, ly: float, lz: float) -> Vector:
        rx = lx * cp + lz * sp
        rz = -lx * sp + lz * cp
        return origin + Vector((rx * c - ly * s, rx * s + ly * c, rz))

    v0 = bm.verts.new(pt(0.0, 0.0, 0.0))
    v1_l = bm.verts.new(pt(length * 0.36, width * 0.85, 0.09 * length))
    v1_c = bm.verts.new(pt(length * 0.38, 0.0, 0.14 * length))
    v1_r = bm.verts.new(pt(length * 0.36, -width * 0.85, 0.09 * length))

    v2_l = bm.verts.new(pt(length * 0.72, width * 1.05, 0.03 * length))
    v2_c = bm.verts.new(pt(length * 0.74, 0.0, 0.08 * length))
    v2_r = bm.verts.new(pt(length * 0.72, -width * 1.05, 0.03 * length))

    v_tip = bm.verts.new(pt(length, 0.0, -0.22 * length))

    bm.faces.new((v0, v1_l, v1_c))
    bm.faces.new((v0, v1_c, v1_r))
    bm.faces.new((v1_l, v2_l, v2_c, v1_c))
    bm.faces.new((v1_c, v2_c, v2_r, v1_r))
    bm.faces.new((v2_l, v_tip, v2_c))
    bm.faces.new((v2_c, v_tip, v2_r))


def _add_stylized_coconut_palm(
    b_foliage: MeshBatch,
    x: float,
    y: float,
    z_base: float,
    scale: float,
    yaw: float,
    lean: float = 0.28,
) -> None:
    """Cây dừa nhiệt đới thân cong thanh mảnh + chùm quả dừa + tán lá 10 tàu xếp 2 tầng."""
    if abs(x) <= 10.5 and abs(y) <= 10.5:
        return
    dir_v = Vector((math.cos(yaw), math.sin(yaw), 0.0))
    side_v = Vector((-math.sin(yaw), math.cos(yaw), 0.0))
    h = 1.68 * scale
    pts = [
        Vector((x, y, z_base - 0.03)),
        Vector((x, y, z_base + h * 0.34)) + dir_v * (lean * 0.28 * scale),
        Vector((x, y, z_base + h * 0.70)) + dir_v * (lean * 0.66 * scale) + side_v * (0.05 * scale),
        Vector((x, y, z_base + h)) + dir_v * (lean * scale) + side_v * (0.05 * scale),
    ]
    add_tube_along(
        b_foliage("palm_trunk", smooth=True),
        pts,
        0.0,
        segments=5,
        radii=[0.082 * scale, 0.058 * scale, 0.044 * scale, 0.030 * scale],
    )
    crown = pts[-1]

    # Chùm quả dừa nâu vàng dưới cổ hũ dừa
    coco_bm = b_foliage("coconut")
    for c_i in range(2):
        ca = yaw + c_i * math.pi
        c_pos = crown + Vector((0.050 * scale * math.cos(ca), 0.050 * scale * math.sin(ca), -0.045 * scale))
        _add_foliage_dome(coco_bm, c_pos.x, c_pos.y, c_pos.z, 0.048 * scale, 0.042 * scale, 0.048 * scale, segs=4)

    # Tán lá dừa 2 tầng (6 tàu lá lớn tầng dưới + 4 tàu lá non vươn cao tầng trên)
    frond_bm = b_foliage("palm_frond")
    for k in range(6):
        a = yaw + 2.0 * math.pi * k / 6.0 + (0.08 if k % 2 == 0 else -0.06)
        _add_curved_frond_blade(
            frond_bm,
            crown,
            a,
            pitch=math.radians(8.0 + 6.0 * (k % 2)),
            length=(0.74 + 0.06 * (k % 3)) * scale,
            width=0.148 * scale,
        )
    for k in range(4):
        a = yaw + math.pi / 6.0 + 2.0 * math.pi * k / 4.0
        _add_curved_frond_blade(
            frond_bm,
            crown + Vector((0.0, 0.0, 0.045 * scale)),
            a,
            pitch=math.radians(-22.0),
            length=0.54 * scale,
            width=0.118 * scale,
        )


def _add_vessel_wake_foam(
    bm_foam: bmesh.types.BMesh,
    cx: float,
    cy: float,
    yaw: float,
    stern_x: float,
    bow_x: float,
    half_beam: float,
    wake_len: float,
    z_foam: float = -0.314,
) -> None:
    """Viền bọt sóng trắng ôm sát mớn nước thân tàu và vuốt nhẹ về phía đuôi tàu."""
    F = local_frame(cx, cy, yaw)
    mid_x = 0.5 * (stern_x + bow_x) - 0.15 * wake_len
    rx = 0.5 * (bow_x - stern_x) + 0.25 * wake_len
    ry = half_beam
    segs = 12
    v_in = []
    v_out = []
    for k in range(segs):
        a = 2.0 * math.pi * k / segs
        lx_in = mid_x + rx * 0.96 * math.cos(a)
        ly_in = ry * 0.96 * math.sin(a)
        lx_out = mid_x + (rx + 0.32) * math.cos(a)
        ly_out = (ry + 0.28) * math.sin(a)
        v_in.append(bm_foam.verts.new(F(lx_in, ly_in, z_foam)))
        v_out.append(bm_foam.verts.new(F(lx_out, ly_out, z_foam - 0.002)))
    for k in range(segs):
        kn = (k + 1) % segs
        bm_foam.faces.new((v_in[k], v_out[k], v_out[kn], v_in[kn]))


# -----------------------------------------------------------------------------
# 3. Xây dựng Mesh 1 & 2: `GEO_Archipelago_Terrain` & `GEO_Archipelago_Foliage`
# -----------------------------------------------------------------------------
def build_archipelago_terrain_and_foliage(
    coll: bpy.types.Collection,
    mats: dict[str, bpy.types.Material],
) -> tuple[bpy.types.Object, bpy.types.Object]:
    b_ter = MeshBatch("GEO_Archipelago_Terrain", mats, coll)
    b_fol = MeshBatch("GEO_Archipelago_Foliage", mats, coll)

    bm_sand = b_ter("ivory_sand", smooth=True)
    bm_wet = b_ter("wet_sand", smooth=True)
    bm_foam = b_ter("sea_foam", smooth=True)
    bm_crystal = b_ter("ocean_crystal", smooth=True)
    bm_shallow = b_ter("ocean_shallow", smooth=True)
    bm_mid = b_ter("ocean_mid", smooth=True)
    bm_deep = b_ter("ocean_deep", smooth=True)

    # -------------------------------------------------------------------------
    # A. LÒNG ĐÁY PHẲNG DƯỚI GẦM BÀN CỜ (|X| <= 10.2m, |Y| <= 10.2m ở Z = -0.388m)
    # -------------------------------------------------------------------------
    c_verts = [
        bm_deep.verts.new((-10.45, -10.45, -0.388)),
        bm_deep.verts.new((10.45, -10.45, -0.388)),
        bm_deep.verts.new((10.45, 10.45, -0.388)),
        bm_deep.verts.new((-10.45, 10.45, -0.388)),
    ]
    bm_deep.faces.new(c_verts)

    # -------------------------------------------------------------------------
    # B. HỆ ĐỒNG MỨC ĐỊA HÌNH BỜ BIỂN, BỌT SÓNG & ĐẦM PHÁ 5 CẤP ĐỘ SÂU (R = 10.48m .. 50.0m)
    #    Thiết kế đường bờ biển thắt eo tự nhiên ở 4 cạnh bàn cờ (R ~ 12.8m) và vươn dài ở 4 mũi góc (R ~ 18.5m)
    # -------------------------------------------------------------------------
    n_ang = 52
    contour_rings_spec = (
        # idx, r_base, cape_amp, z_h
        (0, 10.48, 0.00, -0.382),  # Chân mép trong sát gầm bàn cờ
        (1, 10.95, 0.55, -0.340),  # Đỉnh gờ cát khô (Dry berm crest)
        (2, 11.85, 2.65, -0.344),  # Sườn bãi cát trắng ngà
        (3, 12.75, 4.35, -0.356),  # Mép tiếp giáp cát khô - cát ướt
        (4, 13.55, 5.10, -0.366),  # Mép ngoài thềm cát ướt
        (5, 13.95, 5.25, -0.319),  # Viền bọt sóng trắng (Shorebreak surf foam)
        (6, 15.80, 5.00, -0.320),  # Vịnh nước nông ngọc lam sáng (Crystal turquoise shallows #22D3EE)
        (7, 19.20, 4.40, -0.320),  # Đầm phá ngọc bích trong (Turquoise lagoon #06B6D4)
        (8, 23.50, 3.30, -0.320),  # Đầm phá ngọc bích ngoài (#06B6D4)
        (9, 29.00, 2.10, -0.320),  # Thềm rạn san hô xanh Cerulean (#0284C7)
        (10, 36.50, 0.85, -0.320), # Vùng biển xanh Cerulean ngoài (#0284C7)
        (11, 50.00, 0.00, -0.320), # Đại dương sâu thẳm (#0C4A6E) mở rộng tới biên vuông [-50m, +50m]
    )

    ring_pts: list[list[tuple[float, float, float]]] = []
    for _idx, r_base, cape_amp, z_h in contour_rings_spec:
        row = []
        for k in range(n_ang):
            th = 2.0 * math.pi * k / n_ang
            px, py = _shore_contour_xy(r_base, cape_amp, th)
            row.append((px, py, z_h))
        ring_pts.append(row)

    def _stitch_band(target_bm: bmesh.types.BMesh, idx_a: int, idx_b: int) -> None:
        ra = [target_bm.verts.new(p) for p in ring_pts[idx_a]]
        rb = [target_bm.verts.new(p) for p in ring_pts[idx_b]]
        for k in range(n_ang):
            kn = (k + 1) % n_ang
            target_bm.faces.new((ra[k], rb[k], rb[kn], ra[kn]))

    for r_i in (0, 1, 2):
        _stitch_band(bm_sand, r_i, r_i + 1)
    _stitch_band(bm_wet, 3, 4)
    _stitch_band(bm_foam, 4, 5)
    _stitch_band(bm_crystal, 5, 6)
    for r_i in (6, 7):
        _stitch_band(bm_shallow, r_i, r_i + 1)
    for r_i in (8, 9):
        _stitch_band(bm_mid, r_i, r_i + 1)
    _stitch_band(bm_deep, 10, 11)

    # -------------------------------------------------------------------------
    # C. 4 MŨI ĐẤT CHÍNH & CÁC ĐẢO SAN HÔ VỆ TINH TÁCH BIỆT Ở 4 GÓC PHẦN TƯ (R = 12m .. 22m)
    # -------------------------------------------------------------------------
    capes = (
        # (cx, cy, rx, ry, rot_deg, has_foam) — 4 Mũi đất chính ở 4 góc phần tư
        (-13.8, -12.8, 4.4, 3.2, 34.0, False),   # Mũi Tây Nam
        (14.2, -13.6, 4.6, 3.3, -38.0, False),   # Mũi Đông Nam
        (-14.8, 13.6, 4.8, 3.5, -28.0, False),   # Mũi Tây Bắc
        (14.6, 13.4, 4.5, 3.3, 36.0, False),     # Mũi Đông Bắc
        # 6 Đảo san hô / Cồn cát ngoài khơi (Barrier Atoll Islets) tách biệt khỏi bờ bởi lạch nước nông, có viền bọt sóng
        (-18.8, -10.2, 2.8, 1.5, 58.0, True),
        (-11.4, -18.2, 2.5, 1.4, 22.0, True),
        (18.8, -10.4, 2.7, 1.5, -55.0, True),
        (12.0, -18.5, 2.4, 1.3, -24.0, True),
        (-18.6, 10.2, 2.9, 1.6, -52.0, True),
        (18.8, 10.0, 2.7, 1.5, 54.0, True),
    )
    for cx, cy, rx, ry, rot_deg, has_foam in capes:
        _add_atoll_mound(
            bm_sand, bm_wet, bm_foam,
            cx, cy, rx, ry,
            z_bot=-0.325, z_top=-0.275,
            rot_z=math.radians(rot_deg),
            segs=10,
            with_foam_ring=has_foam,
        )

    # Cụm ghềnh đá hoa cương & đá базальт đa diện ven bờ (Faceted Coastal Headland Boulders)
    boulder_bm = b_ter("dark_reef")
    boulder_mid_bm = b_ter("karst_rock")
    boulder_light_bm = b_ter("karst_light")
    rock_outcrops = (
        (-16.2, -14.2, 1.25, 0.90, 0.48, 201, 0.4),
        (-17.5, -13.2, 0.85, 0.65, 0.34, 202, 1.1),
        (-18.8, -11.4, 0.95, 0.70, 0.38, 203, -0.6),
        (16.8, -15.0, 1.35, 0.95, 0.52, 204, -0.5),
        (18.2, -13.8, 0.90, 0.68, 0.36, 205, 0.8),
        (18.6, -11.6, 0.82, 0.62, 0.32, 206, 1.5),
        (-17.6, 14.8, 1.40, 0.98, 0.55, 207, 0.3),
        (-16.4, 16.0, 0.95, 0.72, 0.38, 208, 1.4),
        (16.6, 14.8, 1.30, 0.92, 0.50, 209, -0.7),
        (18.0, 13.6, 0.88, 0.64, 0.35, 210, 0.2),
    )
    for rx, ry, sx, sy, sz, bseed, r_yaw in rock_outcrops:
        _add_faceted_boulder(boulder_bm, rx, ry, -0.34, sx, sy, sz, bseed, r_yaw)
        _add_faceted_boulder(
            boulder_mid_bm,
            rx - 0.38 * math.sin(r_yaw),
            ry + 0.38 * math.cos(r_yaw),
            -0.34,
            sx * 0.72,
            sy * 0.66,
            sz * 0.78,
            bseed + 25,
            r_yaw + 0.4,
        )
        _add_faceted_boulder(
            boulder_light_bm,
            rx + 0.48 * math.cos(r_yaw),
            ry + 0.48 * math.sin(r_yaw),
            -0.35,
            sx * 0.55,
            sy * 0.50,
            sz * 0.60,
            bseed + 50,
            r_yaw + 0.9,
        )

    # -------------------------------------------------------------------------
    # D. CẦU CẢNG GỖ BẾN DU THUYỀN TÂY NAM & NHÀ CHÒI ĐÓN KHÁCH (Southwest Marina Pier & Pavilion)
    #    Vươn từ mũi cát Tây Nam (-12.2, -11.6) ra vùng nước neo đậu du thuyền (-16.2, -15.6)
    # -------------------------------------------------------------------------
    j_x0, j_y0 = -12.2, -11.6
    j_x1, j_y1 = -16.2, -15.6
    j_dx, j_dy = j_x1 - j_x0, j_y1 - j_y0
    j_len = math.hypot(j_dx, j_dy)
    j_yaw = math.atan2(j_dy, j_dx)
    j_cx, j_cy = 0.5 * (j_x0 + j_x1), 0.5 * (j_y0 + j_y1)
    T_jet = local_frame(j_cx, j_cy, j_yaw)
    bm_wood = b_ter("jetty_wood")
    bm_thatch = b_ter("jetty_thatch")

    # Dầm dọc kép & chiếu nghỉ chữ T ở mũi cầu cảng
    for side in (-0.42, 0.0, 0.42):
        add_box(bm_wood, T_jet(0.0, side, -0.245), (j_len, 0.075, 0.065), j_yaw)
    n_planks = 20
    for pk in range(n_planks):
        u = -0.48 * j_len + (pk / float(n_planks - 1)) * (0.86 * j_len)
        add_box(bm_wood, T_jet(u, 0.0, -0.200), (0.19, 1.08, 0.030), j_yaw)
    for pk_h in range(5):
        u_h = 0.40 * j_len + pk_h * 0.16
        add_box(bm_wood, T_jet(u_h, 0.0, -0.200), (0.14, 1.90, 0.032), j_yaw)

    # Cọc trụ gỗ đóng xuống đáy biển, trụ neo tàu & lan can dây
    for pk_p in range(6):
        u_p = -0.45 * j_len + (pk_p / 5.0) * (0.92 * j_len)
        for side_p in (-0.48, 0.48):
            add_cylinder(bm_wood, T_jet(u_p, side_p, -0.255), 0.062, 0.054, 0.34, segments=6)
            if pk_p < 5:
                u_next = -0.45 * j_len + ((pk_p + 1) / 5.0) * (0.92 * j_len)
                add_box(bm_wood, T_jet(0.5 * (u_p + u_next), side_p, -0.115), (1.05, 0.035, 0.035), j_yaw)
    for side_b in (-0.80, 0.80):
        add_cylinder(boulder_bm, T_jet(0.46 * j_len, side_b, -0.145), 0.065, 0.080, 0.10, segments=6)

    # Nhà chòi gỗ mái lá (Tropical Marina Welcome Gazebo) ở đầu cầu cảng
    u_gaz = -0.34 * j_len
    for gx_off in (-0.42, 0.42):
        for gy_off in (-0.46, 0.46):
            add_cylinder(bm_wood, T_jet(u_gaz + gx_off, gy_off, 0.06), 0.045, 0.040, 0.52, segments=5)
    # Mái chóp gỗ lợp lá cọ 2 tầng ở cổng cầu cảng
    add_cylinder(bm_thatch, T_jet(u_gaz, 0.0, 0.38), 0.82, 0.32, 0.22, segments=4, rot_z=j_yaw + math.pi / 4.0)
    add_cylinder(bm_thatch, T_jet(u_gaz, 0.0, 0.54), 0.42, 0.04, 0.18, segments=4, rot_z=j_yaw + math.pi / 4.0)

    # -------------------------------------------------------------------------
    # E. QUẦN THỂ NÚI ĐÁ VÔI KARST VỊNH HẠ LONG (Horizon Y = 32m .. 50m, Z = 6.0m .. 14.0m)
    #    Điêu khắc dạng cụm tháp đôi/tháp ba nối yên ngựa (Fengcong clusters) + các đảo tháp độc lập (Fenglin)
    # -------------------------------------------------------------------------
    bm_karst = b_ter("karst_rock")
    bm_klight = b_ter("karst_light")
    bm_forest = b_fol("karst_forest")
    bm_moss = b_fol("karst_moss")
    bm_bush = b_fol("tropical_bush")

    karst_clusters = (
        # Cụm 1 (Tây Bắc chân trời): Tháp chính 10.6m + tháp phụ 7.0m nối yên ngựa
        (-28.5, 36.0, 4.5, 3.6, 10.6, 101, 15.0),
        (-24.6, 34.6, 3.2, 2.6, 7.0, 121, 28.0),
        # Cụm 2 (Bắc - Tây Bắc): Đại tháp đôi 12.8m & 8.6m
        (-18.2, 39.5, 5.2, 4.0, 12.8, 102, -18.0),
        (-14.2, 37.2, 3.7, 2.9, 8.6, 122, -8.0),
        # Cụm 3 (Chính Bắc trung tâm): Quần thể 3 đỉnh hùng vĩ nhất (đỉnh 13.9m, 9.8m, 7.6m)
        (-3.6, 42.0, 5.8, 4.5, 13.9, 104, -12.0),
        (1.0, 40.2, 4.2, 3.4, 9.8, 124, 8.0),
        (-7.6, 39.0, 3.6, 2.9, 7.6, 125, -24.0),
        # Cụm 4 (Bắc - Đông Bắc): Tháp đôi 11.5m & 7.8m
        (8.4, 37.0, 4.6, 3.7, 11.5, 105, 18.0),
        (12.0, 35.4, 3.3, 2.6, 7.8, 126, 32.0),
        # Cụm 5 (Đông Bắc): Đại tháp 13.5m + tháp vệ tinh 9.0m
        (17.8, 42.5, 5.5, 4.3, 13.5, 106, -25.0),
        (22.0, 39.8, 3.9, 3.1, 9.0, 127, -10.0),
        # Cụm 6 (Viễn Đông Bắc): Tháp canh chân trời 11.8m & 8.2m
        (29.5, 38.5, 4.8, 3.8, 11.8, 108, -16.0),
        (33.2, 36.0, 3.4, 2.8, 8.2, 128, 12.0),
        # Cánh cung đảo đá vôi Đông Bắc (X = 34m .. 44m, Y = 16m .. 30m)
        (36.0, 26.5, 4.2, 3.3, 8.9, 109, 40.0),
        (39.0, 17.5, 3.6, 2.9, 7.0, 110, -35.0),
        # Cánh cung đảo đá vôi Tây Bắc (X = -34m .. -44m, Y = 16m .. 30m)
        (-36.0, 25.5, 3.9, 3.1, 8.0, 111, -30.0),
        (-38.5, 16.0, 3.4, 2.7, 6.6, 112, 22.0),
        # Hòn Trống Mái / Đảo đá đôi tiền cảnh vịnh Bắc (Y = 32.5m, Z = 6.4m & 6.0m)
        (-10.8, 33.2, 2.4, 1.8, 6.4, 131, 35.0),
        (-8.4, 32.8, 2.1, 1.6, 6.0, 132, -28.0),
    )
    for kx, ky, krx, kry, kpz, kseed, krot in karst_clusters:
        _add_halong_karst_tower(
            bm_karst, bm_klight, boulder_bm, bm_foam, bm_crystal,
            bm_forest, bm_moss, bm_bush,
            kx, ky, krx, kry, kpz, kseed, math.radians(krot),
        )

    # Vệt sóng rẽ nước trắng xóa (Vessel Wake Trails) cho tàu Container (-20.2, -18.5) và Du thuyền (-16.8, -14.8)
    _add_vessel_wake_foam(bm_foam, -20.2, -18.5, math.radians(-38.0), stern_x=-5.4, bow_x=5.5, half_beam=1.35, wake_len=4.2)
    _add_vessel_wake_foam(bm_foam, -16.8, -14.8, math.radians(46.0), stern_x=-1.75, bow_x=1.78, half_beam=0.58, wake_len=1.8)

    # -------------------------------------------------------------------------
    # F. RẶNG DỪA NHIỆT ĐỚI & THẢM CÂY BỤI QUANH 4 MŨI CÁT (`GEO_Archipelago_Foliage`)
    # -------------------------------------------------------------------------
    palm_clusters = (
        # Cụm mũi Tây Nam (quanh cầu cảng, nhà chòi & bãi tắm)
        (-11.8, -11.2, -0.34, 1.12, 2.2),
        (-13.2, -12.0, -0.34, 1.26, 2.5),
        (-14.5, -11.4, -0.34, 0.98, 1.9),
        (-12.9, -13.4, -0.34, 1.16, 2.8),
        (-15.0, -12.8, -0.35, 0.95, 2.3),
        (-15.8, -11.9, -0.35, 0.88, 2.0),
        (-18.4, -9.8, -0.35, 1.02, 2.6),
        (-19.2, -10.5, -0.35, 0.86, 2.1),
        (-11.2, -17.8, -0.35, 0.92, 1.8),
        # Cụm mũi Đông Nam
        (12.8, -12.2, -0.34, 1.18, -0.8),
        (14.2, -13.1, -0.34, 1.28, -0.5),
        (15.4, -12.5, -0.34, 1.00, -1.1),
        (13.6, -14.5, -0.34, 1.10, -0.3),
        (15.7, -13.8, -0.35, 0.94, -0.7),
        (18.4, -10.0, -0.35, 0.98, -0.4),
        (19.2, -10.6, -0.35, 0.86, -0.9),
        (11.8, -18.2, -0.35, 0.90, -1.2),
        # Cụm mũi Tây Bắc
        (-13.4, 12.2, -0.34, 1.18, 0.9),
        (-14.8, 13.2, -0.34, 1.28, 0.6),
        (-15.9, 12.5, -0.34, 1.00, 1.2),
        (-14.2, 14.5, -0.34, 1.12, 0.4),
        (-16.1, 13.8, -0.35, 0.94, 0.8),
        (-18.2, 9.8, -0.35, 0.98, 1.0),
        (-19.0, 10.5, -0.35, 0.85, 0.7),
        # Cụm mũi Đông Bắc
        (13.2, 12.0, -0.34, 1.15, 0.5),
        (14.4, 13.0, -0.34, 1.25, 0.8),
        (15.5, 12.2, -0.34, 0.98, 0.2),
        (13.8, 14.3, -0.34, 1.08, 1.0),
        (15.7, 13.6, -0.35, 0.92, 0.6),
        (18.4, 9.6, -0.35, 0.96, 0.3),
        (19.1, 10.3, -0.35, 0.85, 0.9),
    )
    for px, py, pz, pscale, pyaw in palm_clusters:
        _add_stylized_coconut_palm(b_fol, px, py, pz, pscale, pyaw)
        # Bụi cây dứa dại / cây bụi nhiệt đới ven biển dưới gốc dừa
        _add_foliage_dome(
            bm_bush,
            px + 0.38 * math.cos(pyaw),
            py + 0.38 * math.sin(pyaw),
            pz + 0.06,
            0.34 * pscale,
            0.28 * pscale,
            0.18 * pscale,
            rot_z=pyaw,
            segs=6,
        )
        _add_foliage_dome(
            bm_moss,
            px - 0.30 * math.sin(pyaw),
            py + 0.30 * math.cos(pyaw),
            pz + 0.05,
            0.26 * pscale,
            0.22 * pscale,
            0.15 * pscale,
            rot_z=pyaw + 0.8,
            segs=5,
        )

    obj_terrain = b_ter.commit_merged("GEO_Archipelago_Terrain")
    obj_foliage = b_fol.commit_merged("GEO_Archipelago_Foliage")
    return obj_terrain, obj_foliage


# -----------------------------------------------------------------------------
# 4. Xây dựng Mesh 3: `GEO_Archipelago_Vessels` (Tàu Container 11m & Du thuyền 3.5m)
# -----------------------------------------------------------------------------
def build_archipelago_vessels(
    coll: bpy.types.Collection,
    mats: dict[str, bpy.types.Material],
) -> bpy.types.Object:
    b_ves = MeshBatch("GEO_Archipelago_Vessels", mats, coll)

    # -------------------------------------------------------------------------
    # A. TÀU CONTAINER VIỄN DƯƠNG 11m TÂY NAM NGOÀI KHƠI (Southwest Outer Ocean)
    #    Vị trí: (-20.2, -18.5, Z = -0.30m), chiều dài ~11.0m, thân đỏ (#DC2626),
    #    đài chỉ huy trắng (#F8FAFC) nhiều tầng có cánh gà buồng lái (bridge wings),
    #    xuồng cứu sinh, cầu lashing và các kiện container đa sắc (#0284C7, #10B981, #F59E0B)
    # -------------------------------------------------------------------------
    ship_cx, ship_cy, ship_z0 = -20.2, -18.5, -0.30
    ship_yaw = math.radians(-38.0)
    S = local_frame(ship_cx, ship_cy, ship_yaw)

    hull_bm = b_ves("hull_red")
    boot_bm = b_ves("hull_dark")
    deck_bm = b_ves("vessel_deck")
    white_bm = b_ves("vessel_white")
    glass_bm = b_ves("bridge_glass")

    hull_stations = (
        (-5.45, 0.32, 0.68, 0.82, ship_z0 - 0.04, ship_z0 + 0.34, ship_z0 + 0.74),
        (-4.35, 0.96, 1.24, 1.32, ship_z0 - 0.04, ship_z0 + 0.34, ship_z0 + 0.74),
        (-1.80, 1.20, 1.34, 1.36, ship_z0 - 0.04, ship_z0 + 0.34, ship_z0 + 0.72),
        (2.10, 1.20, 1.34, 1.36, ship_z0 - 0.04, ship_z0 + 0.34, ship_z0 + 0.72),
        (3.85, 0.82, 1.06, 1.22, ship_z0 - 0.04, ship_z0 + 0.38, ship_z0 + 0.82),
        (4.95, 0.32, 0.48, 0.72, ship_z0 - 0.02, ship_z0 + 0.44, ship_z0 + 0.94),
        (5.55, 0.05, 0.09, 0.16, ship_z0 + 0.04, ship_z0 + 0.50, ship_z0 + 1.02),
    )
    h_rings = []
    for lx, hwb, hwm, hwt, zb, zm, zt in hull_stations:
        pts_sec = [
            (lx, -hwb, zb),
            (lx, hwb, zb),
            (lx, hwm, zm),
            (lx, hwt, zt),
            (lx, -hwt, zt),
            (lx, -hwm, zm),
        ]
        h_rings.append([hull_bm.verts.new(S(px, py, pz)) for px, py, pz in pts_sec])

    for i in range(len(h_rings) - 1):
        r0, r1 = h_rings[i], h_rings[i + 1]
        for k in range(6):
            kn = (k + 1) % 6
            hull_bm.faces.new((r0[k], r1[k], r1[kn], r0[kn]))
    hull_bm.faces.new(list(reversed(h_rings[0])))
    hull_bm.faces.new(h_rings[-1])

    # Mũi quả lê ngầm (Bulbous bow) + Đai mớn nước đen (Boot-topping) + Boong tàu chính & Boong mũi (Forecastle)
    add_sphere(hull_bm, S(5.48, 0.0, ship_z0 + 0.06), (0.42, 0.22, 0.16), subdiv=1, rot_z=ship_yaw)
    add_box(boot_bm, S(-0.20, 0.0, ship_z0 + 0.05), (9.95, 2.54, 0.14), ship_yaw)
    add_box(deck_bm, S(-0.15, 0.0, ship_z0 + 0.74), (9.70, 2.58, 0.08), ship_yaw)
    add_box(hull_bm, S(4.65, 0.0, ship_z0 + 0.90), (1.65, 1.55, 0.22), ship_yaw)
    add_box(deck_bm, S(4.55, 0.0, ship_z0 + 1.02), (1.55, 1.48, 0.05), ship_yaw)
    add_cylinder(white_bm, S(4.95, 0.0, ship_z0 + 1.38), 0.035, 0.020, 0.68, segments=6)
    add_box(deck_bm, S(4.35, -0.35, ship_z0 + 1.08), (0.28, 0.24, 0.12), ship_yaw)
    add_box(deck_bm, S(4.35, 0.35, ship_z0 + 1.08), (0.28, 0.24, 0.12), ship_yaw)

    # 2. Đài chỉ huy & Tháp buồng lái màu trắng nhiều tầng phía lái (Multi-deck Aft Superstructure)
    bx_bridge = -3.80
    add_box(white_bm, S(bx_bridge, 0.0, ship_z0 + 1.02), (1.68, 2.24, 0.48), ship_yaw)
    add_box(white_bm, S(bx_bridge - 0.04, 0.0, ship_z0 + 1.46), (1.42, 2.02, 0.42), ship_yaw)
    add_box(white_bm, S(bx_bridge - 0.06, 0.0, ship_z0 + 1.84), (1.22, 1.84, 0.38), ship_yaw)
    add_box(white_bm, S(bx_bridge + 0.06, 0.0, ship_z0 + 2.18), (0.96, 2.62, 0.32), ship_yaw)
    add_box(glass_bm, S(bx_bridge + 0.48, 0.0, ship_z0 + 2.20), (0.16, 2.48, 0.16), ship_yaw)
    add_box(glass_bm, S(bx_bridge - 0.36, 0.0, ship_z0 + 1.48), (1.46, 2.06, 0.08), ship_yaw)
    add_box(white_bm, S(bx_bridge + 0.06, 0.0, ship_z0 + 2.38), (1.06, 2.68, 0.08), ship_yaw)
    for side_lb in (-1.12, 1.12):
        add_box(b_ves("cargo_yellow"), S(bx_bridge - 0.10, side_lb, ship_z0 + 1.42), (0.58, 0.22, 0.18), ship_yaw)
    add_box(white_bm, S(bx_bridge - 0.42, 0.0, ship_z0 + 2.56), (0.58, 0.64, 0.36), ship_yaw)
    add_cylinder(hull_bm, S(bx_bridge - 0.42, 0.0, ship_z0 + 2.92), 0.24, 0.20, 0.42, segments=8, rot_z=ship_yaw)
    add_cylinder(boot_bm, S(bx_bridge - 0.42, 0.0, ship_z0 + 3.16), 0.19, 0.17, 0.10, segments=8, rot_z=ship_yaw)
    add_cylinder(white_bm, S(bx_bridge + 0.20, 0.0, ship_z0 + 2.72), 0.04, 0.02, 0.62, segments=6)
    add_box(white_bm, S(bx_bridge + 0.20, 0.0, ship_z0 + 2.96), (0.08, 0.52, 0.06), ship_yaw)

    # 3. Các dãy kiện hàng Container đa sắc xếp tầng trên boong kèm cầu giằng (Lashing bridges)
    bay_xs = (-2.05, -0.45, 1.15, 2.75)
    bay_ys = (-0.74, 0.0, 0.74)
    palette_cycle = ("cargo_blue", "cargo_green", "cargo_yellow")
    for b_idx, lx_c in enumerate(bay_xs):
        add_box(deck_bm, S(lx_c, 0.0, ship_z0 + 0.80), (1.48, 2.18, 0.08), ship_yaw)
        if b_idx < len(bay_xs) - 1:
            add_box(white_bm, S(lx_c + 0.80, 0.0, ship_z0 + 1.05), (0.08, 2.26, 0.45), ship_yaw)
        for r_idx, ly_c in enumerate(bay_ys):
            tiers_count = 3 if (b_idx in (1, 2) or r_idx == 1) else 2
            for t_idx in range(tiers_count):
                mat_key = palette_cycle[(b_idx * 3 + r_idx * 2 + t_idx) % 3]
                cz = ship_z0 + 0.84 + (t_idx + 0.5) * 0.40
                add_box(b_ves(mat_key), S(lx_c, ly_c, cz), (1.42, 0.66, 0.38), ship_yaw)

    # -------------------------------------------------------------------------
    # B. DU THUYỀN NGHỈ DƯỠNG MÀU TRẮNG 3.5m NEO ĐẬU GẦN BÃI CÁT & CẦU CẢNG TÂY NAM
    #    Vị trí: (-16.8, -14.8, Z = -0.30m), chiều dài ~3.5m
    # -------------------------------------------------------------------------
    y_cx, y_cy, y_z0 = -16.8, -14.8, -0.30
    y_yaw = math.radians(46.0)
    Y = local_frame(y_cx, y_cy, y_yaw)

    y_hull = b_ves("vessel_white")
    y_stations = (
        (-1.74, 0.38, 0.52, y_z0 - 0.02, y_z0 + 0.28),
        (-0.70, 0.50, 0.62, y_z0 - 0.02, y_z0 + 0.31),
        (0.65, 0.42, 0.56, y_z0 - 0.02, y_z0 + 0.34),
        (1.40, 0.20, 0.32, y_z0 + 0.00, y_z0 + 0.36),
        (1.78, 0.03, 0.08, y_z0 + 0.04, y_z0 + 0.39),
    )
    y_rings = []
    for lx, hwb, hwt, zb, zt in y_stations:
        pts_y = [(lx, -hwb, zb), (lx, hwb, zb), (lx, hwt, zt), (lx, -hwt, zt)]
        y_rings.append([y_hull.verts.new(Y(px, py, pz)) for px, py, pz in pts_y])
    for i in range(len(y_rings) - 1):
        r0, r1 = y_rings[i], y_rings[i + 1]
        for k in range(4):
            kn = (k + 1) % 4
            y_hull.faces.new((r0[k], r1[k], r1[kn], r0[kn]))
    y_hull.faces.new(list(reversed(y_rings[0])))
    y_hull.faces.new(y_rings[-1])

    add_box(b_ves("yacht_teak"), Y(-1.82, 0.0, y_z0 + 0.08), (0.36, 0.92, 0.05), y_yaw)
    add_box(b_ves("yacht_teak"), Y(-0.05, 0.0, y_z0 + 0.33), (3.12, 0.96, 0.04), y_yaw)
    add_box(b_ves("yacht_stripe"), Y(0.0, 0.0, y_z0 + 0.22), (3.28, 1.10, 0.05), y_yaw)
    add_box(b_ves("yacht_teak"), Y(0.95, 0.0, y_z0 + 0.37), (0.78, 0.62, 0.05), y_yaw)
    add_box(white_bm, Y(-0.18, 0.0, y_z0 + 0.47), (1.78, 0.86, 0.26), y_yaw)
    add_box(glass_bm, Y(0.08, 0.0, y_z0 + 0.49), (1.42, 0.90, 0.16), y_yaw)
    add_box(white_bm, Y(-0.35, 0.0, y_z0 + 0.67), (1.08, 0.70, 0.16), y_yaw)
    add_box(b_ves("yacht_stripe"), Y(-0.35, 0.0, y_z0 + 0.77), (1.14, 0.74, 0.04), y_yaw)
    add_box(white_bm, Y(-0.68, 0.0, y_z0 + 0.86), (0.24, 0.68, 0.16), y_yaw)

    return b_ves.commit_merged("GEO_Archipelago_Vessels")


# -----------------------------------------------------------------------------
# 5. Thiết lập Studio Camera / Ánh sáng, Kiểm định Ràng buộc & Xuất GLB Draco
# -----------------------------------------------------------------------------
def setup_archipelago_studio(scene: bpy.types.Scene, coll_studio: bpy.types.Collection) -> None:
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"
    engines = {e.identifier for e in scene.render.bl_rna.properties["engine"].enum_items}
    for candidate in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES"):
        if candidate in engines:
            scene.render.engine = candidate
            break
    ee = scene.eevee
    ee.taa_render_samples = 64
    scene.render.resolution_x = 1440
    scene.render.resolution_y = 900
    scene.render.image_settings.file_format = "JPEG"
    scene.render.image_settings.quality = 95
    try:
        scene.view_settings.view_transform = "Khronos PBR Neutral"
    except TypeError:
        scene.view_settings.view_transform = "AgX"

    world = bpy.data.worlds.get("VTCOON_Archipelago_World") or bpy.data.worlds.new("VTCOON_Archipelago_World")
    scene.world = world
    if world.node_tree is None:
        world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = hex_to_rgba("#BAE6FD")
    bg.inputs["Strength"].default_value = 0.95
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])

    target = bpy.data.objects.new("Archipelago_Cam_Target", None)
    target.location = (-2.5, 3.0, 1.2)
    move_to_collection(target, coll_studio)

    cam_data = bpy.data.cameras.new("Archipelago_Overview_Cam")
    cam_data.lens_unit = "FOV"
    cam_data.angle = math.radians(48.0)
    cam_data.clip_start = 0.5
    cam_data.clip_end = 400.0
    cam = bpy.data.objects.new("Archipelago_Overview_Cam", cam_data)
    cam.location = (46.0, -54.0, 34.0)
    track = cam.constraints.new(type="TRACK_TO")
    track.target = target
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    move_to_collection(cam, coll_studio)
    scene.camera = cam

    sun_data = bpy.data.lights.new(name="Archipelago_Sun", type="SUN")
    sun_data.energy = 4.4
    sun_data.color = hex_to_rgba("#FFFBEB")[:3]
    sun = bpy.data.objects.new("Archipelago_Sun", sun_data)
    sun.location = (-28.0, -32.0, 34.0)
    sun.rotation_euler = (Vector((0.0, 0.0, 0.0)) - sun.location).to_track_quat("-Z", "Y").to_euler()
    move_to_collection(sun, coll_studio)


def validate_archipelago_constraints(coll_arch: bpy.types.Collection) -> None:
    bpy.context.view_layer.update()
    mesh_objs = sorted([o for o in coll_arch.all_objects if o.type == "MESH"], key=lambda o: o.name)
    expected_names = ["GEO_Archipelago_Foliage", "GEO_Archipelago_Terrain", "GEO_Archipelago_Vessels"]
    actual_names = [o.name for o in mesh_objs]
    violations = []

    if actual_names != expected_names:
        violations.append(f"Expected exactly 3 meshes {expected_names}, got {actual_names}")

    total_tris = 0
    for o in mesh_objs:
        tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
        total_tris += tris
        print(f"  [ARCHIPELAGO_MESH] {o.name}: {tris} tris, {len(o.data.materials)} materials")

        # Kiểm chứng khoảng không trung tâm |X| <= 10.2m, |Y| <= 10.2m luôn nằm ở Z <= -0.375m
        for v in o.data.vertices:
            wv = o.matrix_world @ v.co
            if abs(wv.x) <= 10.2 and abs(wv.y) <= 10.2 and wv.z > -0.375:
                violations.append(
                    f"{o.name} intrudes into central board clearance |X|,|Y|<=10.2m at ({wv.x:.2f}, {wv.y:.2f}, {wv.z:.3f})"
                )
                break

    if total_tris >= 15000:
        violations.append(f"Total polycount {total_tris} >= 15,000 triangles limit")

    if violations:
        raise RuntimeError("Coastal archipelago validation failed:\n  " + "\n  ".join(violations))
    print(f"[VTCOON-ARCHIPELAGO] Validation OK: 3 static meshes, Total Tris = {total_tris} (< 15,000).")


def export_archipelago_glb(coll_arch: bpy.types.Collection, filepath: str) -> float:
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    for obj in bpy.context.scene.objects:
        obj.select_set(False)
    for obj in coll_arch.all_objects:
        obj.select_set(True)

    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_animations=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
    )
    size_kb = os.path.getsize(filepath) / 1024.0
    with open(filepath, "rb") as f:
        raw = f.read()
    json_len = struct.unpack("<I", raw[12:16])[0]
    gltf_json = json.loads(raw[20:20 + json_len].decode("utf-8"))
    node_names = [n.get("name") for n in gltf_json.get("nodes", [])]
    print(f"[VTCOON-ARCHIPELAGO] Exported GLB: {filepath} ({size_kb:.1f} KB)")
    print(f"[VTCOON-ARCHIPELAGO] GLB Nodes: {node_names}")
    return size_kb


def main() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    coll_studio = ensure_collection("00_Archipelago_Studio")
    coll_arch = ensure_collection(ARCHIPELAGO_COLLECTION)

    mats = build_archipelago_materials()
    setup_archipelago_studio(scene, coll_studio)

    build_archipelago_terrain_and_foliage(coll_arch, mats)
    build_archipelago_vessels(coll_arch, mats)

    validate_archipelago_constraints(coll_arch)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT_PATH)
    export_archipelago_glb(coll_arch, GLB_OUT_PATH)

    os.makedirs(os.path.dirname(RENDER_OUT_PATH), exist_ok=True)
    scene.render.filepath = RENDER_OUT_PATH
    bpy.ops.render.render(write_still=True)
    print(f"[VTCOON-ARCHIPELAGO] Verification render saved: {RENDER_OUT_PATH}")


if __name__ == "__main__":
    main()
