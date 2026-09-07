---
name: de-sloppify
description: >
  Systematic code cleanup pipeline for .NET projects. Runs 8 ordered steps:
  formatting, unused usings, analyzer warnings, dead code removal, TODO resolution,
  sealed class audit, CancellationToken propagation, and organizing telemetry. Each step is verified
  independently with tests between phases. Load this skill when: "clean up",
  "de-sloppify", "tidy up", "remove dead code", "code cleanup", "housekeeping",
  "tech debt", "fix warnings", "seal classes", "add CancellationToken",
  "unused usings", "format code", "organize telemetry".
---

# De-Sloppify

## Core Principles

1. **The Broken Window Protocol (Pre-Flight)** — A single messy file gives AI permission to write messy code. If you open a legacy file and detect unused imports, warnings, or commented-out code, you MUST halt feature work and run this skill to repair the "broken windows" first.

2. **Systematic over random** — Follow the cleanup pipeline in order. Formatting first (because it touches every file), dead code last (because earlier steps might reveal it). Random cleanup misses things and creates merge conflicts.

2. **Verify after each step** — Run `dotnet build` and `dotnet test` after every step. A cleanup that breaks something is worse than the mess it was fixing. Never batch multiple cleanup types into one untested change.

3. **Safe removals only** — Before removing any code flagged as "dead," verify it isn't used via reflection, DI conventions, or serialization. `find_references` shows compile-time usage; grep for string-based references that Roslyn cannot track.

4. **One concern at a time** — Don't mix formatting fixes with logic changes. Don't combine dead code removal with new feature work. Separate concerns make code review possible and reverts safe.

5. **Commit between phases** — Each cleanup step gets its own commit. If Step 4 (dead code removal) breaks something, revert just that commit without losing the formatting and analyzer fixes from Steps 1-3.

## Patterns

### 8-Step Cleanup Pipeline

Execute in order. Verify (build + test) after each step. Commit each step separately.

**Step 1: Format All Code**
```bash
dotnet format
```
Why first: Formatting touches many files. Getting it out of the way prevents merge conflicts with subsequent steps. After this step, every file has consistent style.

Verify: `dotnet format --verify-no-changes` should report no changes.
Commit: `chore: apply dotnet format`

**Step 2: Remove Unused Usings**
```bash
dotnet format analyzers --diagnostics IDE0005
```
Why second: Unused usings are noise. Removing them makes subsequent analysis cleaner and reduces false positives in code review.

Verify: `dotnet build` should show no new errors. Run `dotnet test` if usings removal is extensive.
Commit: `chore: remove unused using statements`

**Step 3: Fix Analyzer Warnings**
```
MCP: get_diagnostics(scope: "solution", severityFilter: "warning")
```
Triage warnings by category:
- **Nullability warnings (CS8600-CS8604)** — Add null checks or use the null-forgiving operator with a comment explaining why null is impossible.
- **Unused variables (CS0219)** — Remove them.
- **Obsolete API usage (CS0618)** — Migrate to the recommended replacement.
- **IDE suggestions (IDE0xxx)** — Apply if they improve readability.

Fix in priority order: compiler warnings first, then analyzer suggestions.
Verify: `dotnet build` with zero new warnings. `dotnet test` passes.
Commit: `chore: fix analyzer warnings`

**Step 4: Remove Dead Code**
```
MCP: find_dead_code(scope: "solution", kind: "all")
```
For each result, perform a safety check before removing:

```
SAFETY CHECK BEFORE REMOVAL:
1. find_references(symbolName: "DeadType") — confirm zero compile-time references
2. Grep for string-based usage:
   - "nameof(DeadType)" — sometimes used in attributes or logging
   - Reflection: Type.GetType("DeadType"), Activator.CreateInstance
   - DI registration: services.AddScoped(typeof(IHandler<>), typeof(DeadType))
   - Serialization: [JsonDerivedType(typeof(DeadType))]
3. Check if it's a public API consumed by external packages
4. Check if it's referenced in configuration files (appsettings.json, etc.)

ONLY remove if all checks come back clean.
```

Verify: `dotnet build` and `dotnet test` pass.
Commit: `chore: remove dead code`

**Step 5: Resolve TODOs**
```bash
# Find all TODOs in the codebase
grep -rn "TODO\|HACK\|FIXME\|XXX" --include="*.cs"
```
For each TODO, decide:
- **Fix it now** — If it's small and self-contained, resolve it in this cleanup pass.
- **Create an issue** — If it requires significant work, create a GitHub issue and update the TODO with the issue number: `// TODO(#142): Implement retry logic`
- **Remove it** — If it's stale (the work was already done or is no longer relevant), delete the comment.

Verify: `dotnet build` and `dotnet test` pass.
Commit: `chore: resolve TODO comments`

**Step 6: Seal Non-Inherited Classes**
```
MCP: find_dead_code(scope: "solution", kind: "type") — for a list of types
MCP: get_type_hierarchy(typeName: "EachClass") — check for derived types
```
Add `sealed` to every class that:
- Has no derived types (confirmed via `get_type_hierarchy`)
- Is not a base class by design (no `virtual` or `abstract` members)
- Is not used as an open generic in DI registration
- Is not a test fixture base class

Why seal: Sealed classes enable compiler optimizations (devirtualization), communicate design intent ("this class is not meant to be extended"), and prevent accidental inheritance.

```csharp
// BEFORE
public class OrderValidator : AbstractValidator<CreateOrderCommand>
{
    public OrderValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
    }
}

// AFTER — sealed, because nothing inherits from it
public sealed class OrderValidator : AbstractValidator<CreateOrderCommand>
{
    public OrderValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
    }
}
```

Skip sealing:
- Classes with `virtual` members designed for override
- Classes used as `IClassFixture<T>` in tests (xUnit requires non-sealed)
- Base classes in a hierarchy (`Entity<T>`, `AggregateRoot`, etc.)

Verify: `dotnet build` and `dotnet test` pass.
Commit: `chore: seal non-inherited classes`

**Step 7: Propagate CancellationToken**
```
MCP: detect_antipatterns(severity: "warning") — filter for "missing CancellationToken"
```
Trace the async call chain from entry points (endpoints, handlers) through services to data access (DbContext, HttpClient). Ensure `CancellationToken` flows through every layer.

```csharp
// BEFORE — CancellationToken stops at the endpoint
app.MapGet("/orders/{id}", async (Guid id, AppDbContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    return order is not null ? Results.Ok(order) : Results.NotFound();
});

// AFTER — CancellationToken propagated to EF Core
app.MapGet("/orders/{id}", async (Guid id, AppDbContext db, CancellationToken ct) =>
{
    var order = await db.Orders.FindAsync([id], ct);
    return order is not null ? Results.Ok(order) : Results.NotFound();
});
```

Common propagation points:
- Minimal API endpoints: add `CancellationToken ct` parameter (auto-bound by ASP.NET Core)
- Mediator/MediatR handlers: already provided in `Handle(TRequest, CancellationToken)`
- EF Core: `SaveChangesAsync(ct)`, `ToListAsync(ct)`, `FindAsync([key], ct)`
- HttpClient: `GetAsync(url, ct)`, `PostAsync(url, content, ct)`

Verify: `dotnet build` and `dotnet test` pass.
Commit: `chore: propagate CancellationToken through async chains`

**Step 8: Sweep Historical Telemetry (Librarian)**
```powershell
# Organize development history and clean up trash to adhere to Rule 4 Environment Rules
New-Item -ItemType Directory -Force -Path ".agents/logs" -ErrorAction SilentlyContinue;
New-Item -ItemType Directory -Force -Path "dbquery" -ErrorAction SilentlyContinue;

# 1. Archive Test Logs & Text Outputs to .agents/logs/
Get-ChildItem -Path "server", "lib", "." -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in ".log", ".txt" } | Move-Item -Destination ".agents/logs" -Force -ErrorAction SilentlyContinue;

# 2. Archive Scratch Queries to dbquery/
Get-ChildItem -Path "server", "." -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -eq ".sql" } | Move-Item -Destination "dbquery" -Force -ErrorAction SilentlyContinue;

# 3. Delete Useless Compiler Dumps & Ephemeral DBs
Get-ChildItem -Path "server", "." -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -eq ".xml" } | Remove-Item -Force -ErrorAction SilentlyContinue;
Get-ChildItem -Path "test" -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq "_fake_db.sqlite" } | Remove-Item -Force -ErrorAction SilentlyContinue;
```
Why eighth: Agents often pipe test outputs or scratch logic directly to project folders during execution. This step acts as a Librarian, sorting valuable historical test logs and SQL queries into their proper archives (`.agents/logs/` and `dbquery/`), while permanently deleting useless compiler dumps.

Verify: Check `git status` to ensure no loose scratch files remain in the root, `server/`, `lib/`, or `test/`.
Commit: `chore: organize telemetry and clean up workspace`

### Cleanup Summary Report

After completing all steps, produce a summary:

```markdown
## De-Sloppify Report

| Step | Changes | Files Affected |
|------|---------|----------------|
| 1. Format | Applied consistent formatting | 23 files |
| 2. Usings | Removed 47 unused usings | 18 files |
| 3. Analyzers | Fixed 12 warnings (8 nullability, 3 unused vars, 1 obsolete) | 9 files |
| 4. Dead Code | Removed 3 unused types, 5 unused methods | 6 files |
| 5. TODOs | Fixed 2, created issues for 3, removed 1 stale | 5 files |
| 6. Sealed | Sealed 14 classes | 14 files |
| 7. CancellationToken | Added propagation to 8 async chains | 11 files |
| 8. Librarian | Organized logs to .agents/logs/ and dbquery/ | 0 files |

**Total: 8 commits, 86 files improved**
```

## Anti-patterns

### Mixing Cleanup with Feature Work

```
# BAD — one commit with formatting + new feature + dead code removal
git commit -m "Add order validation and clean up code"
# Impossible to review, impossible to revert the cleanup without losing the feature

# GOOD — separate commits, separate concerns
git commit -m "chore: apply dotnet format"
git commit -m "chore: remove dead code"
git commit -m "feat: add order validation"
```

### Removing Code Without Checking Reflection

```
# BAD — find_dead_code says it's unused, so delete it
MCP: find_dead_code → "PaymentProcessor has 0 references"
*Deletes PaymentProcessor*
# Runtime crash: DI container can't resolve IPaymentProcessor
# It was registered via: services.AddScoped(typeof(IPaymentProcessor), typeof(PaymentProcessor))

# GOOD — safety check before removal
MCP: find_dead_code → "PaymentProcessor has 0 references"
MCP: find_references(symbolName: "PaymentProcessor") → 0 compile-time refs
Grep: "PaymentProcessor" in *.cs, *.json → Found in DI registration
*Keep PaymentProcessor — it's used via DI convention*
```

### Sealing Classes That Tests Mock

```
# BAD — sealing a class that tests inherit from
public sealed class OrderService { ... }
// Test project: class MockOrderService : OrderService { ... } — COMPILE ERROR

# GOOD — check for test doubles before sealing
MCP: get_type_hierarchy(typeName: "OrderService") → no derived types in production
Grep: "OrderService" in test projects → no inheritance, only usage via interface
*Safe to seal — tests use IOrderService, not OrderService directly*
```

### Batch-Committing All Cleanup

```
# BAD — one giant commit with all 8 steps
git add -A && git commit -m "chore: cleanup everything"
# If sealing a class broke a test, you have to revert ALL cleanup to fix it

# GOOD — commit per step with verification between
Step 1 → verify → commit
Step 2 → verify → commit
...
# If Step 6 (sealed) breaks something, revert only that commit
```

### Running Cleanup Without Tests

```
# BAD — "it's just formatting and dead code, what could go wrong?"
dotnet format → commit (no test run)
Remove dead code → commit (no test run)
# Dead code was actually used by a test helper via reflection — tests broken

# GOOD — verify after every step
dotnet format → dotnet test → commit
Remove dead code → dotnet test → commit
```

## Decision Guide

| Scenario | Steps to Run | Notes |
|----------|-------------|-------|
| Full cleanup pass | All 8 | Dedicate a session to cleanup only |
| Quick tidy before PR | 1, 2, 6, 8 | Format, usings, check, sweep trash |
| After large feature merge | 1, 2, 3, 4, 8 | Clean up accumulated mess |
| Quarterly maintenance | All 8 | Schedule regular cleanup sprints |
| New team member onboarding | 1, 2, 3 | Get the codebase to a clean baseline |
| Before performance work | 4, 6 | Remove dead code, seal classes for devirtualization |
| After dependency upgrade | 2, 3 | Fix new analyzer warnings from updated packages |
| Pre-release hardening | All 8 | Full cleanup before a release |
| CI warning threshold exceeded | 3 | Focus on analyzer warnings only |
| Tech debt sprint | 4, 5, 8 | Dead code, TODOs, and trash cleanup |

---

## Hard Verification Gate (MANDATORY)

After completing the full 8-step pipeline (or any subset), run EXACTLY:

```
cmd /c python .agents/skills/de-sloppify/verify_clean_compilation.py server
```

- **Exit 0 (PASS):** Build is clean. Declare cleanup complete.
- **Exit 1 (FAIL):** Errors or warnings remain. Fix every reported diagnostic before declaring done.
- **2-Strike Rule:** Same error fails twice → STOP. Write `handoff_desloppify.md` and escalate.

> This gate cannot be bypassed. A "clean" de-sloppify session requires a provably zero-warning build.
