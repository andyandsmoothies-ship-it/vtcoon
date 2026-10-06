---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** If working in an isolated worktree, it should have been created via the `superpowers:using-git-worktrees` skill at execution time.

**Save plans to:** `.agents/plans/PLAN_[TICKET].md`
- Active execution plans are scaffolding stored in `.agents/plans/PLAN_[TICKET].md` (Single Source of Truth, zero duplicate files).
- Upon completion, concise reports are persisted to `docs/reports/improvements/IMP-[ID]-[slug]_report.md`.

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## Pre-Drafting Physical Verification (The 5 Mandatory Checks)

Before writing any task steps or code snippets, you MUST physically inspect the disk using tools:
1. **Call-Site Exhaustion (`grep_search`)**: Run `grep_search` on every symbol/function you plan to change across `tests/` and `src/`. Tabulate every caller and every affected test case. Zero unverified assumptions.
2. **Subtractive Deletion Range (`view_file`)**: Run `view_file` on target files to inspect exact lines being replaced or deleted. Record exact start/end line numbers and functions to delete. Zero hand-wavy "refactor later".
3. **Banned Mechanism Check**: Cross-check proposed snippets against project constraints (e.g. anti-programmer-art primitives, bare strings, loose types).
4. **Physical Snippet LOC Count Verification**: When writing drop-in replacement snippets for tasks, physically count the lines of the snippet (`snippet.split('\n').length`). If a planned abstraction or proxy exceeds 100 LOC, design it as an isolated standalone file upfront, preventing accidental LOC ceiling breaches.
5. **Collection & Adapter Protocol Parity**: When specifying a Proxy or Adapter emulating a standard collection (`Map`, `Set`, `List`, `Dict`), specify all standard protocol methods (CRUD, iteration, size, entries). Never plan partial stubs. For scalar variables, plan simple local single-entry collections (`new Map([[k, v]])`) with sync-back instead of dynamic proxies.

## File Structure

Before defining tasks, use `list_dir` and `grep_search` to map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan is reasonable.
- When integrating with external APIs or libraries, use `search_web` and `read_url_content` to fetch current documentation before locking in the file structure

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Task Right-Sizing & TDD Separation

A task is the smallest unit that carries its own contract and test cycle.
- **Plans specify WHAT**: Architecture, State Transitions, Type/DTO Interfaces, Function Signatures, Invariants, and Test Matrices.
- **Station 1 (QA Tester) specifies EXPECTATIONS**: Writes failing contract tests in `tests/**` (TDD RED) asserting observable outcomes.
- **Station 2 (Implementer) implements HOW**: Writes minimal code in `src/**` to make contract tests pass (TDD GREEN).
- **Plan Code Bloat Ban**: Full copy-pasting of entire UI components, stylesheets, dispatchers, or test function bodies into plans is strictly BANNED. Reserved code snippets (`<<<< ==== >>>>`) are strictly for subtle core math or concurrency locks (maximum 1-3 snippets per plan, each <= 30 LOC). Target plan size <= 400 lines (warning at 600 lines).

## Task Structure (Lean Specification)

````markdown
### Task N: [Component / Seam Name]

**Files:**
- Create/Modify: `exact/path/to/file.ts`
- Subtractive Cleanup: Delete obsolete states, listeners, flags, or dead code paths
- Test File: `tests/contracts/exact_path.test.ts`

**Contract & Signatures:**
```typescript
export interface TargetContract {
  id: string;
  payload: DtoType;
  execute(intent: IntentDto): ResultOutcome;
}
```

**Behavior & Acceptance Criteria:**
- Enforces domain invariants: [Invariant 1, Invariant 2].
- State transition: [State A] -> [State B] upon trigger.
- Error handling: Emits [REASON_CODE] on invalid inputs.

**Station 1 Test Scenarios (Given / When / Then):**
- `[TC-XX.01/MSS]`: Given [precondition], When [action], Then [observable outcome / state change].
- `[TC-XX.02/A1]`: Given [boundary/error condition], When [invalid action], Then [error reason / rollback].
````

## No Placeholders vs. Lean Specifications

Every task must contain the actual contracts and acceptance criteria an engineer needs.

**These are plan failures (BANNED):**
- Vague hand-waving: "TBD", "TODO", "implement later", "fill in details", "add validation" without specifying rules or error reasons.
- Unanchored assumptions: "several callers unaffected" without verified search counts.
- Unreferenced symbols: References to types or functions never defined anywhere in the plan or codebase.

**These are LEAN SPECIFICATIONS (MANDATORY & ENCOURAGED):**
- Exact TypeScript/Language interfaces, DTO schemas, and function signatures.
- Given/When/Then behavioral contracts with explicit Flow Taxonomy tags (`[TC-XX/MSS]`).
- Do NOT write full implementation code or full test code inside the plan. Let Station 1 (`qa-tester`) and Station 2 (`implementer`) perform true TDD.

## Rich Formatting

Use Antigravity's artifact formatting to make plans scannable:

- **File links:** Always use clickable links: `[filename](file:///absolute/path/to/file)` or `[function](file:///path/to/file#L10-L20)`
- **Diff blocks:** Show code changes as diffs when modifying existing files:
  ```diff
  -old_function_name()
  +new_function_name()
   unchanged_line()
  ```
- **GitHub alerts:** Flag critical requirements and breaking changes:
  > [!IMPORTANT]
  > This change requires a database migration

- **Mermaid diagrams:** Use in the architecture section and for complex data flows within tasks

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements it? List any gaps.

**2. Placeholder scan:** Search your plan for red flags — any of the patterns from the "No Placeholders" section above. Fix them.

**3. Type consistency:** Do the types, method signatures, and property names you used in later tasks match what you defined in earlier tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add the task.

## Execution Handoff

After saving the plan (using `write_to_file` with `IsArtifact: true`, with the implementation-plan type and `RequestFeedback: true` in `ArtifactMetadata`), confirm execution:

**"Plan complete and saved. Ready to execute with subagent-driven-development?"**

Use `ask_question` to present the confirmation.

User feedback may arrive as inline artifact comments — treat each comment as a change request against that section and confirm resolution in the artifact.

**REQUIRED SUB-SKILL:** Use superpowers:subagent-driven-development
- Fresh subagent per task + two-stage review (spec compliance + code quality)
- Define implementer/spec-reviewer/code-reviewer types upfront
