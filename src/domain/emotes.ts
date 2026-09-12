// [UC-GAME-018/MSS] Social Emotes Domain Models & Constants
// 5 biểu cảm tương tác nhanh: Cười, Khóc, Đốt tiền, Bắn tim, Cay cú

export enum EmoteId {
  Laugh = 'laugh',
  Cry = 'cry',
  BurnMoney = 'burn_money',
  Heart = 'heart',
  Rage = 'rage',
}

export interface SocialEmoteDef {
  readonly id: EmoteId;
  readonly icon: string;
  readonly label: string;
}

export const SOCIAL_EMOTES: readonly SocialEmoteDef[] = [
  { id: EmoteId.Laugh, icon: '😂', label: 'Cười' },
  { id: EmoteId.Cry, icon: '😭', label: 'Khóc' },
  { id: EmoteId.BurnMoney, icon: '💸', label: 'Đốt tiền' },
  { id: EmoteId.Heart, icon: '❤️', label: 'Bắn tim' },
  { id: EmoteId.Rage, icon: '😡', label: 'Cay cú' },
] as const;

export const EMOTE_DISPLAY_DURATION_MS = 3000;
export const EMOTE_COOLDOWN_MS = 2500;

export function isValidEmoteId(id: unknown): id is EmoteId {
  return typeof id === 'string' && Object.values(EmoteId).includes(id as EmoteId);
}

export function getEmoteDef(id: EmoteId | string): SocialEmoteDef | undefined {
  return SOCIAL_EMOTES.find((e) => e.id === id);
}
