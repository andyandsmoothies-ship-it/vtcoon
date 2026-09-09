// [UC-GAME-009/A3][TC-NET03.3/Adversarial]
// FIFO Mutex — Tuần tự hóa xử lý intent cho từng phòng đấu, ngăn ngừa Race Condition

export class IntentMutex {
  private readonly queues = new Map<string, Promise<unknown>>();
  private readonly counts = new Map<string, number>();

  runExclusive<T>(task: () => Promise<T> | T): Promise<T>;
  runExclusive<T>(roomCode: string, task: () => Promise<T> | T): Promise<T>;
  runExclusive<T>(
    roomCodeOrTask: string | (() => Promise<T> | T),
    maybeTask?: () => Promise<T> | T,
  ): Promise<T> {
    const roomCode = typeof roomCodeOrTask === 'string' ? roomCodeOrTask : '__DEFAULT__';
    const task = typeof roomCodeOrTask === 'function' ? roomCodeOrTask : maybeTask!;

    const currentCount = this.counts.get(roomCode) ?? 0;
    this.counts.set(roomCode, currentCount + 1);

    const prev = this.queues.get(roomCode) ?? Promise.resolve();
    const next = prev.then(async () => {
      try {
        return await task();
      } finally {
        const remaining = (this.counts.get(roomCode) ?? 1) - 1;
        if (remaining <= 0) {
          this.counts.delete(roomCode);
          this.queues.delete(roomCode);
        } else {
          this.counts.set(roomCode, remaining);
        }
      }
    });

    // Bắt lỗi để hàng đợi không bị kẹt khi một task thất bại
    this.queues.set(roomCode, next.catch(() => {}));
    return next;
  }

  isBusy(roomCode: string = '__DEFAULT__'): boolean {
    return (this.counts.get(roomCode) ?? 0) > 0;
  }

  getQueueDepth(roomCode: string = '__DEFAULT__'): number {
    return this.counts.get(roomCode) ?? 0;
  }

  clear(roomCode?: string): void {
    if (roomCode) {
      this.queues.delete(roomCode);
      this.counts.delete(roomCode);
    } else {
      this.queues.clear();
      this.counts.clear();
    }
  }
}
