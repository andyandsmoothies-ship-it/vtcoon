---
name: atdd-quality-gates
description: Quality gates and checklists for ATDD test authoring. Ensures acceptance tests are infrastructure-clean, properly scoped, and handoff-ready before reaching the Builder. Load this skill whenever the /atdd workflow is invoked, when writing acceptance or integration tests, when classifying test failures as infrastructure vs. business, when preparing test handoff artifacts, or when the user mentions "smoke gate", "RED for the right reason", "test handoff", "ATDD quality", "infrastructure failure", "test classification", or "acceptance test". Use PROACTIVELY during any ATDD phase.
---

# ATDD Quality Gates

This skill provides the concrete checklists, templates, and rules that make the `/atdd` workflow produce tests the Builder can actually fix. Without these gates, Sentinel tends to ship tests that fail for infrastructure reasons (wrong passwords, missing routes, bad JSON property names) — and the Builder wastes entire cycles debugging test setup instead of writing production code.

## Why This Matters

In ATDD, there is a handoff boundary between the **Sentinel** (test author) and the **Builder** (implementer). The contract is: *every test must fail because the feature doesn't exist yet, not because the test itself is broken.* When that contract is violated, the Builder receives a puzzle — "is this a real RED or a broken test?" — and cannot proceed efficiently.

These quality gates enforce that contract.

---

## Gate 1: Infrastructure Pre-Flight Checklist

Before classifying any test failure, verify that the test infrastructure itself works. Run through this checklist for every test class:

| # | Check | What to Verify | Common Failure |
|---|-------|---------------|----------------|
| 1 | **Auth** | Can the test register users and log in? Does the password meet Identity policy (uppercase, digit, special char, min length)? | `BadRequest` from registration |
| 2 | **Database** | Does `TestWebApplicationFactory` create the schema? Are required seed tables populated? | `3D000: database does not exist` |
| 3 | **Routes** | Do the endpoints under test exist in the routing table (even if empty/returning 501)? A 404 from routing is not the same as a 404 from business logic. | Test expects 403 but gets 404 because route isn't registered |
| 4 | **Serialization** | Do your JSON assertions use property names that match the API's `JsonSerializerOptions` (camelCase vs PascalCase)? | `KeyNotFoundException` on response parsing |
| 5 | **Dependencies** | Are all NuGet/npm packages referenced in the test project's `.csproj`/`package.json`? Are `using` statements valid? | Build failure before tests even run |

If **any** of these checks fail, fix them before proceeding. These are Sentinel's responsibility, not the Builder's.

---

## Gate 2: Test Granularity Rules

Well-scoped tests are debuggable tests. When a test fails, the Builder should immediately know *which behavior* is broken.

### Rule: Single Concern per Test

Each test method tests exactly **one** acceptance criterion. If a test requires setup steps (e.g., create an area before creating a store), extract setup into helper methods that fail with clear messages.

**Why**: A 50-line test that chains register → login → create area → create store → assert breaks at step 3 and the Builder sees `KeyNotFoundException` with no idea which step caused it.

**Good** — setup is a named helper with its own assertion:
```csharp
// Arrange — use helper that fails clearly if setup breaks
var areaId = await _factory.CreateAreaAsync(client, "Test Area", "TST");
Assert.NotNull(areaId); // "Setup failed: could not create prerequisite area"

// Act — the ONE thing we're testing
var response = await client.PostAsJsonAsync("/api/stores", new { Name = "Store 1", AreaId = areaId });

// Assert — the ONE criterion
Assert.Equal(HttpStatusCode.Created, response.StatusCode);
```

**Bad** — everything inlined, failure point is ambiguous:
```csharp
var reg = await client.PostAsJsonAsync("/api/auth/register", new { Email = "test@test.com", Password = "123" });
var login = await client.PostAsJsonAsync("/api/auth/login", new { Email = "test@test.com", Password = "123" });
var token = (await login.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("token").GetString();
// ... 20 more lines before the actual assertion
```

### Rule: Max Chain Length ≤ 5

A test method must not contain more than **5 sequential HTTP calls** (or DB operations). This is the maximum: Arrange (1-3 setup calls) → Act (1 action) → Assert (1 verification). If you need more, split into separate tests or extract setup into `TestWebApplicationFactory` helper methods.

**Why 5?** It maps to realistic integration tests: register user + login + create prerequisite + perform action + verify result. Beyond 5, you're testing a workflow, not a criterion.

### Rule: One Scenario File Per Slice (Anti-Collision)

When writing ATDD tests, **DO NOT** append to an existing mega-file. You must scaffold a **new, dedicated test file** for the current feature slice.

**Why:**
1. **Parallel Execution:** Prevents unrecoverable file corruption and Git merge conflicts when multiple AI agents or human developers work simultaneously.
2. **Blast Radius:** Keeps test failures isolated to a single, readable file.

---

## Gate 3: Structured Smoke Gate Report

After writing all tests and running them, produce a **mandatory classification table**. Do not use free-form text like "tests are RED as expected."

### Template

Include this table in the specs artifact:

```markdown
## Smoke Gate Report

| Test Name | Status | Type | Error Summary |
|-----------|--------|------|---------------|
| Create_Area_Returns_Created | RED | ✅ Business | POST /api/areas returns 404 (route not implemented) |
| Auditor_Cannot_Create_Area | RED | ❌ Infra | Expected 403 but got 404 — route not registered yet |
| Register_User_Fails | RED | ❌ Infra | Password "123" doesn't meet Identity policy |
| Store_FK_Points_To_Area | RED | ✅ Business | AreaId FK column not yet added to stores table |

### Verdict
- ❌ 2 infrastructure failures found — fixing before handoff
```

### Classification Rules

- **✅ Business**: The test fails at a **domain assertion** because the feature doesn't exist yet. The error message directly relates to the acceptance criterion (e.g., "expected NotFound because entity doesn't exist yet").
- **❌ Infra**: The test fails at **setup, auth, routing, serialization, or DB schema** — something that should work regardless of whether the feature is implemented. This is Sentinel's bug.
- **⚠️ Ambiguous**: The test fails but the root cause could be either. Sentinel must investigate and reclassify before handoff.

### Gate Verdict

- ✅ All failures are `Business` → proceed to handoff
- ❌ Any `Infra` or `Ambiguous` failure exists → fix it, re-run, update the table

---

## Gate 4: Skip-With-Reason Protocol

Sometimes Sentinel discovers that an AC **cannot be tested** due to a pre-existing production bug, a missing dependency, or a framework limitation. Rather than commenting out the test (making it invisible to test runners), use the framework's skip mechanism.

### xUnit (.NET)
```csharp
[Fact(Skip = "Blocked: LINQ translation bug in GetAnalytics — see issue #42")]
public async Task GetAnalytics_Accepts_AreaId_Query_Parameter()
{
    // Test body stays intact for when the blocker is resolved
}
```

### Vitest / Jest (TypeScript)
```typescript
it.skip('handles analytics area filter — blocked by LINQ bug #42', async () => {
    // ...
});
```

### Why Not Comment Out?

| Approach | Visible in Test Report | Reminder to Fix | Countable |
|----------|:---------------------:|:---------------:|:---------:|
| `[Fact(Skip = "reason")]` | ✅ Shows as "Skipped" | ✅ Reason displayed | ✅ In test count |
| `// commented out` | ❌ Invisible | ❌ Forgotten | ❌ Not counted |

Always log the deferral in the specs artifact with the blocker description.

---

## Gate 5: Infrastructure Map for Builder Handoff

The specs artifact must include a section that gives the Builder everything they need to understand the test infrastructure without reverse-engineering it.

### Template

```markdown
## Test Infrastructure Map

### Helper Methods
| Method | Signature | Behavior |
|--------|-----------|----------|
| `RegisterUserAsync` | `(HttpClient, email, password, role)` | Creates a user via POST /api/auth/register |
| `LoginBootstrapAdminAsync` | `(HttpClient)` | Logs in as seed admin, returns JWT token |
| `CreateAuthenticatedClient` | `(role)` | Returns HttpClient with Bearer token for given role |
| `CreateAreaAsync` | `(HttpClient, name, code)` | Creates area via API and returns the area ID |

### Seed Data
- **Admin user**: `admin@checkly.test` / `Admin123!` (seeded by `TestWebApplicationFactory`)
- **Roles**: `admin`, `manager`, `auditor`
- **Database**: Fresh `checkly_test` PostgreSQL database, recreated per test run

### Auth Tokens
| Role | How to Get | Permissions |
|------|-----------|-------------|
| Admin | `CreateAuthenticatedClient("admin")` | Full CRUD on all entities |
| Auditor | Register new user + assign "auditor" role | Read-only + submit audits |

### Expected Response Shapes
```json
// POST /api/areas → 201 Created
{ "id": "guid", "name": "string", "code": "string" }

// GET /api/areas → 200 OK
[ { "id": "guid", "name": "string", "code": "string" } ]
```

### Known Limitations
- `ReminderService` hosted service fires during test startup — produces log noise but doesn't affect tests
- Admin bootstrap uses `EnsureDatabaseCreated()` with static lock — first test class to run initializes the DB
```

Adapt this template to the specific project's test infrastructure. The goal is that a Builder reading this section can understand the test setup without reading `TestWebApplicationFactory.cs`.

---

## Gate 6: Full-Stack Coverage Audit

When a slice spans **multiple technology layers** (e.g., server C# endpoint + Flutter Dart UI), Sentinel MUST write tests on **every layer** that the slice touches. A server-only test suite for a full-stack feature is incomplete — the Builder can implement the backend and skip the frontend (or vice versa) without any test catching it.

### Rule: Layer Parity

For each slice in the specs artifact, classify the layers involved:

| Layer | Example Test |
|-------|-------------|
| **Server** (C#) | Integration test hitting the HTTP endpoint via `TestWebApplicationFactory` |
| **Client** (Flutter) | Widget existence test — verify the widget/page renders, the button exists, or the API service method compiles |
| **Client** (React/PWA) | Component render test or E2E test |

If a slice touches **N layers**, Sentinel must produce tests for **all N layers**.

### Why This Matters

**Incident**: Slice 2 (CreateUser) specified both `CreateUser.cs` [NEW] and `user_management_page.dart` [MODIFY] with a FAB + form. ATDD only wrote server integration tests (`AdminUserManagementTests.cs`). The Builder implemented the server endpoint but never added the Flutter FAB — and all 7 ATDD tests passed GREEN. The missing UI was only caught during manual device testing.

### Minimum Client-Side Tests

Client tests don't need full widget tree rendering. At minimum, verify **compilation + existence**:

```dart
// Flutter: verify widget exists and API method compiles
test('CreateUser FAB exists on UserManagementPage', () {
  // Widget class is importable (compile gate)
  expect(UserManagementPage, isNotNull);
  // API service has the method (compile gate)
  expect(AdminApiService, isNotNull);
});
```

```csharp
// If the client is a Blazor/React app, verify the component file exists
// or the API client method compiles
```

For higher confidence, use `tester.pumpWidget()` to verify the FAB renders:

```dart
testWidgets('UserManagement has Add User FAB', (tester) async {
  await tester.pumpWidget(MaterialApp(home: UserManagementPage()));
  expect(find.byType(FloatingActionButton), findsOneWidget);
  expect(find.text('Add User'), findsOneWidget);
});
```

---

## Gate 7: Meaningful Test Checklist

Infrastructure gates (1-6) verify tests are *buildable*. This gate verifies tests are *meaningful*. AI agents commonly produce tests that pass all infrastructure checks but test nothing useful — asserting on data shapes, echoing input values back, or only testing happy paths.

Before handoff, Sentinel must verify **every test** against these 5 checks:

| # | Check | Question to Ask | 🚩 Flop Signal |
|---|-------|-----------------|----------------|
| 1 | **Behavior, Not Shape** | Does this test verify a *business rule* or *user-visible behavior*? | Test only checks property names, data types, or response structure |
| 2 | **Survives Refactor** | Would this test pass if internals changed but behavior stayed the same? | Test asserts on DB column values, internal class names, or private state |
| 3 | **Meaningful Assertion** | Does the assertion prove something *non-trivial* about the system? | `Assert.NotNull()`, `Assert.True(response.IsSuccessStatusCode)` without checking what was returned |
| 4 | **Edge & Hostile Testing** | Are boundary limits (max/min), concurrency (double-submit), and hostile cases (IDOR/403) tested? | All tests are happy-path only — ignoring boundaries, rate limits, or authorization |
| 5 | **Spec-Readable Name** | Does the test name read like a specification a non-engineer could understand? | `Test1`, `CreateStore_Works`, `ShouldReturnOk` |

### Examples

**Flop test** (passes Gate 1-6 but fails Gate 7):
```csharp
[Fact]
public async Task CreateStore_Works()
{
    var response = await client.PostAsJsonAsync("/api/stores", new { Name = "Store 1" });
    Assert.NotNull(response);  // ← Meaningless: every non-crashing call passes
    var body = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.Equal("Store 1", body.GetProperty("name").GetString()); // ← Shape: echoes input
}
```

**Meaningful test** (passes Gate 7):
```csharp
[Fact]
public async Task Auditor_Cannot_Create_Store()
{
    // Arrange — auditor role (not admin)
    var client = await _factory.CreateAuthenticatedClient("auditor");

    // Act — attempt to create a store
    var response = await client.PostAsJsonAsync("/api/stores", new { Name = "Store 1", AreaId = areaId });

    // Assert — business rule: only admins can create stores
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
}
```

---

## Quick Reference Checklist

Use this as a final pre-handoff gate. Every box must be checked:

- [ ] **Gate 1**: All 5 infrastructure checks pass
- [ ] **Gate 2**: No test exceeds 5 HTTP calls; each tests one AC
- [ ] **Gate 3**: Smoke Gate table is complete with zero `Infra`/`Ambiguous` failures
- [ ] **Gate 4**: Deferred ACs use `Skip` attribute, not comments
- [ ] **Gate 5**: Infrastructure Map is included in specs artifact
- [ ] **Gate 6**: Full-stack slices have tests on **every layer** (server + client)
- [ ] **Gate 7**: Every test passes the Meaningful Test Checklist (behavior, not shape)

Only after all gates pass should Sentinel proceed to Phase 3 (Handoff).

