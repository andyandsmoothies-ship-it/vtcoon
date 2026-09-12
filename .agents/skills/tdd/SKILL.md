---
name: tdd
description: Load this skill whenever building features or fixing bugs using TDD, when the user mentions "red-green-refactor", wants integration tests, explicitly asks for test-first development, needs to verify AI-generated code, is working with legacy code that lacks tests, or when applying SOLID principles through test design. This skill enforces the Detroit (Classical) testing style — test observable state/output, not internal interactions. Use PROACTIVELY during any /implement workflow.
---

# Test-Driven Development

## Why TDD Matters

TDD isn't a philosophical preference — it's empirically proven. Landmark studies across Microsoft and IBM showed that strict TDD reduced pre-release defect density by **40% to 90%** at the cost of a **15% to 35%** increase in initial development time. That time penalty is absorbed entirely during the implementation phase, compressing the full Software Development Life Cycle by virtually eliminating downstream costs of late-stage bug resolution, manual regression testing, and technical debt remediation.

Recent longitudinal studies (2020-2025) confirm these findings at scale: projects with strict TDD procedures showed significantly lower defect-fixing commit rates and higher test coverage stability even as complex features were rapidly introduced.

> [!IMPORTANT]
> **The AI Amplifier (DORA 2025)**: AI acts strictly as an organizational amplifier. If a team has a weak testing culture, AI exponentially accelerates the creation of technical debt — generating legacy code at unprecedented speed. If a team practices disciplined TDD, AI becomes a powerful velocity multiplier. By writing the test first, you mathematically bound the problem space, defining the exact intent, requirements, and edge cases. The pre-existing test suite then acts as an immediate, deterministic, and automated verification mechanism for AI-generated code.

## Philosophy

**Core principle**: A TDD "test" is a **specification**, not a test. It's an example of how you expect to use the code you're about to write. You write the spec first (RED), kluge together just enough code to satisfy it (GREEN), then refactor until the code is high quality. The spec drives the design — hence "test-driven **design**."

**The TDD/BDD Connection**: Behaviour-Driven Development (BDD) was originally coined simply as a vocabulary shift for TDD to get people to stop focusing on "testing" and start focusing on "specifying behavior." True TDD consists of an **Outer Loop** (Customer/Acceptance tests defined via BDD/Gherkin) and an **Inner Loop** (Programmer-level unit tests). The outer loop acts as living documentation, while the inner loop acts as a design tool for code structure. Do not collapse the two, or you will write tests that are "too granular to communicate intent or too coarse to catch regression."

**Wishful Amnesia**: When writing a spec, forget how the system works internally. Ask: "What does the consumer need?" — not "What can the system do?" This consumer-first perspective is what makes specs survive refactors.

**Write Assertions First**: Before writing any setup code or mocks, write the final `expect()` or `Assert()`. This forces you to define the exact outcome you want. Once the assertion is clear, work backward to set up the state.

**Good specs** exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good spec reads like a requirement — "user can checkout with valid cart" tells you exactly what capability exists. They test behavior, not implementation details.

**Bad specs** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means. The warning sign: your spec breaks when you refactor, but behavior hasn't changed.

**Testability as Architecture**: Tests are part of the system's architecture, not an afterthought. Architectural principles like Single Responsibility apply strictly to test suites. Business rules must be isolated into components so that if they change, the test-change blast radius is minimized. Never test business logic indirectly through volatile layers (like the GUI) — this violates encapsulation and creates extreme fragility.

**Liskov Substitution in Tests**: Changes to the implementation (the client code) must be irrelevant to the tests as long as the observable behavior remains unchanged. If changing internal code breaks 100 tests, you have lost all safety and developers will resist necessary refactoring. A robust test suite enables change; fragile tests paralyze it.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Detroit vs. London Style

This project follows the **Detroit (Classical) style** of TDD. Understanding the difference is critical because it determines how you write every test.

| | Detroit (Classical) — **USE THIS** | London (Mockist) — Avoid |
|---|---|---|
| **Unit** | A module or group of coupled classes | A single class or function |
| **Dependencies** | Uses real collaborators; stubs only slow boundaries (DB, network) | Mocks all external dependencies |
| **Testing Focus** | State/Output — *what the object produces* | Interactions — *how the object works internally* |
| **Refactoring Resilience** | High — tests survive internal changes as long as output is constant | Low — tests break when implementation details change |

The modern industry consensus, driven by the need for maintainable software over long lifespans, leans heavily toward the Detroit style. As Uber's engineering teams discovered, over-mocking leads to a false sense of security where unit tests pass entirely in a vacuum but fail catastrophically upon integration. By focusing on testing state and observable behavior, your test suites act as an enabler of continuous change rather than an impediment.

See [mocking.md](mocking.md) for detailed guidelines on when to mock and the Detroit vs. London comparison.

## Spec-Tests vs Unit Tests

These are two different things that often happen at the same time. Don't confuse them.

| | Spec-Test (drives TDD) | Unit Test (guards regressions) |
|---|---|---|
| **Purpose** | Specifies new behavior, drives the design forward | Covers corner cases, failure modes, edge cases |
| **When written** | Before the code exists (RED phase) | After the code works (during or after REFACTOR) |
| **Who writes it** | Human defines intent; AI implements the code | AI can help write these |
| **Happy path?** | Usually yes — one clear usage example | No — boundary conditions, error paths |
| **If from /atdd** | The Gherkin scenarios ARE your spec-tests — don't re-spec them | Add these after the spec-tests pass |

> [!IMPORTANT]
> When specs arrive from the `/atdd` workflow, they ARE the RED starting point. Do not re-specify what ATDD already defined — go straight to GREEN. BDD (ATDD) defines the *edges of the box* at the macro level; TDD *fills it in* at the micro level. They are nested: a high-level BDD scenario fails first, prompting the developer into the granular TDD Red-Green-Refactor cycle to implement the underlying logic.

## Example-Based vs. Generative Testing

As you shift left on quality, you must decide between writing **Example-Based Tests** and **Generative (Property-Based) Tests (PBT)**. 

| | Example-Based (Standard TDD) | Generative (Property-Based) |
|---|---|---|
| **What it tests** | Specific inputs and their known outputs (e.g., "Given cart with $10 item, tax is $1") | Universal truths/invariants (e.g., "Tax is always > 0 for valid carts") |
| **How data is created** | Hardcoded by the developer | Auto-generated randomly by the testing framework (e.g., FsCheck, glados) |
| **Primary Value** | Excellent for UI workflows, business logic chains, and documenting expected behavior. | Discovers the "unknown unknowns." Destroys brittle, hardcoded implementations (The "Enterprise Developer From Hell"). |
| **When to use** | Use for **Outer Loop ATDD** and standard **Inner Loop TDD** features. | Use for pure functions, data transformers, offline-sync state machines, serialization, and algorithms. |

**Rule of Thumb:** If you are testing a complex calculation, a sync engine, or a serialization contract, TDD with Example-Based tests is insufficient because you cannot anticipate every edge case. You must drop down into Property-Based Testing to let the machine fuzz your logic. See the **testing-strategy** skill for the "7 PBT Patterns."


## Anti-Pattern: The Mirror Function Trap

**DO NOT copy-paste private production methods into your test file.**

When testing private logic during the RED phase, never declare a clone of the production function inside the test file just to make it compile. Testing a clone decouples the test from reality—it will pass even if the real system breaks.

**Correct approach:** Test observable behavior through the public API. If you must test a private internal method directly, expose the real production logic using your language's standard testing access modifier. Never write business logic inside a test namespace.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" — treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes — they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

Before writing any code:

- [ ] Identify opportunities for [deep modules](deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](interface-design.md)
- [ ] List the behaviors to test (not implementation steps)

**Document & Proceed**: Do NOT pause to ask the user which behaviors to test or for approval on the plan. Default to testing the most critical, riskiest paths first (auth, data mutation, error handling). Document your chosen test scope in a short **"Test Plan"** comment at the top of the test file and proceed immediately.

**Only halt** if the public interface for the feature is completely undefined and cannot be inferred from existing code, architecture docs, or the upstream `/atdd` spec.

**You can't test everything.** Focus testing effort on critical paths and complex logic, not every possible edge case.

> [!IMPORTANT]
> **Don't write tests for what the type system already guarantees.** If TypeScript enforces a shape, a required field, or a return type — trust it. Testing that a function "returns a string" when the signature says `(): string` is a shit test. Reserve tests for *behavior* the compiler can't see: business rules, state transitions, conditional logic, and edge cases.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

Hacks are expected in GREEN: hardcoded values, duplication, everything in one file. The goal is feedback speed — prove the spec is correct before investing in structure.

This is your tracer bullet — proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication in production code
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural — TDD organically drives Single Responsibility and Dependency Inversion because code must be testable from inception
- [ ] Look for new abstractions — simplifying often means creating MORE things, not fewer
- [ ] Organize boundaries — separate files, directories, new interfaces
- [ ] **Refactor Test Code**: Treat test code as first-class code. Remove obsolete tests and extract duplicated setup logic, but **prefer clarity over DRY**. Avoid complex base classes for tests; reading a test should not require jumping through 3 parent classes.
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

## Working with Legacy Code

When you encounter existing code that lacks tests, do NOT attempt a full rewrite. Load [legacy-code.md](legacy-code.md) for the complete strategy. The key steps are:

1. **Find a Seam** — a point where behavior can be altered without editing the code at that location
2. **Write Characterization Tests** — capture the current behavior (including bugs) as a safety net
3. **Refactor safely** within the characterization perimeter
4. **Apply TDD** for all new changes going forward


## TDD in the Agentic Era (Adam Tornhill 2026 Shift)

Classic micro-TDD (increments of 5-10 lines of code) was optimized for **human working memory**. Forcing an AI agent through micro-increments creates extreme overhead, token bloat, and context fragmentation without leveraging the agent's strength: reasoning across feature boundaries.

### The Mental Model Shift: Human Flow vs. Agentic Flow

```
[ HUMAN FLOW: TDD CỔ ĐIỂN ]                   [ AGENTIC FLOW: TDD KỶ NGUYÊN AGENT ]
(Tối ưu cho nhận thức não người)              (Lặp ở cấp độ hệ thống - Iterate at system level)

  ┌──────────────┐                              ┌─────────────────────────────┐
  │ RED ➔ GREEN  │                              │ 1. SPECIFY (XÁC ĐỊNH)       │
  │     Unit     │                              │ Yêu cầu & E2E Tests ĐỎ      │
  └──────┬───────┘                              └──────────────┬──────────────┘
         ▼                                                     ▼
  ┌──────────────┐                              ┌─────────────────────────────┐
  │ RED ➔ GREEN  │                              │ 2. DELEGATE (ỦY THÁC)       │
  │     Unit     │                              │ Agent tự sinh toàn bộ:      │
  └──────┬───────┘                              │ Code, Unit Tests trên hệ    │
         ▼                                      │ thống trong 1 lượt duy nhất │
  ┌──────────────┐                              └──────────────┬──────────────┘
  │ RED ➔ GREEN  │                                                     ▼
  │     Unit     │                              ┌─────────────────────────────┐
  └──────────────┘                              │ 3. VALIDATE (THẨM ĐỊNH)     │
                                                │ Chạy E2E Tests & nghiệm thu │
  Vòng lặp vi mô 5-10 dòng code                 └──────────────┬──────────────┘
  lặp đi lặp lại hàng chục lần.                                │
                                                Vòng phản hồi Người + Agent
                                                (Human + Agent feedback loop)
```

In the Agentic Era, TDD operates as a 3-step system loop:

### 1. Feature-Level Abstraction Boundary (Step 1: Specify)
- **Define the boundary at the Feature/E2E level**: Humans and architects focus on defining the acceptance boundary via high-level integration or End-to-End (E2E) contracts (The Golden Path / Living User Journey). Tests serve as the human/agent abstraction boundary.
- **One-Sweep Implementation (Step 2: Delegate)**: Once the feature boundary test is locked in and FAILS (RED), delegate the complete implementation across the system to the agent in **one sweep**. Humans do not micromanage low-level internal helper functions.
- **System-Level Validation (Step 3: Validate)**: Run the E2E acceptance suite to validate the outcome. If errors occur, provide feedback at the system level (`Human + Agent feedback`).

### 2. Double-Entry Bookkeeping (Zero Bug-Codification)
- AI agents frequently attempt to fix a failing test by either:
  - (a) Modifying or relaxing the test assertion to match buggy implementation behavior.
  - (b) Deleting or commenting out the failing test case.
- **Strict Rule**: The test assertion is **immutable** during the implementation pass. Tests represent the SSOT requirement. The code must bend to the test, never the test to the code.

### 3. Purpose of RED: Proving Test Harness Sensitivity
- In human TDD: RED proved the developer had work left to do.
- In agentic TDD: RED proves the **test harness has the sensitivity to catch bugs** in AI-generated code. Always execute an **Adversarial Inversion Gate** (deliberately mutate 1 logic line to confirm the test turns RED).

### 4. Machine-Enforced Architecture
- Architecture boundaries (no DB calls from UI, no circular dependencies) are enforced mechanically by linters and compiler boundary rules (`eslint-plugin-boundaries`, `ArchUnit`, `import_lint`), not manual eyeball inspection.

## Checklist Per Cycle


```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
[ ] Test is strictly independent (does not rely on execution order or shared mutable state)
[ ] Assertions are minimized (one logical condition per test to pinpoint failures)
[ ] Mocking follows Detroit style (real collaborators; stubs only at slow boundaries)
```

## Project-Agnostic Rules

These apply regardless of language, framework, or platform:

- **Avoid Raw Selectors** — Do not assert against implementation-specific identifiers (e.g., CSS class names, widget keys, internal method names). Assert against *observable behavior* (status codes, returned values, visible state).
- **The Mirror Function Trap** — NEVER copy-paste production logic into a test file to bypass access modifiers. Testing cloned functions completely decouples the test from production reality. If a private method must be unit-tested directly, import `package:meta/meta.dart` (or `.NET` `InternalsVisibleTo`) and annotate the real production method with `@visibleForTesting` to expose it.
- **Abstraction Layer** — If your project has a shared test helper, driver, or factory (e.g., `WebApplicationFactory`, `WidgetTester`, `AppDriver`, `render()`), always use it. Never bypass your project's established test scaffolding.
- **Naming Convention** — Test names must read as specifications: `Entity_Action_ExpectedOutcome` (e.g., `Auditor_SubmitWithMissingField_Returns400`, `Cart_Checkout_DecreasesStock`). Never use `Test1`, `MyTest`, or `It_Works`.
- **One Assertion Per Concept** — Each test should prove exactly one behavioral claim. Multiple assertions are acceptable only if they all verify the same logical outcome.
