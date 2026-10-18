# -*- coding: utf-8 -*-
"""Bảng vật liệu PBR chuẩn hoá cho sa bàn Hà Nội (Đông) – TP.HCM (Tây)."""

from .core import create_pbr_material as pbr


def build_material_palette() -> dict:
    return {
        # Khung bàn cờ & nền
        "walnut": pbr("MAT_Walnut_Chassis", "#78350F", roughness=0.36, coat=0.45),
        "brass": pbr("MAT_Brushed_Brass", "#D4AF37", metallic=0.90, roughness=0.22),
        "parchment_tile": pbr("MAT_Board_Parchment", "#F8FAFC", roughness=0.52),
        "turf": pbr("MAT_Royal_Emerald_Turf", "#15803D", roughness=0.80),
        "river_water": pbr("MAT_Saigon_River_Water", "#0369A1", roughness=0.12, specular=0.9, coat=0.85),
        "cut_stone": pbr("MAT_CutStone_Embankment", "#94A3B8", roughness=0.50),
        "granite_paving": pbr("MAT_Granite_Promenade", "#CBD5E1", roughness=0.46),
        "marble_wharf": pbr("MAT_Marble_Wharf", "#E5E7EB", roughness=0.32, coat=0.30),
        # Trống đồng Đông Sơn
        "dark_granite": pbr("MAT_Dark_Granite_Plinth", "#334155", roughness=0.38),
        "bronze_base": pbr("MAT_DongSon_Bronze_Base", "#92400E", metallic=0.78, roughness=0.34),
        "dong_son_gold": pbr("MAT_DongSon_Gilded_Gold", "#D4AF37", metallic=0.90, roughness=0.20,
                             coat=0.40, emission_hex="#F59E0B", emission_strength=0.15),
        "ruby_red": pbr("MAT_Ruby_Dice", "#DC2626", roughness=0.18, coat=0.85),
        "porcelain": pbr("MAT_Porcelain_White", "#F8FAFC", roughness=0.26, coat=0.45),
        # Metro
        "concrete": pbr("MAT_Precast_Concrete_Viaduct", "#E2E8F0", roughness=0.40),
        "rail_groove": pbr("MAT_Metro_Rail_Groove", "#334155", metallic=0.4, roughness=0.35),
        "metro_cyan": pbr("MAT_Metro_Cyan_Stripe", "#0284C7", roughness=0.24, coat=0.60),
        "obsidian_glass": pbr("MAT_Obsidian_Glass", "#0F172A", roughness=0.08, coat=0.95),
        "lamp_glow": pbr("MAT_Warm_Lantern_Glow", "#FEF08A", roughness=0.20,
                         emission_hex="#FEF08A", emission_strength=6.0),
        # Hà Nội
        "hoan_kiem_water": pbr("MAT_HoanKiem_CyanWater", "#06B6D4", roughness=0.10, specular=0.95, coat=0.90,
                               emission_hex="#0891B2", emission_strength=0.25),
        "jade_moss": pbr("MAT_NgocIsland_Jade_Moss", "#166534", roughness=0.72),
        "aged_stucco": pbr("MAT_TurtleTower_Aged_Stucco", "#E7E5E4", roughness=0.62),
        "moss_slate": pbr("MAT_TurtleTower_Moss_Slate_Roof", "#64748B", roughness=0.58),
        "the_huc_red": pbr("MAT_TheHuc_Vermilion_Lacquer", "#DC2626", roughness=0.28, coat=0.60),
        "flag_brick": pbr("MAT_FlagTower_Ancient_Brick", "#C2410C", roughness=0.62),
        "flag_stone": pbr("MAT_FlagTower_Grey_Stone", "#475569", roughness=0.52),
        "flag_red": pbr("MAT_National_Flag_Red", "#DA251D", roughness=0.40, emission_hex="#DA251D",
                        emission_strength=0.20),
        "star_yellow": pbr("MAT_National_Star_Yellow", "#FFDD00", roughness=0.30, emission_hex="#FFDD00",
                           emission_strength=0.60),
        "indochine_cream": pbr("MAT_Indochine_Cream_Wall", "#FEF3C7", roughness=0.52),
        "mansard_slate": pbr("MAT_Mansard_Slate_Roof", "#334155", metallic=0.15, roughness=0.42),
        "silver_steel": pbr("MAT_Silver_Plated_Steel", "#E2E8F0", metallic=0.85, roughness=0.22, coat=0.40),
        # TP.HCM
        "bitexco_glass": pbr("MAT_Bitexco_CurtainWall", "#38BDF8", metallic=0.15, roughness=0.12, coat=0.90),
        "helipad_yellow": pbr("MAT_Helipad_Yellow_Marking", "#FACC15", roughness=0.35,
                              emission_hex="#FACC15", emission_strength=0.35),
        "notre_dame_brick": pbr("MAT_NotreDame_Crimson_Brick", "#B91C1C", roughness=0.54),
        "terracotta_roof": pbr("MAT_Terracotta_Roof_Tile", "#B45309", roughness=0.48),
        "zinc_spire": pbr("MAT_Cathedral_Zinc_Spire", "#475569", metallic=0.40, roughness=0.34),
        "cruiser_blue": pbr("MAT_Cruiser_Blue_Stripe", "#1D4ED8", roughness=0.28, coat=0.50),
        "fountain_water": pbr("MAT_Fountain_Jet_Water", "#67E8F9", roughness=0.05, coat=0.9,
                              emission_hex="#22D3EE", emission_strength=0.6),
        # Cảnh quan
        "foliage_emerald": pbr("MAT_Townscaper_Emerald_Tree", "#15803D", roughness=0.66),
        "foliage_moss": pbr("MAT_Townscaper_Moss_Tree", "#166534", roughness=0.68),
        "palm_frond": pbr("MAT_Tropical_Palm_Frond", "#16A34A", roughness=0.60),
        "trunk": pbr("MAT_Tree_Trunk_Bark", "#78350F", roughness=0.80),
        "palm_trunk": pbr("MAT_Palm_Trunk_Ringed", "#A16207", roughness=0.78),
        "flower_pink": pbr("MAT_Flowerbed_Pink", "#F472B6", roughness=0.55),
        "flower_yellow": pbr("MAT_Flowerbed_Yellow", "#FACC15", roughness=0.55),
    }
