---
name: codebase-archeology
description: Universal codebase forensics skill combining structural call-graph tracing (how) and historical git archaeology (why / Chesterton's fence) before modifying unfamiliar or complex code.
---

# CODEBASE ARCHEOLOGY SKILL (HOW & WHY FORENSICS)

## 1. PURPOSE & APPLICABILITY
Use during **Station 0 / Root-Cause Investigation** before drafting plans or modifying unfamiliar code across any repository (Web, Mobile, Backend, CLI, Embedded).

- **Objective**: Prevent breaking legacy edge cases by answering:
  1. *How does data physically flow through this subsystem?*
  2. *Why was this code originally written this way? (Chesterton's Fence)*

---

## 2. THE 3-STEP ARCHEOLOGY PROTOCOL

### Step 1: Trace the Physical Call-Graph (How)
1. Locate the entrypoint (API route, UI event handler, CLI flag, or message consumer).
2. Trace the synchronous and asynchronous execution path downward to the persistence/state layer:
   ```text
   [Entry Trigger] -> [Validator / Guard] -> [FSM / Core Logic] -> [State Mutation / Network I/O]
   ```
3. Document data transformations and hidden side-effects (event emissions, timers, caches).

### Step 2: Excavate Git Archaeology (Why)
Before refactoring or deleting unusual checks, fallbacks, or defensive clauses, inspect historical intent:
1. **Locate line origin**:
   ```bash
   git log -S "<symbol_or_clause>" --oneline
   git log -L <start>,<end>:<file_path>
   ```
2. **Read the original commit message & ticket**:
   - What bug or outage triggered this code?
   - Did it fix an obscure platform quirk (Safari, Windows path, race condition)?
3. **Chesterton's Fence Rule**: If you cannot find or explain *why* the fence exists, you are strictly forbidden from tearing it down.

### Step 3: Synthesis & Surface Proof
Output a concise 5-10 line summary before proceeding to planning:
- **Culprit / Seam**: The exact function and file governing the behavior.
- **Historical Invariant**: The constraint that must remain true.
- **Blast Radius**: Upstream callers and downstream listeners affected.
