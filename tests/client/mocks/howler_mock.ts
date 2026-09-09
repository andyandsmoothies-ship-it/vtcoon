// [UI-S05/MSS] Pure Mock for Howler in Vitest Node.js environment
export interface MockHowlOptions {
  src: string[];
  html5?: boolean;
  loop?: boolean;
  volume?: number;
}

export class MockHowl {
  public options: MockHowlOptions;
  public isPlaying = false;
  public currentVolume = 1;
  public lastFade: { from: number; to: number; duration: number } | null = null;
  public playCount = 0;
  public stopCount = 0;

  constructor(options: MockHowlOptions) {
    this.options = options;
    this.currentVolume = options.volume ?? 1;
  }

  public play(): number {
    this.isPlaying = true;
    this.playCount++;
    return 1;
  }

  public stop(): this {
    this.isPlaying = false;
    this.stopCount++;
    return this;
  }

  public fade(from: number, to: number, duration: number): this {
    this.lastFade = { from, to, duration };
    this.currentVolume = to;
    return this;
  }

  public volume(): number;
  public volume(vol: number): this;
  public volume(vol?: number): number | this {
    if (vol === undefined) return this.currentVolume;
    this.currentVolume = vol;
    return this;
  }

  public currentRate = 1;
  public rate(): number;
  public rate(r: number): this;
  public rate(r?: number): number | this {
    if (r === undefined) return this.currentRate;
    this.currentRate = r;
    return this;
  }

  public playing(): boolean {
    return this.isPlaying;
  }

  public mute(_muted: boolean): this {
    return this;
  }

  public on(_event: string, _fn: () => void): this {
    return this;
  }
}

export const mockHowler = {
  isMuted: false,
  mute(muted: boolean): void {
    mockHowler.isMuted = muted;
  },
  ctx: {
    state: 'suspended',
    async resume(): Promise<void> {
      mockHowler.ctx.state = 'running';
    },
  },
};
