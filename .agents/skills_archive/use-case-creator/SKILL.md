---
name: use-case-creator
description: Write rigorous, generative Use Case specifications optimized for AI agents, software engineers, and stakeholders following Use-Case 3.0 and the AI Unified Process (AIUP). Use whenever a user asks to write, draft, define, or formalize a Use Case, or when preparing specifications for slicing and autonomous implementation. Enforces the 5 AI-era principles, 3-Zone precision model, mechanism blocklist, and machine-readable traceability.
---

# Use Case Creator (AIUP Edition)

A skill for writing precise, generative Use Case specifications based on **Use-Case 3.0** (Jacobson, Cockburn) and **Writing Use Cases for AI** (Martinelli, 2026).

---

## The 5 AI-Era Principles (AIUP 2026)

11. **The specification outlives the code**: Code is a disposable build artifact that can be regenerated or replaced. The use case is the enduring asset. When the specification and the code disagree, the default assumption is that the code is wrong.
12. **Write for three readers, in this order: Stakeholder, Engineer, AI**: If a stakeholder cannot validate the spec, precision is worthless. If an engineer cannot review against it, correctness cannot be verified. Never optimize into machine pseudo-code.
13. **Be precise about the observable, silent about the mechanism**: Everything a user or test could observe belongs in the spec. Everything about how the system achieves it internally does not.
14. **Tests carry the truth**: Tests are what make code regeneration safe. A use case without tests is only a wish. Every flow gets a test, and every change to a flow changes a test.
15. **Change the specification first**: A new feature, a change request (CR), and a bug are all changes to a use case. The specification changes first, then code and tests regenerate. Zero side-channel hotfixes directly in code.

---

## The 3 Zones of Precision

To prevent both under-specification (which forces the AI to invent logic) and over-specification (which leaks brittle implementation mechanics), every detail must be placed in its proper zone:

### Zone 1: Observable Behavior (Specify Concretely)
State everything a stakeholder could observe and a test could assert:
- Exact data fields, named columns, and display order (e.g., "Grid with columns Title, Author, ISBN, Available Copies").
- Concrete business quantities (e.g., "due date 28 days from today", "at most 5 open loans", never "soon" or "a few").
- Explicit confirmation and error content (e.g., "System informs the member that borrowing is blocked while loans are overdue and lists the overdue items").
- Ordering and optionality (e.g., "steps 2–4 in any order", "the member may skip step 3").

### Zone 2: Domain Data (Reference, Never Restate)
- Nouns in steps (e.g., `member`, `loan`, `book`) must exist in `docs/entity_model.md`.
- **Never inline attribute tables or field schemas** inside the use case. The entity model owns data shape; the use case owns behavioral flow.
- Supplementary artifacts (OpenAPI schemas, UI mockups) are referenced by link, never pasted inline.

### Zone 3: Implementation Mechanism (BANNED BLOCKLIST)
Steps describe **what** the actor and system achieve, never **how** it is built internally. A specification that contains any of the following fails verification:
- ❌ **Forbidden Blocklist**: `SMTP`, `email server`, `JWT`, `token`, `bcrypt`, `hash`, `salt`, `SHA`, `SQL`, `SELECT`, `INSERT`, `HTTP verbs (GET/POST/PUT/DELETE)`, `regex patterns`, `class names`, `exception names`.
- **The Do/Don't Rule**:
  - Write: `"User clicks Save button"` | Do NOT write: `"User triggers onClick handler"`
  - Write: `"System validates email format"` | Do NOT write: `"System runs regex /^[\w]+@[\w]+$/"`
  - Write: `"System securely stores password"` | Do NOT write: `"System hashes password with bcrypt and salt"`
  - Write: `"System signs user in"` | Do NOT write: `"System issues JWT with expiry"`

---

## The Step-Writing Card (Split-Pane Reference)

### Main Success Scenario (3–9 Steps)
1. **One sentence. Present tense. Active voice.**
2. **First word = who has the ball** (`Member requests...`, `System records...`).
3. **Structure:** `[Subject] [Verb] [Direct Object] [Prepositional Phrase]`.
4. **Intent, not movements:** One step per direction of data; nickname the data (`Member submits credentials`, never click-by-click).
5. **"Validates that…", NEVER "checks whether"** (asserts success on happy path; delegates failure to an Alternative Flow).
6. **Concrete where observable:** Names, columns, quantities, exact message content.
7. **Silent where mechanism:** Zero protocols, zero schemas, zero components, zero code.
8. **3–9 steps.** Step 1 is the trigger; the final step delivers the goal.

### Alternative Flows (A#)
1. `### A#: <Name of the condition>`
2. `**Trigger:** <What the system detected> (step N)`
3. `1..n steps` (following the exact same grammatical rules above).
4. `End: "Use case continues at step N."` OR `"Use case ends."` (Zero open-ended flows).
5. `"Use case ends"` outcome MUST be covered by a non-empty **Failure Postcondition** (rollback guarantee).

---

## Specification Template

Always output specifications using this exact Markdown template:

```markdown
# Use Case: [Goal-Oriented Name, e.g., Borrow Book]

## Overview
**Use Case ID:** UC-[EPIC]-NNN (e.g., UC-AUTH-001, UC-EVENT-001)  
**Use Case Name:** [Descriptive Verb-Noun Name]  
**Primary Actor:** [Role Name]  
**Goal:** [One sentence: the observable outcome the actor achieves and why]  
**Scope:** In Scope: [What is covered] | Out of Scope: [Explicit exclusions to prevent hallucination]  
**Traces to:** FR-XXX  
**Status:** Draft | Reviewed | Approved | Implemented | Tested | Done | Obsolete  

## Preconditions
- [Condition enforceable by system, established by a previous use case]

## Main Success Scenario
1. [Primary Actor does action]
2. [System responds / validates]
3. [System validates that condition holds (BR-[EPIC]-NNN)]
4. [System updates state]
5. [System delivers goal to actor]

## Alternative Flows

### A1: [Condition Name]
**Trigger:** [Condition detected by system] (step N)  
**Flow:**
1. [System response / error notification]
2. Use case continues at step N. *(or: Use case ends.)*

### A2: [Timeout / System Failure]
**Trigger:** [System fails to detect response within time limit] (step N)  
**Flow:**
1. [System logs failure and notifies actor]
2. Use case ends.

## Postconditions

### Success Postconditions
- [Observable state of the world when goal is achieved]
- [Records created or updated]

### Failure Postconditions
- [State of system when goal is abandoned: transactions rolled back, attempt logged]
- [Guarantees preserved]

## Business Rules

### BR-[EPIC]-NNN: [Rule Name]
[Concrete policy statement. Numbering is scoped by Epic, e.g., BR-AUTH-001.]
```

---

## The Revision Pass (3 Critical Questions)
Before setting status to `Approved`, answer these 3 questions:
1. **Can the stakeholder observe this?** If not observable, delete or rephrase.
2. **What would the AI have to invent to build this?** If AI must guess, specify the boundary.
3. **Will this sentence remain true if the framework changes next year?** If false, you leaked mechanism.

---

## 10 Common Mistakes Guardrail
Reject any specification displaying these anti-patterns:

### 5 Classical Anti-Patterns (Cockburn)
1. **No System**: Spec contains only actor actions; system never responds. Generates dead screens with no behavior.
2. **No Primary Actor**: Written from inside the system ("Validate PIN. Dispense cash."). Generates headless backend services with guessed UI.
3. **UI Walkthrough**: Click-by-click instructions instead of business intent. (e.g., 6 steps of clicking dropdowns instead of "Member submits loan request").
4. **Underwater Goal**: Micro-steps disguised as goals ("Validate ISBN"). Keep asking "Why" until surfacing at a sea-level goal someone can leave happy from.
5. **Purpose–Content Mismatch**: A "Log In" spec secretly specifying the whole application, or prose full of programming constructs.

### 5 AI-Era Anti-Patterns (Martinelli)
6. **Mechanism Leakage**: `JWT`, `SQL`, `bcrypt`, `regex`, HTTP verbs. Forces the spec to fight future implementation refactors.
7. **Restated Truth**: Inlining entity attributes or NFRs already in `entity_model.md` or `adr/`. Two sources of truth guarantee contradiction, and AI resolves contradictions silently.
8. **The Open Flow**: An alternative flow lacking `continues at step N` or `Use case ends`. A human reader forgives a dangling thread; the AI completes it by inventing speculative logic.
9. **The Blank Check (Vague Word Trap)**: Words like `"appropriately"`, `"handles the error"`, `"etc."`, `"and so on"`, `"shows relevant data"`. Every vague word is a delegated decision; delegate consciously or not at all.
10. **Backfilled Specs**: Code fixed directly, spec updated "later". The day the spec stops being first is the day it stops being true.

---

## Pre-Flight Specification Checklist (The 23 Gold Rules)
Run before status moves to `Reviewed`, and again before `Approved`:

### Identity and Structure
- [ ] 1. Name is primary actor's goal, short active verb phrase, in user's language.
- [ ] 2. Name matches `docs/domain/use_cases.puml` verbatim; file is named `UC-[EPIC]-NNN-<kebab-name>.md`.
- [ ] 3. One use case per file; goal achievable in one sitting by one actor (sea-level test, 2–20 min).
- [ ] 4. Goal line states observable outcome and why, not "use the system".
- [ ] 5. Traces directly to at least one `FR-XXX` in requirements catalog.

### Preconditions and Postconditions
- [ ] 6. Every precondition is enforceable by system, established elsewhere (prior UC), and NEVER re-validated inside flows.
- [ ] 7. Success postconditions state world with goal achieved: every record created or changed.
- [ ] 8. Failure postconditions non-empty, cover every "Use case ends", no half-recorded state unaccounted for.

### Main Success Scenario
- [ ] 9. 3–9 steps, numbered from 1 without gaps; final step delivers the goal.
- [ ] 10. Every step in active voice, present tense, named ball-holder as first word.
- [ ] 11. Every step is an Interaction, a Validation, or a State change; scenario contains all 3 kinds.
- [ ] 12. Validations say "validates", never "checks whether"; zero if-statements anywhere.
- [ ] 13. Zero UI mechanics (widgets, clicks, dialogs); data flowing one direction is one step with a nickname.

### Alternative Flows
- [ ] 14. Every validation in main scenario has exactly one flow answering its failure.
- [ ] 15. Every trigger states what system detected and anchors to a step: `(step N)`.
- [ ] 16. Every flow ends with `Use case continues at step N.` or `Use case ends.` (zero open-ended flows).
- [ ] 17. Conditions with same net effect merged; sub-failures rolled up ("Save fails", not 5 DB error reasons).

### Business Rules and References
- [ ] 18. Every `(BR-[EPIC]-NNN)` cited exists; every business rule cited at least once in flows; IDs globally unique.
- [ ] 19. Every entity noun exists in `docs/domain/entity_model.md`; zero attribute tables in spec.
- [ ] 20. Mockups, OpenAPI, and NFRs are referenced, never inlined or restated.

### The Three-Reader Test
- [ ] 21. Zone check: observable facts asserted concretely; zero blocklist vocabulary (`SMTP`, `JWT`, `bcrypt`, `SQL`, HTTP verbs, class/exception names, `regex`).
- [ ] 22. Stakeholder test: "Is this what you want? Will you be able to tell on delivery whether you got it?"
- [ ] 23. Regeneration check: every sentence remains true if system is regenerated on a different framework next year.
