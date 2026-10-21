# -*- coding: utf-8 -*-
"""Bảng vật liệu PBR chuẩn hoá cho sa bàn Hà Nội (Đông) – TP.HCM (Tây)."""

from .core import create_pbr_material as pbr


def build_material_palette() -> dict:
    return {
        # Khung bàn cờ & nền (Metallic строго 0.0 cho dielectric hoặc 1.0 cho kim loại thực)
        "walnut": pbr("MAT_Walnut_Chassis", "#6D2E0F", metallic=0.0, roughness=0.30, specular=0.65, coat=0.55),
        "brass": pbr("MAT_Brushed_Brass", "#D4AF37", metallic=1.0, roughness=0.18, coat=0.25),
        "parchment_tile": pbr("MAT_Board_Parchment", "#F8FAFC", metallic=0.0, roughness=0.46, coat=0.15),
        "turf": pbr("MAT_Royal_Emerald_Turf", "#15803D", metallic=0.0, roughness=0.76, specular=0.35),
        "river_water": pbr("MAT_Saigon_River_Water", "#0369A1", metallic=0.0, roughness=0.06, specular=0.98, coat=0.95),
        "cut_stone": pbr("MAT_CutStone_Embankment", "#94A3B8", metallic=0.0, roughness=0.44, specular=0.55),
        "granite_paving": pbr("MAT_Granite_Promenade", "#CBD5E1", metallic=0.0, roughness=0.38, specular=0.60, coat=0.18),
        "marble_wharf": pbr("MAT_Marble_Wharf", "#E5E7EB", metallic=0.0, roughness=0.24, specular=0.75, coat=0.45),
        "asphalt_road": pbr("MAT_Bridge_Asphalt_Deck", "#1E293B", metallic=0.0, roughness=0.52, specular=0.45),
        # Trống đồng Đông Sơn
        "dark_granite": pbr("MAT_Dark_Granite_Plinth", "#1E293B", metallic=0.0, roughness=0.28, specular=0.70, coat=0.35),
        "bronze_base": pbr("MAT_DongSon_Bronze_Base", "#78350F", metallic=1.0, roughness=0.30, coat=0.25),
        "dong_son_gold": pbr("MAT_DongSon_Gilded_Gold", "#EAB308", metallic=1.0, roughness=0.16,
                             coat=0.55, emission_hex="#F59E0B", emission_strength=0.18),
        "ruby_red": pbr("MAT_Ruby_Dice", "#DC2626", metallic=0.0, roughness=0.14, coat=0.92),
        "porcelain": pbr("MAT_Porcelain_White", "#F8FAFC", metallic=0.0, roughness=0.24, specular=0.70, coat=0.45),
        # Metro (Hitachi Line 1 Bến Thành - Suối Tiên: hợp kim nhôm xước + xanh dương đặc trưng)
        "concrete": pbr("MAT_Precast_Concrete_Viaduct", "#E2E8F0", metallic=0.0, roughness=0.42, specular=0.55),
        "rail_groove": pbr("MAT_Metro_Rail_Groove", "#475569", metallic=1.0, roughness=0.26, coat=0.20),
        "metro_cyan": pbr("MAT_Metro_Cyan_Stripe", "#0284C7", metallic=0.0, roughness=0.18, specular=0.80, coat=0.78),
        "obsidian_glass": pbr("MAT_Obsidian_Glass", "#0F172A", metallic=0.0, roughness=0.05, specular=0.98, coat=0.98),
        "lamp_glow": pbr("MAT_Warm_Lantern_Glow", "#FEF08A", metallic=0.0, roughness=0.15,
                         emission_hex="#FEF08A", emission_strength=7.5),
        # Hà Nội (Tháp Rùa vôi vàng rêu phong, mái ngói nâu xám cổ kính)
        "hoan_kiem_water": pbr("MAT_HoanKiem_CyanWater", "#06B6D4", metallic=0.0, roughness=0.06, specular=0.98,
                               coat=0.96, emission_hex="#0891B2", emission_strength=0.28),
        "jade_moss": pbr("MAT_NgocIsland_Jade_Moss", "#166534", metallic=0.0, roughness=0.68),
        "aged_stucco": pbr("MAT_TurtleTower_Aged_Stucco", "#D6C5A3", metallic=0.0, roughness=0.62, specular=0.42),
        "moss_slate": pbr("MAT_TurtleTower_Moss_Slate_Roof", "#44403C", metallic=0.0, roughness=0.56, specular=0.48),
        "the_huc_red": pbr("MAT_TheHuc_Vermilion_Lacquer", "#DC2626", metallic=0.0, roughness=0.20, specular=0.85, coat=0.75),
        "flag_brick": pbr("MAT_FlagTower_Ancient_Brick", "#B43B0B", metallic=0.0, roughness=0.58, specular=0.45),
        "flag_stone": pbr("MAT_FlagTower_Grey_Stone", "#475569", metallic=0.0, roughness=0.48, specular=0.52),
        "flag_red": pbr("MAT_National_Flag_Red", "#DA251D", metallic=0.0, roughness=0.36, emission_hex="#DA251D",
                        emission_strength=0.22),
        "star_yellow": pbr("MAT_National_Star_Yellow", "#FFDD00", metallic=0.0, roughness=0.24, emission_hex="#FFDD00",
                           emission_strength=0.68),
        "indochine_cream": pbr("MAT_Indochine_Cream_Wall", "#FEF3C7", metallic=0.0, roughness=0.46, specular=0.52),
        "mansard_slate": pbr("MAT_Mansard_Slate_Roof", "#1E293B", metallic=0.0, roughness=0.38, specular=0.62, coat=0.22),
        "silver_steel": pbr("MAT_Silver_Plated_Steel", "#E2E8F0", metallic=1.0, roughness=0.18, coat=0.40),
        # Khuê Văn Các (Văn Miếu - Quốc Tử Giám) & Giếng Thiên Quang (Chuẩn quy cách PBR)
        "khue_van_wood": pbr("MAT_KhueVan_Crimson_Wood", "#991B1B", metallic=0.0, roughness=0.45, specular=0.55, coat=0.35),
        "khue_van_roof": pbr("MAT_KhueVan_Ancient_Tile", "#B45309", metallic=0.0, roughness=0.75, specular=0.40),
        "khue_van_mortar": pbr("MAT_KhueVan_Ancient_Mortar", "#64748B", metallic=0.0, roughness=0.80, specular=0.35),
        "battrang_brick": pbr("MAT_BatTrang_Courtyard_Brick", "#C2410C", metallic=0.0, roughness=0.65, specular=0.42),
        "thien_quang_water": pbr("MAT_ThienQuang_Jade_Water", "#0D9488", metallic=0.05, roughness=0.08,
                                 specular=0.95, coat=0.92, emission_hex="#0F766E", emission_strength=0.18),
        # TP.HCM (Bitexco kính phản quang xanh biếc, Nhà thờ Đức Bà gạch Marseille #B45309)
        "bitexco_glass": pbr("MAT_Bitexco_CurtainWall", "#0284C7", metallic=0.0, roughness=0.05, specular=0.98,
                             coat=0.96, emission_hex="#0369A1", emission_strength=0.12),
        "bitexco_mullion": pbr("MAT_Bitexco_Recessed_Seam", "#0F172A", metallic=1.0, roughness=0.22, coat=0.35),
        "helipad_yellow": pbr("MAT_Helipad_Yellow_Marking", "#FACC15", metallic=0.0, roughness=0.28,
                              emission_hex="#FACC15", emission_strength=0.42),
        "notre_dame_brick": pbr("MAT_NotreDame_Marseille_Brick", "#B45309", metallic=0.0, roughness=0.56, specular=0.48),
        "terracotta_roof": pbr("MAT_Terracotta_Roof_Tile", "#9A3412", metallic=0.0, roughness=0.48, specular=0.54, coat=0.15),
        "zinc_spire": pbr("MAT_Cathedral_Zinc_Spire", "#64748B", metallic=1.0, roughness=0.26, coat=0.30),
        "cruiser_blue": pbr("MAT_Cruiser_Blue_Stripe", "#1D4ED8", metallic=0.0, roughness=0.22, coat=0.65),
        "fountain_water": pbr("MAT_Fountain_Jet_Water", "#67E8F9", metallic=0.0, roughness=0.04, coat=0.95,
                              emission_hex="#22D3EE", emission_strength=0.65),
        # Cảnh quan
        "foliage_emerald": pbr("MAT_Townscaper_Emerald_Tree", "#15803D", metallic=0.0, roughness=0.60, specular=0.42),
        "foliage_moss": pbr("MAT_Townscaper_Moss_Tree", "#166534", metallic=0.0, roughness=0.62, specular=0.40),
        "palm_frond": pbr("MAT_Tropical_Palm_Frond", "#16A34A", metallic=0.0, roughness=0.54, specular=0.48),
        "trunk": pbr("MAT_Tree_Trunk_Bark", "#78350F", metallic=0.0, roughness=0.76),
        "palm_trunk": pbr("MAT_Palm_Trunk_Ringed", "#A16207", metallic=0.0, roughness=0.74),
        "flower_pink": pbr("MAT_Flowerbed_Pink", "#F472B6", metallic=0.0, roughness=0.48),
        "flower_yellow": pbr("MAT_Flowerbed_Yellow", "#FACC15", metallic=0.0, roughness=0.48),
    }
