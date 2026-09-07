# Working with Legacy Code

Michael Feathers defined legacy code simply and brutally as **"code without tests."** Without a testing safety net, developers operate in continuous fear, forced to use fragile patches that further degrade the architecture because they can't predict the cascading effects of structural refactoring.

## The Legacy Code Paradox

You need tests to refactor safely, but the code is often too tightly coupled to be tested without being refactored first. This is the primary paradox of legacy modification.

## The Legacy Code Change Algorithm

To break the deadlock, follow these steps:

### 1. Find a Seam

A **Seam** is a point in the code where behavior can be altered or intercepted *without editing the code at that location*. Common seam techniques:

- **Dependency Injection** — Pass a dependency in rather than constructing it internally
- **Subclassing** — Override a method in a test subclass to intercept behavior
- **Interface Abstraction** — Extract an interface from a concrete class so tests can provide a fake
- **Extract Method** — Pull a hard-to-test section into its own method, making it overridable

### 2. Write Characterization Tests

Unlike standard TDD where tests define *desired* behavior, **Characterization Tests** blindly capture the *current* behavior of the legacy module — including all its bugs, undocumented quirks, and precise outputs.

```typescript
// Characterization Test — documents what the code ACTUALLY does
test("calculateDiscount with expired coupon returns full price", () => {
  // We don't know if this is correct behavior or a bug.
  // We're locking it down so we can safely refactor.
  const result = calculateDiscount(cart, expiredCoupon);
  expect(result).toBe(cart.total); // No discount applied
});
```

This provides a temporary, automated perimeter around the legacy logic. The goal is NOT to define what the code *should* do — it's to ensure you don't accidentally change what it *currently* does.

### 3. Refactor Within the Perimeter

With characterization tests in place, you can safely perform minimal, conservative refactoring:
- Extract methods to clarify logic
- Break hard dependencies using seams
- Bring the module under fine-grained unit test coverage

### 4. Apply TDD for New Changes

Once stabilized, any new feature additions or bug fixes within that module must strictly follow Red-Green-Refactor. Applied consistently over time, this acts as a continuous modernization engine — gradually replacing brittle legacy code with verified, modular architecture.

> [!TIP]
> **Hotspot analysis**: Use `git log --format='%H' -- path/to/file | wc -l` to find the most frequently changed files. Target these hotspots first — they deliver the highest return on test investment.
