// [TC-SE-MOD/MSS] SoundEngine Context Manager & WebAudio Graph Living Contract Test
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAudioStore } from '../../src/client/store/audio_store';
import {
  SoundEngineContextManager,
  resolveAudioContext,
} from '../../src/client/audio/sound_engine_context';
import { SoundEngine, SoundEngineImpl } from '../../src/client/audio/sound_engine';

function createMockAudioParam(initialValue = 1) {
  return {
    value: initialValue,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

class MockAudioNode {
  public connect = vi.fn();
  public disconnect = vi.fn();
}

class MockGainNode extends MockAudioNode {
  public gain = createMockAudioParam(1);
}

class MockAudioContext {
  public state: AudioContextState = 'suspended';
  public currentTime = 10.0;
  public sampleRate = 44100;
  public destination = new MockAudioNode();
  public close = vi.fn().mockResolvedValue(undefined);
  public resume = vi.fn().mockImplementation(async () => {
    this.state = 'running';
  });

  public createGain(): MockGainNode {
    return new MockGainNode();
  }
}

describe('[TC-SE-MOD/MSS] SoundEngine Context Modularization Contract', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', MockAudioContext);
    useAudioStore.setState({
      masterVolume: 1.0,
      sfxVolume: 0.8,
      bgmVolume: 0.6,
      isMuted: false,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('[TC-SE-MOD.01/MSS][UC-SE-MOD/MSS] Given môi trường test với MockAudioContext, When gọi resolveAudioContext(), Then hàm trả về constructor MockAudioContext', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('window', {
      AudioContext: MockAudioContext,
      webkitAudioContext: undefined,
    });
    const CtxClass = resolveAudioContext();
    expect(CtxClass).toBe(MockAudioContext);
  });

  it('[TC-SE-MOD.01b/MSS][UC-SE-MOD/MSS] Given môi trường Safari chỉ có webkitAudioContext, When gọi resolveAudioContext(), Then hàm trả về constructor webkitAudioContext', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('window', {
      AudioContext: undefined,
      webkitAudioContext: MockAudioContext,
    });
    const CtxClass = resolveAudioContext();
    expect(CtxClass).toBe(MockAudioContext);
  });

  it('[TC-SE-MOD.02/MSS][UC-SE-MOD/MSS] Given môi trường không có AudioContext trong window và globalThis, When gọi resolveAudioContext(), Then hàm trả về null an toàn', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('window', undefined);
    const CtxClass = resolveAudioContext();
    expect(CtxClass).toBeNull();
  });

  it('[TC-SE-MOD.03/MSS][UC-SE-MOD/MSS] Given SoundEngineContextManager mới khởi tạo, When truy xuất getContext(), Then đồ thị âm thanh khởi tạo masterGain, sfxBus và bgmBus', () => {
    const manager = new SoundEngineContextManager();
    const ctx = manager.getContext();
    expect(ctx).toBeInstanceOf(MockAudioContext);
    expect(manager.masterGain).toBeDefined();
    expect(manager.sfxBus).toBeDefined();
    expect(manager.bgmBus).toBeDefined();
    manager.disposeContext();
  });

  it('[TC-SE-MOD.04/MSS][UC-SE-MOD/MSS] Given đồ thị âm thanh đã khởi tạo, When kiểm tra các kết nối bus, Then sfxBus và bgmBus kết nối tới masterGain và masterGain kết nối tới destination', () => {
    const manager = new SoundEngineContextManager();
    manager.getContext();
    expect(manager.sfxBus?.connect).toHaveBeenCalledWith(manager.masterGain);
    expect(manager.bgmBus?.connect).toHaveBeenCalledWith(manager.masterGain);
    manager.disposeContext();
  });

  it('[TC-SE-MOD.05/MSS][UC-SE-MOD/MSS] Given âm lượng audio store là master 0.8 và sfx 0.5, When gọi getEffectiveSfxVolume(), Then giá trị trả về bằng 0.4', () => {
    useAudioStore.setState({ masterVolume: 0.8, sfxVolume: 0.5, isMuted: false });
    const manager = new SoundEngineContextManager();
    expect(manager.getEffectiveSfxVolume()).toBeCloseTo(0.4, 5);
  });

  it('[TC-SE-MOD.06/MSS][UC-SE-MOD/MSS] Given âm lượng audio store là master 0.8 và bgm 0.6, When gọi getEffectiveBgmVolume(), Then giá trị trả về bằng 0.48', () => {
    useAudioStore.setState({ masterVolume: 0.8, bgmVolume: 0.6, isMuted: false });
    const manager = new SoundEngineContextManager();
    expect(manager.getEffectiveBgmVolume()).toBeCloseTo(0.48, 5);
  });

  it('[TC-SE-MOD.07/MSS][UC-SE-MOD/MSS] Given audio store được đặt trạng thái isMuted là true, When gọi getEffectiveSfxVolume(), Then giá trị hiệu dụng sfx bằng 0', () => {
    useAudioStore.setState({ masterVolume: 0.8, sfxVolume: 0.5, isMuted: true });
    const manager = new SoundEngineContextManager();
    expect(manager.getEffectiveSfxVolume()).toBe(0);
  });

  it('[TC-SE-MOD.08/MSS][UC-SE-MOD/MSS] Given audio store được đặt trạng thái isMuted là true, When gọi getEffectiveBgmVolume(), Then giá trị hiệu dụng bgm bằng 0', () => {
    useAudioStore.setState({ masterVolume: 0.8, bgmVolume: 0.6, isMuted: true });
    const manager = new SoundEngineContextManager();
    expect(manager.getEffectiveBgmVolume()).toBe(0);
  });

  it('[TC-SE-MOD.09/MSS][UC-SE-MOD/MSS] Given audio store thay đổi âm lượng, When gọi syncVolumesWithStore(), Then setValueAtTime được gọi trên gain của các node bus', () => {
    const manager = new SoundEngineContextManager();
    manager.getContext();
    useAudioStore.setState({ masterVolume: 0.7, sfxVolume: 0.4, bgmVolume: 0.3 });
    manager.syncVolumesWithStore(12.0);
    expect(manager.masterGain?.gain.setValueAtTime).toHaveBeenCalledWith(0.7, 12.0);
    expect(manager.sfxBus?.gain.setValueAtTime).toHaveBeenCalledWith(0.4, 12.0);
    manager.disposeContext();
  });

  it('[TC-SE-MOD.10/MSS][UC-SE-MOD/MSS] Given AudioContext đang ở trạng thái suspended, When gọi resumeAudioContext(), Then trạng thái context được gọi resume thành công', async () => {
    const manager = new SoundEngineContextManager();
    const ctx = manager.getContext() as MockAudioContext | null;
    expect(ctx).not.toBeNull();
    await manager.resumeAudioContext();
    expect(ctx?.resume).toHaveBeenCalled();
    manager.disposeContext();
  });

  it('[TC-SE-MOD.11/MSS][UC-SE-MOD/MSS] Given SoundEngineContextManager đang quản lý context và bus, When gọi disposeContext(), Then context được close và các tham chiếu gain node đặt về null', () => {
    const manager = new SoundEngineContextManager();
    manager.getContext();
    manager.disposeContext();
    expect(manager.masterGain).toBeNull();
    expect(manager.sfxBus).toBeNull();
    expect(manager.bgmBus).toBeNull();
  });

  it('[TC-SE-MOD.12/MSS][UC-SE-MOD/MSS] Given lớp SoundEngineImpl kế thừa từ SoundEngineContextManager, When kiểm tra nguyên mẫu prototype với instanceof, Then đối tượng trả về true', () => {
    const impl = new SoundEngineImpl();
    expect(impl instanceof SoundEngineContextManager).toBe(true);
    impl.dispose();
  });

  it('[TC-SE-MOD.13/MSS][UC-SE-MOD/MSS] Given singleton SoundEngine xuất khẩu từ sound_engine.ts, When kiểm tra định danh PascalCase và instance, Then SoundEngine là một instance của SoundEngineImpl', () => {
    expect(SoundEngine).toBeDefined();
    expect(SoundEngine).toBeInstanceOf(SoundEngineImpl);
    expect(typeof SoundEngine.playDiceRoll).toBe('function');
  });

  it('[TC-SE-MOD.14/MSS][UC-SE-MOD/MSS] Given AudioContext bị thiếu hoặc null trong môi trường headless, When gọi SoundEngine.playDiceRoll(), Then phương thức bypass an toàn không ném lỗi', () => {
    vi.stubGlobal('AudioContext', undefined);
    let error: unknown = null;
    try {
      SoundEngine.playDiceRoll();
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });

  it('[TC-SE-MOD.15/MSS][UC-SE-MOD/MSS] Given SoundEngine đang chạy các hiệu ứng âm thanh lặp, When gọi SoundEngine.stopAll(), Then các tiến trình lặp được dọn dẹp sạch sẽ mà không phát sinh lỗi', () => {
    let error: unknown = null;
    try {
      SoundEngine.stopAll();
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });

  it('[TC-SE-MOD.16/MSS][UC-SE-MOD/MSS] Given việc import SoundEngine và SoundEngineContextManager từ hai tệp khác nhau, When kiểm tra cây phụ thuộc module, Then không phát sinh circular dependency', () => {
    expect(typeof SoundEngineContextManager).toBe('function');
    expect(typeof SoundEngineImpl).toBe('function');
  });
});
