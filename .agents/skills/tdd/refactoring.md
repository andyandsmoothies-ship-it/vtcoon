# Refactor Candidates

After the TDD cycle, look for:

## Production Code

- **Duplication** → Extract function/class
- **Long methods** → Break into private helpers (keep tests on public interface)
- **Shallow modules** → Combine or deepen
- **Feature envy** → Move logic to where data lives
- **Primitive obsession** → Introduce value objects
- **Existing code** the new code reveals as problematic
- **SOLID violations** — TDD naturally drives toward Single Responsibility and Dependency Inversion because code must be testable from inception. If your code is hard to test, it's telling you the design needs work.

## Test Code

Treat test code with the same refactoring rigor as production code. Tests that rot become a liability, not a safety net.

- **Remove obsolete tests** — If a test no longer covers an existing behavior (e.g., a feature was removed), delete it. Dead tests add noise.
- **Extract shared setup** into factory functions (`createUser()`, `buildCart()`) rather than inheritance hierarchies. Factory functions are grep-friendly and explicit.
- **Prefer clarity over DRY** — Duplicated setup in two tests is better than a 4-level deep class hierarchy that nobody can read. A test should tell its own story.
- **Rename for intent** — If a test name says "test1" or "testProcessing", rename it to describe the behavior: "expired coupon returns zero discount."
- **Split bloated tests** — If a test has 5 assertions covering 3 different behaviors, split it into 3 focused tests. Each test should pinpoint exactly one failure.
