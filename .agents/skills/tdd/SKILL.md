---
name: tdd
description: Test-driven development. Use when building features or fixing bugs test-first, when the user mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle: consult them before and during the loop, not after.

When exploring the codebase, read `docs/domain/gotchas/` so test names and interface vocabulary match the project's domain invariants, and respect established architectural boundaries.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification: "player cannot upgrade mortgaged property" tells you exactly what capability exists, and it survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams: where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them. No test is written at an unconfirmed seam. Testing effort must land on critical paths, domain validators, and state machines instead of private internal helpers.

Ask: "What's the public interface, and which seams should we test?"

When the shape of that interface is itself in question (how deep the module is, where the seam belongs, what the interface should expose), call the Skill tool with "codebase-design" for the vocabulary (module, interface, depth, seam, adapter, leverage, locality).

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or verifies through a side channel. The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does (`expect(calculateRent(tile)).toBe(tile.baseRent * 2)` recomputed identically), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth: a known-good literal, a worked example, or domain rules.
- **Horizontal slicing**: writing all tests first, then all implementation. Bulk tests verify *imagined* behavior: you test the *shape* of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead: one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.
- **Anti-TIDD Violation**: NEVER add exports, props, or methods just to make testing easier (`@visibleForTesting`, `ForTesting`). Every export in `src/**` must have production consumers. Seam discipline requires testing observable outputs through legitimate public entry points.

## Rules of the loop

- **Red before green (Adversarial Inversion).** Write the failing test first, then only enough code to pass it. The test must fail because of runtime logic assertions, never because of syntax or missing imports. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Double-Entry Bookkeeping.** The test assertion is immutable during the implementation pass. The code bends to the test, never the test to the code.
- **Refactoring is not part of the loop.** It belongs to the review stage, not the red → green implementation cycle.
