# PILLAR VII: DETROIT CLASSICAL TESTING & CONTRACT TRAPS

> **Scope**: `tests/**`, `scripts/check_evidence.mjs`  
> **Gotchas SSOT Rule**: Concise architectural invariant rulebook. Anti-Changelog: Keep technical formulas, limits, and negative constraints; omit narrative stories. Size ceiling: <= 15 KB.

---

1. **Adversarial Inversion Gate (RED First)**:
   - Contract tests MUST be written first and verified to FAIL (RED) strictly due to domain assertion mismatches before touching production code in `src/**`.

2. **Atomic Contract Mandate**:
   - Each atomic test case contains 1–4 assertions focused on a single behavior. Loops (`for`, `forEach`) in `it()` are strictly forbidden. Static checklist tests (`fs.existsSync`, `typeof fn`, testing LOC inside unit tests) are banned.

3. **Universal 5-Facet Matrix**:
   - Test suites must cover 5 dimensions: (1) Boundary & edge values; (2) Reactivity; (3) Resource disposal/cleanup; (4) Error defense; (5) Blast radius.

4. **Detroit Classical State Assertions**:
   - Assert observable system state and outputs; spying or mocking internal private module methods is forbidden.

5. **3D Headless Geometry & AST Assertions**:
   - Shallow existence assertions (`expect(res).toBeDefined()`) are FORBIDDEN for 3D components. Assert: (a) geometry type (`TubeGeometry`, `BoxGeometry`), (b) numerical coordinates/scale with `toBeCloseTo()`, (c) PBR material properties (`color`, `metalness`, `roughness`). FORBIDDEN using React private internals (`__CLIENT_INTERNALS_*`).

6. **Targeted Mutation Sensitivity & Anti-Tautology**:
   - Probe test suites (`tests/probes/`) MUST import and exercise actual production exports on disk with assertions tight enough to fail if production branches are altered. Writing inline mock mutants inside test files is a forbidden tautology.

7. **JSX `title` Attribute Ghost Pass**:
   - When testing user-visible text contracts, MUST assert text node content via `getByText()` or `textContent`. Raw `toContain()` is banned when target strings match `title`, `aria-label`, or `data-*` attributes.

8. **`Partial<T>` Dynamic Key Access Safety**:
   - Accessing properties via dynamic keys on `Record<string, Partial<T>>` allows missing properties to compile cleanly as `undefined`. Field names MUST match canonical type definitions exactly (e.g. `bankrupt`, not `isBankrupt`).

9. **Content Assertion Parity & Utility Coverage**:
   - Tests for components utilizing string or data transformation helpers MUST assert processed text node output, not merely empty container markup. Utility functions exported from UI files must be unit-tested independently.

10. **React Component Invocation in Tests**:
    - FORBIDDEN calling function components as plain JS functions (`const vdom = MyComponent(props)`). Components with hooks must render within a React context (`renderToStaticMarkup(React.createElement(() => MyComponent(props)))` or Testing Library `render()`). Carousels/steppers require keyboard event tests (`ArrowLeft`, `ArrowRight`).

11. **Background Subshell Hangs via Interactive CLI**:
    - Naked `npx <pkg>` in subshells is strictly forbidden; MUST use `npx --yes <pkg>`.
    - Multiline `-e "..."` in Windows PowerShell is FORBIDDEN. Use temporary scratch files and execute via `vitest run` or `node`, then delete. UI/Client code requires Vitest with `happy-dom`.

12. **File Extensions `.tsx` vs `.ts` & Mutant Threshold**:
    - Any living contract test containing direct JSX syntax must end with `.tsx`.
    - Station 1 test suites should author 12–14 specific assertions (positive, negative, null, boundary values) to reliably clear the 14-mutant threshold in Station 4 Sentinel.

13. **Subagent Timebox & Targeted Test Execution**:
    - `qa-tester` and `implementer` MUST ONLY execute their assigned slice test (`npx vitest run tests/<subsystem>/<target>.test.ts`, run time < 1s). Untargeted repo-wide `vitest run` is strictly forbidden in subagents. Subagent dispatches timebox $\le 3$ minutes.

14. **Flight Recorder Auto-Ingestion**:
    - For gameplay, economic, or FSM desync bugs, agents MUST ingest Flight Recorder dumps (`npm run analyze:log <dump.json>` or `window.__vtcoon.exportFlightRecorder()`) to verify sequential tick timelines before hypothesizing fixes.

15. **Planning Stopping Boundary & Staged Elision**:
    - Implementation plans serve as a Hard Stopping Boundary. Once Station 1 acceptance criteria and contract tests pass and pre-filters succeed, stop editing and proceed to reporting. Verbose passing logs must be elided (T4 context policy). Coarse-grained batching in UI edits.

16. **`SafeGLTFModel` Nullish Coalescing Guard**:
    - When conditionally forwarding fallback props to headless-aware components, NEVER pass literal boolean `false`. MUST use `forceFallback={isMobile ? true : undefined}` so desktop passes `undefined`, allowing `isHeadlessOrTestEnv()` to safely detect the test environment.

17. **Sentinel Signal Rollback & Hard CDP Timeouts**:
    - Sentinel registers `process.on('SIGINT')`, `SIGTERM`, and `exit` to restore physical file backups on abort.
    - Pre-build scripts scan and restore orphaned `*.sentinel_bak_*` files on startup.
    - CDP browser client enforces a hard 20-second timeout on all commands. Chrome launches with an isolated `--user-data-dir` temporary profile.

18. **TypeScript Closure Ref Pattern in Component Tests**:
    - When capturing values emitted or returned by React components/hooks in static markup tests (e.g. `renderToStaticMarkup`), initializing `let profile: T | null = null` and assigning inside a nested child component causes TypeScript control flow analysis to narrow `profile` to `never` / `null` at outer scope (`TS2339: Property does not exist on type never`).
    - Remedy: Use an object ref container `const ref: { current: T | null } = { current: null };` and assign `ref.current = ...` inside the component. This prevents TypeScript from falsely narrowing the variable to `never` without resorting to dirty casts (`as any`).

19. **Safe Indexing under `noUncheckedIndexedAccess: true`**:
    - Under `noUncheckedIndexedAccess`, indexed accesses on arrays or spy call arrays (e.g. `spy.mock.calls[0][0]`) are typed as `T | undefined` (`TS2532: Object is possibly undefined`).
    - Remedy: Explicitly assert existence before indexing:
      `const firstCall = spy.mock.calls[0]; expect(firstCall).toBeDefined();`
      and use safe fallback access `const params = (firstCall ? firstCall[0] : {})` instead of dirty casts (`as any`).

20. **Chaos Sentinel Mock Input Token Decoupling**:
    - When authoring tests for tooling/linters that inspect test assertions (e.g. AST spatial assertion linters), mock test input code strings must NOT contain literal assertion tokens like `.toBeGreaterThanOrEqual(`, `.toBeLessThanOrEqual(`, or `.toBeLessThan(`.
    - Cause: Chaos Sentinel mutators search for these tokens in test files and will corrupt the mock code string literals rather than real test assertions, causing mutants to survive.
    - Remedy: Construct mock assertion method names dynamically (e.g. `const gte = 'toBeGreaterThanOrEqual'; const code = \`expect(pos[0]).\${gte}(0.55);\``) so that Sentinel only mutates genuine Vitest assertion calls.
