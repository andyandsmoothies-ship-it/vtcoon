---
name: concurrency-patterns
description: >
  Implement thread-safe code, mutexes, semaphores, async/await patterns, and
  concurrent data structures. Use when handling parallel operations, race
  conditions, or building high-performance concurrent systems.
---

# Concurrency Patterns

> [!NOTE]
> **Related skills:** For C#/.NET concurrency (async/await, Channels, Akka.NET), see `csharp-concurrency-patterns`. This skill covers language-agnostic patterns (TypeScript, Python, Go).

## When to Use

- Multi-threaded applications
- Parallel data processing
- Race condition prevention
- Resource pooling
- Task coordination
- High-performance systems
- Async operations
- Worker pools

## Quick Start

Minimal working example:

```typescript
class PromisePool {
  private queue: Array<() => Promise<any>> = [];
  private active = 0;

  constructor(private concurrency: number) {}

  async add<T>(fn: () => Promise<T>): Promise<T> {
    while (this.active >= this.concurrency) {
      await this.waitForSlot();
    }

    this.active++;

    try {
      return await fn();
    } finally {
      this.active--;
    }
  }

  private async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.active < this.concurrency) {
          resolve();
// ... (see reference guides for full implementation)
```

## Reference Guides

Detailed implementations in the `references/` directory:

| Guide | Contents |
|---|---|
| [Promise Pool (TypeScript)](references/promise-pool-typescript.md) | Promise Pool (TypeScript) |
| [Mutex and Semaphore (TypeScript)](references/mutex-and-semaphore-typescript.md) | Mutex and Semaphore (TypeScript) |
| [Worker Pool (Node.js)](references/worker-pool-nodejs.md) | Worker Pool (Node.js) |
| [Python Threading Patterns](references/python-threading-patterns.md) | Python Threading Patterns |
| [Async Patterns (Python asyncio)](references/async-patterns-python-asyncio.md) | Async Patterns (Python asyncio) |
| [Go-Style Channels (Simulation)](references/go-style-channels-simulation.md) | Go-Style Channels (Simulation) |
