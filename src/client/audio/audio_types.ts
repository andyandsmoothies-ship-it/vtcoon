// [UI-S05/MSS] Regional Audio Types & Map — SSOT: docs/domain/design.md §2
export enum BGMTrack {
  TAY_NAM_BO = 'TAY_NAM_BO',                     // Cạnh 1: Ô 00 - 09 (Đàn kìm, sông nước)
  DUYEN_HAI_MIEN_TRUNG = 'DUYEN_HAI_MIEN_TRUNG', // Cạnh 2: Ô 10 - 19 (Đàn bầu, sóng biển)
  BAC_TRUNG_BO = 'BAC_TRUNG_BO',                 // Cạnh 3: Ô 20 - 29 (Cồng chiêng, Tràng An)
  DO_THI_LOI = 'DO_THI_LOI',                     // Cạnh 4: Ô 30 - 39 (Lofi/Jazz Hà Nội - TP.HCM)
}

export enum SoundEffect {
  DICE_ROLL = 'DICE_ROLL',
  PAWN_STEP = 'PAWN_STEP',
  BUY_PROPERTY = 'BUY_PROPERTY',
  UPGRADE_C3 = 'UPGRADE_C3',
  AUCTION_BID = 'AUCTION_BID',
  TRADE_SUCCESS = 'TRADE_SUCCESS',
  CARD_DRAW = 'CARD_DRAW',
  BANKRUPT = 'BANKRUPT',
  TAX_PENALTY = 'TAX_PENALTY',
  CARD_FLIP = 'CARD_FLIP',
  VICTORY_CHIME = 'VICTORY_CHIME',
}

export const BGM_FILE_MAP: Record<BGMTrack, string> = {
  [BGMTrack.TAY_NAM_BO]: '/assets/audio/bgm_tay_nam_bo.mp3',
  [BGMTrack.DUYEN_HAI_MIEN_TRUNG]: '/assets/audio/bgm_duyen_hai_mien_trung.mp3',
  [BGMTrack.BAC_TRUNG_BO]: '/assets/audio/bgm_bac_trung_bo.mp3',
  [BGMTrack.DO_THI_LOI]: '/assets/audio/bgm_do_thi_loi.mp3',
} as const;

export const SFX_FILE_MAP: Record<SoundEffect, string> = {
  [SoundEffect.DICE_ROLL]: '/assets/audio/sfx_dice_roll.mp3',
  [SoundEffect.PAWN_STEP]: '/assets/audio/sfx_pawn_step.mp3',
  [SoundEffect.BUY_PROPERTY]: '/assets/audio/sfx_buy_property.mp3',
  [SoundEffect.UPGRADE_C3]: '/assets/audio/sfx_upgrade_c3.mp3',
  [SoundEffect.AUCTION_BID]: '/assets/audio/sfx_auction_bid.mp3',
  [SoundEffect.TRADE_SUCCESS]: '/assets/audio/sfx_trade_success.mp3',
  [SoundEffect.CARD_DRAW]: '/assets/audio/sfx_card_draw.mp3',
  [SoundEffect.BANKRUPT]: '/assets/audio/sfx_bankrupt.mp3',
  [SoundEffect.TAX_PENALTY]: '/assets/audio/sfx_tax_penalty.mp3',
  [SoundEffect.CARD_FLIP]: '/assets/audio/sfx_card_flip.mp3',
  [SoundEffect.VICTORY_CHIME]: '/assets/audio/sfx_victory_chime.mp3',
} as const;

/** Ánh xạ chỉ số ô bàn cờ (0..39) sang nhạc nền BGM 4 cạnh địa lý */
export function getBgmTrackForCell(cellIndex: number): BGMTrack {
  const normalized = Math.floor(cellIndex % 40);
  const positive = normalized < 0 ? normalized + 40 : normalized;
  const side = Math.floor(positive / 10);
  switch (side) {
    case 0: return BGMTrack.TAY_NAM_BO;
    case 1: return BGMTrack.DUYEN_HAI_MIEN_TRUNG;
    case 2: return BGMTrack.BAC_TRUNG_BO;
    default: return BGMTrack.DO_THI_LOI;
  }
}
