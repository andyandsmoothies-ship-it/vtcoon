// [UC-GAME-018/MSS][TC-EMOTE01/MSS] Social Emotes Domain Contract & Validation Tests
import { describe, it, expect } from 'vitest';
import {
  EmoteId,
  SOCIAL_EMOTES,
  EMOTE_DISPLAY_DURATION_MS,
  EMOTE_COOLDOWN_MS,
  isValidEmoteId,
  getEmoteDef,
} from '../../src/domain/emotes';

describe('[TC-EMOTE01.1/MSS] Social Emotes Enum & Fixture Contract', () => {
  it('Dinh nghia dung 5 bieu cam xa hoi bat buoc', () => {
    expect(Object.values(EmoteId)).toHaveLength(5);
    expect(EmoteId.Laugh).toBe('laugh');
    expect(EmoteId.Cry).toBe('cry');
    expect(EmoteId.BurnMoney).toBe('burn_money');
    expect(EmoteId.Heart).toBe('heart');
    expect(EmoteId.Rage).toBe('rage');
  });

  it('SOCIAL_EMOTES chua day du 5 bieu cam voi icon emoji va ten tieng Viet', () => {
    expect(SOCIAL_EMOTES).toHaveLength(5);

    const emoteMap = new Map(SOCIAL_EMOTES.map((e) => [e.id, e]));

    const laugh = emoteMap.get(EmoteId.Laugh);
    expect(laugh).toBeDefined();
    expect(laugh?.icon).toBe('😂');
    expect(laugh?.label).toBe('Cười');

    const cry = emoteMap.get(EmoteId.Cry);
    expect(cry).toBeDefined();
    expect(cry?.icon).toBe('😭');
    expect(cry?.label).toBe('Khóc');

    const burn = emoteMap.get(EmoteId.BurnMoney);
    expect(burn).toBeDefined();
    expect(burn?.icon).toBe('💸');
    expect(burn?.label).toBe('Đốt tiền');

    const heart = emoteMap.get(EmoteId.Heart);
    expect(heart).toBeDefined();
    expect(heart?.icon).toBe('❤️');
    expect(heart?.label).toBe('Bắn tim');

    const rage = emoteMap.get(EmoteId.Rage);
    expect(rage).toBeDefined();
    expect(rage?.icon).toBe('😡');
    expect(rage?.label).toBe('Cay cú');
  });

  it('Thoi gian hien thi bong bong emote dung chuan 3 giay (3000ms)', () => {
    expect(EMOTE_DISPLAY_DURATION_MS).toBe(3000);
  });

  it('Thoi gian hoi chieu (cooldown) tray emote la 1 giay (1000ms)', () => {
    expect(EMOTE_COOLDOWN_MS).toBe(1000);
  });
});

describe('[TC-EMOTE01.2/MSS] Emote Validation & Lookup Helpers', () => {
  it('isValidEmoteId tra ve true cho tat ca 5 EmoteId hop le', () => {
    for (const emote of SOCIAL_EMOTES) {
      expect(isValidEmoteId(emote.id)).toBe(true);
    }
  });

  it('[Adversarial] isValidEmoteId tu choi chuoi la, chuoi rong va cac kieu du lieu bat thuong', () => {
    expect(isValidEmoteId('')).toBe(false);
    expect(isValidEmoteId('unknown_emote')).toBe(false);
    expect(isValidEmoteId('LAUGH')).toBe(false); // Case-sensitive
    expect(isValidEmoteId(123)).toBe(false);
    expect(isValidEmoteId(null)).toBe(false);
    expect(isValidEmoteId(undefined)).toBe(false);
    expect(isValidEmoteId({})).toBe(false);
  });

  it('getEmoteDef tra ve dung definition hoac undefined neu ID khong hop le', () => {
    expect(getEmoteDef(EmoteId.Laugh)?.icon).toBe('😂');
    expect(getEmoteDef('burn_money')?.label).toBe('Đốt tiền');
    expect(getEmoteDef('non_existent')).toBeUndefined();
  });
});
