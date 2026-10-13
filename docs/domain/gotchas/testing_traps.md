# PILLAR VII: DETROIT CLASSICAL TESTING & CONTRACT TRAPS

> **Scope**: `tests/**`, `scripts/check_evidence.mjs`

---

1. **Adversarial Inversion Gate (RED First)**: Write contract tests first and verify they FAIL (RED) strictly due to domain assertion mismatches before touching production code in `src/**`.
2. **Atomic Contract Mandate**: Each atomic test case contains 1–4 assertions, focused on a single behavior. Loops (`for`, `forEach`) in `it()` are strictly forbidden. Static checklist tests (`fs.existsSync`, `typeof fn`, testing LOC inside unit tests) are prohibited.
3. **Universal 5-Facet Matrix**: The test suite for each feature must cover 5 dimensions: (1) Boundary & edge values; (2) Reactivity; (3) Resource disposal/cleanup; (4) Error defense; (5) Multi-dimensional blast radius.
4. **Detroit Classical State Assertions**: Assert the observable state of the system (Observable State/Output); spying or mocking internal private module methods is forbidden.
5. **3D Headless Geometry & AST Assertion Invariant [3D/HEADLESS]**:
   - For 3D tests (Three.js/R3F), shallow change-detector assertions like `expect(res).toBeDefined()` or `expect(res.children).toHaveLength(n)` without validating object internals are FORBIDDEN.
   - MUST assert: (a) geometry type (`mesh.geometry.type === 'TubeGeometry'`/`BoxGeometry`), (b) numerical coordinates/scale with `toBeCloseTo()`, (c) PBR material properties (`color`, `metalness`, `roughness`), (d) FORBIDDEN using React private internals `(React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE` to bypass mocks; render via standard containers or test pure domain logic.
6. **Targeted Mutation Sensitivity & Anti-Tautology Invariant (Station 4) [TEST/MUTATION]**:
   - For probe test suites (`tests/probes/`), MUST import and exercise actual production exports on disk with assertions tight enough that tests FAIL if production logic is removed or altered (e.g. `renderInteractiveModal({ myId: 'X', highestBidderId: 'X' })` must assert existence of `auction-leading-close-btn` to catch deletion of the `isLeading` branch).
   - STRICTLY FORBIDDEN from writing inline mock mutants in test files (e.g. `function mutantRenderFooter() { ... }` and asserting it fails); this is a Tautology fallacy that does not exercise production code.
7. **JSX `title` Attribute Ghost Pass [UI/TEST] (Gotcha 33)**:
   - **Deceptive Trap**: When an iteration changes visible element text (e.g. from `C3 (HOTEL)` to `C3 (RESORT/MALL)`) but retains `title="C3 (HOTEL)"` as a tooltip, `renderToStaticMarkup` produces HTML containing both strings. The assertion `expect(html).toContain('C3 (HOTEL)')` still PASSES because it matches the `title` attribute rather than visible content, falsely indicating contract preservation when user-facing text changed completely.
   - **Physical Finding**: In `title_deed_rent_table.tsx` after IMP-235: `<span ... title="C3 (KHÁCH SẠN)">C3 (RESORT/TTTM)</span>`. TC-AUC-ERG.10 asserting `toContain('C3 (KHÁCH SẠN)')` stayed GREEN due to the `title` attribute.
   - **Verified Invariant**: When testing user-visible text contracts, MUST assert text node content, not raw `toContain()` on entire markup. Use `getByText()` (Testing Library) or extract `textContent`, avoiding `toContain('string')` when that string may exist in `title`, `aria-label`, or `data-*` attributes.
8. **`Partial<T>` Dynamic Key Access — Undetected Dead Properties [TYPE/RUNTIME] (Gotcha 35)**:
   - **Deceptive Trap**: When accessing properties via dynamic keys on `Record<string, Partial<T>>` (e.g. `playersInfo?.[myId]?.isBankrupt`), TypeScript strict mode does NOT report an error if `isBankrupt` is absent from `T`. Combining `Partial<T>` with optional chaining `?.` allows any property access to compile cleanly—returning `undefined` at runtime.
   - **Physical Finding**: IMP-240 Step 10.2 added fallback `playersInfo?.[myId]?.isBankrupt` while `PlayerInfo` only declared `bankrupt` (not `isBankrupt`). TypeScript did not warn, code compiled cleanly, but the fallback always resolved to `undefined`.
   - **Verified Invariant**: When accessing fallbacks via `Partial<T>` dynamic lookups, MUST verify exact field names in type definitions. Never guess field names via camelCase variations.
9. **Component Utility String Slicing & SSR Fallback Mutation Blind Spots [TEST/MUTATION] (Gotcha 41)**:
   - **Deceptive Trap (Superficial Contract & Mutation Survival)**: When writing contract tests for UI components, asserting only high-level selectors (data-testid, responsive classes, roles) without asserting actual text output from string manipulation helpers (`cleanEventDescription`) or SSR selector render states (`isSSR ? getState() : hook`) allows underlying mutations (+ to -, === to !==) to survive 100%, failing Station 4 probes.
   - **Physical Finding**: In IMP-253, `cleanEventDescription` string slicing via `colonIndex + 2` and `isSSR = typeof window === 'undefined'` in `floating_numbers.tsx` survived `imp253_floating_toast_ergonomics.test.ts` because the test never asserted filtered text or player names.
   - **Verified Invariants**:
     1. *Content Assertion Parity*: Tests for components containing data or string helpers must include at least 1 assertion verifying processed text node output, not merely empty container wrappers.
     2. *Independent Utility Coverage*: Utility functions exported from UI files must be unit-tested independently across edge cases to kill operator mutations (+, -, slice).

10. **React Component Invocation in Tests & Keyboard A11y Contract [UI/TEST] [IMP-267]**:
    - **Forbidden Direct Invocation of Function Components as Pure JS**: Strictly banned calling components as plain functions `const vdom = MyComponent(props)` in `tests/**`. All components utilizing React Hooks must render within a React context (`renderToStaticMarkup(React.createElement(() => MyComponent(props)))` or Testing Library `render()`). Implementers must update legacy non-conforming tests with proper React wrappers; FORBIDDEN from injecting malformed defensive code (`try...catch`, `isReactContext`) into `src/**` to appease invalid tests (Anti-TIDD violation).
    - **Mandatory Keyboard Tests for Carousel / Stepper**: Station 1 contract suites for components with pagination, tabs, or card stepping must contain at least 1 keyboard event test (`fireEvent.keyDown(window, { key: 'ArrowRight' })`), never relying solely on mouse clicks.

11. **Background Subshell Hangs via Interactive CLI & PowerShell Parsing [TOOLING/CLI] (Gotcha 42)**:
    - **Deceptive Trap (Non-Interactive Subshell Hang / Empty Log)**: When agents or CI run commands in subshells (background processes with piped stdin):
      1. `npx <package>` when uninstalled prompts `Need to install... Ok to proceed? (y)`. Without an interactive keyboard, the process hangs indefinitely, outputting an empty log.
      2. In Windows PowerShell, passing multiline code with double quotes (`"`), single quotes (`'`), or newlines into `-e "..."` breaks argument parsing, deadlocking the child process.
      3. Running Client code (React/JSX/Zustand Store) with plain Node.js fails due to missing DOM/browser globals.
    - **Physical Finding**: `npx tsx -e "import ... from MarketEventTicker..."` hung completely because `tsx` was not in `devDependencies`, `npx` awaited `y`, and PowerShell corrupted the multiline string.
    - **Verified Invariants**:
      1. *Always use `--yes` with `npx`*: Naked `npx <pkg>` in subshells is strictly forbidden; MUST use `npx --yes <pkg>` or install dependencies first.
      2. *Forbidden Multiline Inline Code in PowerShell*: FORBIDDEN multiline `-e "..."` in PowerShell. Create temporary scratch files (e.g. `scratch.ts` or temporary test in `tests/`) and execute via `vitest run` or `node`, then delete.
      3. *Client Code Requires Test Runner*: UI/Client code containing JSX or browser stores must execute via Vitest with `happy-dom` (`vitest run <test_file>`), never plain Node.js.

12. **File Extensions `.ts` vs. `.tsx` & Station 4 Mutant Floor [TEST/HARNESS] [IMP-288]**:
    - **Deceptive Trap**:
      1. *Extensions and JSX Parser*: Creating living contract tests for React components with a `.ts` extension (e.g. `imp288_test.ts`) causes esbuild / Vite compiler syntax errors (`Expected ">" but found "prop"`). If using `.ts`, invoke via `React.createElement(ActionDock, props)` or rename to `.tsx`.
      2. *Mutant Floor Underrun*: At Station 4 Sentinel, the mutation probe evaluates at least 14 mutants (`mutantsTested >= 14 && killed >= 14`). If Station 1 contract suites are overly sparse (< 12 asserts) and omit mutated operators (`toBe(true)`, `toBe(false)`, `toBeNull()`, `toContain()`), the suite fails Station 4 despite passing all unit tests.
    - **Verified Invariants**:
      1. *JSX Test File Naming*: Any living contract test containing direct JSX syntax must end with `.tsx`.
      2. *Assertion Density & Range*: When designing Station 1 test suites, author 12–14 specific assertions checking positive (`true`), negative (`false`), `null`, and boundary numerical values to clear the 14-mutant threshold in Station 4 on the first attempt.

13. **Subagent Timebox & Targeted Test Execution Invariant [TOOLING/SUBAGENT]**:
    - **Deceptive Trap (Subagent Context Choke & Heavy Tool Bloat)**: When dispatching subagents (`qa-tester` or `implementer`), running untargeted test commands (`npx vitest run`) executes all 5,400+ repository tests. This leads to: (1) execution timeouts (> 5 minutes); (2) massive test logs filling the Main Agent's context window; (3) thousands of wasted reasoning tokens.
    - **Verified Invariants**:
      1. *Targeted Test Execution Only*: `qa-tester` and `implementer` MUST ONLY execute their assigned slice test (`npx vitest run tests/<subsystem>/<target_test>.test.ts`, run time < 1s). Untargeted `vitest run` is strictly forbidden in subagents.
      2. *Full Regression Belongs to Main Agent & OS Process*: Executing repo-wide regressions and Chaos Sentinel mutation testing belongs strictly to Station 4 executed by the Main Agent via native OS background processes (`run_command`).
      3. *Timebox $\le 3$ Minutes*: Subagent dispatches must finish within 3 minutes. Extensive refactoring needs indicate an oversized scope that MUST be sliced into Micro-Slices $\le 50$ LOC before dispatch.

14. **Flight Recorder Auto-Ingestion & Forensic Invariant [TOOLING/OBSERVABILITY]**:
    - **Deceptive Trap (Conjectural Debugging & Amnesia)**: In bugs involving turn sequence, FSM synchronization, financial disputes, or unexpected bankruptcy, speculative static code inspection or verbal descriptions consistently miss inter-tick race hazards.
    - **Verified Invariants**:
      1. *Flight Recorder Auto-Ingestion*: For gameplay, economic, or FSM desync anomalies, the agent MUST prioritize extracting or requesting a Flight Recorder dump (`npm run analyze:log <dump.json>` or `window.__vtcoon.exportFlightRecorder()`).
      2. *Tick Timeline Verification*: Use `scripts/analyze_gameplay_log.mjs` to inspect the full timeline of ticks, player/bot intents, and invariant violations before formulating hypotheses or solutions.

15. **The Hyper-Verification Trap & Planning Stopping Boundary [HARNESS/STOPPING_GATE] [EXP-STUDY]**:
    - **Deceptive Trap (Hyper-Verification & Context Bloat Trap)**: Empirical research (arXiv:2609.20804) demonstrates that frontier models exhibit redundant post-edit verification—continuing to run exploratory tests after code is modified and tests pass, inflating token expenditure by 30–32% and lengthening trajectories without quality gains. Additionally, dumping hundreds of passing test lines into context wastes working memory.
    - **Verified Invariants**:
      1. *Planning as a Hard Stopping Boundary (DoD Hard Stop)*: Implementation plans (`PLAN_[ID].md` / todo-lists) serve as a **Hard Stopping Boundary**. Once Station 1 acceptance criteria and contract tests PASS in Station 2 and mechanical pre-filters succeed, the Agent MUST stop editing and proceed directly to reporting. Redundant post-edit test exploration is FORBIDDEN.
      2. *Staged Elision for Test Logs (T4 Context Policy)*: Automated test runs must extract only assertion diffs and passing summaries; dumping verbose passing outputs into context history is FORBIDDEN.
      3. *Coarse-Grained Batching in UI Edits*: When refactoring or tuning UI, agents must reason and modify code in cohesive component blocks; repetitive micro-string patching (`re-patch` streaks 4–5 times on the same file) is FORBIDDEN.

16. **`SafeGLTFModel` Nullish Coalescing Guard Inversion & Literal Boolean Fallthrough [3D/TEST] [IMP-378]**:
    - **Deceptive Trap (Nullish Coalescing False-Pass Fallthrough)**: In `SafeGLTFModel`, headless testing detection relies on `const isHeadless = forceFallback ?? isHeadlessOrTestEnv();`. If a consumer component passes `forceFallback={isMobile}`, on desktop (`isMobile === false`), passing literal `false` evaluates `false ?? isHeadlessOrTestEnv()` as `false` because boolean `false` is not nullish (`null` or `undefined`).
    - **Physical Finding**: In headless Vitest/SSR test environments, passing literal `forceFallback={false}` bypasses `isHeadlessOrTestEnv()`, forcing `isHeadless = false`. This activates real `@react-three/drei` `useGLTF()` in an environment without WebGL or asset loaders, crashing dozens of test suites across the entire codebase with `TypeError: Cannot read properties of undefined (reading 'load')`.
    - **Verified Invariants**:
      1. *Strict Nullish Fallback Guard*: When conditionally forwarding fallback props to headless-aware components, NEVER pass literal boolean `false`. MUST use `forceFallback={isMobile ? true : undefined}` or `forceFallback={Boolean(isMobile) || undefined}` so that desktop passes `undefined`, allowing `isHeadlessOrTestEnv()` to safely detect the test environment.
      2. *Dual-Mode Headless Contract Verification*: When adding mobile LOD props to 3D diorama components, always verify both mobile (`isMobile: true`) and desktop (`isMobile: false`) in headless tests to guarantee headless fallback integrity across both branches.

17. **Sentinel Interrupted Mutation & Headless CDP Infinite Loop Lock [TEST/SENTINEL/CDP] [IMP-378]**:
    - **Deceptive Trap (Dirty Mutant Survives Process Interruption)**: When Station 4 Chaos Sentinel applies source-level AST mutations in `src/**`, it creates a `.sentinel_bak_*` backup and writes the mutant directly to disk. If Sentinel is interrupted mid-execution (subshell timeout, Ctrl+C, killed process), Node.js `finally` blocks do NOT execute. Corrupted mutants (e.g. `pIdx < len` mutated to `pIdx >= len` creating a synchronous infinite loop) remain written on physical disk while the backup is orphaned.
    - **Cascade Failure**: A subsequent `capture:visual` run bundles the infinite loop into `dist/`. Headless Chrome launches, renders the page, and the main JavaScript thread locks at 100% CPU. Because Chrome's event loop is deadlocked, CDP commands (`Runtime.evaluate`, `Page.captureScreenshot`) never return. Without a timeout, the capture runner hangs indefinitely for hours.
    - **Verified Invariants & Permanent Architecture Safeguards**:
      1. *Sentinel Signal Interception & Emergency Rollback*: Sentinel registers `process.on('SIGINT')`, `process.on('SIGTERM')`, and `process.on('exit')` to unconditionally restore all active file backups before process termination.
      2. *Automated Self-Healing on Startup & Pre-Build*: Both `station4_sentinel.ts` and `preview_server_manager.mjs` automatically scan the repository for any orphaned `*.sentinel_bak_*` files on startup and restore them instantly before tests or builds run.
      3. *Strict 20-Second CDP Dispatch Timeout*: In `cdp_browser_client.mjs`, all CDP `send` calls enforce a hard 20-second timeout (`setTimeout`), ensuring that if Chrome freezes, the tool cleanly aborts and kills all child processes instead of hanging indefinitely.
      4. *Isolated Chrome User Data Profile*: Headless Chrome MUST launch with `--user-data-dir` set to a dedicated temporary directory (`os.tmpdir()/vtcoon_chrome_cdp_${port}`), preventing profile lock conflicts with running user browsers or other instances.
