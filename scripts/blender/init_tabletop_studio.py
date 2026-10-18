# -*- coding: utf-8 -*-
"""
VTCOON — Sa Bàn Trung Tâm "Hai Đại Đô Thị" (Blender 5.2.2 LTS, headless CLI)
=============================================================================
Quy hoạch 50/50 mặt đồng hồ, ranh giới là kinh tuyến 12h → 6h (dòng sông uốn lượn + đại lộ ven sông):
  • NỬA ĐÔNG (X > 0): Thủ đô HÀ NỘI — Hồ Hoàn Kiếm ngọc lam, Đảo Ngọc, Tháp Rùa 3 tầng, Cầu Thê Húc,
    Kỳ Đài Thăng Long (Cột Cờ), Nhà Hát Lớn, bờ hồ liễu rủ.
  • NỬA TÂY (X < 0): TP. HỒ CHÍ MINH — Tháp Bitexco Búp Sen, Nhà thờ Đức Bà, Chợ Bến Thành,
    Bến Bạch Đằng, phố đi bộ Nguyễn Huệ – Lê Lợi.
  • TÂM (0,0,0): Đĩa Trống Đồng Đông Sơn mạ vàng (khay gieo xúc xắc chìm).
  • Tuyến Metro trên cao hình chữ S nối Tây ↔ Đông, 10 trụ chữ T, đoàn tàu Toybox 3 toa.
  • TUYỆT ĐỐI KHÔNG có nhà ống / nhà phố / biệt thự phân lô (được kiểm tra tự động).

Chạy:
  blender -b --factory-startup --python-exit-code 1 -P scripts/blender/init_tabletop_studio.py
  (tuỳ chọn sau "--": --skip-export, --skip-render)

Đầu ra:
  1. tabletop_studio.blend
  2. public/models/board/tabletop_diorama.glb  (chỉ collection 03_Diorama_Indochine_Master, Draco mức 6, <= 1.5MB)
  3. .agents/tmp/tabletop_studio_verified_1.jpg (EEVEE Next, 64 samples, 1280x800)
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

from vtcoon_tabletop.core import (BLEND_SAVE_PATH, GLB_EXPORT_PATH, RENDER_VERIFY_PATH, ClearanceMap,  # noqa: E402
                                  ensure_collection)
from vtcoon_tabletop.foundation import (build_board_chassis, build_dong_son_drum, build_static_dice,  # noqa: E402
                                        build_terrain_and_river)
from vtcoon_tabletop.hanoi import build_hoan_kiem_quarter  # noqa: E402
from vtcoon_tabletop.hanoi_monuments import build_hanoi_civic_quarter  # noqa: E402
from vtcoon_tabletop.materials import build_material_palette  # noqa: E402
from vtcoon_tabletop.metro import build_metro  # noqa: E402
from vtcoon_tabletop.saigon_waterfront import build_saigon_quarter  # noqa: E402
from vtcoon_tabletop.studio import (DIORAMA_COLLECTION, export_glb, render_still,  # noqa: E402
                                    setup_camera_and_lighting, setup_world_and_render)

GLB_BUDGET_MB = 2.0
FORBIDDEN_TOKENS = ("shophouse", "villa", "townhouse", "residential", "nhapho", "nha_ong")


def parse_flags() -> set[str]:
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    return {a for a in argv if a.startswith("--")}


def _world_x_range(obj) -> tuple[float, float]:
    xs = [(obj.matrix_world @ v.co).x for v in obj.data.vertices]
    return min(xs), max(xs)


def validate_master_plan(coll_hanoi, coll_saigon) -> None:
    """Kiểm chứng 50/50: Hà Nội hoàn toàn X > 0, TP.HCM hoàn toàn X < 0, không có nhà phân lô."""
    bpy.context.view_layer.update()
    violations = []
    for obj in coll_hanoi.all_objects:
        lo, _ = _world_x_range(obj)
        if lo <= 0.0:
            violations.append(f"{obj.name} crosses into the West half (min x = {lo:.3f})")
    for obj in coll_saigon.all_objects:
        _, hi = _world_x_range(obj)
        if hi >= 0.0:
            violations.append(f"{obj.name} crosses into the East half (max x = {hi:.3f})")
    for obj in bpy.data.objects:
        if any(tok in obj.name.lower() for tok in FORBIDDEN_TOKENS):
            violations.append(f"Forbidden generic housing object: {obj.name}")
    if violations:
        raise RuntimeError("Master plan validation failed:\n  " + "\n  ".join(violations))
    print(f"[VTCOON-STUDIO] Master plan OK: Hanoi {len(coll_hanoi.all_objects)} objects (X>0), "
          f"Saigon {len(coll_saigon.all_objects)} objects (X<0), 0 generic houses.")


def build_and_verify_tabletop_studio() -> None:
    flags = parse_flags()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    coll_studio = ensure_collection("01_Studio_Camera_And_Lighting")
    coll_chassis = ensure_collection("02_Board_Chassis_18m")
    coll_master = ensure_collection(DIORAMA_COLLECTION)
    coll_center = ensure_collection("03A_Center_DongSon_River_Metro", coll_master)
    coll_hanoi = ensure_collection("03B_Hanoi_East_Heritage", coll_master)
    coll_saigon = ensure_collection("03C_Saigon_West_Metropolis", coll_master)
    coll_dice = ensure_collection("04_Static_Dice_Reference")

    mats = build_material_palette()
    setup_world_and_render(scene)
    setup_camera_and_lighting(scene, coll_studio)

    build_board_chassis(coll_chassis, mats)
    build_terrain_and_river(coll_center, mats)
    build_dong_son_drum(coll_center, mats)
    build_static_dice(coll_dice, mats)
    metro_pts = build_metro(coll_center, mats)

    hanoi_clear = ClearanceMap()
    hanoi_clear.add_path(metro_pts, 0.30)
    hanoi_clear.add_circle(0.0, 0.0, 2.15)
    build_hoan_kiem_quarter(coll_hanoi, mats, hanoi_clear)
    build_hanoi_civic_quarter(coll_hanoi, mats, hanoi_clear)

    saigon_clear = ClearanceMap()
    saigon_clear.add_path(metro_pts, 0.30)
    saigon_clear.add_circle(0.0, 0.0, 2.15)
    build_saigon_quarter(coll_saigon, mats, saigon_clear)

    validate_master_plan(coll_hanoi, coll_saigon)

    bpy.ops.wm.save_as_mainfile(filepath=BLEND_SAVE_PATH)
    print(f"[VTCOON-STUDIO] Saved: {BLEND_SAVE_PATH}")

    if "--skip-export" not in flags:
        size_mb = export_glb(GLB_EXPORT_PATH)
        if size_mb > GLB_BUDGET_MB:
            raise RuntimeError(f"GLB budget exceeded: {size_mb:.2f} MB > {GLB_BUDGET_MB} MB")
    if "--skip-render" not in flags:
        render_still(scene, RENDER_VERIFY_PATH)


if __name__ == "__main__":
    build_and_verify_tabletop_studio()
